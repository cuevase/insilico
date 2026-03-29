"""
Thin wrapper around TribeModel for consistent model loading and prediction
across all experiments.
"""
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CACHE = PROJECT_ROOT / "cache"


def load_model(cache_folder: Optional[str] = None):
    """Load the pretrained TRIBE v2 model.

    Returns the model ready for inference in 'unseen subject' mode.
    Weights are downloaded on first call and cached locally.
    """
    from tribev2 import TribeModel

    cache = cache_folder or str(DEFAULT_CACHE)
    model = TribeModel.from_pretrained("facebook/tribev2", cache_folder=cache)
    return model


def predict_from_video(model, video_path: str) -> tuple[np.ndarray, pd.DataFrame]:
    """Run full pipeline: video -> events -> fMRI prediction."""
    df = model.get_events_dataframe(video_path=video_path)
    preds, segments = model.predict(events=df)
    return preds, segments


def predict_from_audio(model, audio_path: str) -> tuple[np.ndarray, pd.DataFrame]:
    """Run full pipeline: audio -> events -> fMRI prediction."""
    df = model.get_events_dataframe(audio_path=audio_path)
    preds, segments = model.predict(events=df)
    return preds, segments


def predict_from_text(model, text_path: str) -> tuple[np.ndarray, pd.DataFrame]:
    """Run full pipeline: text -> TTS -> events -> fMRI prediction.

    Text is automatically converted to speech and transcribed for word timings
    by the tribev2 pipeline.
    """
    df = model.get_events_dataframe(text_path=text_path)
    preds, segments = model.predict(events=df)
    return preds, segments


def predict_from_events(model, events: pd.DataFrame) -> tuple[np.ndarray, pd.DataFrame]:
    """Run prediction from a pre-built events dataframe."""
    preds, segments = model.predict(events=events)
    return preds, segments
