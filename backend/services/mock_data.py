from typing import List, Dict, Any, Optional

# Mock Overview Data
MOCK_OVERVIEW_DATA: Dict[str, Any] = {
    "monitoring_sources": {
        "total": 42,
        "online": 39
    },
    "ai_events_today": 186,
    "road_issues": {
        "total": 27,
        "requiring_attention": 8
    },
    "safety_alerts": {
        "total": 6,
        "critical": 2
    },
    "traffic": {
        "vehicles_detected": 8421,
        "density": 72,
        "average_speed": 34,
        "congestion": "HIGH"
    },
    "road_infrastructure": {
        "potholes": 1432,
        "waterlogging": 18,
        "road_damage": 12,
        "missing_dividers": 7,
        "missing_zebra_crossings": 4,
        "traffic_sign_issues": 9
    }
}

# Mock 8+ Cameras Dataset
MOCK_CAMERAS: List[Dict[str, Any]] = [
    {
        "id": "CAM-001",
        "name": "MG Road Central Camera",
        "location": "MG Road & Junction 4",
        "latitude": 26.2183,
        "longitude": 78.1828,
        "status": "online",
        "ipAddress": "192.168.1.101:554",
        "currentDensity": 68,
        "avgSpeed": 34,
        "activeAlerts": 1,
        "streamProtocol": "RTSP"
    },
    {
        "id": "CAM-002",
        "name": "Ring Road Corridor Camera",
        "location": "Ring Road Flyover Sector 2",
        "latitude": 26.2295,
        "longitude": 78.1734,
        "status": "online",
        "ipAddress": "192.168.1.102:554",
        "currentDensity": 82,
        "avgSpeed": 24,
        "activeAlerts": 2,
        "streamProtocol": "RTSP"
    },
    {
        "id": "CAM-003",
        "name": "NH-44 Highway Node",
        "location": "NH-44 Toll Plaza Approach",
        "latitude": 26.2410,
        "longitude": 78.1950,
        "status": "online",
        "ipAddress": "192.168.1.103:8080",
        "currentDensity": 45,
        "avgSpeed": 58,
        "activeAlerts": 0,
        "streamProtocol": "HTTP/MJPEG"
    },
    {
        "id": "CAM-004",
        "name": "Station Road Terminal Cam",
        "location": "Central Railway Station Plaza",
        "latitude": 26.2120,
        "longitude": 78.1690,
        "status": "online",
        "ipAddress": "192.168.1.104:554",
        "currentDensity": 91,
        "avgSpeed": 18,
        "activeAlerts": 1,
        "streamProtocol": "RTSP"
    },
    {
        "id": "CAM-005",
        "name": "Outer Ring Expressway Cam",
        "location": "North Flyover Exit 9",
        "latitude": 26.2550,
        "longitude": 78.2100,
        "status": "online",
        "ipAddress": "192.168.1.105:8554",
        "currentDensity": 38,
        "avgSpeed": 64,
        "activeAlerts": 0,
        "streamProtocol": "WebRTC"
    },
    {
        "id": "CAM-006",
        "name": "School Zone Safety Cam",
        "location": "St. Xavier Road & Pedestrian Gate",
        "latitude": 26.2050,
        "longitude": 78.1780,
        "status": "online",
        "ipAddress": "192.168.1.106:554",
        "currentDensity": 55,
        "avgSpeed": 22,
        "activeAlerts": 1,
        "streamProtocol": "RTSP"
    },
    {
        "id": "CAM-007",
        "name": "Depot Terminal Maintenance Cam",
        "location": "Bus Depot Gate 2",
        "latitude": 26.1980,
        "longitude": 78.1550,
        "status": "degraded",
        "ipAddress": "192.168.1.107:8080",
        "currentDensity": 15,
        "avgSpeed": 10,
        "activeAlerts": 0,
        "streamProtocol": "HTTP/MJPEG"
    },
    {
        "id": "CAM-008",
        "name": "Underpass Flood Sensor Cam",
        "location": "MG Road Metro Underpass",
        "latitude": 26.2210,
        "longitude": 78.1870,
        "status": "online",
        "ipAddress": "192.168.1.108:554",
        "currentDensity": 74,
        "avgSpeed": 28,
        "activeAlerts": 2,
        "streamProtocol": "RTSP"
    }
]

