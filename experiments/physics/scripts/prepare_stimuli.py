"""
Prepare stimuli for the physics experiment.

Takes downloaded Physics-IQ benchmark videos, selects center-perspective
take-1 clips, copies them into stimuli/real/, reverses each with ffmpeg
(stripping audio) into stimuli/reversed/, and builds stimuli.csv.

With --holdout-n, also prepares a separate holdout test set from scenes
that were NOT used for training (completely unseen videos).

Usage:
    python experiments/physics/scripts/prepare_stimuli.py
    python experiments/physics/scripts/prepare_stimuli.py --n 20
    python experiments/physics/scripts/prepare_stimuli.py --holdout-n 20
    python experiments/physics/scripts/prepare_stimuli.py --holdout-only --holdout-n 20
"""
import argparse
import csv
import random
import shutil
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
EXPERIMENT_DIR = SCRIPT_DIR.parent
DEFAULT_DATA_DIR = EXPERIMENT_DIR / "physics-iq-data" / "split-videos" / "testing" / "30FPS"
STIMULI_DIR = EXPERIMENT_DIR / "stimuli"
REAL_DIR = STIMULI_DIR / "real"
REVERSED_DIR = STIMULI_DIR / "reversed"
HOLDOUT_REAL_DIR = STIMULI_DIR / "holdout_real"
HOLDOUT_REVERSED_DIR = STIMULI_DIR / "holdout_reversed"


def find_videos(data_dir: Path) -> list[Path]:
    """Find center-perspective, take-1 test videos."""
    if not data_dir.exists():
        print(f"ERROR: Data directory not found: {data_dir}")
        print(f"Run the download script first:")
        print(f"  bash experiments/physics/scripts/download_videos.sh")
        sys.exit(1)

    all_mp4 = sorted(data_dir.glob("*.mp4"))
    if not all_mp4:
        all_mp4 = sorted(data_dir.rglob("*.mp4"))

    print(f"Found {len(all_mp4)} total .mp4 files in {data_dir}")

    filtered = []
    for p in all_mp4:
        name = p.stem.lower()
        is_center = "perspective-center" in name or "center" in name
        is_take1 = "take-1" in name
        is_testing = "testing" in name

        if is_center and is_take1:
            filtered.append(p)
        elif is_center and is_testing:
            filtered.append(p)

    if not filtered:
        print("No center-perspective take-1 videos found. Falling back to all videos.")
        filtered = all_mp4

    unique = {}
    for p in filtered:
        scenario_id = p.stem.split("_")[0]
        if scenario_id not in unique:
            unique[scenario_id] = p
    filtered = sorted(unique.values(), key=lambda p: p.stem)

    print(f"Filtered to {len(filtered)} unique scenario videos (center, take-1)")
    return filtered


def extract_category(video_path: Path, descriptions_path: Path | None) -> str:
    """Try to extract the physics category from descriptions.csv or filename."""
    if descriptions_path and descriptions_path.exists():
        scenario_id = video_path.stem.split("_")[0]
        try:
            with open(descriptions_path) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    row_id = str(row.get("id", row.get("ID", ""))).zfill(4)
                    if row_id == scenario_id:
                        for key in ("category", "Category", "physics_category", "type"):
                            if key in row and row[key]:
                                return row[key].strip().lower()
        except Exception:
            pass

    name = video_path.stem.lower()
    for cat in ["fluid", "solid", "optics", "thermo", "magnet"]:
        if cat in name:
            return cat
    return "unknown"


def reverse_video(src: Path, dst: Path) -> bool:
    """Reverse a video and strip audio using ffmpeg."""
    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-vf", "reverse",
        "-an",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        str(dst),
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=120)
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ffmpeg error for {src.name}: {e.stderr.decode()[-200:]}")
        return False
    except FileNotFoundError:
        print("ERROR: ffmpeg not found. Install it first:")
        print("  brew install ffmpeg  (macOS)")
        print("  apt install ffmpeg   (Ubuntu)")
        sys.exit(1)


def strip_audio(src: Path, dst: Path) -> bool:
    """Copy video without audio so real and reversed are comparable."""
    cmd = [
        "ffmpeg", "-y", "-i", str(src),
        "-an",
        "-c:v", "copy",
        str(dst),
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True, timeout=60)
        return True
    except subprocess.CalledProcessError:
        shutil.copy2(src, dst)
        return True


def get_scene_id(video_path: Path) -> str:
    return video_path.stem.split("_")[0]


def prepare_set(
    videos: list[Path],
    real_dir: Path,
    reversed_dir: Path,
    csv_path: Path,
    descriptions_path: Path | None,
    start_id: int = 1,
    set_name: str = "train",
) -> list[dict]:
    """Prepare real + reversed videos and write a CSV for a given set."""
    real_dir.mkdir(parents=True, exist_ok=True)
    reversed_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    stim_id = start_id

    # Determine relative prefix for CSV paths
    real_prefix = real_dir.name
    reversed_prefix = reversed_dir.name

    print(f"\n  Processing {set_name} real videos (stripping audio)...")
    for i, src in enumerate(videos):
        dst = real_dir / src.name
        print(f"    [{i+1}/{len(videos)}] {src.name}")
        strip_audio(src, dst)

        category = extract_category(src, descriptions_path)
        rows.append({
            "id": stim_id,
            "label": "real",
            "video_path": f"{real_prefix}/{src.name}",
            "scene_id": get_scene_id(src),
            "category": category,
        })
        stim_id += 1

    print(f"\n  Reversing {set_name} videos...")
    for i, src in enumerate(videos):
        reversed_name = src.stem + "_reversed.mp4"
        dst = reversed_dir / reversed_name
        print(f"    [{i+1}/{len(videos)}] {src.name} -> {reversed_name}")
        ok = reverse_video(src, dst)

        if ok:
            category = extract_category(src, descriptions_path)
            rows.append({
                "id": stim_id,
                "label": "reversed",
                "video_path": f"{reversed_prefix}/{reversed_name}",
                "scene_id": get_scene_id(src),
                "category": category,
            })
            stim_id += 1
        else:
            print(f"      SKIPPED (ffmpeg failed)")

    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "label", "video_path", "scene_id", "category"])
        writer.writeheader()
        writer.writerows(rows)

    return rows


def main():
    parser = argparse.ArgumentParser(description="Prepare physics experiment stimuli")
    parser.add_argument("--n", type=int, default=50, help="Number of training scenes")
    parser.add_argument("--holdout-n", type=int, default=0,
                        help="Number of holdout test scenes (0 = skip holdout)")
    parser.add_argument("--holdout-only", action="store_true",
                        help="Only prepare holdout set (skip training set)")
    parser.add_argument("--data-dir", type=str, default=None,
                        help="Path to Physics-IQ test videos (30FPS folder)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for selection")
    args = parser.parse_args()

    data_dir = Path(args.data_dir) if args.data_dir else DEFAULT_DATA_DIR
    descriptions_path = data_dir.parent.parent.parent / "descriptions.csv"

    print("=" * 60)
    print("  PHYSICS EXPERIMENT — STIMULUS PREPARATION")
    print("=" * 60)
    print(f"\nData dir:     {data_dir}")
    print(f"Target:       {STIMULI_DIR}")
    print(f"Train scenes: {args.n}")
    print(f"Holdout scenes: {args.holdout_n}")
    print()

    videos = find_videos(data_dir)

    # Use seed=42 to select training scenes (same as original run)
    random.seed(args.seed)
    train_n = min(args.n, len(videos))
    train_selected = sorted(random.sample(videos, train_n), key=lambda p: p.stem)
    train_scene_ids = {get_scene_id(v) for v in train_selected}

    if not args.holdout_only:
        print(f"\n--- TRAINING SET ({len(train_selected)} scenes) ---")
        train_rows = prepare_set(
            train_selected, REAL_DIR, REVERSED_DIR,
            STIMULI_DIR / "stimuli.csv", descriptions_path,
            start_id=1, set_name="training",
        )
        n_real = sum(1 for r in train_rows if r["label"] == "real")
        n_rev = sum(1 for r in train_rows if r["label"] == "reversed")
        print(f"\n  Training set: {len(train_rows)} stimuli ({n_real} real + {n_rev} reversed)")
    else:
        print(f"  Skipping training set (--holdout-only). Using {len(train_scene_ids)} known scene IDs.")

    if args.holdout_n > 0:
        remaining = [v for v in videos if get_scene_id(v) not in train_scene_ids]
        print(f"\n--- HOLDOUT SET ---")
        print(f"  Available unseen scenes: {len(remaining)}")

        if len(remaining) < args.holdout_n:
            print(f"  WARNING: Only {len(remaining)} unseen scenes available.")
            args.holdout_n = len(remaining)

        random.seed(args.seed + 1000)
        holdout_selected = sorted(random.sample(remaining, args.holdout_n), key=lambda p: p.stem)

        overlap = train_scene_ids & {get_scene_id(v) for v in holdout_selected}
        assert len(overlap) == 0, f"LEAK: {len(overlap)} scenes overlap between train and holdout!"
        print(f"  Verified: 0 scene overlap with training set")

        holdout_rows = prepare_set(
            holdout_selected, HOLDOUT_REAL_DIR, HOLDOUT_REVERSED_DIR,
            STIMULI_DIR / "holdout_stimuli.csv", descriptions_path,
            start_id=5001, set_name="holdout",
        )
        n_real = sum(1 for r in holdout_rows if r["label"] == "real")
        n_rev = sum(1 for r in holdout_rows if r["label"] == "reversed")
        print(f"\n  Holdout set: {len(holdout_rows)} stimuli ({n_real} real + {n_rev} reversed)")

    print(f"\n{'=' * 60}")
    print(f"  DONE")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
