
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["project"] == "AegisTrace"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_system_metrics():
    response = client.get("/system")
    assert response.status_code == 200
    data = response.json()
    assert "cpu_percent" in data
    assert "memory" in data
    assert "disk" in data
    assert "running_processes" in data

def test_processes():
    response = client.get("/processes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) <= 20
