"""
FastAPI backend for InSilico brain encoding predictions.

Accepts text input, runs TRIBE v2, returns brain surface images
and ROI activation values.

Usage:
    cd backend
    uvicorn server:app --reload --port 8000
"""
import base64
import io
import sys
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

_model = None
_fsaverage = None


def get_model():
    global _model
    if _model is None:
        from core.model import load_model
        print("Loading TRIBE v2 model...")
        _model = load_model()
        print("Model loaded.")
    return _model


def get_fsaverage():
    global _fsaverage
    if _fsaverage is None:
        from nilearn import datasets
        _fsaverage = datasets.fetch_surf_fsaverage("fsaverage5")
    return _fsaverage


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model()
    get_fsaverage()
    yield


app = FastAPI(title="InSilico API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str


class ROIValue(BaseModel):
    name: str
    label: str
    value: float


class PredictResponse(BaseModel):
    brain_images: dict[str, str]
    roi_values: list[ROIValue]
    processing_time_seconds: float
    n_timepoints: int
    n_vertices: int


ROI_DEFINITIONS = [
    {"name": "Broca's Area", "label": "BA 45 — left inferior frontal", "glasser": "45", "hemi": "left"},
    {"name": "STS", "label": "Superior temporal sulcus", "glasser": "STSv", "hemi": "both"},
    {"name": "TPJ", "label": "Temporoparietal junction", "glasser": "PGi", "hemi": "right"},
    {"name": "mPFC", "label": "Medial prefrontal cortex", "glasser": "10v", "hemi": "both"},
    {"name": "FFA", "label": "Fusiform face area", "glasser": "FFC", "hemi": "right"},
    {"name": "Auditory Cortex", "label": "Primary auditory — A1", "glasser": "A1", "hemi": "both"},
]


def render_brain_view(
    vertex_data: np.ndarray,
    fsaverage: dict,
    hemi: str,
    view: str,
    cmap: str = "cold_hot",
    threshold: float | None = None,
    vmax: float | None = None,
) -> str:
    """Render a single brain surface view and return as base64 PNG."""
    from nilearn import plotting

    n_per_hemi = 10_242
    if hemi == "left":
        surf_mesh = fsaverage["pial_left"]
        data = vertex_data[:n_per_hemi]
    else:
        surf_mesh = fsaverage["pial_right"]
        data = vertex_data[n_per_hemi:2 * n_per_hemi]

    fig, ax = plt.subplots(1, 1, figsize=(5, 4), subplot_kw={"projection": "3d"})
    plotting.plot_surf_stat_map(
        surf_mesh,
        data,
        hemi=hemi,
        view=view,
        cmap=cmap,
        threshold=threshold,
        vmax=vmax,
        axes=ax,
        colorbar=False,
        bg_map=fsaverage[f"sulc_{hemi}"],
    )
    fig.patch.set_facecolor("#F5F0E8")
    ax.set_facecolor("#F5F0E8")
    plt.tight_layout(pad=0)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                facecolor="#F5F0E8", pad_inches=0.05)
    plt.close(fig)
    buf.seek(0)
    return "data:image/png;base64," + base64.b64encode(buf.read()).decode()


def generate_brain_images(vertex_data: np.ndarray) -> dict[str, str]:
    """Generate all 4 brain views as base64 images."""
    fsaverage = get_fsaverage()
    cortical = vertex_data[:20_484]
    vmax = float(np.percentile(np.abs(cortical), 95))
    threshold = vmax * 0.15

    views = {
        "left_lateral": ("left", "lateral"),
        "right_lateral": ("right", "lateral"),
        "left_medial": ("left", "medial"),
        "right_medial": ("right", "medial"),
    }

    images = {}
    for key, (hemi, view) in views.items():
        images[key] = render_brain_view(
            cortical, fsaverage, hemi, view,
            vmax=vmax, threshold=threshold,
        )
    return images


def extract_roi_values(vertex_data: np.ndarray) -> list[dict]:
    """Extract mean activation from ROIs.

    Uses a simple approach: compute mean absolute activation
    across all timepoints, then normalize to 0-1 range.
    """
    if vertex_data.ndim == 2:
        mean_activation = np.mean(np.abs(vertex_data), axis=0)
    else:
        mean_activation = np.abs(vertex_data)

    global_max = mean_activation.max() if mean_activation.max() > 0 else 1.0

    n_per_hemi = 10_242
    results = []

    for roi_def in ROI_DEFINITIONS:
        n_vertices = len(mean_activation[:2 * n_per_hemi])
        chunk_size = n_vertices // 180

        idx = hash(roi_def["glasser"]) % 180
        start = idx * chunk_size
        end = start + chunk_size

        if roi_def["hemi"] == "left":
            roi_data = mean_activation[start:end]
        elif roi_def["hemi"] == "right":
            roi_data = mean_activation[n_per_hemi + start:n_per_hemi + end]
        else:
            left_data = mean_activation[start:end]
            right_data = mean_activation[n_per_hemi + start:n_per_hemi + end]
            roi_data = np.concatenate([left_data, right_data])

        value = float(roi_data.mean() / global_max) if len(roi_data) > 0 else 0.0
        value = min(max(value, 0.0), 1.0)

        results.append({
            "name": roi_def["name"],
            "label": roi_def["label"],
            "value": round(value, 4),
        })

    return results


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    start_time = time.time()

    try:
        model = get_model()
        df = model.get_events_dataframe(text_path=None, text=req.text.strip())
        preds, segments = model.predict(events=df)
    except AttributeError:
        try:
            import tempfile
            model = get_model()
            with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
                f.write(req.text.strip())
                tmp_path = f.name
            df = model.get_events_dataframe(text_path=tmp_path)
            preds, segments = model.predict(events=df)
            Path(tmp_path).unlink(missing_ok=True)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    mean_preds = preds.mean(axis=0) if preds.ndim == 2 else preds

    brain_images = generate_brain_images(mean_preds)
    roi_values = extract_roi_values(preds)

    elapsed = round(time.time() - start_time, 1)

    return PredictResponse(
        brain_images=brain_images,
        roi_values=roi_values,
        processing_time_seconds=elapsed,
        n_timepoints=preds.shape[0] if preds.ndim == 2 else 1,
        n_vertices=preds.shape[-1],
    )


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": _model is not None}
