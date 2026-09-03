import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PARENT_DIR = CURRENT_DIR.parent
for p in [str(CURRENT_DIR), str(PARENT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.api.video import router as video_router
from Backend.api.detection import router as detection_router


app = FastAPI(
    title="SIH Transport AI",
    description="AI-powered Transport Monitoring System",
    version="1.0.0"
)
app.include_router(video_router)
app.include_router(detection_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "SIH Transport AI Backend"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }