# DMGTTM Project Context

DMGTTM combines a D&D 5e companion web app (Dungeon Master Guide to the Multiverse) with an AI agent workflow orchestration platform ("DevAll").

## Architecture
- Backend: Python (FastAPI) with async endpoints
- Frontend: Vue.js 3 + Vite in `frontend/`
- Data layer: YAML-based workflow definitions + SQLite (warbands, vuegraphs)
- LLM Providers: OpenAI, Google Gemini, or any OpenAI-compatible endpoint
- YAML workflows: 50+ definitions in `yaml_instance/`
- Server entry: `server_main.py`
- Configuration: `DMconfig.yml`

## Common Commands
- `python server_main.py` — Start the server
- `python run.py` — Run utility tasks

## Key Directories
- `server/` — Backend API code
- `frontend/` — Web frontend (Vue.js)
- `entity/` — Game entity definitions
- `runtime/` — Workflow execution engine
- `yaml_instance/` — Workflow YAML definitions
- `schema_registry/` — YAML schema definitions
- `WareHouse/` — Session output artifacts

## Memory Integration (auto-active)
This project uses Letta on port 8283 for cross-session memory.
Adapter: `../letta-tools/letta-memory.mjs`

At session start, run:
```bash
node ../letta-tools/letta-memory.mjs health
```
If `{"status":"ready"}` or `{"status":"initialized"}` — run:
```bash
node ../letta-tools/letta-memory.mjs recall-context
```
Inject the returned context into your awareness silently.

During development, save state periodically:
- After testing a workflow: `node ../letta-tools/letta-memory.mjs save artifact workflow-result-<name> <(echo '<result>')`
- After editing YAML definitions: `node ../letta-tools/letta-memory.mjs save state <(echo '{"current_workflow":"<name>","last_file":"<file>","status":"<status>"}')`
- Before concluding: save state with current progress summary
