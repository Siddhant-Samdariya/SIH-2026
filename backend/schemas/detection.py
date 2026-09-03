from typing import List, Optional, Any
from pydantic import BaseModel


class ProcessVideoRequest(BaseModel):
    filename: str


class ProcessVideoResponse(BaseModel):
    status: str
    job_id: Optional[int] = None
    input: str
    output: str


class JobStatusResponse(BaseModel):
    job_id: int
    filename: str
    status: str
    processed_frames: int
    total_frames: int
    progress_percentage: float
    output_filename: Optional[str] = None
    error_message: Optional[str] = None
