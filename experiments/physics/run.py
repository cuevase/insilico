"""
Real vs. reversed physics classification experiment.

Can predicted brain responses (via TRIBE v2) distinguish real physical events
from time-reversed versions of the same clips?  This script:
  1. Loads stimuli (real + reversed physics videos from Physics-IQ benchmark)
  2. Passes each video through TRIBE v2 → predicted fMRI activation
  3. Collects brain-pattern feature vectors
  4. Trains a logistic-regression classifier with proper cross-validation
  5. (Optional) Evaluates on a completely unseen holdout test set
  6. Reports accuracy, top discriminative brain regions, and saves figures

Methodological fixes (v2):
  - Pipeline(StandardScaler, LogisticRegression) so scaling happens inside CV
  - GroupKFold by scene_id so paired real/reversed videos stay in the same fold
  - Holdout test on scenes never seen during training

Usage:
    python experiments/physics/run.py            # full run (CV only)
    python experiments/physics/run.py --holdout  # include holdout test
    python experiments/physics/run.py --n 10     # quick test with 10 stimuli
"""
import argparse
import json
import sys
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
HOLDOUT_CACHE_DIR = RESULTS_DIR / "holdout_embeddings"
STIMULI_DIR = EXPERIMENT_DIR / "stimuli"

POSITIVE_LABEL = "reversed"
NEGATIVE_LABEL = "real"


def load_config() -> dict:
    with open(EXPERIMENT_DIR / "config.yaml") as f:
        return yaml.safe_load(f)


def load_stimuli(csv_path: Path, n: int | None = None) -> pd.DataFrame:
    """Load a stimuli CSV (id, label, video_path, scene_id, category)."""
    df = pd.read_csv(csv_path)
    if "scene_id" not in df.columns:
        df["scene_id"] = df["video_path"].apply(
            lambda p: Path(p).stem.split("_")[0].replace("-reversed", "")
        )
    if n is not None:
        n_per = n // 2
        pos = df[df.label == POSITIVE_LABEL].head(n_per)
        neg = df[df.label == NEGATIVE_LABEL].head(n_per)
        df = pd.concat([pos, neg]).reset_index(drop=True)
    print(f"  Loaded {len(df)} stimuli: "
          f"{(df.label == NEGATIVE_LABEL).sum()} {NEGATIVE_LABEL}, "
          f"{(df.label == POSITIVE_LABEL).sum()} {POSITIVE_LABEL}")
    return df


def get_brain_vector(model, video_path: str, stim_id: int,
                     cache_dir: Path = CACHE_DIR) -> np.ndarray | None:
    """Run a single video through TRIBE v2 and return the mean brain vector.

    Caches results to disk so interrupted runs can resume.
    """
    cache_path = cache_dir / f"stim_{stim_id:04d}.npy"
    if cache_path.exists():
        return np.load(cache_path)

    full_path = str(STIMULI_DIR / video_path)
    if not Path(full_path).exists():
        print(f"    WARNING: video not found: {full_path}")
        return None

    try:
        df = model.get_events_dataframe(video_path=full_path)
        preds, _ = model.predict(events=df)

        mean_vec = preds.mean(axis=0) if preds.ndim == 2 else preds
        np.save(cache_path, mean_vec)
        return mean_vec

    except Exception as e:
        print(f"    ERROR on stim {stim_id}: {e}")
        return None


def collect_embeddings(
    model, stimuli: pd.DataFrame, cache_dir: Path = CACHE_DIR
) -> tuple[np.ndarray, np.ndarray, list[int], list[str]]:
    """Run all stimuli through the model and collect brain vectors."""
    cache_dir.mkdir(parents=True, exist_ok=True)

    vectors, labels, valid_ids, scene_ids = [], [], [], []

    total = len(stimuli)
    for i, row in stimuli.iterrows():
        idx = int(i) + 1
        print(f"  [{idx}/{total}] {row.label}: {row.video_path}")
        t0 = time.time()
        vec = get_brain_vector(model, row.video_path, row.id, cache_dir)
        elapsed = time.time() - t0

        if vec is not None:
            vectors.append(vec)
            labels.append(1 if row.label == POSITIVE_LABEL else 0)
            valid_ids.append(row.id)
            scene_ids.append(row.scene_id)
            print(f"           done ({elapsed:.1f}s, {vec.shape[0]} vertices)")
        else:
            print(f"           SKIPPED")

    X = np.vstack(vectors)
    y = np.array(labels)
    return X, y, valid_ids, scene_ids


