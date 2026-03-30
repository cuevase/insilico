"""
Prepare stimuli for the physics experiment.

Takes downloaded Physics-IQ benchmark videos, selects 50 center-perspective
take-1 clips, copies them into stimuli/real/, reverses each with ffmpeg
(stripping audio) into stimuli/reversed/, and builds stimuli.csv.

Usage:
    python experiments/physics/scripts/prepare_stimuli.py
    python experiments/physics/scripts/prepare_stimuli.py --n 20   # fewer for testing
    python experiments/physics/scripts/prepare_stimuli.py --data-dir /path/to/physics-iq-data
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


def main():
    parser = argparse.ArgumentParser(description="Prepare physics experiment stimuli")
    parser.add_argument("--n", type=int, default=50, help="Number of videos per condition")
    parser.add_argument("--data-dir", type=str, default=None,
                        help="Path to Physics-IQ test videos (30FPS folder)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for selection")
    args = parser.parse_args()

    data_dir = Path(args.data_dir) if args.data_dir else DEFAULT_DATA_DIR
    descriptions_path = data_dir.parent.parent.parent / "descriptions.csv"

    print("=" * 60)
    print("  PHYSICS EXPERIMENT — STIMULUS PREPARATION")
    print("=" * 60)
    print(f"\nData dir:  {data_dir}")
    print(f"Target:    {STIMULI_DIR}")
    print(f"N per cond: {args.n}")
    print()

    videos = find_videos(data_dir)
    if len(videos) < args.n:
        print(f"WARNING: Only {len(videos)} videos available, using all of them.")
        args.n = len(videos)

    random.seed(args.seed)
    selected = sorted(random.sample(videos, args.n), key=lambda p: p.stem)
    print(f"Selected {len(selected)} videos")

    REAL_DIR.mkdir(parents=True, exist_ok=True)
    REVERSED_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    stim_id = 1

    print("\nProcessing real videos (stripping audio)...")
    for i, src in enumerate(selected):
        dst = REAL_DIR / src.name
        print(f"  [{i+1}/{len(selected)}] {src.name}")
        strip_audio(src, dst)

        category = extract_category(src, descriptions_path)
        rows.append({
            "id": stim_id,
            "label": "real",
            "video_path": f"real/{src.name}",
            "category": category,
        })
        stim_id += 1

    print("\nReversing videos (this may take a few minutes)...")
    for i, src in enumerate(selected):
        reversed_name = src.stem + "_reversed.mp4"
        dst = REVERSED_DIR / reversed_name
        print(f"  [{i+1}/{len(selected)}] {src.name} -> {reversed_name}")
        ok = reverse_video(src, dst)

        if ok:
            category = extract_category(src, descriptions_path)
            rows.append({
                "id": stim_id,
                "label": "reversed",
                "video_path": f"reversed/{reversed_name}",
                "category": category,
            })
            stim_id += 1
        else:
            print(f"    SKIPPED (ffmpeg failed)")

    csv_path = STIMULI_DIR / "stimuli.csv"
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "label", "video_path", "category"])
        writer.writeheader()
        writer.writerows(rows)

    n_real = sum(1 for r in rows if r["label"] == "real")
    n_reversed = sum(1 for r in rows if r["label"] == "reversed")
    print(f"\n{'=' * 60}")
    print(f"  DONE: {len(rows)} stimuli ({n_real} real + {n_reversed} reversed)")
    print(f"  CSV:  {csv_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
