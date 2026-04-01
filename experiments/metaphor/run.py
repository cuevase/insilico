"""
Metaphor vs. literal classification experiment.

Can predicted brain responses (via TRIBE v2) distinguish metaphorical from
literal language?  This script:
  1. Loads stimuli (metaphor + literal sentences)
  2. Passes each through TRIBE v2 → predicted fMRI activation
  3. Collects brain-pattern feature vectors
  4. Trains a logistic-regression classifier with proper cross-validation
  5. (Optional) Evaluates on a held-out test set of unseen stimuli
  6. Reports accuracy, top discriminative brain regions, and saves figures

Methodological fixes (v2):
  - Pipeline(StandardScaler, LogisticRegression) so scaling happens inside CV
  - --holdout flag for proper train/test split evaluation

Usage:
    python experiments/metaphor/run.py                    # full run with model
    python experiments/metaphor/run.py --holdout           # include holdout test
    python experiments/metaphor/run.py --cached-only       # re-run classifier on cached embeddings (no GPU needed)
    python experiments/metaphor/run.py --cached-only --holdout
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
    print(f"  Loaded {len(df)} stimuli: "
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

    vectors, labels, valid_ids = [], [], []

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


def load_cached_embeddings(stimuli: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, list[int]]:
    """Load pre-computed embeddings from cache (no model needed)."""
    vectors, labels, valid_ids = [], [], []

    for _, row in stimuli.iterrows():
        cache_path = CACHE_DIR / f"stim_{row.id:04d}.npy"
        if cache_path.exists():
            vectors.append(np.load(cache_path))
            labels.append(1 if row.label == POSITIVE_LABEL else 0)
            valid_ids.append(row.id)
        else:
            print(f"  WARNING: no cached embedding for stim {row.id}")

    X = np.vstack(vectors)
    y = np.array(labels)
    print(f"  Loaded {len(valid_ids)} cached embeddings ({X.shape[1]} vertices each)")
    return X, y, valid_ids


def split_train_holdout(
    stimuli: pd.DataFrame, holdout_per_class: int = 10, seed: int = 42
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Split stimuli into train and holdout sets, stratified by label."""
    rng = np.random.RandomState(seed)

    pos = stimuli[stimuli.label == POSITIVE_LABEL]
    neg = stimuli[stimuli.label == NEGATIVE_LABEL]

    pos_idx = rng.choice(pos.index, size=holdout_per_class, replace=False)
    neg_idx = rng.choice(neg.index, size=holdout_per_class, replace=False)
    holdout_idx = np.concatenate([pos_idx, neg_idx])

    holdout = stimuli.loc[holdout_idx].reset_index(drop=True)
    train = stimuli.drop(holdout_idx).reset_index(drop=True)

    print(f"  Train: {len(train)} ({(train.label == POSITIVE_LABEL).sum()} {POSITIVE_LABEL}, "
          f"{(train.label == NEGATIVE_LABEL).sum()} {NEGATIVE_LABEL})")
    print(f"  Holdout: {len(holdout)} ({(holdout.label == POSITIVE_LABEL).sum()} {POSITIVE_LABEL}, "
          f"{(holdout.label == NEGATIVE_LABEL).sum()} {NEGATIVE_LABEL})")

    return train, holdout


