"""
Stimulus generation and manipulation utilities.

Handles building event sequences for in-silico experiments:
block designs, event-related designs, and parametric modulations.
"""
from pathlib import Path

import numpy as np
import pandas as pd


def build_block_design(
    conditions: dict[str, list[str]],
    block_duration: float = 16.0,
    rest_duration: float = 16.0,
    n_repetitions: int = 4,
    randomize: bool = True,
    seed: int = 42,
) -> pd.DataFrame:
    """Create a block-design experiment timeline.

    Args:
        conditions: Mapping of condition name -> list of stimulus file paths.
            e.g. {"faces": ["face1.jpg", ...], "places": ["place1.jpg", ...]}
        block_duration: Duration of each stimulus block in seconds.
        rest_duration: Duration of rest between blocks in seconds.
        n_repetitions: Number of times each condition is repeated.
        randomize: Whether to randomize block order.
        seed: Random seed for reproducibility.

    Returns:
        DataFrame with columns: onset, duration, condition, stimulus_path
    """
    rng = np.random.default_rng(seed)
    condition_names = list(conditions.keys())

    block_order = condition_names * n_repetitions
    if randomize:
        rng.shuffle(block_order)

    events = []
    current_time = rest_duration

    for condition in block_order:
        stim_files = conditions[condition]
        n_stims = len(stim_files)
        stim_duration = block_duration / n_stims

        for i, stim_path in enumerate(stim_files):
            events.append({
                "onset": current_time + i * stim_duration,
                "duration": stim_duration,
                "condition": condition,
                "stimulus_path": stim_path,
            })

        current_time += block_duration + rest_duration

    return pd.DataFrame(events)


def build_event_related_design(
    conditions: dict[str, list[str]],
    stimulus_duration: float = 1.0,
    isi_range: tuple[float, float] = (6.0, 10.0),
    n_trials_per_condition: int = 20,
    seed: int = 42,
) -> pd.DataFrame:
    """Create an event-related experiment timeline.

    Stimuli are presented briefly with jittered inter-stimulus intervals,
    matching the visual localizer protocol from the TRIBE v2 paper
    (1s stimulus every ~8s).

    Args:
        conditions: Mapping of condition name -> list of stimulus file paths.
        stimulus_duration: Duration of each stimulus presentation in seconds.
        isi_range: (min, max) inter-stimulus interval in seconds.
        n_trials_per_condition: Number of trials per condition.
        seed: Random seed.

    Returns:
        DataFrame with columns: onset, duration, condition, stimulus_path
    """
    rng = np.random.default_rng(seed)

    trials = []
    for cond, stim_files in conditions.items():
        for i in range(n_trials_per_condition):
            stim_path = stim_files[i % len(stim_files)]
            trials.append({"condition": cond, "stimulus_path": stim_path})

    rng.shuffle(trials)

    events = []
    current_time = 10.0  # initial fixation

    for trial in trials:
        events.append({
            "onset": current_time,
            "duration": stimulus_duration,
            **trial,
        })
        isi = rng.uniform(*isi_range)
        current_time += stimulus_duration + isi

    return pd.DataFrame(events)


def get_total_duration(events: pd.DataFrame, padding: float = 16.0) -> float:
    """Calculate total experiment duration from an events dataframe."""
    last_event_end = (events["onset"] + events["duration"]).max()
    return last_event_end + padding
