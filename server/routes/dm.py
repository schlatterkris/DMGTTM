"""Dungeon Master tool API routes."""

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter, HTTPException, Query, UploadFile, File
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
                        parsed = _parse_stat_block(content)
                        entry.update(parsed)
                    else:
                        entry["text"] = str(content)
                    results.append(entry)
                sub = {k: v for k, v in value.items() if k != "content"}
                if sub:
                    results.extend(_flatten_entries(sub, current_path))
            elif isinstance(value, list):
                entry = {"name": key, "path": current_path}
                parsed = _parse_stat_block(value)
                entry.update(parsed)
                results.append(entry)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, dict) and "name" in item:
                results.append(item)
            else:
                results.extend(_flatten_entries(item, f"{path}[{i}]"))
    return results


def _parse_stat_block(content: list) -> Dict[str, Any]:
    """Parse a creature/NPC stat block content array into structured sections."""
    result = {"text": " ".join(
        str(c) if not isinstance(c, dict) else json.dumps(c)
        for c in content
    )}

    current_section = None
    traits = []
    actions = []
    reactions = []
    legendary_actions = []
    remaining = []

    for item in content:
        if isinstance(item, str):
            s = item
            if s.startswith("**Armor Class**"):
                result["ac"] = s.split("**Armor Class**", 1)[-1].strip()
            elif s.startswith("**Hit Points**"):
                result["hp"] = s.split("**Hit Points**", 1)[-1].strip()
            elif s.startswith("**Speed**"):
                result["speed"] = s.split("**Speed**", 1)[-1].strip()
            elif "type_line" not in result and re.match(r"^\*[^*]", s) and s.strip().endswith("*"):
                result["type_line"] = s
            elif s.startswith("**Saving Throws**"):
                result["saving_throws"] = s.split("**Saving Throws**", 1)[-1].strip()
            elif s.startswith("**Skills**"):
                result["skills"] = s.split("**Skills**", 1)[-1].strip()
            elif s.startswith("**Damage Vulnerabilities**"):
                result["damage_vulnerabilities"] = s.split("**Damage Vulnerabilities**", 1)[-1].strip()
            elif s.startswith("**Damage Resistances**") or s.startswith("**Damage Resistance**"):
                result["damage_resistances"] = re.split(r"\*\*Damage Resistances?\*\*", s)[-1].strip()
            elif s.startswith("**Damage Immunities**"):
                result["damage_immunities"] = s.split("**Damage Immunities**", 1)[-1].strip()
            elif s.startswith("**Condition Immunities**"):
                result["condition_immunities"] = s.split("**Condition Immunities**", 1)[-1].strip()
            elif s.startswith("**Senses**"):
                result["senses"] = s.split("**Senses**", 1)[-1].strip()
            elif s.startswith("**Languages**"):
                result["languages"] = s.split("**Languages**", 1)[-1].strip()
            elif s.startswith("**Challenge**"):
                result["challenge"] = s.split("**Challenge**", 1)[-1].strip()
            elif s.startswith("**Actions**"):
                current_section = "actions"
            elif s.startswith("**Reactions**"):
                current_section = "reactions"
            elif s.startswith("**Legendary Actions**"):
                current_section = "legendary_actions"
            elif s.startswith("***"):
                if current_section == "actions":
                    actions.append(s)
                elif current_section == "reactions":
                    reactions.append(s)
                elif current_section == "legendary_actions":
                    legendary_actions.append(s)
                else:
                    traits.append(s)
            else:
                remaining.append(s)
        elif isinstance(item, dict) and "table" in item:
            table = item["table"]
            result["abilities"] = {
                k.lower(): (v[0] if isinstance(v, list) and v else str(v))
                for k, v in table.items()
            }

    if traits:
        result["traits"] = traits
    if actions:
        result["actions"] = actions
    if reactions:
        result["reactions"] = reactions
    if legendary_actions:
        result["legendary_actions"] = legendary_actions
    if remaining:
        result["remaining"] = remaining

    return result


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
                entry = {"name": key}
                content = value["content"]
                if isinstance(content, list):
                    parsed = _parse_stat_block(content)
                    entry.update(parsed)
                    entry["content"] = content
                else:
                    entry["content"] = content
                return entry
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


# ── PDF Upload ────────────────────────────────────────────────────────────

