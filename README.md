# InSilico — Brain Encoding Visualizer

In-silico neuroscience experiments using [TRIBE v2](https://github.com/facebookresearch/tribev2) — Meta's multimodal brain encoding model.

**What this repo is for:** This is a **public record** of how analyses and figures were produced: code, configs, stimuli, and experiment layouts are here so anyone can **inspect the reasoning and pipeline**, not so the project reads as a polished, supported “clone and reproduce” kit. I host a small site separately; what you see on GitHub is mainly **methodology and provenance**.

## What you can see here

- **`experiments/`** — Per-study folders: `run.py`, configs, stimuli, and (where committed) outputs or paths to how results were derived.
- **`core/`** — Shared helpers (model loading, GLM, visualization) used across experiments.
- **`backend/`** & **`website/`** — Code for the interactive stack I run locally; present for transparency, not documented here as a product to install.
- **`notebooks/`** — Ad hoc exploration.
- **`TRIBE_v2_dev_readme.md`** — Notes on the TRIBE v2 model for context.

If something is missing (e.g. large weights, caches), it is usually **gitignored** or **gated** (e.g. Hugging Face for LLaMA); the point is to show **how** things were wired, not to guarantee a one-command rerun on every machine.

## Project structure (overview)

```
insilico/
├── backend/                # FastAPI server (TRIBE v2 inference)
├── core/                   # Shared utilities (model loading, GLM, visualization)
├── website/                # Next.js frontend (personal deployment)
├── cache/                  # Model weights & features (gitignored)
├── stimuli/                # Shared stimulus bank
├── experiments/            # Individual experiments (code + stimuli + derivation trail)
│   ├── _template/          # Structural reference for how experiments are organized
│   ├── humor/
│   ├── physics/
│   └── metaphor/
├── notebooks/
├── LICENSE                 # MIT (project code); TRIBE v2 is CC-BY-NC-4.0
└── TRIBE_v2_dev_readme.md
```

## License

This project's code is released under the [MIT License](LICENSE). TRIBE v2 model weights and outputs are licensed under [CC-BY-NC-4.0](https://creativecommons.org/licenses/by-nc/4.0/) by Meta Research.