# Mock Events Dataset
MOCK_EVENTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "type": "hit_and_run",
        "title": "Hit-and-run detected",
        "location": "MG Road",
        "camera_id": "CAM-001",
        "severity": "critical",
        "timestamp": "2 min ago",
        "description": "Vehicle collided with sedan and fled southbound on Ring Road."
    },
    {
        "id": 2,
        "type": "waterlogging",
        "title": "Waterlogging detected",
        "location": "MG Road Underpass",
        "camera_id": "CAM-008",
        "severity": "warning",
        "timestamp": "5 min ago",
        "description": "Water depth > 3.5 inches detected near Metro Station underpass."
    },
    {
        "id": 3,
        "type": "pothole",
        "title": "Pothole detected",
        "location": "NH-44 Corridor",
        "camera_id": "CAM-003",
        "severity": "warning",
        "timestamp": "8 min ago",
        "description": "Deep surface depression detected on middle lane."
    },
    {
        "id": 4,
        "type": "unsafe_driving",
        "title": "Unsafe driving detected",
        "location": "Ring Road Sector 2",
        "camera_id": "CAM-002",
        "severity": "critical",
        "timestamp": "12 min ago",
        "description": "Aggressive lane weaving and speed threshold violation."
    },
    {
        "id": 5,
        "type": "infrastructure",
        "title": "Damaged road divider detected",
        "location": "Ring Road",
        "camera_id": "CAM-002",
        "severity": "info",
        "timestamp": "18 min ago",
        "description": "Concrete barrier section displaced into active traffic lane."
    },
    {
        "id": 6,
        "type": "pedestrian_safety",
        "title": "Pedestrian crossing violation",
        "location": "School Zone",
        "camera_id": "CAM-006",
        "severity": "warning",
        "timestamp": "24 min ago",
        "description": "Vehicle failed to yield at designated school zebra crossing."
    },
    {
        "id": 7,
        "type": "traffic_congestion",
        "title": "Heavy congestion bottleneck",
        "location": "Station Road Plaza",
        "camera_id": "CAM-004",
        "severity": "warning",
        "timestamp": "30 min ago",
        "description": "Traffic flow speed dropped below 15 km/h average."
    },
    {
        "id": 8,
        "type": "anpr",
        "title": "Stolen vehicle plate match (ANPR)",
        "location": "Outer Ring Expressway",
        "camera_id": "CAM-005",
        "severity": "critical",
        "timestamp": "42 min ago",
        "description": "License plate DL-01-AB-1234 flagged in central stolen database."
    }
]

# Mock Active Alerts
MOCK_ALERTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "Hit-and-run detected",
        "severity": "critical",
        "location": "MG Road",
        "camera_id": "CAM-001",
        "time": "2 min ago",
        "description": "Vehicle DL-01-AB-1234 collided with sedan and fled southbound."
    },
    {
        "id": 2,
        "title": "Waterlogging detected",
        "severity": "warning",
        "location": "MG Road Underpass",
        "camera_id": "CAM-008",
        "time": "5 min ago",
        "description": "Standing water depth exceeds safety threshold (3.5 inches)."
    },
    {
        "id": 3,
        "title": "Unsafe driving detected",
        "severity": "critical",
        "location": "Ring Road",
        "camera_id": "CAM-002",
        "time": "12 min ago",
        "description": "Swerving sharply across multi-lane markers at +20 km/h over limit."
    }
]

# Mock Analytics Dataset
MOCK_ANALYTICS: Dict[str, Any] = {
    "vehicle_detection": 8421,
    "number_plates": 5231,
    "traffic_signs": 382,
    "potholes": 143,
    "safety_events": 67,
    "waterlogging": 31,
    "infrastructure_issues": 29,
    "traffic_trend": [
        {"time": "08:00", "vehicles": 520, "density": 42},
        {"time": "09:00", "vehicles": 810, "density": 68},
        {"time": "10:00", "vehicles": 1240, "density": 75},
        {"time": "11:00", "vehicles": 980, "density": 62},
        {"time": "12:00", "vehicles": 890, "density": 72},
        {"time": "13:00", "vehicles": 760, "density": 58},
        {"time": "14:00", "vehicles": 820, "density": 60},
        {"time": "15:00", "vehicles": 950, "density": 69},
        {"time": "16:00", "vehicles": 1050, "density": 84},
        {"time": "17:00", "vehicles": 1210, "density": 91}
    ]
}

# Mock AI System Pipeline Statuses
MOCK_SYSTEM_STATUS: Dict[str, str] = {
    "vehicle_detection": "online",
    "vehicle_tracking": "online",
    "anpr": "online",
    "ocr": "online",
    "pothole_detection": "online",
    "traffic_analysis": "online",
    "waterlogging_detection": "online",
    "safety_detection": "online",
    "infrastructure_analysis": "online"
}


def get_mock_overview() -> Dict[str, Any]:
    return MOCK_OVERVIEW_DATA


def get_mock_cameras() -> List[Dict[str, Any]]:
    return MOCK_CAMERAS


def get_mock_camera_by_id(camera_id: str) -> Optional[Dict[str, Any]]:
    for cam in MOCK_CAMERAS:
        if cam["id"].lower() == camera_id.lower():
            return cam
    return None


def get_mock_events(camera_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if camera_id:
        return [evt for evt in MOCK_EVENTS if evt["camera_id"].lower() == camera_id.lower()]
    return MOCK_EVENTS


def get_mock_alerts() -> List[Dict[str, Any]]:
    return MOCK_ALERTS


def get_mock_analytics(camera_id: Optional[str] = None) -> Dict[str, Any]:
    if camera_id:
        return {
            "camera_id": camera_id,
            "vehicle_detection": 1240,
            "number_plates": 810,
            "traffic_signs": 42,
            "potholes": 8,
            "safety_events": 3,
            "waterlogging": 1,
            "infrastructure_issues": 2,
            "traffic_trend": MOCK_ANALYTICS["traffic_trend"]
        }
    return MOCK_ANALYTICS


def get_mock_system_status() -> Dict[str, str]:
    return MOCK_SYSTEM_STATUS
