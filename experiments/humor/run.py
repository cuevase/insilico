"""
Humor processing experiment.

Compares brain responses to funny vs. neutral video clips using TRIBE v2.
Expects video stimuli in stimuli/funny/ and stimuli/neutral/.

Usage:
    python experiments/humor/run.py
"""
import sys
from pathlib import Path

import yaml
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from core.model import load_model
from core.glm import fit_first_level_glm
from core.contrasts import compute_contrast, compute_simple_contrast
from core.viz import plot_brain_surface, plot_roi_bar

EXPERIMENT_DIR = Path(__file__).resolve().parent
RESULTS_DIR = EXPERIMENT_DIR / "results"


def load_config() -> dict:
    with open(EXPERIMENT_DIR / "config.yaml") as f:
        return yaml.safe_load(f)


def prepare_stimuli(model, config: dict):
    """Build predictions for each stimulus clip, then concatenate
    into a single predicted time series with a matching events DataFrame.

    Each clip is predicted independently, then the predictions are
    concatenated with rest periods (zeros) in between to form a
    continuous 'run' suitable for GLM analysis.
    """
    rng = np.random.default_rng(42)

    conditions = config["conditions"]
    n_trials = config["stimuli"]["n_trials_per_condition"]
    stim_dur = config["stimuli"]["stimulus_duration"]
    isi_min = config["stimuli"]["isi_min"]
    isi_max = config["stimuli"]["isi_max"]

    # Gather all stimulus files
    trials = []
    for cond in conditions:
        stim_dir = EXPERIMENT_DIR / cond["stimuli_dir"]
        if not stim_dir.exists():
            print(f"  WARNING: {stim_dir} does not exist yet. "
                  f"Place your {cond['name']} video clips there.")
            continue
        videos = sorted(stim_dir.glob("*.mp4"))
        if not videos:
            print(f"  WARNING: No .mp4 files found in {stim_dir}")
            continue
        for i in range(n_trials):
            video = videos[i % len(videos)]
            trials.append({"condition": cond["name"], "video_path": str(video)})

    if not trials:
        raise FileNotFoundError(
            "No stimulus files found. Place .mp4 files in "
            "stimuli/funny/ and stimuli/neutral/ before running."
        )

    rng.shuffle(trials)

    # Predict each clip and assemble into a continuous run
    all_preds = []
    events = []
    current_time = 10.0  # initial rest

    n_vertices = None
    print(f"Processing {len(trials)} trials...")

    for i, trial in enumerate(trials):
        print(f"  [{i+1}/{len(trials)}] {trial['condition']}: "
              f"{Path(trial['video_path']).name}")

        df = model.get_events_dataframe(video_path=trial["video_path"])
        preds, _ = model.predict(events=df)

        if n_vertices is None:
            n_vertices = preds.shape[1]

        # Trim/pad to expected duration
        expected_trs = int(stim_dur)
        if preds.shape[0] >= expected_trs:
            clip_preds = preds[:expected_trs]
        else:
            pad = np.zeros((expected_trs - preds.shape[0], n_vertices))
            clip_preds = np.vstack([preds, pad])

        # Add rest before this clip
        isi = rng.uniform(isi_min, isi_max)
        rest_trs = int(isi)
        rest_preds = np.zeros((rest_trs, n_vertices))

        all_preds.append(rest_preds)
        all_preds.append(clip_preds)

        onset = current_time + rest_trs
        events.append({
            "onset": float(onset),
            "duration": float(stim_dur),
            "condition": trial["condition"],
        })
        current_time = onset + expected_trs

    # Final rest
    all_preds.append(np.zeros((10, n_vertices)))

    full_preds = np.vstack(all_preds)
    events_df = pd.DataFrame(events)

    print(f"Total run: {full_preds.shape[0]} TRs ({full_preds.shape[0]}s)")
    return full_preds, events_df


def run_analysis(preds, events, config):
    print("\nFitting GLM...")
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
        print(f"  {c['name']}: range [{cmap.min():.3f}, {cmap.max():.3f}]")

    return glm_result, contrast_maps


def save_results(preds, contrast_maps, config):
    pred_dir = RESULTS_DIR / "predictions"
    fig_dir = RESULTS_DIR / "figures"
    pred_dir.mkdir(parents=True, exist_ok=True)
    fig_dir.mkdir(parents=True, exist_ok=True)

    np.save(pred_dir / "predictions.npy", preds)
    for name, cmap in contrast_maps.items():
        np.save(pred_dir / f"contrast_{name}.npy", cmap)

    fmt = config["output"]["figure_format"]
    for name, cmap in contrast_maps.items():
        plot_brain_surface(
            cmap,
            title=f"Humor: {name}",
            save_path=str(fig_dir / f"{name}.{fmt}"),
            threshold=0.5,
        )

    print(f"\nResults saved to {RESULTS_DIR}")


def main():
    config = load_config()
    print("=== Humor Processing Experiment ===\n")

    print("Loading TRIBE v2 model...")
    model = load_model()

    print("\nPreparing stimuli and generating predictions...")
    preds, events = prepare_stimuli(model, config)

    glm_result, contrast_maps = run_analysis(preds, events, config)
    save_results(preds, contrast_maps, config)

    print("\n=== Experiment complete ===")


if __name__ == "__main__":
    main()
