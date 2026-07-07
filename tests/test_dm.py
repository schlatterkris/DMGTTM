"""Tests for the D&D companion API (server/routes/dm.py)."""


class TestBestiary:
    def test_list_all(self, client):
        resp = client.get("/api/dm/bestiary")
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) > 0

    def test_search_by_name(self, client):
        resp = client.get("/api/dm/bestiary?q=Ape")
        assert resp.status_code == 200
        names = [r["name"].lower() for r in resp.json()["results"]]
        assert any("ape" in n for n in names)

    def test_search_by_text(self, client):
        resp = client.get("/api/dm/bestiary?q=armor+class")
        assert resp.status_code == 200
        assert len(resp.json()["results"]) >= 0

    def test_category_filter(self, client):
        resp = client.get("/api/dm/bestiary?category=creatures")
        assert resp.status_code == 200
        assert len(resp.json()["results"]) > 0

    def test_get_creature_by_name(self, client):
        resp = client.get("/api/dm/bestiary/Ape")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Ape"

    def test_get_creature_not_found(self, client):
        resp = client.get("/api/dm/bestiary/NonExistentCreatureXYZ")
        assert resp.status_code == 404


class TestSpells:
    def test_list_all(self, client):
        resp = client.get("/api/dm/spells")
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) > 0
        assert "name" in data["results"][0]

    def test_search_by_name(self, client):
        resp = client.get("/api/dm/spells?q=Fireball")
        assert resp.status_code == 200
        names = [s["name"] for s in resp.json()["results"]]
        assert "Fireball" in names

    def test_filter_by_level(self, client):
        resp = client.get("/api/dm/spells?level=3")
        assert resp.status_code == 200
        for s in resp.json()["results"]:
            assert s["level"] == "3"

    def test_filter_by_class(self, client):
        resp = client.get("/api/dm/spells?cls=Wizard")
        assert resp.status_code == 200
        for s in resp.json()["results"]:
            assert "wizard" in [c.lower() for c in s.get("classes", [])]

    def test_get_spell_by_name(self, client):
        resp = client.get("/api/dm/spells/Acid%20Splash")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Acid Splash"

    def test_get_spell_not_found(self, client):
        resp = client.get("/api/dm/spells/NotASpell")
        assert resp.status_code == 404


class TestMagicItems:
    def test_list_all(self, client):
        resp = client.get("/api/dm/magic-items")
        assert resp.status_code == 200
        assert "results" in resp.json()

    def test_search_by_name(self, client):
        resp = client.get("/api/dm/magic-items?q=Armor")
        assert resp.status_code == 200
        names = [r["name"].lower() for r in resp.json()["results"]]
        assert any("armor" in n for n in names)

    def test_get_item(self, client):
        resp = client.get("/api/dm/magic-items/Adamantine%20Armor")
        assert resp.status_code in (200, 404)


class TestGods:
    def test_list_all(self, client):
        resp = client.get("/api/dm/gods")
        assert resp.status_code == 200
        assert "results" in resp.json()


class TestPlanes:
    def test_list_all(self, client):
        resp = client.get("/api/dm/planes")
        assert resp.status_code == 200
        assert "results" in resp.json()


class TestWarbands:
    def test_list_empty(self, client, warband_db_override):
        resp = client.get("/api/dm/warbands")
        assert resp.status_code == 200
        assert resp.json() == {"warbands": []}

    def test_create_and_get(self, client, warband_db_override):
        create_resp = client.post("/api/dm/warbands", json={"name": "Test Warband"})
        assert create_resp.status_code == 200
        warband_id = create_resp.json()["id"]
        assert create_resp.json()["name"] == "Test Warband"

        get_resp = client.get(f"/api/dm/warbands/{warband_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["warband"]["name"] == "Test Warband"
        assert get_resp.json()["members"] == []

    def test_create_and_list(self, client, warband_db_override):
        client.post("/api/dm/warbands", json={"name": "Warband A"})
        client.post("/api/dm/warbands", json={"name": "Warband B"})

        resp = client.get("/api/dm/warbands")
        assert resp.status_code == 200
        names = [w["name"] for w in resp.json()["warbands"]]
        assert "Warband A" in names
        assert "Warband B" in names

    def test_delete_warband(self, client, warband_db_override):
        create = client.post("/api/dm/warbands", json={"name": "Delete Me"})
        wid = create.json()["id"]

        del_resp = client.delete(f"/api/dm/warbands/{wid}")
        assert del_resp.status_code == 200

        get_resp = client.get(f"/api/dm/warbands/{wid}")
        assert get_resp.status_code == 404

    def test_add_member(self, client, warband_db_override):
        wb = client.post("/api/dm/warbands", json={"name": "My Warband"}).json()
        wid = wb["id"]

        member = client.post(
            f"/api/dm/warbands/{wid}/members",
            json={
                "name": "Goblin",
                "creature_data": {"type": "humanoid", "size": "small"},
                "max_hp": 7,
                "current_hp": 7,
            },
        )
        assert member.status_code == 200
        assert "id" in member.json()

        get = client.get(f"/api/dm/warbands/{wid}")
        assert len(get.json()["members"]) == 1
        assert get.json()["members"][0]["name"] == "Goblin"

    def test_update_member(self, client, warband_db_override):
        wb = client.post("/api/dm/warbands", json={"name": "Warband"}).json()
        member = client.post(
            f"/api/dm/warbands/{wb['id']}/members",
            json={"name": "Orc", "creature_data": {}, "max_hp": 15, "current_hp": 15},
        ).json()

        update = client.patch(
            f"/api/dm/warbands/{wb['id']}/members/{member['id']}",
            json={"current_hp": 8, "initiative": 12},
        )
        assert update.status_code == 200

        get = client.get(f"/api/dm/warbands/{wb['id']}")
        m = get.json()["members"][0]
        assert m["current_hp"] == 8
        assert m["initiative"] == 12

    def test_remove_member(self, client, warband_db_override):
        wb = client.post("/api/dm/warbands", json={"name": "Warband"}).json()
        member = client.post(
            f"/api/dm/warbands/{wb['id']}/members",
            json={"name": "Goblin", "creature_data": {}, "max_hp": 5, "current_hp": 5},
        ).json()

        client.delete(f"/api/dm/warbands/{wb['id']}/members/{member['id']}")

        get = client.get(f"/api/dm/warbands/{wb['id']}")
        assert get.json()["members"] == []

    def test_get_nonexistent_warband(self, client):
        resp = client.get("/api/dm/warbands/99999")
        assert resp.status_code == 404
