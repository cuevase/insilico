#!/usr/bin/env python3
"""
Interactive demo: type any text and see which brain regions activate.

Usage:
    python3 demo.py
    python3 demo.py --output-dir my_outputs
"""
import sys
import tempfile
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))


def generate_brain_images(vertex_data: np.ndarray, text: str, output_dir: Path):
    """Render 4 brain surface views and save as PNGs."""
    from nilearn import datasets, plotting

    fsaverage = datasets.fetch_surf_fsaverage("fsaverage5")

    n_cortical = 20_484
    n_hemi = 10_242
    cortical = vertex_data[:n_cortical]

    lh = cortical[:n_hemi]
    rh = cortical[n_hemi:]

    vmax = float(np.percentile(np.abs(cortical), 95))
    if vmax == 0:
        vmax = 1.0

    short_text = text[:60] + ("..." if len(text) > 60 else "")
    files = []

    for hemi, hemi_label, data in [("left", "Left", lh), ("right", "Right", rh)]:
        for view in ["lateral", "medial"]:
            fig, ax = plt.subplots(1, 1, figsize=(7, 6), subplot_kw={"projection": "3d"})
            plotting.plot_surf_stat_map(
                fsaverage[f"pial_{hemi}"],
                data,
                hemi=hemi,
                view=view,
                cmap="cold_hot",
                threshold=vmax * 0.05,
                vmax=vmax,
                axes=ax,
                colorbar=True,
                bg_map=fsaverage[f"sulc_{hemi}"],
            )
            ax.set_title(f"{hemi_label} {view.capitalize()}", fontsize=11, pad=10)
            fig.suptitle(f'"{short_text}"', fontsize=9, color="#666", y=0.02)

            fname = f"{hemi}_{view}.png"
            path = output_dir / fname
            fig.savefig(path, dpi=150, bbox_inches="tight", facecolor="white")
            plt.close(fig)
            files.append(path)

    return files


def get_brain_vector(model, text: str) -> np.ndarray:
    """Run text through TRIBE v2 and return the mean brain activation vector."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write(text)
        tmp_path = f.name

    try:
        df = model.get_events_dataframe(text_path=tmp_path)
        preds, _ = model.predict(events=df)
        vec = preds.mean(axis=0) if preds.ndim == 2 else preds
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    return vec


def print_top_regions(vertex_data: np.ndarray, n: int = 10):
    """Print the top activated Destrieux atlas regions."""
    try:
        from nilearn import datasets
        atlas = datasets.fetch_atlas_surf_destrieux()
        labels_lh = atlas["labels_left"]
        labels_rh = atlas["labels_right"]
        label_names = [l.decode() if isinstance(l, bytes) else l for l in atlas["labels"]]

        n_hemi = 10_242
        cortical = vertex_data[:20_484]
        lh = cortical[:n_hemi]
        rh = cortical[n_hemi:]

        region_scores = {}
        for idx, name in enumerate(label_names):
            if "medial_wall" in name.lower() or "unknown" in name.lower():
                continue
            mask_l = labels_lh == idx
            mask_r = labels_rh == idx
            vals = np.concatenate([lh[mask_l], rh[mask_r]])
            if len(vals) > 0:
                region_scores[name] = float(np.mean(np.abs(vals)))

        sorted_regions = sorted(region_scores.items(), key=lambda x: x[1], reverse=True)

        print(f"\n  Top {n} activated brain regions:")
        print("  " + "-" * 50)
        for i, (name, score) in enumerate(sorted_regions[:n]):
            bar_len = int(score / sorted_regions[0][1] * 20)
            bar = "█" * bar_len
            print(f"  {i+1:2d}. {name:<40s} {bar}")
    except Exception:
        pass


def main():
    import argparse
    parser = argparse.ArgumentParser(description="TRIBE v2 brain activation demo")
    parser.add_argument("--output-dir", default="demo_outputs", help="Directory for output images")
    args = parser.parse_args()

    output_base = PROJECT_ROOT / args.output_dir
    output_base.mkdir(parents=True, exist_ok=True)

    print()
    print("  ╔══════════════════════════════════════════╗")
    print("  ║     TRIBE v2 — Brain Activation Demo     ║")
    print("  ╚══════════════════════════════════════════╝")
    print()
    print("  Loading TRIBE v2 model (this takes a minute the first time)...")
    print()

    from core.model import load_model
    model = load_model()

    print("  Model loaded. Type any text to see brain activations.")
    print('  Type "quit" to exit.\n')

    run_number = 0
    while True:
        try:
            text = input("  > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n  Bye!")
            break

        if not text:
            continue
        if text.lower() in ("quit", "exit", "q"):
            print("  Bye!")
            break

        run_number += 1
        run_dir = output_base / f"run_{run_number:03d}"
        run_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n  Running TRIBE v2 on: \"{text}\"")
        print("  Generating brain predictions...")

        vec = get_brain_vector(model, text)

        np.save(run_dir / "brain_vector.npy", vec)

        print("  Rendering brain surface images...")
        files = generate_brain_images(vec, text, run_dir)

        print_top_regions(vec)

        print(f"\n  Saved {len(files)} images to: {run_dir}/")
        for f in files:
            print(f"    • {f.name}")

        (run_dir / "input.txt").write_text(text)
        print()


if __name__ == "__main__":
    main()