_CREATURE_NAMES_CACHE: Optional[List[str]] = None


def _get_creature_names() -> List[str]:
    global _CREATURE_NAMES_CACHE
    if _CREATURE_NAMES_CACHE is not None:
        return _CREATURE_NAMES_CACHE
    names: set = set()
    for fname in ["creatures.json", "monsters.json", "npcs.json"]:
        try:
            data = _load_json(fname)
            _collect_names(data, names)
        except Exception:
            continue
    _CREATURE_NAMES_CACHE = sorted(names, key=lambda n: (-len(n), n))
    return _CREATURE_NAMES_CACHE


def _is_creature_name(name: str) -> bool:
    skip_prefixes = ["appendix", "variant:", "armor,", "melee", "ranged",
                     "grapple", "a legendary", "multiattack"]
    lower = name.lower()
    if any(lower.startswith(p) for p in skip_prefixes):
        return False
    if "," in name or ":" in name:
        return False
    if len(name) > 40:
        return False
    return True


def _collect_names(data: Any, names: set) -> None:
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "content":
                continue
            if isinstance(value, dict) and "content" in value:
                if _is_creature_name(key):
                    names.add(key)
            _collect_names(value, names)
    elif isinstance(data, list):
        for item in data:
            _collect_names(item, names)


def _extract_pages_text(file: UploadFile) -> List[Tuple[int, str]]:
    """Extract text per page. Returns list of (page_number, text) tuples."""
    import tempfile
    from pypdf import PdfReader

    content = file.file.read()
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    try:
        tmp.write(content)
        tmp.close()
        reader = PdfReader(tmp.name)
        return [(i + 1, page.extract_text() or "") for i, page in enumerate(reader.pages)]
    finally:
        os.unlink(tmp.name)


def _find_creatures_in_text(text: str, names: List[str]) -> Dict[str, int]:
    text_lower = text.lower()
    found: Dict[str, int] = {}
    for name in names:
        name_lower = name.lower()
        count = text_lower.count(name_lower)
        if count > 0:
            found[name] = count
    return found


# ── Encounter Section Parsing ────────────────────────────────────────────

_SKIP_HEADING_WORDS = {"contents", "introduction", "appendix", "chapter",
                         "credits", "foreword", "bibliography", "index",
                         "maps", "handouts", "table of"}


def _is_encounter_heading(line: str) -> bool:
    """Check if a text line looks like an encounter/section heading."""
    stripped = line.strip()
    if not stripped or len(stripped) < 4 or len(stripped) > 100:
        return False
    lower = stripped.lower()
    if any(s in lower for s in _SKIP_HEADING_WORDS):
        return False
    if stripped.startswith("[Page"):
        return False

    # Numbered heading: "1. GOBLIN AMBUSH", "1A. The Cellar"
    if re.match(r'^\d+[A-Z]?\.\s+[A-Za-z]', stripped):
        return True

    # All-caps short phrase (2+ words)
    if re.match(r'^[A-Z][A-Z\s]{4,60}[A-Z]$', stripped) and len(stripped.split()) >= 2:
        return True

    # "Area X. Name", "Room X. Name", etc.
    if re.match(r'^(?:Area|Room|Chamber|Hall)\s+\d+[A-Z]?\.?\s+[A-Za-z]', stripped):
        return True

    return False


def _parse_encounter_sections(
    pages: List[Tuple[int, str]], names: List[str]
) -> List[Dict[str, Any]]:
    """
    Split adventure text into encounter sections by detecting headings.
    Each section dict: {name, page, creatures: {name: count}}.
    Falls back to page-level grouping if no headings found.
    """
    full_lines: List[str] = []
    for page_num, page_text in pages:
        full_lines.append(f"[Page {page_num:03d}]")
        for line in page_text.split("\n"):
            full_lines.append(line)

    sections: List[Dict[str, Any]] = []
    current = None
    cur_page = 0

    for line in full_lines:
        stripped = line.strip()
        if not stripped:
            continue

        pm = re.match(r'^\[Page (\d+)\]$', stripped)
        if pm:
            cur_page = int(pm.group(1))
            continue

        if _is_encounter_heading(stripped):
            if current:
                sections.append(current)
            current = {"name": stripped, "page": cur_page, "text": "", "creatures": {}}
        elif current:
            current["text"] += stripped + "\n"

    if current:
        sections.append(current)

    # Find creatures within each section's body text
    for section in sections:
        section["creatures"] = _find_creatures_in_text(section["text"], names)
    sections = [s for s in sections if s["creatures"]]

    # Fallback: page-level grouping if no headings detected
    if not sections:
        for page_num, page_text in pages:
            creatures = _find_creatures_in_text(page_text, names)
            if creatures:
                sections.append({
                    "name": f"Page {page_num:03d}",
                    "page": page_num,
                    "text": page_text,
                    "creatures": creatures,
                })

    return sections


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
            initiative REAL DEFAULT 0.0,
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
    initiative: Optional[float] = None
    notes: Optional[str] = None


