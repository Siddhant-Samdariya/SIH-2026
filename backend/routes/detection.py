import os
import time
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from typing import Dict, Any
from services.multi_yolo import multi_yolo_engine

router = APIRouter(prefix="/api/ai", tags=["UrbanSense Multi-Model YOLO Engine"])

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.get("/yolo/status", summary="Get Multi-Model YOLO Engine Status")
def get_yolo_status() -> Dict[str, Any]:
    return {
        "engine": "UrbanSense Multi-Model YOLO Engine (Potholes + Damage + Vehicles)",
        "is_loaded": multi_yolo_engine.is_loaded,
        "models": {
            "pothole_model": multi_yolo_engine.pothole_model is not None,
            "damage_model": multi_yolo_engine.damage_model is not None,
            "vehicle_model": multi_yolo_engine.vehicle_model is not None
        }
    }


@router.post("/process-video", summary="Run Multi-Model YOLO Inference on Uploaded CCTV Video")
async def process_video(request: Request, file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No video file provided")

    timestamp = int(time.time())
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    input_path = os.path.join(OUTPUT_DIR, f"input_{safe_filename}")
    output_filename = f"processed_{safe_filename}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        # Save uploaded file to disk
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run Multi-Model YOLO Video Processing
        processing_result = multi_yolo_engine.process_video(input_path, output_path)

        # Construct full video URL
        base_url = str(request.base_url).rstrip("/")
        video_url = f"{base_url}/outputs/{output_filename}"

        return {
            "success": True,
            "filename": file.filename,
            "video_url": video_url,
            "summary": processing_result["summary"],
            "total_frames": processing_result["total_frames"],
            "duration_seconds": processing_result["duration_seconds"],
            "events": processing_result["events"][:100]  # Return top 100 event detections
        }

    except Exception as e:
        print(f"[Process Video Error] {e}")
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")
    finally:
        # Cleanup temporary input file
        if os.path.exists(input_path):
            try:
                os.remove(input_path)
            except Exception:
                pass
