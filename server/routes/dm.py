"""Dungeon Master tool API routes."""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/dm", tags=["dm"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def _load_json(filename: str) -> Any:
    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"{filename} not found")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _flatten_entries(data: Any, path: str = "") -> List[Dict[str, Any]]:
    """Flatten nested JSON structures into a list of entries with name and content."""
    results = []
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "content" and isinstance(value, (str, list)):
                continue
            current_path = f"{path} > {key}" if path else key
            if isinstance(value, dict):
                if "content" in value and isinstance(value["content"], (str, list)):
                    entry = {"name": key, "path": current_path}
                    content = value["content"]
                    if isinstance(content, list):
                        entry["text"] = " ".join(
                            str(c) if not isinstance(c, dict) else json.dumps(c)
                            for c in content
                        )
                        _extract_stats_from_content(entry, content)
                    else:
                        entry["text"] = str(content)
                    results.append(entry)
                else:
                    results.extend(_flatten_entries(value, current_path))
            elif isinstance(value, list):
                entry = {"name": key, "path": current_path, "text": json.dumps(value)}
                _extract_stats_from_content(entry, value)
                results.append(entry)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, dict) and "name" in item:
                results.append(item)
            else:
                results.extend(_flatten_entries(item, f"{path}[{i}]"))
    return results


def _extract_stats_from_content(entry: Dict[str, Any], content: list) -> None:
    """Extract AC, HP, speed from content list into entry."""
    for item in content:
        if not isinstance(item, str):
            continue
        if item.startswith("**Armor Class**"):
            entry["ac"] = item.replace("**Armor Class**", "").strip()
        elif item.startswith("**Hit Points**"):
            entry["hp"] = item.replace("**Hit Points**", "").strip()
        elif item.startswith("**Speed**"):
            entry["speed"] = item.replace("**Speed**", "").strip()
        elif item.startswith("*") and "beast" in item.lower() or "humanoid" in item.lower():
            entry["type_line"] = item


# ── Bestiary (Creatures + Monsters) ────────────────────────────────────────

@router.get("/bestiary")
def get_bestiary(q: str = Query(""), category: str = Query("all")):
    """Search creatures and monsters."""
    results = []
    try:
        if category in ("all", "creatures"):
            creatures = _load_json("creatures.json")
            results.extend(_flatten_entries(creatures))
    except Exception:
        pass
    try:
        if category in ("all", "monsters"):
            monsters = _load_json("monsters.json")
            results.extend(_flatten_entries(monsters))
    except Exception:
        pass
    try:
        if category in ("all", "npcs"):
            npcs = _load_json("npcs.json")
            results.extend(_flatten_entries(npcs))
    except Exception:
        pass

    if q:
        q_lower = q.lower()
        results = [r for r in results if q_lower in r.get("name", "").lower() or q_lower in r.get("text", "").lower()]

    return {"results": results[:200]}


@router.get("/bestiary/{name:path}")
def get_creature(name: str):
    """Get full details for a specific creature."""
    for filename in ["creatures.json", "monsters.json", "npcs.json"]:
        try:
            data = _load_json(filename)
            result = _find_entry(data, name)
            if result:
                return result
        except Exception:
            continue
    raise HTTPException(status_code=404, detail="Creature not found")


def _find_entry(data: Any, name: str) -> Optional[Dict]:
    if isinstance(data, dict):
        for key, value in data.items():
            if key == name and isinstance(value, dict) and "content" in value:
                return {"name": key, "content": value["content"]}
            result = _find_entry(value, name)
            if result:
                return result
    elif isinstance(data, list):
        for item in data:
            result = _find_entry(item, name)
            if result:
                return result
    return None


# ── Spells ─────────────────────────────────────────────────────────────────

@router.get("/spells")
def get_spells(q: str = Query(""), level: str = Query(""), cls: str = Query("")):
    """Search spells."""
    try:
        spells = _load_json("spells.json")
    except FileNotFoundError:
        return {"results": []}

    results = spells
    if q:
        q_lower = q.lower()
        results = [s for s in results if q_lower in s.get("name", "").lower() or q_lower in s.get("description", "").lower()]
    if level:
        results = [s for s in results if str(s.get("level", "")) == level]
    if cls:
        results = [s for s in results if cls.lower() in [c.lower() for c in s.get("classes", [])]]

    return {"results": results[:200]}


@router.get("/spells/{name:path}")
def get_spell(name: str):
    try:
        spells = _load_json("spells.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Spells data not found")
    for spell in spells:
        if spell.get("name") == name:
            return spell
    raise HTTPException(status_code=404, detail="Spell not found")


# ── Magic Items ────────────────────────────────────────────────────────────

@router.get("/magic-items")
def get_magic_items(q: str = Query("")):
    """Search magic items."""
    try:
        items = _load_json("magic items.json")
    except FileNotFoundError:
        return {"results": []}

    results = _flatten_entries(items)
    if q:
        q_lower = q.lower()
        results = [r for r in results if q_lower in r.get("name", "").lower() or q_lower in r.get("text", "").lower()]
    return {"results": results[:200]}


