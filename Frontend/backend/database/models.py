from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from Backend.database.connection import Base


class Vehicle(Base):
    """Stores unique tracked vehicles detected by ByteTrack."""
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    track_id = Column(Integer, unique=True, index=True, nullable=False)
    vehicle_type = Column(String(50), default="car")
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    confidence = Column(Float, default=0.0)
    number_plate = Column(String(30), nullable=True, index=True)
    plate_confidence = Column(Float, nullable=True)

    # Relationships
    plate_detections = relationship("PlateDetection", back_populates="vehicle")


class PlateDetection(Base):
    """Stores OCR detections for license plates associated with vehicles."""
    __tablename__ = "plate_detections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vehicle_track_id = Column(Integer, ForeignKey("vehicles.track_id"), nullable=True, index=True)
    plate_track_id = Column(Integer, index=True, nullable=False)
    plate_text = Column(String(30), nullable=False, index=True)
    ocr_confidence = Column(Float, default=0.0)
    x1 = Column(Integer, default=0)
    y1 = Column(Integer, default=0)
    x2 = Column(Integer, default=0)
    y2 = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="plate_detections")


class RoadIncident(Base):
    """Stores detected road hazards: potholes, cracks, and surface damage."""
    __tablename__ = "road_incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_type = Column(String(50), nullable=False, index=True)  # 'pothole' or 'road_damage'
    class_name = Column(String(100), default="Road Issue")
    confidence = Column(Float, default=0.0)
    x1 = Column(Integer, default=0)
    y1 = Column(Integer, default=0)
    x2 = Column(Integer, default=0)
    y2 = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ProcessingJob(Base):
    """Tracks background and synchronous video processing jobs."""
    __tablename__ = "processing_jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False, index=True)
    status = Column(String(50), default="queued", index=True)  # 'queued', 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    output_filename = Column(String(255), nullable=True)
    total_frames = Column(Integer, default=0)
    processed_frames = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
