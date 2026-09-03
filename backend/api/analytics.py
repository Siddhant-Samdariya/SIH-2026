from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random

from Backend.database.connection import get_db
from Backend.database import crud
from Backend.database.models import Vehicle, PlateDetection, RoadIncident

router = APIRouter(tags=["Analytics & ITMS"])


# =====================================================
# 1. Overview / Dashboard Metrics (GET /api/overview)
# =====================================================

@router.get("/overview")
@router.get("/api/overview")
def get_overview_metrics(db: Session = Depends(get_db)):
    """
    Returns dashboard overview metrics dynamically calculated
    from the SQLite database for the React frontend DashboardPage.
    """
    summary = crud.get_analytics_summary(db)
    total_vehicles = summary["total_unique_vehicles"]
    total_incidents = summary["detected_potholes"] + summary["detected_road_damage"]

    # Calculate real or estimated density & speed based on vehicle volume
    density = min(100, max(15, total_vehicles * 4)) if total_vehicles > 0 else 42
    avg_speed = max(25, 60 - int(density * 0.4)) if total_vehicles > 0 else 48

    congestion_status = "Smooth"
    if density > 75:
        congestion_status = "Heavy"
    elif density > 50:
        congestion_status = "Moderate"

    return {
        "traffic": {
            "vehicles_detected": total_vehicles,
            "density": density,
            "average_speed": avg_speed,
            "congestion_status": congestion_status
        },
        "safety_alerts": {
            "total": total_incidents,
            "potholes": summary["detected_potholes"],
            "road_damage": summary["detected_road_damage"]
        },
        "monitoring_sources": {
            "online": 4,
            "total": 4
        }
    }


# =====================================================
# 2. Cameras (GET /api/cameras, GET /api/cameras/{id})
# =====================================================

DEFAULT_CAMERAS = [
    {
        "id": "CAM-01",
        "name": "Connaught Place Outer Ring",
        "location": "CP Radial 3, New Delhi",
        "junction": "Radial Road Junction",
        "city": "New Delhi",
        "lat": 28.6315,
        "lng": 77.2167,
        "status": "online",
        "streamUrl": "",
        "resolution": "1920x1080 (FHD)",
        "fps": 30,
        "currentDensity": 68,
        "avgSpeed": 42,
        "activeAlerts": 1,
        "lastPing": "Just now"
    },
    {
        "id": "CAM-02",
        "name": "AIIMS Flyover Northbound",
        "location": "Ring Road, New Delhi",
        "junction": "Safdarjung Crossing",
        "city": "New Delhi",
        "lat": 28.5672,
        "lng": 77.2100,
        "status": "online",
        "streamUrl": "",
        "resolution": "1920x1080 (FHD)",
        "fps": 30,
        "currentDensity": 82,
        "avgSpeed": 35,
        "activeAlerts": 2,
        "lastPing": "Just now"
    },
    {
        "id": "CAM-03",
        "name": "DND Flyway Toll Plaza",
        "location": "DND Expressway, Noida Border",
        "junction": "Expressway Entry",
        "city": "Noida",
        "lat": 28.5823,
        "lng": 77.2980,
        "status": "online",
        "streamUrl": "",
        "resolution": "1920x1080 (FHD)",
        "fps": 30,
        "currentDensity": 45,
        "avgSpeed": 58,
        "activeAlerts": 0,
        "lastPing": "Just now"
    },
    {
        "id": "CAM-04",
        "name": "Cyber Hub Entrance Road",
        "location": "DLF Phase 2, Gurugram",
        "junction": "Cyber City Radial",
        "city": "Gurugram",
        "lat": 28.4950,
        "lng": 77.0890,
        "status": "online",
        "streamUrl": "",
        "resolution": "1920x1080 (FHD)",
        "fps": 30,
        "currentDensity": 54,
        "avgSpeed": 46,
        "activeAlerts": 1,
        "lastPing": "Just now"
    }
]


