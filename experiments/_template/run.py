"""
Template experiment runner.

Copy this entire _template/ folder to start a new experiment:
    cp -r experiments/_template experiments/my_experiment

Then modify config.yaml and this script for your specific experiment.

Usage:
    python experiments/_template/run.py
"""
import sys
from pathlib import Path

import yaml
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from core.model import load_model, predict_from_events
from core.glm import fit_first_level_glm
from core.contrasts import compute_contrast, compute_simple_contrast
from core.viz import plot_brain_surface, plot_roi_bar

EXPERIMENT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = EXPERIMENT_DIR / "results"


def load_config() -> dict:
    config_path = EXPERIMENT_DIR / "config.yaml"
    with open(config_path) as f:
        return yaml.safe_load(f)


def prepare_stimuli(config: dict):
    """Prepare stimuli and build events dataframe.

    Override this function for your experiment.
    """
    raise NotImplementedError(
        "Implement prepare_stimuli() for your experiment. "
        "It should return a tribev2-compatible events DataFrame."
    )


def run_predictions(model, events):
    """Run model predictions on the events."""
    print("Running model predictions...")
    preds, segments = predict_from_events(model, events)
    print(f"  Predictions shape: {preds.shape}")
    return preds, segments


def run_analysis(preds, events, config):
    """Fit GLM and compute contrasts."""
    print("Fitting GLM...")
    glm_result = fit_first_level_glm(
        preds, events,
        tr=config["analysis"]["tr"],
        hrf_model=config["analysis"]["hrf_model"],
        high_pass=config["analysis"]["high_pass"],
    )

    print("Computing contrasts...")
    contrast_maps = {}
    for c in config["contrasts"]:
        cmap = compute_contrast(glm_result, c["definition"])
        contrast_maps[c["name"]] = cmap
        print(f"  {c['name']}: max={cmap.max():.3f}, min={cmap.min():.3f}")

    return glm_result, contrast_maps


def save_results(preds, contrast_maps, config):
    """Save predictions and figures."""
    if config["output"]["save_predictions"]:
        pred_dir = RESULTS_DIR / "predictions"
        pred_dir.mkdir(parents=True, exist_ok=True)
        np.save(pred_dir / "predictions.npy", preds)
        for name, cmap in contrast_maps.items():
            np.save(pred_dir / f"contrast_{name}.npy", cmap)
        print(f"Saved predictions to {pred_dir}")

    if config["output"]["save_figures"]:
        fig_dir = RESULTS_DIR / "figures"
        fig_dir.mkdir(parents=True, exist_ok=True)
        fmt = config["output"]["figure_format"]
        for name, cmap in contrast_maps.items():
            plot_brain_surface(
                cmap,
                title=name,
                save_path=str(fig_dir / f"{name}.{fmt}"),
            )
        print(f"Saved figures to {fig_dir}")


def main():
    config = load_config()
    name = config["experiment"]["name"]
    print(f"=== Running experiment: {name} ===\n")

    model = load_model()
    events = prepare_stimuli(config)
    preds, segments = run_predictions(model, events)
    glm_result, contrast_maps = run_analysis(preds, events, config)
    save_results(preds, contrast_maps, config)

    print(f"\n=== Experiment '{name}' complete ===")


if __name__ == "__main__":
    main()