def run_classification(X: np.ndarray, y: np.ndarray, groups: list[str],
                       config: dict) -> dict:
    """Train and evaluate with Pipeline + GroupKFold (no leakage)."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import GroupKFold, cross_val_predict
    from sklearn.metrics import (
        accuracy_score, classification_report,
        confusion_matrix, roc_auc_score,
    )
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler

    n_folds = config["classification"]["n_folds"]
    n_groups = len(set(groups))
    if n_folds > n_groups:
        n_folds = n_groups
        print(f"  Reduced folds to {n_folds} (only {n_groups} unique scenes)")

    print(f"\n  Classification: {X.shape[0]} samples, {X.shape[1]} features, "
          f"{n_folds}-fold GroupKFold ({n_groups} scenes)")

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(
            C=config["classification"]["regularization_C"],
            max_iter=10000,
            solver="saga",
            l1_ratio=1.0,
        )),
    ])

    groups_arr = np.array(groups)
    cv = GroupKFold(n_splits=n_folds)

    y_pred = cross_val_predict(pipe, X, y, cv=cv, groups=groups_arr)
    y_prob = cross_val_predict(pipe, X, y, cv=cv, groups=groups_arr,
                               method="predict_proba")[:, 1]

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
        "n_scenes": n_groups,
        "cv_method": "GroupKFold (scene-level, Pipeline with StandardScaler)",
    }
    return results, pipe


def run_holdout_test(pipe, X_train: np.ndarray, y_train: np.ndarray,
                     X_test: np.ndarray, y_test: np.ndarray) -> dict:
    """Evaluate a trained pipeline on completely unseen holdout data."""
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
    print(f"  HOLDOUT TEST (completely unseen scenes)")
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

    Positive weights → more reversed-predictive (physics violation detection).
    Negative weights → more real-predictive.
    """
    weights = pipe.named_steps["clf"].coef_[0]
    n_cortical = 2 * n_vertices_per_hemi
    cortical_weights = weights[:n_cortical]
    return cortical_weights


