"""Test configuration and fixtures for the DMGTTM project."""

import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# ── Environment isolation ──────────────────────────────────────────────
# These must be set BEFORE importing server.app (which loads .env at
# import time via load_dotenv_file / os.environ.setdefault).
os.environ.setdefault("SERVER_LOG_FILE", "")
os.environ.setdefault("LOG_LEVEL", "CRITICAL")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("OPENAI_BASE_URL", "http://test.local/v1")


@pytest.fixture(scope="session")
def app():
    from server.app import app as _app
    return _app


@pytest.fixture
def client(app):
    with TestClient(app) as c:
        yield c


@pytest.fixture
def tmp_db_dir():
    with tempfile.TemporaryDirectory() as d:
        yield Path(d)


@pytest.fixture
def warband_db_override(monkeypatch, tmp_db_dir):
    """Point the warband SQLite DB to a temporary file."""
    db_path = tmp_db_dir / "warbands.db"
    monkeypatch.setattr("server.routes.dm.WARBAND_DB", db_path)
    from server.routes.dm import _init_warband_db
    _init_warband_db()
    return db_path
