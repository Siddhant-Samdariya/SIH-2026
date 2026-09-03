from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from Backend.database.connection import init_db
from Backend.api.video import router as video_router
from Backend.api.detection import router as detection_router, ai_router
from Backend.api.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and tables
    print("[Startup] Initializing SQLite database...")
    init_db()
    yield
    print("[Shutdown] Transport AI backend shut down cleanly.")


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
app.include_router(analytics_router)

# CORS Configuration
# Supports React development servers (Vite 5173, Create-React-App 3000) and API calls
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"
]

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