import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent
for p in [str(CURRENT_DIR), str(PARENT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from Backend.database.connection import init_db
from Backend.api.video import router as video_router
from Backend.api.detection import router as detection_router
from Backend.api.detection import ai_router


app = FastAPI(
    title="SIH Transport AI",
    description="AI-powered Intelligent Transport Monitoring System (ITMS) Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Include all API Routers
app.include_router(video_router)
app.include_router(detection_router)
app.include_router(ai_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "running",
        "service": "SIH Transport AI Backend",
        "database": "SQLite (transport_ai.db)",
        "models": "YOLOv8 + ByteTrack + EasyOCR + Potholes + Road Damage",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/health",
            "upload": "/api/video/upload",
            "process": "/api/detection/process/{filename}",
            "overview": "/api/overview",
            "anpr": "/api/anpr/records",
            "alerts": "/api/alerts"
        }
    }


@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "ai_pipeline": "online",
        "database": "connected"
    }