def run_classification(X: np.ndarray, y: np.ndarray, config: dict) -> dict:
    """Train and evaluate with Pipeline + StratifiedKFold (no scaler leakage)."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import StratifiedKFold, cross_val_predict
    from sklearn.metrics import (
        accuracy_score, classification_report,
        confusion_matrix, roc_auc_score,
    )
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    n_folds = config["classification"]["n_folds"]
    print(f"\n  Classification: {X.shape[0]} samples, {X.shape[1]} features, "
          f"{n_folds}-fold StratifiedKFold")

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(
            C=config["classification"]["regularization_C"],
            max_iter=10000,
            solver="saga",
            penalty="l1",
        )),
    ])

    cv = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=42)

    y_pred = cross_val_predict(pipe, X, y, cv=cv)
    y_prob = cross_val_predict(pipe, X, y, cv=cv, method="predict_proba")[:, 1]

    acc = accuracy_score(y, y_pred)
    auc = roc_auc_score(y, y_prob)
    cm = confusion_matrix(y, y_pred)
    report = classification_report(y, y_pred,
                                   target_names=[NEGATIVE_LABEL, POSITIVE_LABEL])

    print(f"\n{'='*50}")
    print(f"  CV Accuracy:  {acc:.1%}")
    print(f"  CV ROC AUC:   {auc:.3f}")
    print(f"  Confusion matrix:")
    print(f"    {cm}")
    print(f"\n{report}")
    print(f"{'='*50}")

    pipe.fit(X, y)

    results = {
        "cv_accuracy": float(acc),
        "cv_roc_auc": float(auc),
        "cv_confusion_matrix": cm.tolist(),
        "n_train_samples": int(X.shape[0]),
        "n_features": int(X.shape[1]),
        "n_folds": n_folds,
        "cv_method": "StratifiedKFold (Pipeline with StandardScaler)",
    }
    return results, pipe


def run_holdout_test(pipe, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """Evaluate a trained pipeline on held-out data."""
    from sklearn.metrics import (
        accuracy_score, classification_report,
        confusion_matrix, roc_auc_score,
    )

    y_pred = pipe.predict(X_test)
    y_prob = pipe.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred,
                                   target_names=[NEGATIVE_LABEL, POSITIVE_LABEL])

    print(f"\n{'='*50}")
    print(f"  HOLDOUT TEST (unseen stimuli)")
    print(f"  Accuracy:  {acc:.1%}")
    print(f"  ROC AUC:   {auc:.3f}")
    print(f"  Confusion matrix:")
    print(f"    {cm}")
    print(f"\n{report}")
    print(f"{'='*50}")

    return {
        "holdout_accuracy": float(acc),
        "holdout_roc_auc": float(auc),
        "holdout_confusion_matrix": cm.tolist(),
        "n_holdout_samples": int(X_test.shape[0]),
    }


def analyze_discriminative_regions(pipe, n_vertices_per_hemi: int = 10_242) -> np.ndarray:
    """Extract the classifier's weight map from the pipeline.

    Positive weights → more metaphor-predictive.
    Negative weights → more literal-predictive.
    """
    weights = pipe.named_steps["clf"].coef_[0]
    n_cortical = 2 * n_vertices_per_hemi
    cortical_weights = weights[:n_cortical]
    return cortical_weights


def save_results(results: dict, cortical_weights: np.ndarray,
                 X: np.ndarray, y: np.ndarray):
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
                    bg_on_data=True,
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

    # CV confusion matrix
    try:
        cm_key = "cv_confusion_matrix" if "cv_confusion_matrix" in results else "confusion_matrix"
        acc_key = "cv_accuracy" if "cv_accuracy" in results else "accuracy"
        cm = np.array(results[cm_key])
        fig, ax = plt.subplots(figsize=(5, 4))
        im = ax.imshow(cm, cmap="Purples")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Literal", "Metaphor"])
        ax.set_yticklabels(["Literal", "Metaphor"])
        ax.set_xlabel("Predicted")
        ax.set_ylabel("Actual")
        ax.set_title(f"CV Confusion Matrix (Acc: {results[acc_key]:.1%})")
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

    # Holdout confusion matrix
    if "holdout_confusion_matrix" in results:
        try:
            cm = np.array(results["holdout_confusion_matrix"])
            fig, ax = plt.subplots(figsize=(5, 4))
            im = ax.imshow(cm, cmap="Greens")
            ax.set_xticks([0, 1])
            ax.set_yticks([0, 1])
            ax.set_xticklabels(["Literal", "Metaphor"])
            ax.set_yticklabels(["Literal", "Metaphor"])
            ax.set_xlabel("Predicted")
            ax.set_ylabel("Actual")
            ax.set_title(f"Holdout Confusion Matrix (Acc: {results['holdout_accuracy']:.1%})")
            for i in range(2):
                for j in range(2):
                    ax.text(j, i, str(cm[i][j]), ha="center", va="center",
                            color="white" if cm[i][j] > cm.max() / 2 else "black", fontsize=16)
            fig.colorbar(im)
            fig.savefig(fig_dir / "holdout_confusion_matrix.png", dpi=150, bbox_inches="tight")
            plt.close(fig)
            print("  Saved holdout_confusion_matrix.png")
        except Exception as e:
            print(f"  Warning: could not generate holdout confusion matrix: {e}")

    print(f"\nAll results saved to {RESULTS_DIR}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=None,
                        help="Number of stimuli to use (for quick testing)")
    parser.add_argument("--holdout", action="store_true",
                        help="Hold out 20 stimuli (10+10) for proper test")
    parser.add_argument("--cached-only", action="store_true",
                        help="Use cached embeddings only (no GPU/model needed)")
    args = parser.parse_args()

    config = load_config()
    print("=" * 60)
    print("  METAPHOR vs LITERAL CLASSIFICATION EXPERIMENT")
    print("  Can brain responses distinguish figurative from literal language?")
    print("  Methodology: Pipeline + StratifiedKFold (no leakage)")
    print("=" * 60)

    model = None
    if not args.cached_only:
        print("\n1. Loading TRIBE v2 model...")
        from core.model import load_model
        model = load_model()

    print(f"\n{'1' if args.cached_only else '2'}. Loading stimuli...")
    stimuli = load_stimuli(args.n)

    if args.holdout:
        print("\n  Splitting into train + holdout...")
        train_stimuli, holdout_stimuli = split_train_holdout(stimuli)
    else:
        train_stimuli = stimuli
        holdout_stimuli = None

    step = 2 if args.cached_only else 3
    print(f"\n{step}. Loading brain predictions...")
    if args.cached_only:
        X_train, y_train, train_ids = load_cached_embeddings(train_stimuli)
    else:
        t0 = time.time()
        X_train, y_train, train_ids = collect_embeddings(model, train_stimuli)
        elapsed = time.time() - t0
        print(f"   Done: {X_train.shape[0]} embeddings in {elapsed/60:.1f} minutes")

    print(f"   Shape: {X_train.shape} (samples x brain vertices)")

    step += 1
    print(f"\n{step}. Training classifier (StratifiedKFold CV)...")
    results, pipe = run_classification(X_train, y_train, config)

    if holdout_stimuli is not None:
        step += 1
        print(f"\n{step}. Loading holdout embeddings...")
        if args.cached_only:
            X_holdout, y_holdout, _ = load_cached_embeddings(holdout_stimuli)
        else:
            X_holdout, y_holdout, _ = collect_embeddings(model, holdout_stimuli)

        step += 1
        print(f"\n{step}. Evaluating on holdout (unseen stimuli)...")
        holdout_results = run_holdout_test(pipe, X_holdout, y_holdout)
        results.update(holdout_results)

    step += 1
    print(f"\n{step}. Analyzing discriminative brain regions...")
    cortical_weights = analyze_discriminative_regions(pipe)
    top_pos = np.argsort(cortical_weights)[-10:]
    top_neg = np.argsort(cortical_weights)[:10]
    print(f"   Top metaphor-predictive vertices: {top_pos}")
    print(f"   Top literal-predictive vertices: {top_neg}")

    step += 1
    print(f"\n{step}. Saving results and figures...")
    save_results(results, cortical_weights, X_train, y_train)

    print("\n" + "=" * 60)
    print(f"  EXPERIMENT COMPLETE")
    print(f"  CV Accuracy: {results['cv_accuracy']:.1%}  |  CV AUC: {results['cv_roc_auc']:.3f}")
    if "holdout_accuracy" in results:
        print(f"  HOLDOUT Acc: {results['holdout_accuracy']:.1%}  |  "
              f"Holdout AUC: {results['holdout_roc_auc']:.3f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
