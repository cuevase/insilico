# Experiment: Humor Classification from Brain Responses

## Question

Can predicted brain activation patterns (via TRIBE v2) distinguish humorous
text from neutral factual statements?

## Hypothesis

TRIBE v2 has learned neural representations that encode humor-related
processing — including incongruity detection (TPJ), semantic surprise (IFG),
and reward (mPFC/OFC). A classifier trained on these predicted brain
patterns should perform above chance at distinguishing humor from neutral text.

## Stimuli

- **50 humorous texts**: Short jokes and one-liners (8-20 words)
- **50 neutral texts**: Factual statements matched in length (e.g., science facts, geography)
- Source: Kaggle Short Jokes dataset + hand-curated neutral controls

## Method

1. Each text is passed through TRIBE v2 → predicted fMRI BOLD activation
2. Mean activation across time → one brain-pattern vector per stimulus (~20k vertices)
3. Logistic regression with L1 regularization + 5-fold stratified cross-validation
4. Evaluate accuracy, ROC AUC, and identify discriminative brain regions

## Running

```bash
# Full run (100 stimuli — ~3-5 hours on M3 Pro)
python experiments/humor/run.py

# Quick test (10 stimuli — ~30 min)
python experiments/humor/run.py --n 10
```

## Expected Outputs

- `results/classification_results.json` — accuracy, AUC, confusion matrix
- `results/classifier_weights.npy` — vertex-level discriminative weights
- `results/figures/weights_*.png` — brain maps of humor-predictive regions
- `results/figures/pca_scatter.png` — 2D projection of brain patterns
- `results/figures/confusion_matrix.png` — classification confusion matrix
- `results/embeddings/` — cached per-stimulus brain vectors (for resuming)

## Key References

- Vrticka et al. (2013) — Neural basis of humor processing
- Mobbs et al. (2003) — Humor modulates reward center activity
- Chan et al. (2013) — TPJ and incongruity resolution in humor

## Status

- [x] Stimuli prepared (50 humor + 50 neutral)
- [ ] Predictions generated
- [ ] Classifier trained
- [ ] Results analyzed
- [ ] Write-up drafted
