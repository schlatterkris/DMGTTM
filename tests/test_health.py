"""Tests for the health check endpoints."""


class TestHealth:
    def test_health_returns_healthy(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "healthy"}

    def test_liveness_returns_alive(self, client):
        resp = client.get("/health/live")
        assert resp.status_code == 200
        assert resp.json() == {"status": "alive"}

    def test_readiness_returns_ready(self, client):
        resp = client.get("/health/ready")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ready"}
