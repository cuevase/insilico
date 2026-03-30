# Experiment: Metaphor vs. Literal Classification from Brain Responses

## Question

Can predicted brain activation patterns (via TRIBE v2) distinguish metaphorical
language from literal language?

## Hypothesis

Metaphorical language engages additional neural resources beyond those used for
literal comprehension — particularly right-hemisphere regions (IFG, AG, TPJ) and
bilateral temporal areas (STS, ATL). TRIBE v2 may have learned representations
that encode this distinction, allowing a classifier to decode whether a sentence
is figurative or literal from the predicted brain pattern alone.

## Stimuli

- **50 metaphorical sentences**: Figurative language using conceptual metaphors
  (e.g., "His words cut deeper than any knife could.")
- **50 literal sentences**: Concrete factual statements matched in length and
  topic domain (e.g., "His email contained three paragraphs explaining the
  revised project timeline.")
- Source: Hand-curated, controlled for sentence length and content overlap.
  Metaphorical sentences span conventional, novel, and conceptual metaphor types.

## Design Rationale

The literal sentences were crafted to cover similar semantic domains (work,
relationships, emotions, communication) without using figurative language. This
controls for topic and content, isolating the metaphor processing dimension.

## Method

1. Each text is passed through TRIBE v2 → predicted fMRI BOLD activation
2. Mean activation across time → one brain-pattern vector per stimulus (~20k vertices)
3. Logistic regression with L1 regularization + 5-fold stratified cross-validation
4. Evaluate accuracy, ROC AUC, and identify discriminative brain regions

## ROIs of Interest

- **IFG (BA 45)**: Inferior frontal gyrus — semantic selection and metaphor processing
- **AG (PGs)**: Angular gyrus — semantic integration and figurative meaning
- **STS (STSv)**: Superior temporal sulcus — sentence-level comprehension
- **TPJ (PGi)**: Temporoparietal junction — contextual reinterpretation
- **ATL (TE1a)**: Anterior temporal lobe — combinatorial semantics
- **DLPFC (BA 46)**: Dorsolateral prefrontal — executive control for non-literal interpretation

## Running

```bash
# Full run (100 stimuli — ~3-5 hours on M3 Pro)
python experiments/metaphor/run.py

# Quick test (10 stimuli — ~30 min)
python experiments/metaphor/run.py --n 10
```

## Expected Outputs

- `results/classification_results.json` — accuracy, AUC, confusion matrix
- `results/classifier_weights.npy` — vertex-level discriminative weights
- `results/figures/weights_*.png` — brain maps of metaphor-predictive regions
- `results/figures/pca_scatter.png` — 2D projection of brain patterns
- `results/figures/confusion_matrix.png` — classification confusion matrix
- `results/embeddings/` — cached per-stimulus brain vectors (for resuming)

## Key References

- Rapp et al. (2012) — Neural correlates of metaphor processing
- Bohrn et al. (2012) — Meta-analysis of figurative language in the brain
- Cardillo et al. (2012) — Metaphor comprehension and the role of right hemisphere
- Citron & Goldberg (2014) — Metaphorical sentences are more emotionally engaging

## Status

- [x] Stimuli prepared (50 metaphor + 50 literal)
- [ ] Predictions generated
- [ ] Classifier trained
- [ ] Results analyzed
- [ ] Write-up drafted
