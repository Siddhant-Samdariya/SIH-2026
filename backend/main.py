from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from routes.auth import router as auth_router
from routes.overview import router as overview_router
from routes.cameras import router as cameras_router
from routes.events import router as events_router
from routes.alerts import router as alerts_router
from routes.analytics import router as analytics_router
from routes.detection import router as detection_router

app = FastAPI(
    title="UrbanSense AI Platform Backend",
    description="Municipal Urban Intelligence & Computer Vision API Service",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # Development fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Mount Static Outputs Directory for Processed Videos
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")

# Include Routers
app.include_router(auth_router)
app.include_router(overview_router)
app.include_router(cameras_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(analytics_router)
app.include_router(detection_router)


@app.get("/", summary="Root Endpoint")
def read_root() -> Dict[str, Any]:
    return {
        "message": "UrbanSense Backend is running",
        "status": "online"
    }


@app.get("/health", summary="Health Check Endpoint")
def health_check() -> Dict[str, str]:
    return {
        "status": "healthy"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