def save_results(results: dict, cortical_weights: np.ndarray,
                 X: np.ndarray, y: np.ndarray,
                 X_holdout: np.ndarray | None = None,
                 y_holdout: np.ndarray | None = None):
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

    if X_holdout is not None:
        np.save(RESULTS_DIR / "holdout_X.npy", X_holdout)
        np.save(RESULTS_DIR / "holdout_y.npy", y_holdout)

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
                    title=f"Real vs Reversed Physics — {hemi_name} {view.capitalize()}",
                )
                fname = f"weights_{hemi}_{view}.png"
                fig.savefig(fig_dir / fname, dpi=150, bbox_inches="tight")
                plt.close(fig)
                print(f"  Saved {fname}")
    except Exception as e:
        print(f"  Warning: could not generate brain figures: {e}")

    # PCA scatter for training data
    try:
        from sklearn.decomposition import PCA
        pca = PCA(n_components=2)
        X_2d = pca.fit_transform(X)

        fig, ax = plt.subplots(figsize=(8, 6))
        for label, name, color in [(0, "Real", "#2ECC71"), (1, "Reversed", "#E67E22")]:
            mask = y == label
            ax.scatter(X_2d[mask, 0], X_2d[mask, 1], c=color, label=name, alpha=0.7, s=60)
        ax.set_xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%} var)")
        ax.set_ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%} var)")
        ax.set_title("Brain Response Patterns: Real vs Reversed Physics")
        ax.legend()
        fig.savefig(fig_dir / "pca_scatter.png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        print("  Saved pca_scatter.png")
    except Exception as e:
        print(f"  Warning: could not generate PCA figure: {e}")

    # CV confusion matrix
    try:
        cm_key = "cv_confusion_matrix" if "cv_confusion_matrix" in results else "confusion_matrix"
        cm = np.array(results[cm_key])
        acc_key = "cv_accuracy" if "cv_accuracy" in results else "accuracy"
        fig, ax = plt.subplots(figsize=(5, 4))
        im = ax.imshow(cm, cmap="Greens")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Real", "Reversed"])
        ax.set_yticklabels(["Real", "Reversed"])
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

    # Holdout confusion matrix (if available)
    if "holdout_confusion_matrix" in results:
        try:
            cm = np.array(results["holdout_confusion_matrix"])
            fig, ax = plt.subplots(figsize=(5, 4))
            im = ax.imshow(cm, cmap="Blues")
            ax.set_xticks([0, 1])
            ax.set_yticks([0, 1])
            ax.set_xticklabels(["Real", "Reversed"])
            ax.set_yticklabels(["Real", "Reversed"])
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
                        help="Number of training stimuli (for quick testing)")
    parser.add_argument("--holdout", action="store_true",
                        help="Also run holdout test on unseen scenes")
    args = parser.parse_args()

    config = load_config()
    print("=" * 60)
    print("  INTUITIVE PHYSICS — REAL vs REVERSED CLASSIFICATION")
    print("  Can brain responses detect violations of physical laws?")
    print("  Methodology: Pipeline + GroupKFold (no leakage)")
    print("=" * 60)

    print("\n1. Loading TRIBE v2 model...")
    from core.model import load_model
    model = load_model()

    # --- Training data ---
    print("\n2. Loading training stimuli...")
    train_csv = STIMULI_DIR / "stimuli.csv"
    stimuli = load_stimuli(train_csv, args.n)

    print("\n3. Generating brain predictions (training set)...")
    t0 = time.time()
    X, y, valid_ids, scene_ids = collect_embeddings(model, stimuli, CACHE_DIR)
    elapsed = time.time() - t0
    print(f"   Done: {X.shape[0]} embeddings in {elapsed/60:.1f} minutes")
    print(f"   Shape: {X.shape} | Unique scenes: {len(set(scene_ids))}")

    print("\n4. Training classifier (GroupKFold CV)...")
    results, pipe = run_classification(X, y, scene_ids, config)

    # --- Holdout test ---
    X_holdout, y_holdout = None, None
    holdout_csv = STIMULI_DIR / "holdout_stimuli.csv"

    if args.holdout:
        if not holdout_csv.exists():
            print(f"\n  ERROR: Holdout stimuli not found at {holdout_csv}")
            print(f"  Run: python experiments/physics/scripts/prepare_stimuli.py --holdout-only --holdout-n 20")
        else:
            print("\n5. Loading holdout stimuli (unseen scenes)...")
            holdout_stimuli = load_stimuli(holdout_csv)

            train_scenes = set(scene_ids)
            holdout_scenes = set(holdout_stimuli["scene_id"].tolist())
            overlap = train_scenes & holdout_scenes
            if overlap:
                print(f"  FATAL: {len(overlap)} scenes overlap! Aborting holdout.")
            else:
                print(f"  Verified: 0 overlap between train ({len(train_scenes)}) "
                      f"and holdout ({len(holdout_scenes)}) scenes")

                print("\n6. Generating brain predictions (holdout set)...")
                t0 = time.time()
                X_holdout, y_holdout, _, _ = collect_embeddings(
                    model, holdout_stimuli, HOLDOUT_CACHE_DIR
                )
                elapsed = time.time() - t0
                print(f"   Done: {X_holdout.shape[0]} embeddings in {elapsed/60:.1f} min")

                print("\n7. Evaluating on holdout (completely unseen)...")
                holdout_results = run_holdout_test(pipe, X, y, X_holdout, y_holdout)
                results.update(holdout_results)

    print(f"\n{'8' if args.holdout else '5'}. Analyzing discriminative brain regions...")
    cortical_weights = analyze_discriminative_regions(pipe)
    top_pos = np.argsort(cortical_weights)[-10:]
    top_neg = np.argsort(cortical_weights)[:10]
    print(f"   Top reversed-predictive vertices: {top_pos}")
    print(f"   Top real-predictive vertices: {top_neg}")

    step = "9" if args.holdout else "6"
    print(f"\n{step}. Saving results and figures...")
    save_results(results, cortical_weights, X, y, X_holdout, y_holdout)

    print("\n" + "=" * 60)
    print(f"  EXPERIMENT COMPLETE")
    print(f"  CV Accuracy: {results['cv_accuracy']:.1%}  |  CV AUC: {results['cv_roc_auc']:.3f}")
    if "holdout_accuracy" in results:
        print(f"  HOLDOUT Acc: {results['holdout_accuracy']:.1%}  |  "
              f"Holdout AUC: {results['holdout_roc_auc']:.3f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
