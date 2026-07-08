# DMGTTM - Dungeon Master Guide to the Multiverse

The ultimate Dungeon Master companion tool — built for DMs who need quick access to creatures, spells, and magic items, with a powerful warband manager for tracking combat encounters.

## Features

- **Warband Manager** - Create, save, and manage encounter warbands with a live HP tracking table
- **Bestiary Browser** - Search and browse creatures, monsters, and NPCs from the multiverse
- **Spellbook** - Full spell reference with filtering by class, level, and search
- **Magic Items** - Browse and reference magic items instantly
- **Tablet-Friendly UI** - Designed for Android tablets and desktop use
- **HP/Damage Tracking** - Easy hit/healing buttons with visual HP bars during combat
- **Local SQLite Storage** - All warbands saved locally, no cloud required

## Data Included

The `data/` folder contains comprehensive D&D reference data:
- `creatures.json` - Beasts and creatures from the Monster Manual
- `monsters.json` - Full monster entries
- `npcs.json` - Non-player character stat blocks
- `spells.json` - Complete spell database
- `magic items.json` - Magic item compendium
- `gods.json` - Pantheons and deities
- `planes.json` - Planar information

## Architecture

```
DMGTTM/
+-- data/                # D&D JSON data files
+-- server/              # FastAPI backend
|   +-- routes/dm.py    # DM tool API routes
+-- frontend/            # Vue.js 3 + Vite frontend
|   +-- src/pages/      # Views: Warbands, Bestiary, Spells, Magic Items
+-- data/warbands.db    # SQLite warband storage (auto-created)
```

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+ (for frontend)
- No API keys required (fully local)

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd DMGTTM

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -e .
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Running the Server

```bash
# From project root
python server_main.py

# Custom host/port
python server_main.py --host 127.0.0.1 --port 8080
```

## Using the Warband Manager

1. Go to **Warbands** in the sidebar
2. Click **Create** to name a new warband
3. Click the warband name to open it
4. Click **+ Add Creature** to search and add monsters
5. During combat, use **Hit** and **Heal** buttons to adjust HP
6. Click on HP values to edit them directly
7. Members sort by initiative automatically

## Tablet / Android Use

The UI is responsive and tablet-friendly:
- Use Chrome on Android tablets in full-screen mode
- Add to home screen for app-like experience
- HP bars and buttons are touch-optimized
- All data loads locally — no internet required after initial load

## Development

### Running Tests

```bash
pytest tests/
```

### Linting

```bash
ruff check .
mypy .
```

## License

Apache-2.0

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

For bug reports and feature requests, please use the [GitHub Issues](https://github.com/anomalyco/opencode/issues) page.
