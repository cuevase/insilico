# TRIBE v2 — Developer Reference

**Paper:** d'Ascoli et al. (2026), FAIR at Meta  
**Code:** https://github.com/facebookresearch/tribev2  
**Weights:** https://huggingface.co/facebook/tribev2  
**Demo:** https://aidemos.atmeta.com/tribev2  
**License:** CC-BY-NC-4.0

---

## What It Does

TRIBE v2 is a multimodal brain encoding model: given video, audio, and/or text stimuli, it predicts high-resolution fMRI responses (BOLD signals) across the entire cortex and subcortical regions. It's trained on 1,000+ hours of fMRI across 720 subjects and can generalize zero-shot to new subjects and experimental paradigms.

**Key capabilities:**
- Predicts responses for naturalistic stimuli (movies, podcasts)
- Generalizes zero-shot to controlled experimental paradigms (visual localizers, language tasks)
- Recovers canonical neuroscience findings in-silico (FFA for faces, Broca's area for syntax, etc.)
- Outperforms traditional linear encoding models by several-fold
- Scales log-linearly with more training data (no plateau observed)

---

## Architecture

```
Video → V-JEPA2-Giant       ──┐
Audio → Wav2Vec-BERT-2.0    ──┤→ Transformer Encoder (8L, 8H) → Subject Block → fMRI predictions
Text  → LLaMA-3.2-3B        ──┘
         (all pretrained, frozen)       (1B learnable params)
```

**Feature extraction (frozen):**
- **Text:** LLaMA-3.2-3B. Each word embedded with 1024-word context window → `D=2048`, resampled to 2 Hz.
- **Audio:** Wav2Vec-BERT-2.0 on 60-second chunks → `D=1024`, downsampled from 50 Hz to 2 Hz.
- **Video:** V-JEPA2-Giant on 64 frames (4-second window) per 2 Hz bin → `D=1280`, spatially averaged over patches.

**Combining modalities:** Each modality's layers are grouped and averaged, projected to `D=384` via a linear layer + LayerNorm, then concatenated → `D_model = 3 × 384 = 1152` per timestep.

**Transformer encoder (trainable):**
- Input: 100-second windows of multimodal embeddings at 2 Hz with learnable positional + subject embeddings
- 8 transformer layers, 8 attention heads
- Output adaptively pooled from 2 Hz → 1 Hz to match fMRI TR
- Modality dropout: each modality zeroed with p=0.3 during training (at least one always kept)

**Subject block:** Subject-conditional linear projection `(S, D_model, N_targets)` mapping to cortical vertices (20,484 on fsaverage5 surface) + 8,802 subcortical voxels (Harvard-Oxford atlas). An "unseen subject" linear layer (trained with p=0.1 bypass dropout) enables zero-shot group-level predictions.

---

## Outputs

- **Cortical:** 20,484 vertices on the fsaverage5 surface
- **Subcortical:** 8,802 voxels across hippocampus, lateral ventricles, amygdala, thalamus, caudate, putamen, pallidum, accumbens
- **Metric:** Pearson correlation R between predicted and true fMRI time series

---

## Training Details

| Parameter | Value |
|---|---|
| Loss | Mean-squared error |
| Optimizer | AdamW |
| Batch size | 16 |
| Max epochs | 15 (early stopping, patience=3) |
| Learning rate | Warm up linearly to 1e-4 over 10% of steps, then cosine decay |
| Hardware | Single V100 32GB GPU (~24h after cached feature extraction) |
| Feature extraction | 128 V100 GPUs, ~24h, cached as NumPy memmaps |

**fMRI preprocessing:**
- BOLD data registered to a standard volumetric template (MNI152 variants or Colin27)
- Projected to fsaverage5 cortical surface via nilearn `vol_to_surf` (ball sampling, 3mm radius)
- Z-scored per session, detrended, resampled to 1 Hz
- Hemodynamic lag: fMRI offset by +5 seconds relative to stimuli

**Validation:** Stimuli in val set have no overlap with train. Pearson R averaged across subjects and parcels.

---

## Fine-tuning for New Subjects

Hold out half the new subject's data, finetune for 1 epoch (all parameters unfrozen, same hyperparameters). For large test cohorts, initialize new subject blocks using low-rank SVD factorization of the unseen-subject layer (`rank=128`) to keep memory tractable:

```
L_avg ≈ U S V^T   (torch.svd, rank=128)
Subject block = U  (shape: r × N_targets)
Linear layer  = SV^T
```

This yields a **2–4× improvement** over training a linear encoder from scratch per subject.

---

## Training Datasets

| Dataset | Task | Subjects | fMRI Hours |
|---|---|---|---|
| Courtois NeuroMod | Movies + audio (Friends, 4 films) | 4 | 268.7 |
| BoldMoments | Short video clips (no speech) | 10 | 61.9 |
| Lebel2023 | Podcast listening (The Moth) | 8 | 85.8 |
| Wen2017 | Silent video clips | 3 | 35.2 |

## Test Datasets (held out, zero-shot generalization)

| Dataset | Task | Subjects | fMRI Hours |
|---|---|---|---|
| NNDb | Movie watching | 86 | 160.6 |
| LPP | Story listening | 112 | 180.2 |
| Narratives | Story listening | 321 | 146.6 |
| HCP (7T) | Movie watching | 176 | 178.7 |

---

## In-Silico Experiments

TRIBE v2 replicates controlled neuroscience paradigms without any additional training:

**Visual:** Flash images for 1s every 8s → fit GLM on predicted time series → contrast maps. Recovers: FFA (faces), PPA (places), EBA (bodies), VWFA (written characters). Spatial correlation R with ground truth: 0.60–0.79.

**Language (IBC tasks):** Convert text stimuli to audio via TTS → extract word timings via Whisper → feed text+audio to model → fit GLM. Recovers: core language areas (A5, STS, Broca/45), TPJ/MTG for emotional processing, left hemisphere lateralization for sentences, syntactic regions for complex sentences. Spatial correlation R: 0.21–0.79.

**Protocol details:**
- All in-silico experiments use "unseen subject" mode
- GLM uses nilearn `FirstLevelModel` with canonical HRF
- Visual contrasts: predicted response at t=5s minus mean of other categories
- ROI labels (Glasser parcellation): FFA=FFC, PPA=PH, EBA=V4t, VWFA=A5, Broca=45, STS=STSv, TPJ=PGi, MTG=TE1a

---

## Multimodality Insights

- **Best single modality:** Video > Audio > Text (average encoding score)
- **Spatial specialization:** Audio → auditory cortex; Video → occipital/parietal; Text → language + prefrontal cortex
- **Largest multimodal gains:** Temporal-parietal-occipital junction (+50% over best unimodal), prefrontal cortex
- **Bimodal zones:** Text+Audio (yellow) = superior temporal lobe; Video+Audio (cyan) = ventral/dorsal visual cortex + hippocampus

---

## ICA / Interpretability

Applying FastICA (n=5) to the unseen-subject layer maps latent space to cortical space. The 5 components correspond 1:1 to: primary auditory cortex, language network, motion detection area, default mode network, visual system. Verified via Neurosynth meta-analysis spatial correlation.

---

## Installation

```bash
# Inference only
pip install -e .

# With brain visualization
pip install -e ".[plotting]"

# With training
pip install -e ".[training]"
```

---

## Quick Start (Inference)

```python
from tribev2 import TribeModel

model = TribeModel.from_pretrained("facebook/tribev2", cache_folder="./cache")

# Build events dataframe from a video file
df = model.get_events_dataframe(video_path="path/to/video.mp4")
# Also accepts: text_path=, audio_path= (text is auto-converted to speech + transcribed for word timings)

# Predict brain responses
preds, segments = model.predict(events=df)
print(preds.shape)  # (n_timesteps, n_vertices) on fsaverage5
```

Predictions are for the "average" (unseen) subject by default.

---

## Training From Scratch

**1. Set environment variables:**
```bash
export DATAPATH="/path/to/studies"
export SAVEPATH="/path/to/output"
export SLURM_PARTITION="your_partition"
# Or edit tribev2/grids/defaults.py directly
```

**2. Authenticate with HuggingFace** (LLaMA 3.2-3B is gated):
```bash
huggingface-cli login  # use a 'read' access token
```

**3. Run:**
```bash
# Local test
python -m tribev2.grids.test_run

# Full Slurm grid search
python -m tribev2.grids.run_cortical
python -m tribev2.grids.run_subcortical
```

---

## Project Structure

```
tribev2/
├── main.py              # Experiment pipeline (Data, TribeExperiment)
├── model.py             # FmriEncoder: full Transformer model
├── pl_module.py         # PyTorch Lightning training module
├── demo_utils.py        # TribeModel inference API
├── eventstransforms.py  # Event transforms (word extraction, chunking)
├── utils.py             # Multi-study loading, splitting, subject weighting
├── utils_fmri.py        # Surface projection (MNI→fsaverage) and ROI analysis
├── grids/
│   ├── defaults.py      # Full default experiment config
│   └── test_run.py      # Quick local test
├── plotting/            # Brain visualization (PyVista & Nilearn)
└── studies/             # Dataset definitions (Algonauts2025, Lahner2024, …)
```

---

## Key Implementation Notes

- **Frozen feature extractors:** V-JEPA2, Wav2Vec-BERT, LLaMA are all frozen. Only the transformer encoder and subject block are trained. Features are pre-extracted and cached as NumPy memmaps for fast loading.
- **Video spatial averaging:** V-JEPA2 patch tokens are spatially averaged, discarding retinotopic position info. This slightly hurts performance in low-level visual areas.
- **Audio bidirectionality:** Wav2Vec-BERT embeddings are bidirectional (see ±context within each 60s chunk); text and video embeddings are causal (past only).
- **Subcortical targets are harder:** Subcortical encoding scores are 2–3× lower than cortical, but remain statistically significant in most areas.
- **Detrending is critical:** Skipping detrending creates spurious encoding gains on datasets with slow BOLD drifts (Wen2017, Lebel2023) due to the long 100s context window.
- **Transformer implementation:** Uses the `x-transformers` package (https://github.com/lucidrains/x-transformers).

---

## Citation

```bibtex
@article{dAscoli2026TribeV2,
  title={A foundation model of vision, audition, and language for in-silico neuroscience},
  author={d'Ascoli, St{\'e}phane and Rapin, J{\'e}r{\'e}my and Benchetrit, Yohann and
          Brookes, Teon and Begany, Katelyn and Raugel, Jos{\'e}phine and
          Banville, Hubert and King, Jean-R{\'e}mi},
  year={2026}
}
```
