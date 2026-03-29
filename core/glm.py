"""
GLM (General Linear Model) fitting for in-silico fMRI analysis.

Uses nilearn's FirstLevelModel with canonical HRF, matching
the protocol described in the TRIBE v2 paper.
"""
import numpy as np
import pandas as pd


def fit_first_level_glm(
    predictions: np.ndarray,
    events: pd.DataFrame,
    tr: float = 1.0,
    hrf_model: str = "spm",
    drift_model: str = "cosine",
    high_pass: float = 0.01,
    noise_model: str = "ar1",
):
    """Fit a first-level GLM to predicted fMRI time series.

    This wraps nilearn's FirstLevelModel to work with TRIBE v2 outputs,
    which are vertex-wise predictions on fsaverage5 (not volumetric).

    Args:
        predictions: (n_timepoints, n_vertices) predicted BOLD signals.
        events: DataFrame with onset, duration, condition columns.
        tr: Repetition time in seconds (TRIBE v2 outputs at 1 Hz, so TR=1).
        hrf_model: HRF model to use.
        drift_model: Drift model for slow signal fluctuations.
        high_pass: High-pass filter cutoff in Hz.
        noise_model: Noise model for the GLM.

    Returns:
        dict with keys:
            - 'labels': design matrix column labels
            - 'betas': (n_regressors, n_vertices) beta estimates
            - 'design_matrix': the design matrix as a DataFrame
    """
    from nilearn.glm.first_level import FirstLevelModel, make_first_level_design_matrix

    n_timepoints = predictions.shape[0]
    frame_times = np.arange(n_timepoints) * tr

    glm_events = events[["onset", "duration", "condition"]].copy()
    glm_events = glm_events.rename(columns={"condition": "trial_type"})

    design_matrix = make_first_level_design_matrix(
        frame_times=frame_times,
        events=glm_events,
        hrf_model=hrf_model,
        drift_model=drift_model,
        high_pass=high_pass,
    )

    X = design_matrix.values
    betas, _, _, _ = np.linalg.lstsq(X, predictions, rcond=None)

    return {
        "labels": list(design_matrix.columns),
        "betas": betas,
        "design_matrix": design_matrix,
    }


def compute_tstat(glm_result: dict, predictions: np.ndarray) -> np.ndarray:
    """Compute t-statistics for each regressor.

    Args:
        glm_result: Output from fit_first_level_glm.
        predictions: The original (n_timepoints, n_vertices) predictions.

    Returns:
        (n_regressors, n_vertices) t-statistic maps.
    """
    X = glm_result["design_matrix"].values
    betas = glm_result["betas"]

    residuals = predictions - X @ betas
    n, p = X.shape
    mse = np.sum(residuals ** 2, axis=0) / (n - p)

    XtX_inv = np.linalg.inv(X.T @ X)
    se = np.sqrt(np.diag(XtX_inv)[:, None] * mse[None, :])

    t_stats = betas / (se + 1e-10)
    return t_stats
