from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import shutil
import uuid

router = APIRouter(
    prefix="/api/video",
    tags=["Video"]
)

# Project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]

UPLOAD_DIR = PROJECT_ROOT / "Backend" / "uploads"
OUTPUT_DIR = PROJECT_ROOT / "Backend" / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...)
):
    """Save an uploaded raw video file to Backend/uploads/."""
    file_id = str(uuid.uuid4())
    extension = Path(file.filename).suffix
    filename = f"{file_id}{extension}"
    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "status": "uploaded",
        "filename": filename,
        "path": str(file_path)
    }


@router.get("/output/{filename}")
async def get_video_output(filename: str):
    """Serve a processed video output file from Backend/outputs/."""
    output_path = OUTPUT_DIR / filename
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Processed video not found")

    return FileResponse(
        path=str(output_path),
        media_type="video/mp4",
        filename=filename
    )