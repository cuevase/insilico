"""
Contrast map computation for in-silico experiments.

Computes contrasts between conditions from GLM beta maps,
following the same approach as the TRIBE v2 paper.
"""
import numpy as np


def compute_contrast(
    glm_result: dict,
    contrast_def: str | dict[str, float],
) -> np.ndarray:
    """Compute a contrast map from GLM results.

    Args:
        glm_result: Output from core.glm.fit_first_level_glm.
        contrast_def: Either a string like "faces - places" or a dict
            mapping condition names to weights like {"faces": 1, "places": -1}.

    Returns:
        (n_vertices,) contrast map.
    """
    labels = glm_result["labels"]
    betas = glm_result["betas"]

    if isinstance(contrast_def, str):
        contrast_def = _parse_contrast_string(contrast_def)

    contrast_vector = np.zeros(len(labels))
    for cond, weight in contrast_def.items():
        if cond not in labels:
            raise ValueError(
                f"Condition '{cond}' not found in GLM labels: {labels}"
            )
        idx = labels.index(cond)
        contrast_vector[idx] = weight

    return contrast_vector @ betas


def compute_simple_contrast(
    glm_result: dict,
    condition: str,
    baseline_conditions: list[str] | None = None,
) -> np.ndarray:
    """Compute a simple contrast: condition minus mean of all others.

    This matches the TRIBE v2 paper's visual localizer protocol:
    predicted response for one category minus the mean of all other categories.

    Args:
        glm_result: Output from core.glm.fit_first_level_glm.
        condition: The target condition.
        baseline_conditions: Conditions to average for baseline. If None,
            uses all non-drift, non-constant regressors except target.

    Returns:
        (n_vertices,) contrast map.
    """
    labels = glm_result["labels"]
    betas = glm_result["betas"]

    nuisance_prefixes = ("drift", "constant")

    if baseline_conditions is None:
        baseline_conditions = [
            l for l in labels
            if l != condition and not l.startswith(nuisance_prefixes)
        ]

    if not baseline_conditions:
        raise ValueError("No baseline conditions found")

    weights = {}
    weights[condition] = 1.0
    for bl in baseline_conditions:
        weights[bl] = -1.0 / len(baseline_conditions)

    return compute_contrast(glm_result, weights)


def _parse_contrast_string(s: str) -> dict[str, float]:
    """Parse 'A - B' or 'A + B - C' style contrast strings."""
    weights = {}
    s = s.replace("-", "+ -")
    parts = [p.strip() for p in s.split("+") if p.strip()]

    for part in parts:
        if part.startswith("-"):
            name = part[1:].strip()
            weights[name] = weights.get(name, 0) - 1.0
        else:
            tokens = part.split()
            if len(tokens) == 2:
                try:
                    w = float(tokens[0])
                    name = tokens[1]
                except ValueError:
                    name = part
                    w = 1.0
            else:
                name = part
                w = 1.0
            weights[name] = weights.get(name, 0) + w

    return weights
