from fastapi.testclient import TestClient
try:
    from backend.main import app
except ImportError:
    from main import app

client = TestClient(app)

def test_endpoints():
    print("Testing GET /api/dashboard/stats ...")
    r1 = client.get("/api/dashboard/stats")
    print("Status:", r1.status_code)
    print("Dashboard Response:", r1.json())
    assert r1.status_code == 200

    print("\nTesting POST /api/incidents/report ...")
    report_payload = {
        "category": "road_damage",
        "severity": "high",
        "description": "Test pothole report near Central Junction",
        "latitude": 28.6183,
        "longitude": 77.1828,
        "address": "Central Junction, Delhi"
    }
    r2 = client.post("/api/incidents/report", json=report_payload)
    print("Status:", r2.status_code)
    print("Report Response:", r2.json())
    assert r2.status_code == 200
    assert r2.json()["status"] == "success"

    print("\nTesting GET /api/incidents ...")
    r3 = client.get("/api/incidents")
    print("Status:", r3.status_code)
    print("Incidents Count:", len(r3.json()))
    assert r3.status_code == 200

    print("\nTesting GET /api/gis/markers ...")
    r4 = client.get("/api/gis/markers")
    print("Status:", r4.status_code)
    print("GIS Markers Count:", len(r4.json()))
    assert r4.status_code == 200

    print("\nAll Backend Telemetry Endpoints & POST Reporting Test Passed Successfully!")

if __name__ == "__main__":
    test_endpoints()
