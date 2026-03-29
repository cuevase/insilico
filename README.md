# InSilico — Brain Encoding Visualizer

In-silico neuroscience experiments using [TRIBE v2](https://github.com/facebookresearch/tribev2) — Meta's multimodal brain encoding model.

Type text, see which brain regions respond. No scanner required.

## Setup

```bash
# 1. Create environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Clone TRIBE v2 outside the project (avoids import shadowing)
git clone https://github.com/facebookresearch/tribev2.git ../tribev2-repo
pip install -e "../tribev2-repo[plotting]"

# 3. Authenticate with HuggingFace (LLaMA 3.2-3B is gated)
huggingface-cli login

# 4. Install Python dependencies
pip install -r requirements.txt
pip install -r backend/requirements.txt

# 5. Install website dependencies
cd website && pnpm install && cd ..

# 6. Validate setup
python -c "from tribev2 import TribeModel; print('tribev2 OK')"
```

## Running the App

You need two terminals:

**Terminal 1 — Backend (Python/FastAPI):**
```bash
source .venv/bin/activate
uvicorn backend.server:app --port 8000
```

**Terminal 2 — Frontend (Next.js):**
```bash
cd website
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

The first prediction will be slow (~30-60s) as the model downloads weights and loads feature extractors. Subsequent predictions are faster (~10-20s).

## Project Structure

```
insilico/
├── backend/                # FastAPI server (TRIBE v2 inference)
│   └── server.py
├── core/                   # Shared utilities (model loading, GLM, visualization)
├── website/                # Next.js frontend
├── cache/                  # Model weights (gitignored)
├── stimuli/                # Shared stimulus bank
├── experiments/            # Individual experiments (each self-contained)
│   ├── _template/          # Copy to start a new experiment
│   └── humor/              # Humor processing experiment
├── notebooks/              # Project-level exploration notebooks
└── TRIBE_v2_dev_readme.md  # Model reference documentation
```

## Running Experiments (CLI)

```bash
source .venv/bin/activate
python experiments/humor/run.py
```

## Starting a New Experiment

```bash
cp -r experiments/_template experiments/my_new_experiment
# Edit config.yaml and run.py
```
