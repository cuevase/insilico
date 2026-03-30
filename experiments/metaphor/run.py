"""
Metaphor vs. literal classification experiment.

Can predicted brain responses (via TRIBE v2) distinguish metaphorical from
literal language?  This script:
  1. Loads stimuli (metaphor + literal sentences)
  2. Passes each through TRIBE v2 → predicted fMRI activation
  3. Collects brain-pattern feature vectors
  4. Trains a logistic-regression classifier with cross-validation
  5. Reports accuracy, top discriminative brain regions, and saves figures

Usage:
    python experiments/metaphor/run.py            # full run
    python experiments/metaphor/run.py --n 10     # quick test with 10 stimuli
"""
import argparse
import json
import sys
import tempfile
import time
from pathlib import Path

import numpy as np
import pandas as pd
import yaml

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

EXPERIMENT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = EXPERIMENT_DIR / "results"
CACHE_DIR = RESULTS_DIR / "embeddings"

POSITIVE_LABEL = "metaphor"
NEGATIVE_LABEL = "literal"


def load_config() -> dict:
    with open(EXPERIMENT_DIR / "config.yaml") as f:
        return yaml.safe_load(f)


def load_stimuli(n: int | None = None) -> pd.DataFrame:
    """Load the stimuli CSV (id, label, text)."""
    df = pd.read_csv(EXPERIMENT_DIR / "stimuli" / "stimuli.csv")
    if n is not None:
        n_per = n // 2
        pos = df[df.label == POSITIVE_LABEL].head(n_per)
        neg = df[df.label == NEGATIVE_LABEL].head(n_per)
        df = pd.concat([pos, neg]).reset_index(drop=True)
    print(f"Loaded {len(df)} stimuli: "
          f"{(df.label == POSITIVE_LABEL).sum()} {POSITIVE_LABEL}, "
          f"{(df.label == NEGATIVE_LABEL).sum()} {NEGATIVE_LABEL}")
    return df


def get_brain_vector(model, text: str, stim_id: int) -> np.ndarray | None:
    """Run a single text through TRIBE v2 and return the mean brain vector.

    Caches results to disk so interrupted runs can resume.
    """
    cache_path = CACHE_DIR / f"stim_{stim_id:04d}.npy"
    if cache_path.exists():
        return np.load(cache_path)

    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
            f.write(text.strip())
            tmp_path = f.name

        df = model.get_events_dataframe(text_path=tmp_path)
        preds, _ = model.predict(events=df)
        Path(tmp_path).unlink(missing_ok=True)

        mean_vec = preds.mean(axis=0) if preds.ndim == 2 else preds
        np.save(cache_path, mean_vec)
        return mean_vec

    except Exception as e:
        print(f"    ERROR on stim {stim_id}: {e}")
        Path(tmp_path).unlink(missing_ok=True)
        return None


def collect_embeddings(model, stimuli: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, list[int]]:
    """Run all stimuli through the model and collect brain vectors."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    vectors = []
    labels = []
    valid_ids = []

    total = len(stimuli)
    for i, row in stimuli.iterrows():
        idx = int(i) + 1
        print(f"  [{idx}/{total}] {row.label}: {row.text[:60]}...")
        t0 = time.time()
        vec = get_brain_vector(model, row.text, row.id)
        elapsed = time.time() - t0

        if vec is not None:
            vectors.append(vec)
            labels.append(1 if row.label == POSITIVE_LABEL else 0)
            valid_ids.append(row.id)
            print(f"           done ({elapsed:.1f}s, {vec.shape[0]} vertices)")
        else:
            print(f"           SKIPPED")

    X = np.vstack(vectors)
    y = np.array(labels)
    return X, y, valid_ids


def run_classification(X: np.ndarray, y: np.ndarray, config: dict) -> dict:
    """Train and evaluate a classifier using stratified cross-validation."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import StratifiedKFold, cross_val_predict
    from sklearn.metrics import (
        accuracy_score, classification_report,
        confusion_matrix, roc_auc_score,
    )
    from sklearn.preprocessing import StandardScaler

    n_folds = config["classification"]["n_folds"]
    print(f"\nClassification: {X.shape[0]} samples, {X.shape[1]} features, {n_folds}-fold CV")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    clf = LogisticRegression(
        C=config["classification"]["regularization_C"],
        max_iter=5000,
        solver="saga",
        penalty="l1",
    )

    cv = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)
    y_pred = cross_val_predict(clf, X_scaled, y, cv=cv)
    y_prob = cross_val_predict(clf, X_scaled, y, cv=cv, method="predict_proba")[:, 1]

    acc = accuracy_score(y, y_pred)
    auc = roc_auc_score(y, y_prob)
    cm = confusion_matrix(y, y_pred)
    report = classification_report(y, y_pred, target_names=[NEGATIVE_LABEL, POSITIVE_LABEL])

    print(f"\n{'='*50}")
    print(f"  Accuracy:  {acc:.1%}")
    print(f"  ROC AUC:   {auc:.3f}")
    print(f"  Confusion matrix:")
    print(f"    {cm}")
    print(f"\n{report}")
    print(f"{'='*50}")

    clf.fit(X_scaled, y)

    results = {
        "accuracy": float(acc),
        "roc_auc": float(auc),
        "confusion_matrix": cm.tolist(),
        "n_samples": int(X.shape[0]),
        "n_features": int(X.shape[1]),
        "n_folds": n_folds,
    }
    return results, clf, scaler


