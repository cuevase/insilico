# Experiment: Intuitive Physics — Real vs. Reversed Video Classification

## Question

Can predicted brain activation patterns (via TRIBE v2) distinguish real physical
events from time-reversed versions of the same clips? Does the brain's "physics
engine" produce a detectable signal in TRIBE v2's predicted neural responses?

## Hypothesis

The human brain has built-in expectations about physical dynamics — gravity,
momentum, fluid flow, collisions. When these expectations are violated (as in
reversed video), specific regions respond: the intraparietal sulcus (IPS) for
physics/spatial reasoning, MT+ for motion processing, and prefrontal cortex for
prediction error. TRIBE v2's video encoder (V-JEPA2-Giant) was trained with a
self-supervised objective that predicts future frames, so it may have learned
representations that encode temporal physical plausibility. If these
representations are mapped through TRIBE v2's brain projection, they should land
in the brain regions associated with intuitive physics processing.

## Stimuli

- **50 real physics videos**: Selected from the Physics-IQ benchmark (Google
  DeepMind), covering solid mechanics, fluid dynamics, optics, thermodynamics,
  and magnetism. Center perspective, take-1. ~5 seconds each, 30fps, audio stripped.
- **50 reversed physics videos**: The same 50 clips reversed frame-by-frame via
  ffmpeg. Same pixels, same visual content, but violated physical dynamics.
- Source: Physics-IQ Benchmark (Motamed et al., 2025). Apache 2.0 license.

## Design Rationale

Reversing the videos provides the cleanest possible control: identical pixel
content, identical objects and scenes, but with physical dynamics running
backwards. Any difference in predicted brain activation must be due to temporal
motion processing (the "physics" dimension), not visual content, color, or
scene composition. Audio is stripped from both conditions to ensure the signal
is purely visual.

## Method

1. Each video is passed through TRIBE v2 (V-JEPA2 video encoder + transformer)
   → predicted fMRI BOLD activation
2. Mean activation across time → one brain-pattern vector per video (~20k vertices)
3. Logistic regression with L1 regularization + 5-fold stratified cross-validation
4. Evaluate accuracy, ROC AUC, and identify discriminative brain regions

## ROIs of Interest

- **IPS (IP1)**: Intraparietal sulcus — physics reasoning, spatial processing,
  object tracking. The core "physics engine" of the brain.
- **MT+ (MT)**: Middle temporal area — motion processing, detects when motion
  trajectories violate expectations.
- **LOC (LO1)**: Lateral occipital cortex — object recognition, shape processing.
- **DLPFC (BA 46)**: Dorsolateral prefrontal cortex — prediction error, executive
  control, expectation violation detection.
- **V1**: Primary visual cortex — low-level visual processing (control ROI,
  should not differ between conditions).
- **STS (STSv)**: Superior temporal sulcus — biological motion, higher-level
  visual processing.

## Setup

### 1. Download Physics-IQ videos

```bash
bash experiments/physics/scripts/download_videos.sh
```

Requires `gsutil` (installed automatically if missing). Downloads test videos
from `gs://physics-iq-benchmark` (~several GB).

### 2. Prepare stimuli

```bash
python experiments/physics/scripts/prepare_stimuli.py
python experiments/physics/scripts/prepare_stimuli.py --n 20   # fewer for testing
```

Selects 50 center-perspective take-1 videos, copies them to `stimuli/real/`,
reverses each into `stimuli/reversed/`, and generates `stimuli/stimuli.csv`.

### 3. Run the experiment

```bash
# Full run (100 videos — requires GPU, ~2-4 hours on A100)
python experiments/physics/run.py

# Quick test (10 videos)
python experiments/physics/run.py --n 10
```

**Note:** This experiment is designed to run on a CUDA GPU (Lambda, RunPod, etc.).
V-JEPA2-Giant video feature extraction is too slow on CPU/MPS for practical use.

## Expected Outputs

- `results/classification_results.json` — accuracy, AUC, confusion matrix
- `results/classifier_weights.npy` — vertex-level discriminative weights
- `results/figures/weights_*.png` — brain maps of physics-predictive regions
- `results/figures/pca_scatter.png` — 2D projection of brain patterns
- `results/figures/confusion_matrix.png` — classification confusion matrix
- `results/embeddings/` — cached per-stimulus brain vectors (for resuming)

## Key References

- Motamed et al. (2025) — Physics-IQ: Do generative video models understand
  physical principles? arXiv:2501.09038
- Fischer et al. (2016) — Functional neuroanatomy of intuitive physical inference
- Kubricht et al. (2017) — Intuitive physics: Current research and controversies
- Battaglia et al. (2013) — Simulation as an engine of physical scene understanding
- d'Ascoli et al. (2026) — TRIBE v2: A foundation model of vision, audition,
  and language for in-silico neuroscience

## Connection to V-JEPA2

The Physics-IQ benchmark leaderboard's top scorer uses V-JEPA2 (62.6%), which is
the exact video encoder inside TRIBE v2. This creates a closed loop: DeepMind's
physics benchmark → Meta's video encoder → Meta's brain model → neuroscience
predictions about the brain's physics engine.

## Status

- [x] Experiment structure created
- [x] Download and preparation scripts ready
- [x] Videos downloaded from Physics-IQ
- [x] Stimuli prepared (50 real + 50 reversed)
- [x] Predictions generated (requires GPU)
- [x] Classifier trained
- [x] Results analyzed
- [x] Write-up drafted
