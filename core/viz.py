"""
Brain surface visualization utilities.

Wraps nilearn and pyvista for consistent plotting across experiments.
"""
from pathlib import Path
from typing import Optional

import numpy as np
import matplotlib.pyplot as plt


def plot_brain_surface(
    vertex_data: np.ndarray,
    title: str = "",
    cmap: str = "cold_hot",
    threshold: Optional[float] = None,
    vmax: Optional[float] = None,
    views: list[str] | None = None,
    save_path: Optional[str] = None,
    figsize: tuple[int, int] = (12, 6),
):
    """Plot vertex data on the fsaverage5 brain surface.

    The first 10,242 vertices map to the left hemisphere,
    the next 10,242 to the right hemisphere (fsaverage5).

    Args:
        vertex_data: (n_vertices,) data to plot. Can be 20,484 (cortical only)
            or 29,286 (cortical + subcortical).
        title: Plot title.
        cmap: Colormap name.
        threshold: Values below this (absolute) are transparent.
        vmax: Symmetric colorbar max. If None, auto-computed.
        views: List of views, e.g. ["lateral", "medial"]. Default: both.
        save_path: If provided, saves the figure to this path.
        figsize: Figure size.
    """
    from nilearn import datasets, plotting, surface

    fsaverage = datasets.fetch_surf_fsaverage("fsaverage5")

    n_cortical = 20_484
    n_per_hemi = 10_242
    cortical_data = vertex_data[:n_cortical]

    lh_data = cortical_data[:n_per_hemi]
    rh_data = cortical_data[n_per_hemi:]

    if vmax is None:
        vmax = np.percentile(np.abs(cortical_data), 98)

    if views is None:
        views = ["lateral", "medial"]

    fig, axes = plt.subplots(
        len(views), 2,
        figsize=figsize,
        subplot_kw={"projection": "3d"},
    )
    if len(views) == 1:
        axes = axes[np.newaxis, :]

    for i, view in enumerate(views):
        plotting.plot_surf_stat_map(
            fsaverage["pial_left"],
            lh_data,
            hemi="left",
            view=view,
            cmap=cmap,
            threshold=threshold,
            vmax=vmax,
            title=f"LH {view}" if i == 0 and title else None,
            axes=axes[i, 0],
            colorbar=False,
        )
        plotting.plot_surf_stat_map(
            fsaverage["pial_right"],
            rh_data,
            hemi="right",
            view=view,
            cmap=cmap,
            threshold=threshold,
            vmax=vmax,
            title=f"RH {view}" if i == 0 and title else None,
            axes=axes[i, 1],
            colorbar=(i == 0),
        )

    if title:
        fig.suptitle(title, fontsize=14, fontweight="bold")

    plt.tight_layout()

    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Saved: {save_path}")

    return fig


def plot_contrast_comparison(
    contrast_maps: dict[str, np.ndarray],
    save_path: Optional[str] = None,
    **kwargs,
):
    """Plot multiple contrast maps side by side for comparison.

    Args:
        contrast_maps: Dict mapping condition name -> (n_vertices,) contrast.
        save_path: Base path for saving. Files saved as {base}_{condition}.png.
        **kwargs: Passed to plot_brain_surface.
    """
    figs = {}
    for name, data in contrast_maps.items():
        sp = None
        if save_path:
            base = Path(save_path)
            sp = str(base.parent / f"{base.stem}_{name}{base.suffix}")
        fig = plot_brain_surface(data, title=name, save_path=sp, **kwargs)
        figs[name] = fig

    return figs


def plot_roi_bar(
    roi_values: dict[str, float],
    title: str = "",
    ylabel: str = "Contrast value",
    save_path: Optional[str] = None,
    figsize: tuple[int, int] = (8, 5),
):
    """Simple bar plot of ROI values for quick comparison.

    Args:
        roi_values: Dict mapping ROI name -> scalar value.
        title: Plot title.
        ylabel: Y-axis label.
        save_path: If provided, saves the figure.
        figsize: Figure size.
    """
    import seaborn as sns

    fig, ax = plt.subplots(figsize=figsize)
    names = list(roi_values.keys())
    values = list(roi_values.values())

    colors = sns.color_palette("viridis", len(names))
    bars = ax.bar(names, values, color=colors, edgecolor="white", linewidth=0.5)

    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.axhline(y=0, color="gray", linestyle="--", linewidth=0.5)
    sns.despine()

    plt.tight_layout()

    if save_path:
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(save_path, dpi=150, bbox_inches="tight")
        print(f"Saved: {save_path}")

    return fig
