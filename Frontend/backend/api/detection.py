from fastapi import APIRouter, BackgroundTasks, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import shutil
from typing import Optional, Dict, Any

try:
    from sqlalchemy.orm import Session
except Exception:
    Session = Any

try:
    from Backend.database.connection import get_db, SessionLocal
except ModuleNotFoundError:
    try:
        from backend.database.connection import get_db, SessionLocal
    except ModuleNotFoundError:
        from database.connection import get_db, SessionLocal

try:
    from Backend.ai.pipeline import TransportAIPipeline
except ModuleNotFoundError:
    try:
        from backend.ai.pipeline import TransportAIPipeline
    except ModuleNotFoundError:
        from ai.pipeline import TransportAIPipeline

try:
    from Backend.services.processing_service import (
        execute_video_processing,
        OUTPUT_DIR,
        UPLOAD_DIR,
        FFMPEG_PATH,
        FFPROBE_PATH
    )
except ModuleNotFoundError:
    try:
        from backend.services.processing_service import (
            execute_video_processing,
            OUTPUT_DIR,
            UPLOAD_DIR,
            FFMPEG_PATH,
            FFPROBE_PATH
        )
    except ModuleNotFoundError:
        OUTPUT_DIR = Path(__file__).resolve().parent.parent / "outputs"
        UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
        FFMPEG_PATH = "ffmpeg"
        FFPROBE_PATH = "ffprobe"
        execute_video_processing = None

router = APIRouter(
    prefix="/api/detection",
    tags=["Detection"]
)

# =====================================================
# Paths
# =====================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

UPLOAD_DIR = PROJECT_ROOT / "Backend" / "uploads"
OUTPUT_DIR = PROJECT_ROOT / "Backend" / "outputs"
TEMP_DIR = OUTPUT_DIR / "temp"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# Load AI pipeline once
# --------------------------------------------------

# AI Pipeline initialized once
try:
    print("=" * 60)
    print("LOADING AI PIPELINE")
    print("=" * 60)
    pipeline = TransportAIPipeline()
    print("=" * 60)
    print("AI PIPELINE READY")
    print("=" * 60)
except Exception as err:
    print(f"Warning: AI Pipeline model initialization deferred ({err})")
    pipeline = None


# =====================================================
# Background Worker Function
# =====================================================

def run_background_processing(
    input_path: Path,
    output_path: Path,
    job_id: int
):
    """Runs video processing in the background and updates SQLite job status."""
    try:
        execute_video_processing(
            input_path=input_path,
            output_path=output_path,
            pipeline=pipeline,
            job_id=job_id
        )
    except Exception as e:
        print(f"[Background Job Failed] Job {job_id}: {e}")
        db = SessionLocal()
        crud.update_job_failed(db, job_id, str(e))
        db.close()


# =====================================================
# 1. Asynchronous Video Processing: POST /api/detection/process/{filename}
# =====================================================

@router.post("/process/{filename}")
async def process_video_async(
    filename: str,
    background_tasks: BackgroundTasks,
    db: Any = Depends(get_db)
):
    """
    Queue an uploaded video for processing.
    Creates a processing_jobs record in SQLite and runs asynchronously.
    """
    input_path = UPLOAD_DIR / filename

    if not input_path.exists():
        raise HTTPException(status_code=404, detail=f"Video '{filename}' not found in uploads")

    output_filename = f"processed_{filename}"
    if not output_filename.endswith(".mp4"):
        output_filename = f"{Path(output_filename).stem}.mp4"

    output_path = OUTPUT_DIR / output_filename

    # Create job in SQLite
    job = crud.create_job(db, filename)

    # Launch background task
    background_tasks.add_task(
        run_background_processing,
        input_path,
        output_path,
        job.id
    )

    return {
        "status": "processing",
        "job_id": job.id,
        "input": filename,
        "output": output_filename
    }


# =====================================================
# 2. Job Status: GET /api/detection/status/{job_identifier}
# =====================================================

@router.get("/status/{job_identifier}")
async def get_job_status(job_identifier: str, db: Session = Depends(get_db)):
    """
    Get processing status by job ID or by uploaded filename.
    Returns: queued | processing | completed | failed + progress metrics.
    """
    job = None
    if job_identifier.isdigit():
        job = crud.get_job(db, int(job_identifier))

    if not job:
        job = crud.get_job_by_filename(db, job_identifier)

    if not job:
        raise HTTPException(status_code=404, detail="Processing job not found")

    progress_pct = 0.0
    if job.total_frames and job.total_frames > 0:
        progress_pct = round((job.processed_frames / job.total_frames) * 100.0, 1)

    return {
        "job_id": job.id,
        "filename": job.filename,
        "status": job.status,
        "processed_frames": job.processed_frames,
        "total_frames": job.total_frames,
        "progress_percentage": progress_pct,
        "output_filename": job.output_filename,
        "video_url": f"/api/detection/video/{job.output_filename}" if job.status == "completed" and job.output_filename else None,
        "error_message": job.error_message
    }


# =====================================================
# 3. Job Results: GET /api/detection/results/{job_identifier}
# =====================================================

@router.get("/results/{job_identifier}")
async def get_job_results(job_identifier: str, db: Session = Depends(get_db)):
    """Returns detected vehicles, plates, and incidents for a given processing job."""
    job = None
    if job_identifier.isdigit():
        job = crud.get_job(db, int(job_identifier))
    if not job:
        job = crud.get_job_by_filename(db, job_identifier)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    vehicles = crud.get_all_vehicles(db, limit=50)
    plates = crud.get_recent_plate_records(db, limit=50)
    incidents = crud.get_road_incidents(db, limit=50)

    return {
        "job_id": job.id,
        "status": job.status,
        "output_video": f"/api/detection/video/{job.output_filename}" if job.output_filename else None,
        "vehicles_count": len(vehicles),
        "plates_count": len(plates),
        "incidents_count": len(incidents),
        "summary": crud.get_analytics_summary(db)
    }


# =====================================================
# 4. Serve Video: GET /api/detection/video/{filename}
# =====================================================

@router.get("/video/{filename}")
async def serve_video(filename: str):
    """Streams or serves the final H.264 MP4 to the browser / React frontend."""
    video_path = OUTPUT_DIR / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Processed video not found")

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=filename
    )


# =====================================================
# 5. AI Router (Synchronous Single-Shot Endpoint for LiveFleetPage)
# =====================================================

ai_router = APIRouter(
    prefix="/api/ai",
    tags=["AI Single-Shot Processing"]
)


@ai_router.post("/process-video")
async def ai_process_video_sync(
    file: UploadFile = File(...)
):
    """
    Direct single-shot endpoint called by Frontend LiveFleetPage.tsx:
    Uploads video -> executes full AI pipeline -> converts to H.264 MP4 ->
    records to SQLite -> returns video_url and detection summary metrics.
    """
    file_id = str(uuid.uuid4())
    extension = Path(file.filename).suffix or ".mp4"
    upload_filename = f"{file_id}{extension}"
    input_path = UPLOAD_DIR / upload_filename

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    output_filename = f"processed_{file_id}.mp4"
    output_path = OUTPUT_DIR / output_filename

    # Create job in SQLite
    db = SessionLocal()
    job = crud.create_job(db, upload_filename)
    db.close()

    result = execute_video_processing(
        input_path=input_path,
        output_path=output_path,
        pipeline=pipeline,
        job_id=job.id
    )

    if not result or result.get("status") != "completed":
        return {
            "success": False,
            "error": "Video processing failed. Check server logs."
        }

    # Browser-playable URL for the React HTML5 video player
    video_url = f"http://127.0.0.1:8000/api/detection/video/{output_filename}"

    return {
        "success": True,
        "video_url": video_url,
        "total_frames": result.get("total_frames", 0),
        "duration_seconds": result.get("duration_seconds", 0.0),
        "processing_time_seconds": result.get("processing_time_seconds", 0.0),
        "fps": result.get("output_fps", 30.0),
        "width": result.get("width", 1280),
        "height": result.get("height", 720),
        "codec": result.get("output_codec", "h264")
    }


@ai_router.get("/video/{filename}")
async def ai_serve_video(filename: str):
    """Alias for serving video files under /api/ai/video/{filename}."""
    return await serve_video(filename)