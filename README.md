# In-Silico Neuroscience Experiments

In-silico neuroscience experiments using [TRIBE v2](https://github.com/facebookresearch/tribev2) — Meta's multimodal brain encoding model.

TRIBE v2 predicts fMRI responses across the entire cortex from video, audio, and text stimuli, enabling controlled neuroscience experiments without scanning a single subject.

## Setup

```bash
# 1. Create environment
conda create -n insilico python=3.10 -y
conda activate insilico

# 2. Clone and install TRIBE v2
git clone https://github.com/facebookresearch/tribev2.git
cd tribev2
pip install -e ".[plotting]"
cd ..

# 3. Authenticate with HuggingFace (LLaMA 3.2-3B is gated)
huggingface-cli login

# 4. Install remaining dependencies
pip install -r requirements.txt

# 5. Validate setup
python -c "from tribev2 import TribeModel; print('tribev2 OK')"
```

## Project Structure

```
insilico/
├── core/                   # Shared utilities (model loading, GLM, visualization)
├── cache/                  # Model weights & cached features (gitignored)
├── stimuli/                # Shared stimulus bank (images, videos, audio, text)
├── experiments/            # Individual experiments (each self-contained)
│   ├── _template/          # Copy to start a new experiment
│   └── humor/              # Humor processing experiment
├── notebooks/              # Project-level exploration notebooks
├── requirements.txt
└── TRIBE_v2_dev_readme.md  # Model reference documentation
```

## Running an Experiment

```bash
# From the project root
python experiments/humor/run.py
```

## Starting a New Experiment

```bash
cp -r experiments/_template experiments/my_new_experiment
# Edit experiments/my_new_experiment/config.yaml and run.py
```