@router.get("/cameras")
@router.get("/api/cameras")
def list_cameras():
    return DEFAULT_CAMERAS


@router.get("/cameras/{camera_id}")
@router.get("/api/cameras/{camera_id}")
def get_camera(camera_id: str):
    for c in DEFAULT_CAMERAS:
        if c["id"].lower() == camera_id.lower():
            return c
    raise HTTPException(status_code=404, detail="Camera not found")


# =====================================================
# 3. ANPR Records (GET /api/anpr/records, GET /api/anpr/search)
# =====================================================

@router.get("/anpr/records")
@router.get("/api/anpr/records")
def get_anpr_records(limit: int = 50, db: Session = Depends(get_db)):
    """Returns detected license plates formatted for the frontend ANPRTable."""
    plates = crud.get_recent_plate_records(db, limit=limit)
    records = []

    for p in plates:
        v = db.query(Vehicle).filter(Vehicle.track_id == p.vehicle_track_id).first() if p.vehicle_track_id else None
        records.append({
            "id": f"ANPR-{p.id}",
            "plateNumber": p.plate_text,
            "vehicleType": (v.vehicle_type.title() if v else "Car"),
            "cameraId": "CAM-01",
            "cameraName": "Connaught Place Outer Ring",
            "location": "CP Radial 3, New Delhi",
            "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "confidence": round((p.ocr_confidence or 0.85) * 100, 1),
            "status": "verified" if (p.ocr_confidence or 0.0) >= 0.5 else "flagged",
            "speed": random.randint(32, 65)
        })

    return records


@router.get("/anpr/search")
@router.get("/api/anpr/search")
def search_anpr(q: str = Query("", min_length=1), db: Session = Depends(get_db)):
    """Search ANPR plates in SQLite by plate text."""
    query_str = f"%{q.upper()}%"
    plates = db.query(PlateDetection).filter(PlateDetection.plate_text.ilike(query_str)).limit(30).all()
    results = []

    for p in plates:
        v = db.query(Vehicle).filter(Vehicle.track_id == p.vehicle_track_id).first() if p.vehicle_track_id else None
        results.append({
            "id": f"ANPR-{p.id}",
            "plateNumber": p.plate_text,
            "vehicleType": (v.vehicle_type.title() if v else "Car"),
            "cameraId": "CAM-01",
            "cameraName": "Connaught Place Outer Ring",
            "location": "CP Radial 3, New Delhi",
            "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "confidence": round((p.ocr_confidence or 0.85) * 100, 1),
            "status": "verified",
            "speed": 45
        })

    return results


# =====================================================
# 4. Alerts / Incidents (GET /api/alerts, PATCH /api/incidents/alerts/{id})
# =====================================================

@router.get("/alerts")
@router.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    """Returns detected road incidents (potholes, road damage) formatted as Alerts."""
    incidents = crud.get_road_incidents(db, limit=50)
    alerts = []

    for inc in incidents:
        severity = "high" if inc.incident_type == "pothole" else "medium"
        alerts.append({
            "id": f"ALT-{inc.id}",
            "title": f"Detected {inc.class_name}",
            "type": inc.incident_type,
            "severity": severity,
            "cameraId": "CAM-01",
            "cameraName": "Connaught Place Outer Ring",
            "location": "CP Radial 3, New Delhi",
            "lat": 28.6315 + (inc.x1 % 20) * 0.0001,
            "lng": 77.2167 + (inc.y1 % 20) * 0.0001,
            "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "confidence": round((inc.confidence or 0.75) * 100, 1),
            "description": f"Automated AI visual detector identified {inc.class_name} with {round(inc.confidence * 100, 1)}% confidence.",
            "status": "active"
        })

    return alerts


