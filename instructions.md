Terminal 1
cd /Users/emilianocuevas/Desktop/cuevasbuilds/new/insilico
source .venv/bin/activate
uvicorn backend.server:app --port 8000

Terminal 2:
cd /Users/emilianocuevas/Desktop/cuevasbuilds/new/insilico/website
pnpm dev