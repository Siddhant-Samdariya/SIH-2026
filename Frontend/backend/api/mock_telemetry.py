import json
import time
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/api",
    tags=["Mock Telemetry Integration"]
)

MOCK_DIR = Path(__file__).resolve().parent.parent / "mock_data"

def load_json_file(filename: str):
    file_path = MOCK_DIR / filename
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except Exception:
                return []
    return []

def save_json_file(filename: str, data):
    MOCK_DIR.mkdir(parents=True, exist_ok=True)
    file_path = MOCK_DIR / filename
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

class ReportIncidentPayload(BaseModel):
    category: str = Field(..., description="road_damage, traffic_congestion, waterlogging")
    type: Optional[str] = None
    severity: str = Field(..., description="low, medium, high, critical")
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None

@router.get("/dashboard/stats")
def get_dashboard_stats():
    vehicle_data = load_json_file("vehicle_detection.json")
    incidents_data = load_json_file("incidents.json")
    road_damage_data = load_json_file("road_damage.json")
    waterlogging_data = load_json_file("waterlogging.json")

    total_incidents = len(incidents_data) if isinstance(incidents_data, list) else 0
    road_issues_count = (len(road_damage_data) if isinstance(road_damage_data, list) else 0) + \
                        (len(waterlogging_data) if isinstance(waterlogging_data, list) else 0)

    road_damage_count = sum(1 for item in incidents_data if isinstance(item, dict) and item.get("category") == "road_damage") if isinstance(incidents_data, list) else 0
    traffic_count = sum(1 for item in incidents_data if isinstance(item, dict) and item.get("category") == "traffic_congestion") if isinstance(incidents_data, list) else 0
    waterlogging_count = sum(1 for item in incidents_data if isinstance(item, dict) and item.get("category") == "waterlogging") if isinstance(incidents_data, list) else 0

    return {
        "total_vehicles": vehicle_data.get("total_count", 50) if isinstance(vehicle_data, dict) else 50,
        "vehicles_breakdown": vehicle_data.get("vehicles", {}) if isinstance(vehicle_data, dict) else {},
        "traffic_density": vehicle_data.get("traffic_density", "High") if isinstance(vehicle_data, dict) else "High",
        "average_speed_kmh": vehicle_data.get("average_speed_kmh", 22.4) if isinstance(vehicle_data, dict) else 22.4,
        "total_incidents": total_incidents,
        "road_issues": road_issues_count,
        "incidents_by_category": {
            "road_damage": road_damage_count,
            "traffic_congestion": traffic_count,
            "waterlogging": waterlogging_count
        },
        "recent_incidents": incidents_data[:5] if isinstance(incidents_data, list) else []
    }

@router.get("/incidents")
def get_incidents(category: Optional[str] = Query(None, description="Category filter: road_damage, traffic_congestion, waterlogging")):
    incidents_data = load_json_file("incidents.json")
    if not isinstance(incidents_data, list):
        return []

    if category and category.lower() != "all":
        filtered = [item for item in incidents_data if isinstance(item, dict) and item.get("category", "").lower() == category.lower()]
        return filtered

    return incidents_data

@router.post("/incidents/report")
def report_incident_report(payload: ReportIncidentPayload):
    return process_incident_report(payload)

@router.post("/incidents")
def report_incident(payload: ReportIncidentPayload):
    return process_incident_report(payload)

def process_incident_report(payload: ReportIncidentPayload):
    incidents_data = load_json_file("incidents.json")
    if not isinstance(incidents_data, list):
        incidents_data = []

    # Map category names cleanly
    cat_raw = payload.category.lower()
    if "road" in cat_raw or "pothole" in cat_raw or cat_raw == "road_damage":
        cat_key = "road_damage"
        type_title = "Road Damage & Potholes"
    elif "traffic" in cat_raw or "congestion" in cat_raw or cat_raw == "traffic_congestion":
        cat_key = "traffic_congestion"
        type_title = "Traffic & Congestion"
    elif "water" in cat_raw or "flood" in cat_raw or cat_raw == "waterlogging":
        cat_key = "waterlogging"
        type_title = "Waterlogging"
    else:
        cat_key = payload.category
        type_title = payload.type or payload.category

    incident_id = f"INC-{len(incidents_data) + 1:03d}"
    timestamp_str = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

    new_incident = {
        "incident_id": incident_id,
        "category": cat_key,
        "type": type_title,
        "title": f"{type_title} ({payload.severity.capitalize()})",
        "description": payload.description,
        "confidence": 0.95,
        "timestamp": timestamp_str,
        "location": {
            "latitude": payload.latitude,
            "longitude": payload.longitude,
            "address": payload.address or f"Location ({payload.latitude:.4f}, {payload.longitude:.4f})"
        },
        "severity": payload.severity.lower(),
        "status": "Reported"
    }

    # Prepend new incident to beginning of list
    incidents_data.insert(0, new_incident)
    save_json_file("incidents.json", incidents_data)

    # Also update sub-category json files if applicable
    if cat_key == "road_damage":
        rd_data = load_json_file("road_damage.json")
        if not isinstance(rd_data, list):
            rd_data = []
        rd_data.insert(0, new_incident)
        save_json_file("road_damage.json", rd_data)
    elif cat_key == "waterlogging":
        wl_data = load_json_file("waterlogging.json")
        if not isinstance(wl_data, list):
            wl_data = []
        wl_data.insert(0, new_incident)
        save_json_file("waterlogging.json", wl_data)

    return {
        "status": "success",
        "message": "Incident reported successfully",
        "incident": new_incident
    }

@router.get("/gis/markers")
def get_gis_markers():
    incidents_data = load_json_file("incidents.json")
    markers = []

    if isinstance(incidents_data, list):
        for item in incidents_data:
            if isinstance(item, dict):
                loc = item.get("location", {})
                markers.append({
                    "incident_id": item.get("incident_id"),
                    "type": item.get("type"),
                    "category": item.get("category"),
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "latitude": loc.get("latitude"),
                    "longitude": loc.get("longitude"),
                    "address": loc.get("address"),
                    "timestamp": item.get("timestamp"),
                    "severity": item.get("severity"),
                    "confidence": item.get("confidence"),
                    "status": item.get("status")
                })

    return markers

@router.get("/telemetry/live-feed")
def get_live_feed():
    feed_data = load_json_file("live_feed.json")
    sequence = feed_data.get("sequence", []) if isinstance(feed_data, dict) else []

    if not sequence:
        return {"step": 1, "vehicles_count": 50, "traffic_density": "High"}

    current_step = (int(time.time()) % len(sequence))
    return sequence[current_step]
