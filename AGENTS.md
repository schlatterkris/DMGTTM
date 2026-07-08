# DMGTTM Project Context

DMGTTM is a D&D 5e companion web app (Dungeon Master Guide to the Multiverse).

## Architecture
- Backend: Python (FastAPI) with async endpoints
- Frontend: Vue.js 3 + Vite in `frontend/`
- Data: JSON reference files in `data/` — creatures, monsters, spells, magic items, NPCs, gods, planes
- Storage: Local SQLite for warband persistence

## Common Commands
- `python server_main.py` — Start the server
- `python -m pytest -v` — Run tests

## Key Directories
- `server/` — Backend API code
- `frontend/` — Web frontend (Vue.js)
- `data/` — D&D JSON data files
- `tests/` — Test suite
