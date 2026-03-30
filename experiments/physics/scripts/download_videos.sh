#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPERIMENT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="${EXPERIMENT_DIR}/physics-iq-data"

echo "=============================================="
echo "  Physics-IQ Benchmark — Video Download"
echo "=============================================="
echo ""
echo "Source: gs://physics-iq-benchmark"
echo "Paper:  arxiv.org/abs/2501.09038"
echo "Target: ${DATA_DIR}"
echo ""

if ! command -v gsutil &> /dev/null; then
    echo "gsutil not found. Installing via pip..."
    pip install gsutil
    echo ""
fi

mkdir -p "${DATA_DIR}/split-videos/testing/30FPS"

echo "Downloading split-videos/testing/30FPS/ ..."
gsutil -m rsync -r \
    "gs://physics-iq-benchmark/split-videos/testing/30FPS/" \
    "${DATA_DIR}/split-videos/testing/30FPS/"

echo ""
echo "Downloading descriptions.csv (if available)..."
gsutil cp "gs://physics-iq-benchmark/descriptions.csv" "${DATA_DIR}/descriptions.csv" 2>/dev/null || \
    echo "  descriptions.csv not found in bucket root, skipping."

echo ""
echo "=============================================="
echo "  Download complete!"
echo "=============================================="
echo ""
echo "Next step: run the prepare script to select 50 videos and create reversed versions:"
echo ""
echo "  python experiments/physics/scripts/prepare_stimuli.py"
echo ""