@router.get("/warbands")
def list_warbands(
    q: Optional[str] = Query(None),
    sort_by: str = Query("updated_at", pattern="^(name|created_at|updated_at)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
):
    sql = "SELECT id, name, created_at, updated_at FROM warbands"
    params: list = []
    if q:
        sql += " WHERE name LIKE ?"
        params.append(f"%{q}%")
    sql += f" ORDER BY {sort_by} {'ASC' if sort_order == 'asc' else 'DESC'}"
    with _warband_conn() as conn:
        rows = conn.execute(sql, params).fetchall()
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
        wb = conn.execute("SELECT id FROM warbands WHERE id = ?", (warband_id,)).fetchone()
        if not wb:
            raise HTTPException(status_code=404, detail="Warband not found")
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
        cur = conn.execute(f"UPDATE warband_members SET {', '.join(fields)} WHERE warband_id = ? AND id = ?", values)
        conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Member not found")
        return {"ok": True}


@router.delete("/warbands/{warband_id}/members/{member_id}")
def remove_member(warband_id: int, member_id: int):
    with _warband_conn() as conn:
        conn.execute("DELETE FROM warband_members WHERE warband_id = ? AND id = ?", (warband_id, member_id))
        conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))
        conn.commit()
        return {"ok": True}


@router.post("/warbands/upload-pdf")
def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pages = _extract_pages_text(file)
    all_text = "\n".join(t for _, t in pages)
    if not all_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    names = _get_creature_names()
    has_any = _find_creatures_in_text(all_text, names)
    if not has_any:
        raise HTTPException(status_code=404, detail="No known creatures found in PDF")

    sections = _parse_encounter_sections(pages, names)
    if not sections:
        raise HTTPException(status_code=404, detail="No known creatures found in PDF")

    adventure_name = Path(file.filename).stem
    warbands_created = []
    _all_unmatched: List[str] = []

    with _warband_conn() as conn:
        for section in sections:
            warband_name = f"[{adventure_name} & p.{section['page']:03d}] {section['name']}"

            cur = conn.execute("INSERT INTO warbands (name) VALUES (?)", (warband_name,))
            warband_id = cur.lastrowid

            members_added = 0
            creature_summary = []

            for cname, cnt in section["creatures"].items():
                creature_data = _find_entry(_load_json("creatures.json"), cname) \
                    or _find_entry(_load_json("monsters.json"), cname) \
                    or _find_entry(_load_json("npcs.json"), cname)
                if not creature_data:
                    creature_summary.append({"name": cname, "count": cnt, "matched": False})
                    if cname not in _all_unmatched:
                        _all_unmatched.append(cname)
                    continue

                hp_str = creature_data.get("hp", "")
                m = re.search(r"(\d+)", hp_str)
                hp = int(m.group(1)) if m else None

                for _ in range(min(cnt, 20)):
                    conn.execute(
                        "INSERT INTO warband_members (warband_id, name, creature_data, max_hp, current_hp) VALUES (?, ?, ?, ?, ?)",
                        (warband_id, cname, json.dumps(creature_data), hp, hp),
                    )
                    members_added += 1

                creature_summary.append({"name": cname, "count": cnt, "matched": True})

            conn.execute("UPDATE warbands SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (warband_id,))

            warbands_created.append({
                "warband_id": warband_id,
                "warband_name": warband_name,
                "members_added": members_added,
                "creatures": creature_summary,
            })

        conn.commit()

    return {
        "warbands": warbands_created,
        "unmatched_names": _all_unmatched if _all_unmatched else None,
    }