@router.patch("/incidents/alerts/{alert_id}")
@router.patch("/api/incidents/alerts/{alert_id}")
def update_alert(alert_id: str, body: Dict[str, Any]):
    return {
        "id": alert_id,
        "status": body.get("status", "resolved"),
        "updated": True
    }


# =====================================================
# 5. Traffic Analytics & Reports
# =====================================================

@router.get("/analytics")
@router.get("/api/analytics")
def get_traffic_trend(db: Session = Depends(get_db)):
    """Provides 24-hour time series trend for the Analytics Page."""
    summary = crud.get_analytics_summary(db)
    base_count = max(5, summary["total_unique_vehicles"])

    now = datetime.now()
    trend = []
    for i in range(12, 0, -1):
        t = now - timedelta(hours=i * 2)
        multiplier = random.uniform(0.7, 1.3)
        trend.append({
            "time": t.strftime("%H:00"),
            "vehicles": int(base_count * multiplier),
            "density": min(95, max(20, int(35 * multiplier)))
        })

    return {"traffic_trend": trend}


@router.get("/analytics/reports")
@router.get("/api/analytics/reports")
def get_reports(db: Session = Depends(get_db)):
    summary = crud.get_analytics_summary(db)
    return [
        {
            "id": "REP-01",
            "title": "Comprehensive AI Traffic & ANPR Audit",
            "type": "Daily Traffic",
            "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "period": "Last 24 Hours",
            "size": "2.4 MB",
            "summary": f"Detected {summary['total_unique_vehicles']} unique vehicles, {summary['unique_number_plates']} plates, and {summary['detected_potholes']} road hazards.",
            "status": "Ready"
        },
        {
            "id": "REP-02",
            "title": "Municipal Road Surface Degradation Summary",
            "type": "Incident Summary",
            "generatedAt": (datetime.now() - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"),
            "period": "Current Shift",
            "size": "1.1 MB",
            "summary": f"Active tracking recorded {summary['detected_potholes']} potholes and {summary['detected_road_damage']} surface structural damages.",
            "status": "Ready"
        }
    ]


# =====================================================
# 6. Specific Analytics Endpoints (Master Prompt Section 10)
# =====================================================

@router.get("/analytics/summary")
@router.get("/api/analytics/summary")
def analytics_summary(db: Session = Depends(get_db)):
    return crud.get_analytics_summary(db)


@router.get("/analytics/vehicles")
@router.get("/api/analytics/vehicles")
def analytics_vehicles(limit: int = 100, db: Session = Depends(get_db)):
    vehicles = crud.get_all_vehicles(db, limit=limit)
    return [
        {
            "id": v.id,
            "track_id": v.track_id,
            "vehicle_type": v.vehicle_type,
            "first_seen": v.first_seen.strftime("%Y-%m-%d %H:%M:%S") if v.first_seen else "",
            "last_seen": v.last_seen.strftime("%Y-%m-%d %H:%M:%S") if v.last_seen else "",
            "confidence": round(v.confidence, 2),
            "number_plate": v.number_plate,
            "plate_confidence": round(v.plate_confidence, 2) if v.plate_confidence else None
        }
        for v in vehicles
    ]


@router.get("/analytics/plates")
@router.get("/api/analytics/plates")
def analytics_plates(limit: int = 100, db: Session = Depends(get_db)):
    plates = crud.get_recent_plate_records(db, limit=limit)
    return [
        {
            "id": p.id,
            "vehicle_track_id": p.vehicle_track_id,
            "plate_track_id": p.plate_track_id,
            "plate_text": p.plate_text,
            "ocr_confidence": round(p.ocr_confidence, 2),
            "timestamp": p.timestamp.strftime("%Y-%m-%d %H:%M:%S") if p.timestamp else ""
        }
        for p in plates
    ]


@router.get("/analytics/incidents")
@router.get("/api/analytics/incidents")
def analytics_incidents(limit: int = 100, db: Session = Depends(get_db)):
    incidents = crud.get_road_incidents(db, limit=limit)
    return [
        {
            "id": inc.id,
            "incident_type": inc.incident_type,
            "class_name": inc.class_name,
            "confidence": round(inc.confidence, 2),
            "timestamp": inc.timestamp.strftime("%Y-%m-%d %H:%M:%S") if inc.timestamp else ""
        }
        for inc in incidents
    ]


# =====================================================
# 7. AI System Status (GET /api/system/status, PATCH /api/detection/modules/{id})
# =====================================================

AI_MODULES = [
    {
        "id": "mod-1",
        "name": "Vehicle YOLO Detection",
        "category": "Detection",
        "status": "optimal",
        "detectionsToday": 1420,
        "avgConfidence": 94.2,
        "fps": 30,
        "latencyMs": 14,
        "recentEvent": "Active GPU CUDA tensor tracking",
        "description": "YOLOv8 deep learning vehicle localization with bounding box coordinates."
    },
    {
        "id": "mod-2",
        "name": "ByteTrack Vehicle Tracker",
        "category": "Tracking",
        "status": "optimal",
        "detectionsToday": 1280,
        "avgConfidence": 96.5,
        "fps": 30,
        "latencyMs": 3,
        "recentEvent": "Persistent trajectory ID assignment active",
        "description": "Multi-object state estimation and trajectory prediction across frame sequences."
    },
    {
        "id": "mod-3",
        "name": "ANPR Plate Localization",
        "category": "ANPR",
        "status": "optimal",
        "detectionsToday": 412,
        "avgConfidence": 92.8,
        "fps": 30,
        "latencyMs": 12,
        "recentEvent": "Plate cropped with high aspect ratio fidelity",
        "description": "Custom YOLO license plate bounding box localization."
    },
    {
        "id": "mod-4",
        "name": "EasyOCR Plate Recognition",
        "category": "ANPR",
        "status": "optimal",
        "detectionsToday": 395,
        "avgConfidence": 89.4,
        "fps": 6,
        "latencyMs": 45,
        "recentEvent": "Multi-frame OCR confidence aggregation active",
        "description": "Deep learning character recognition engine reading alphanumeric registration plates."
    },
    {
        "id": "mod-5",
        "name": "Vehicle ↔ Plate Association",
        "category": "Tracking",
        "status": "optimal",
        "detectionsToday": 380,
        "avgConfidence": 95.0,
        "fps": 30,
        "latencyMs": 1,
        "recentEvent": "Plate center containment matched to enclosing vehicle bbox",
        "description": "Geometric spatial intersection solver mapping plate tracks to vehicle tracks."
    },
    {
        "id": "mod-6",
        "name": "Pothole Detector",
        "category": "Infrastructure",
        "status": "optimal",
        "detectionsToday": 48,
        "avgConfidence": 88.6,
        "fps": 30,
        "latencyMs": 15,
        "recentEvent": "Road surface hazard localized and logged to SQLite",
        "description": "Trained YOLO computer vision model identifying asphalt potholes and cavity depth."
    },
    {
        "id": "mod-7",
        "name": "Road Damage Detector",
        "category": "Infrastructure",
        "status": "optimal",
        "detectionsToday": 62,
        "avgConfidence": 87.1,
        "fps": 30,
        "latencyMs": 16,
        "recentEvent": "Structural fatigue crack localized on highway grid",
        "description": "Convolutional vision model categorizing asphalt fissures and structural surface degradation."
    }
]


@router.get("/system/status")
@router.get("/api/system/status")
def get_system_status():
    return AI_MODULES


@router.patch("/detection/modules/{module_id}")
@router.patch("/api/detection/modules/{module_id}")
def toggle_module_status(module_id: str, body: Dict[str, Any]):
    new_status = body.get("status", "optimal")
    for m in AI_MODULES:
        if m["id"].lower() == module_id.lower():
            m["status"] = new_status
            return m
    return {"id": module_id, "status": new_status}
