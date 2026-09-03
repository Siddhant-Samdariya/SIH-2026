from fastapi import APIRouter, UploadFile, File
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

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...)
):

    # Generate unique filename
    file_id = str(uuid.uuid4())

    extension = Path(file.filename).suffix

    filename = f"{file_id}{extension}"

    file_path = UPLOAD_DIR / filename

    # Save uploaded file
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "status": "uploaded",
        "filename": filename,
        "path": str(file_path)
    }