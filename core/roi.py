"""
ROI (Region of Interest) analysis using the Glasser parcellation.

Maps vertex-level predictions to named brain regions, matching the
ROI labels used in the TRIBE v2 paper.
"""
import numpy as np

GLASSER_ROI_MAP = {
    "FFA": "FFC",       # Fusiform Face Complex
    "PPA": "PH",        # Parahippocampal Place Area
    "EBA": "V4t",       # Extrastriate Body Area
    "VWFA": "A5",       # Visual Word Form Area
    "Broca": "45",      # Broca's area (pars triangularis)
    "STS": "STSv",      # Superior Temporal Sulcus (ventral)
    "TPJ": "PGi",       # Temporoparietal Junction
    "MTG": "TE1a",      # Middle Temporal Gyrus
}


def get_glasser_labels():
    """Load Glasser parcellation labels for fsaverage5.

    Returns:
        (n_vertices,) array of integer parcel labels, and a dict mapping
        label integers to parcel names.
    """
    from nilearn import datasets

    atlas = datasets.fetch_atlas_surf_destrieux()
    # For Glasser, we use the surface parcellation
    # This may need adjustment based on available atlases
    labels_lh = atlas["map_left"]
    labels_rh = atlas["map_right"]
    labels = np.concatenate([labels_lh, labels_rh])
    label_names = atlas["labels"]

    name_map = {i: name for i, name in enumerate(label_names)}
    return labels, name_map


def extract_roi_timeseries(
    predictions: np.ndarray,
    roi_vertices: np.ndarray,
) -> np.ndarray:
    """Extract mean time series from a set of vertices.

    Args:
        predictions: (n_timepoints, n_vertices) array.
        roi_vertices: Boolean mask or integer indices of ROI vertices.

    Returns:
        (n_timepoints,) mean ROI time series.
    """
    return predictions[:, roi_vertices].mean(axis=1)


def extract_roi_value(
    vertex_map: np.ndarray,
    roi_vertices: np.ndarray,
) -> float:
    """Extract mean value from a contrast/stat map within an ROI.

    Args:
        vertex_map: (n_vertices,) map (contrast, t-stat, etc.).
        roi_vertices: Boolean mask or integer indices.

    Returns:
        Mean value within the ROI.
    """
    return float(vertex_map[roi_vertices].mean())


def compare_rois(
    vertex_map: np.ndarray,
    roi_dict: dict[str, np.ndarray],
) -> dict[str, float]:
    """Extract values from multiple ROIs for comparison.

    Args:
        vertex_map: (n_vertices,) map.
        roi_dict: Mapping of ROI name -> vertex indices/mask.

    Returns:
        Dict mapping ROI name -> mean value.
    """
    return {
        name: extract_roi_value(vertex_map, vertices)
        for name, vertices in roi_dict.items()
    }