def analyze_discriminative_regions(clf, n_vertices_per_hemi: int = 10_242) -> np.ndarray:
    """Extract the classifier's weight map to find discriminative brain regions.

    Positive weights → more metaphor-predictive.
    Negative weights → more literal-predictive.
    """
    weights = clf.coef_[0]
    n_cortical = 2 * n_vertices_per_hemi
    cortical_weights = weights[:n_cortical]
    return cortical_weights


def save_results(results: dict, cortical_weights: np.ndarray, X: np.ndarray, y: np.ndarray):
    """Save classification results, figures, and weight maps."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig_dir = RESULTS_DIR / "figures"
    fig_dir.mkdir(parents=True, exist_ok=True)

    with open(RESULTS_DIR / "classification_results.json", "w") as f:
        json.dump(results, f, indent=2)

    np.save(RESULTS_DIR / "classifier_weights.npy", cortical_weights)
    np.save(RESULTS_DIR / "embeddings_X.npy", X)
    np.save(RESULTS_DIR / "labels_y.npy", y)

    try:
        from nilearn import datasets, plotting

        fsaverage = datasets.fetch_surf_fsaverage("fsaverage5")
        n_hemi = 10_242
        vmax = float(np.percentile(np.abs(cortical_weights), 95))

        for hemi, hemi_name in [("left", "Left"), ("right", "Right")]:
            for view in ["lateral", "medial"]:
                fig, ax = plt.subplots(1, 1, figsize=(6, 5), subplot_kw={"projection": "3d"})
                data = cortical_weights[:n_hemi] if hemi == "left" else cortical_weights[n_hemi:]
                plotting.plot_surf_stat_map(
                    fsaverage[f"pial_{hemi}"],
                    data,
                    hemi=hemi,
                    view=view,
                    cmap="cold_hot",
                    threshold=vmax * 0.2,
                    vmax=vmax,
                    axes=ax,
                    colorbar=True,
                    bg_map=fsaverage[f"sulc_{hemi}"],
                    title=f"Metaphor vs Literal — {hemi_name} {view.capitalize()}",
                )
                fname = f"weights_{hemi}_{view}.png"
                fig.savefig(fig_dir / fname, dpi=150, bbox_inches="tight")
                plt.close(fig)
                print(f"  Saved {fname}")
    except Exception as e:
        print(f"  Warning: could not generate brain figures: {e}")

    try:
        from sklearn.decomposition import PCA
        pca = PCA(n_components=2)
        X_2d = pca.fit_transform(X)

        fig, ax = plt.subplots(figsize=(8, 6))
        for label, name, color in [(1, "Metaphor", "#9B59B6"), (0, "Literal", "#2ECC71")]:
            mask = y == label
            ax.scatter(X_2d[mask, 0], X_2d[mask, 1], c=color, label=name, alpha=0.7, s=60)
        ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%} var)")
        ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%} var)")
        ax.set_title("Brain Response Patterns: Metaphor vs Literal")
        ax.legend()
        fig.savefig(fig_dir / "pca_scatter.png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        print("  Saved pca_scatter.png")
    except Exception as e:
        print(f"  Warning: could not generate PCA figure: {e}")

    try:
        from sklearn.metrics import confusion_matrix as cm_fn
        cm = cm_fn(y, results["_y_pred"]) if "_y_pred" in results else np.array(results["confusion_matrix"])
        fig, ax = plt.subplots(figsize=(5, 4))
        im = ax.imshow(cm, cmap="Purples")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Literal", "Metaphor"])
        ax.set_yticklabels(["Literal", "Metaphor"])
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_title(f"Confusion Matrix (Acc: {results['accuracy']:.1%})")
        for i in range(2):
            for j in range(2):
                ax.text(j, i, str(cm[i][j]), ha="center", va="center",
                        color="white" if cm[i][j] > cm.max() / 2 else "black", fontsize=16)
        fig.colorbar(im)
        fig.savefig(fig_dir / "confusion_matrix.png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        print("  Saved confusion_matrix.png")
    except Exception as e:
        print(f"  Warning: could not generate confusion matrix figure: {e}")

    print(f"\nAll results saved to {RESULTS_DIR}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=None,
                        help="Number of stimuli to use (for quick testing)")
    args = parser.parse_args()

    config = load_config()
    print("=" * 60)
    print("  METAPHOR vs LITERAL CLASSIFICATION EXPERIMENT")
    print("  Can brain responses distinguish figurative from literal language?")
    print("=" * 60)

    print("\n1. Loading TRIBE v2 model...")
    from core.model import load_model
    model = load_model()

    print("\n2. Loading stimuli...")
    stimuli = load_stimuli(args.n)

    print("\n3. Generating brain predictions (this will take a while)...")
    t0 = time.time()
    X, y, valid_ids = collect_embeddings(model, stimuli)
    elapsed = time.time() - t0
    print(f"   Done: {X.shape[0]} embeddings in {elapsed/60:.1f} minutes")
    print(f"   Shape: {X.shape} (samples x brain vertices)")

    print("\n4. Training classifier...")
    results, clf, scaler = run_classification(X, y, config)

    print("\n5. Analyzing discriminative brain regions...")
    cortical_weights = analyze_discriminative_regions(clf)
    top_pos = np.argsort(cortical_weights)[-10:]
    top_neg = np.argsort(cortical_weights)[:10]
    print(f"   Top metaphor-predictive vertices: {top_pos}")
    print(f"   Top literal-predictive vertices: {top_neg}")

    print("\n6. Saving results and figures...")
    save_results(results, cortical_weights, X, y)

    print("\n" + "=" * 60)
    print(f"  EXPERIMENT COMPLETE")
    print(f"  Accuracy: {results['accuracy']:.1%}  |  AUC: {results['roc_auc']:.3f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