@router.get("/magic-items/{name:path}")
def get_magic_item(name: str):
    try:
        items = _load_json("magic items.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Magic items data not found")
    result = _find_entry(items, name)
    if result:
        return result
    raise HTTPException(status_code=404, detail="Magic item not found")


# ── Gods ───────────────────────────────────────────────────────────────────

@router.get("/gods")
def get_gods(q: str = Query("")):
    try:
        gods = _load_json("gods.json")
    except FileNotFoundError:
        return {"results": []}
    results = _flatten_entries(gods)
    if q:
        q_lower = q.lower()
        results = [r for r in results if q_lower in r.get("name", "").lower()]
    return {"results": results[:200]}


# ── Planes ─────────────────────────────────────────────────────────────────

@router.get("/planes")
def get_planes(q: str = Query("")):
    try:
        planes = _load_json("planes.json")
    except FileNotFoundError:
        return {"results": []}
    results = _flatten_entries(planes)
    if q:
        q_lower = q.lower()
        results = [r for r in results if q_lower in r.get("name", "").lower()]
    return {"results": results[:200]}


# ── Warbands (SQLite) ─────────────────────────────────────────────────────

import sqlite3
from contextlib import contextmanager

WARBAND_DB = DATA_DIR / "warbands.db"


def _init_warband_db():
    conn = sqlite3.connect(str(WARBAND_DB))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS warbands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS warband_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            warband_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            creature_data TEXT NOT NULL,
            max_hp INTEGER,
            current_hp INTEGER,
            initiative INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            FOREIGN KEY (warband_id) REFERENCES warbands(id) ON DELETE CASCADE
        )
    """)
    conn.commit()
    conn.close()


_init_warband_db()


@contextmanager
def _warband_conn():
    conn = sqlite3.connect(str(WARBAND_DB))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


class WarbandCreate(BaseModel):
    name: str


class WarbandMemberCreate(BaseModel):
    name: str
    creature_data: Dict[str, Any]
    max_hp: Optional[int] = None
    current_hp: Optional[int] = None


class WarbandMemberUpdate(BaseModel):
    current_hp: Optional[int] = None
    max_hp: Optional[int] = None
    initiative: Optional[int] = None
    notes: Optional[str] = None


@router.get("/warbands")
def list_warbands():
    with _warband_conn() as conn:
        rows = conn.execute("SELECT id, name, created_at, updated_at FROM warbands ORDER BY updated_at DESC").fetchall()
        return {"warbands": [dict(r) for r in rows]}


@router.post("/warbands")
def create_warband(payload: WarbandCreate):
    with _warband_conn() as conn:
        cur = conn.execute("INSERT INTO warbands (name) VALUES (?)", (payload.name,))
        conn.commit()
        return {"id": cur.lastrowid, "name": payload.name}


@router.get("/warbands/{warband_id}")
def get_warband(warband_id: int):
    with _warband_conn() as conn:
        wb = conn.execute("SELECT * FROM warbands WHERE id = ?", (warband_id,)).fetchone()
        if not wb:
            raise HTTPException(status_code=404, detail="Warband not found")
        members = conn.execute("SELECT * FROM warband_members WHERE warband_id = ? ORDER BY initiative DESC, id", (warband_id,)).fetchall()
        return {"warband": dict(wb), "members": [dict(m) for m in members]}


@router.delete("/warbands/{warband_id}")
def delete_warband(warband_id: int):
    with _warband_conn() as conn:
        conn.execute("DELETE FROM warbands WHERE id = ?", (warband_id,))
        conn.commit()
        return {"ok": True}


@router.post("/warbands/{warband_id}/members")
def add_member(warband_id: int, payload: WarbandMemberCreate):
    max_hp = payload.max_hp
    current_hp = payload.current_hp
    if current_hp is None:
        current_hp = max_hp
    creature_json = json.dumps(payload.creature_data)
    with _warband_conn() as conn:
        cur = conn.execute(
            "INSERT INTO warband_members (warband_id, name, creature_data, max_hp, current_hp) VALUES (?, ?, ?, ?, ?)",
            (warband_id, payload.name, creature_json, max_hp, current_hp)
        )
        conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))
        conn.commit()
        return {"id": cur.lastrowid}


@router.patch("/warbands/{warband_id}/members/{member_id}")
def update_member(warband_id: int, member_id: int, payload: WarbandMemberUpdate):
    fields = []
    values = []
    for field, value in payload.model_dump(exclude_unset=True).items():
        fields.append(f"{field} = ?")
        values.append(value)
    if not fields:
        return {"ok": True}
    values.extend([warband_id, member_id])
    with _warband_conn() as conn:
        conn.execute(f"UPDATE warband_members SET {', '.join(fields)} WHERE warband_id = ? AND id = ?", values)
        conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))
        conn.commit()
        return {"ok": True}


@router.delete("/warbands/{warband_id}/members/{member_id}")
def remove_member(warband_id: int, member_id: int):
    with _warband_conn() as conn:
        conn.execute("DELETE FROM warband_members WHERE warband_id = ? AND id = ?", (warband_id, member_id))
        conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))
        conn.commit()
        return {"ok": True}
