from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from Backend.database.models import Vehicle, PlateDetection, RoadIncident, ProcessingJob


# =====================================================
# Vehicle CRUD
# =====================================================

def upsert_vehicle(
    db: Session,
    track_id: int,
    vehicle_type: str,
    confidence: float,
    plate_text: Optional[str] = None,
    plate_confidence: Optional[float] = None
) -> Vehicle:
    """
    Insert a new vehicle or update last_seen and highest confidence.
    Associates license plate if reliable text is available.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.track_id == track_id).first()

    now = datetime.utcnow()

    if not vehicle:
        vehicle = Vehicle(
            track_id=track_id,
            vehicle_type=vehicle_type,
            first_seen=now,
            last_seen=now,
            confidence=confidence,
            number_plate=plate_text,
            plate_confidence=plate_confidence
        )
        db.add(vehicle)
        db.flush()
    else:
        vehicle.last_seen = now
        # Update vehicle type and confidence if this observation is stronger
        if confidence > vehicle.confidence:
            vehicle.confidence = confidence
            vehicle.vehicle_type = vehicle_type

        # Associate plate if new plate is detected with higher confidence
        if plate_text and plate_confidence:
            if not vehicle.number_plate or (vehicle.plate_confidence or 0.0) < plate_confidence:
                vehicle.number_plate = plate_text
                vehicle.plate_confidence = plate_confidence

    return vehicle


def get_all_vehicles(db: Session, limit: int = 100) -> List[Vehicle]:
    return db.query(Vehicle).order_by(desc(Vehicle.last_seen)).limit(limit).all()


def get_unique_vehicle_count(db: Session) -> int:
    return db.query(func.count(Vehicle.id)).scalar() or 0


# =====================================================
# Plate Detections CRUD
# =====================================================

def record_plate_detection(
    db: Session,
    plate_track_id: int,
    plate_text: str,
    ocr_confidence: float,
    bbox: List[int],
    vehicle_track_id: Optional[int] = None
) -> PlateDetection:
    """
    Records an OCR plate detection or updates the existing track detection
    to avoid duplicate noise every frame.
    """
    now = datetime.utcnow()
    x1, y1, x2, y2 = bbox

    # Check if a recent detection for this plate_track_id already exists
    existing = db.query(PlateDetection).filter(
        PlateDetection.plate_track_id == plate_track_id
    ).first()

    if existing:
        # Update if higher OCR confidence or vehicle association newly identified
        if ocr_confidence > existing.ocr_confidence:
            existing.plate_text = plate_text
            existing.ocr_confidence = ocr_confidence
        if vehicle_track_id and not existing.vehicle_track_id:
            existing.vehicle_track_id = vehicle_track_id
        existing.x1, existing.y1, existing.x2, existing.y2 = x1, y1, x2, y2
        existing.timestamp = now
        return existing

    record = PlateDetection(
        vehicle_track_id=vehicle_track_id,
        plate_track_id=plate_track_id,
        plate_text=plate_text,
        ocr_confidence=ocr_confidence,
        x1=x1, y1=y1, x2=x2, y2=y2,
        timestamp=now
    )
    db.add(record)
    db.flush()
    return record


def get_recent_plate_records(db: Session, limit: int = 50) -> List[PlateDetection]:
    return db.query(PlateDetection).order_by(desc(PlateDetection.timestamp)).limit(limit).all()


# =====================================================
# Road Incidents CRUD
# =====================================================

def record_road_incident(
    db: Session,
    incident_type: str,
    class_name: str,
    confidence: float,
    bbox: List[int]
) -> RoadIncident:
    """
    Inserts a detected road incident (pothole or road damage).
    Avoids duplicate spam within close spatial proximity recently.
    """
    x1, y1, x2, y2 = bbox
    now = datetime.utcnow()

    # Spatial proximity check within the last few seconds
    recent_duplicate = db.query(RoadIncident).filter(
        RoadIncident.incident_type == incident_type,
        func.abs(RoadIncident.x1 - x1) < 40,
        func.abs(RoadIncident.y1 - y1) < 40
    ).first()

    if recent_duplicate:
        if confidence > recent_duplicate.confidence:
            recent_duplicate.confidence = confidence
        recent_duplicate.timestamp = now
        return recent_duplicate

    incident = RoadIncident(
        incident_type=incident_type,
        class_name=class_name,
        confidence=confidence,
        x1=x1, y1=y1, x2=x2, y2=y2,
        timestamp=now
    )
    db.add(incident)
    db.flush()
    return incident


def get_road_incidents(db: Session, limit: int = 100) -> List[RoadIncident]:
    return db.query(RoadIncident).order_by(desc(RoadIncident.timestamp)).limit(limit).all()


# =====================================================
# Processing Jobs CRUD
# =====================================================

def create_job(db: Session, filename: str) -> ProcessingJob:
    job = ProcessingJob(
        filename=filename,
        status="queued",
        created_at=datetime.utcnow()
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def update_job_started(db: Session, job_id: int, total_frames: int):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if job:
        job.status = "processing"
        job.started_at = datetime.utcnow()
        job.total_frames = total_frames
        db.commit()


def update_job_progress(db: Session, job_id: int, processed_frames: int):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if job:
        job.processed_frames = processed_frames
        db.commit()


def update_job_completed(db: Session, job_id: int, output_filename: str, processed_frames: int):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if job:
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        job.output_filename = output_filename
        job.processed_frames = processed_frames
        db.commit()


def update_job_failed(db: Session, job_id: int, error_message: str):
    job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
    if job:
        job.status = "failed"
        job.completed_at = datetime.utcnow()
        job.error_message = error_message
        db.commit()


def get_job(db: Session, job_id: int) -> Optional[ProcessingJob]:
    return db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()


def get_job_by_filename(db: Session, filename: str) -> Optional[ProcessingJob]:
    return db.query(ProcessingJob).filter(ProcessingJob.filename == filename).order_by(desc(ProcessingJob.id)).first()


# =====================================================
# Analytics Aggregations
# =====================================================

def get_analytics_summary(db: Session) -> Dict[str, Any]:
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    total_plates = db.query(func.count(PlateDetection.id)).scalar() or 0
    unique_plates = db.query(func.count(func.distinct(PlateDetection.plate_text))).scalar() or 0
    total_potholes = db.query(func.count(RoadIncident.id)).filter(RoadIncident.incident_type == "pothole").scalar() or 0
    total_damage = db.query(func.count(RoadIncident.id)).filter(RoadIncident.incident_type == "road_damage").scalar() or 0
    avg_ocr_conf = db.query(func.avg(PlateDetection.ocr_confidence)).scalar() or 0.0
    avg_veh_conf = db.query(func.avg(Vehicle.confidence)).scalar() or 0.0

    # Counts by vehicle type
    type_counts = db.query(Vehicle.vehicle_type, func.count(Vehicle.id)).group_by(Vehicle.vehicle_type).all()
    vehicles_by_type = {v_type: count for v_type, count in type_counts}

    return {
        "total_unique_vehicles": total_vehicles,
        "vehicles_by_type": vehicles_by_type,
        "unique_number_plates": unique_plates,
        "total_plate_detections": total_plates,
        "detected_potholes": total_potholes,
        "detected_road_damage": total_damage,
        "average_ocr_confidence": round(float(avg_ocr_conf), 2),
        "average_detection_confidence": round(float(avg_veh_conf), 2)
    }
