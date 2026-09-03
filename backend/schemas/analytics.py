from typing import List, Dict, Optional, Any
from pydantic import BaseModel


class AnalyticsSummaryResponse(BaseModel):
    total_unique_vehicles: int
    vehicles_by_type: Dict[str, int]
    unique_number_plates: int
    total_plate_detections: int
    detected_potholes: int
    detected_road_damage: int
    average_ocr_confidence: float
    average_detection_confidence: float


class VehicleRecordResponse(BaseModel):
    id: int
    track_id: int
    vehicle_type: str
    first_seen: str
    last_seen: str
    confidence: float
    number_plate: Optional[str] = None
    plate_confidence: Optional[float] = None


class PlateRecordResponse(BaseModel):
    id: int
    vehicle_track_id: Optional[int] = None
    plate_track_id: int
    plate_text: str
    ocr_confidence: float
    timestamp: str


class IncidentRecordResponse(BaseModel):
    id: int
    incident_type: str
    class_name: str
    confidence: float
    timestamp: str
