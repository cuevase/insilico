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
├── website/                # Next.js frontend (experiments site)
├── cache/                  # Model weights & features (gitignored)
├── stimuli/                # Shared stimulus bank
├── experiments/            # Individual experiments (each self-contained)
│   ├── _template/          # Copy to start a new experiment
│   ├── humor/              # Humor vs. neutral text classification
│   ├── physics/            # Real vs. reversed video (intuitive physics)
│   └── metaphor/           # Metaphor comprehension (planned)
├── notebooks/              # Project-level exploration notebooks
├── LICENSE                 # MIT (project code); TRIBE v2 is CC-BY-NC-4.0
└── TRIBE_v2_dev_readme.md  # TRIBE v2 model reference documentation
```

## Running Experiments (CLI)

```bash
source .venv/bin/activate

# Humor experiment (text — runs locally, uses cached embeddings)
python experiments/humor/run.py --holdout --cached-only

# Physics experiment (video — requires GPU for encoding)
python experiments/physics/run.py --holdout
```

## Starting a New Experiment

```bash
cp -r experiments/_template experiments/my_new_experiment
# Edit config.yaml and run.py
```

## License

This project's code is released under the [MIT License](LICENSE). TRIBE v2 model weights and outputs are licensed under [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/) by Meta Research.
