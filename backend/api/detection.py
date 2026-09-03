from fastapi import APIRouter, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse
from pathlib import Path
import cv2
import subprocess
import shutil
import uuid
import time
import json

try:
    from Backend.ai.pipeline import TransportAIPipeline
except ModuleNotFoundError:
    try:
        from backend.ai.pipeline import TransportAIPipeline
    except ModuleNotFoundError:
        from ai.pipeline import TransportAIPipeline


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

print("=" * 60)
print("LOADING AI PIPELINE")
print("=" * 60)

pipeline = TransportAIPipeline()


# =====================================================
# Processing job status tracking
# =====================================================

# { filename: { status, progress, error, ... } }
processing_jobs = {}


# =====================================================
# FFprobe validation
# =====================================================

def validate_video_with_ffprobe(
    video_path: Path,
    expected_fps: float = None,
    expected_width: int = None,
    expected_height: int = None,
    expected_frame_count: int = None
):
    """
    Validate the output video using FFprobe.
    Returns (is_valid, info_dict).
    """

    if not FFPROBE_PATH:
        print("FFprobe not available, skipping validation")
        return True, {}

    try:
        command = [
            str(FFPROBE_PATH),
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(video_path)
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=30
        )

        if result.returncode != 0:
            print(
                f"FFprobe failed: {result.stderr}"
            )
            return False, {}

        probe_data = json.loads(result.stdout)

        # Find video stream
        video_stream = None
        for stream in probe_data.get("streams", []):
            if stream.get("codec_type") == "video":
                video_stream = stream
                break

        if not video_stream:
            print("VALIDATION FAILED: No video stream found")
            return False, {}

        info = {
            "codec": video_stream.get("codec_name", ""),
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "pix_fmt": video_stream.get("pix_fmt", ""),
            "duration": float(
                probe_data.get("format", {}).get(
                    "duration", 0
                )
            ),
            "nb_frames": video_stream.get(
                "nb_frames", "N/A"
            ),
        }

        # Parse FPS from r_frame_rate
        r_frame_rate = video_stream.get(
            "r_frame_rate", "0/1"
        )
        try:
            num, den = r_frame_rate.split("/")
            info["fps"] = float(num) / float(den)
        except (ValueError, ZeroDivisionError):
            info["fps"] = 0.0

        print("=" * 60)
        print("OUTPUT VIDEO VALIDATION")
        print("=" * 60)
        print(f"  Codec:        {info['codec']}")
        print(f"  Resolution:   {info['width']}x{info['height']}")
        print(f"  FPS:          {info['fps']:.2f}")
        print(f"  Pixel Format: {info['pix_fmt']}")
        print(f"  Duration:     {info['duration']:.2f}s")
        print(f"  Frames:       {info['nb_frames']}")

        # Validation checks
        is_valid = True

        if info["codec"] != "h264":
            print(
                f"  WARNING: Expected h264, got {info['codec']}"
            )
            is_valid = False

        if info["pix_fmt"] != "yuv420p":
            print(
                f"  WARNING: Expected yuv420p, got {info['pix_fmt']}"
            )
            is_valid = False

        if expected_width and info["width"] != expected_width:
            print(
                f"  WARNING: Width mismatch: "
                f"expected {expected_width}, "
                f"got {info['width']}"
            )
            is_valid = False

        if expected_height and info["height"] != expected_height:
            print(
                f"  WARNING: Height mismatch: "
                f"expected {expected_height}, "
                f"got {info['height']}"
            )
            is_valid = False

        # Check duration mismatch
        if (
            expected_fps
            and expected_frame_count
            and expected_fps > 0
        ):
            expected_duration = (
                expected_frame_count / expected_fps
            )

            if info["duration"] > 0:
                duration_diff = abs(
                    info["duration"] - expected_duration
                )

                if duration_diff > 2.0:
                    print(
                        f"  WARNING: Duration mismatch: "
                        f"expected ~{expected_duration:.1f}s, "
                        f"got {info['duration']:.1f}s "
                        f"(diff: {duration_diff:.1f}s)"
                    )

                    # Only fail on severe mismatch
                    if duration_diff > 10.0:
                        is_valid = False

        if is_valid:
            print("  VALIDATION: PASSED")
        else:
            print("  VALIDATION: FAILED")

        return is_valid, info

    except Exception as e:
        print(f"FFprobe validation error: {e}")
        return True, {}


# =====================================================
# Process video (existing background task endpoint)
# =====================================================

@router.post("/process/{filename}")
async def process_video(
    filename: str,
    background_tasks: BackgroundTasks
):

    input_path = UPLOAD_DIR / filename

    if not input_path.exists():

        return {
            "status": "error",
            "message": "Video not found",
            "filename": filename
        }

    output_filename = f"processed_{filename}"

    output_path = OUTPUT_DIR / output_filename

    # Track job status
    processing_jobs[filename] = {
        "status": "queued",
        "progress": 0,
        "output": output_filename
    }

    background_tasks.add_task(
        process_video_file,
        input_path,
        output_path,
        filename
    )

    return {
        "status": "processing",
        "input": filename,
        "output": output_filename
    }


# =====================================================
# Processing status endpoint
# =====================================================

@router.get("/status/{filename}")
async def get_processing_status(filename: str):

    job = processing_jobs.get(filename)

    if not job:
        return {
            "status": "not_found",
            "filename": filename
        }

    return job


# =====================================================
# Process video file
# =====================================================

def process_video_file(
    input_path: Path,
    output_path: Path,
    job_key: str = None
):
    """
    Process video through AI pipeline, write to temp AVI,
    then convert to H.264 MP4 using FFmpeg.

    Returns dict with processing metadata, or None on failure.
    """

    if job_key:
        processing_jobs[job_key] = {
            "status": "processing",
            "progress": 0
        }

    print("=" * 60)
    print("STARTING VIDEO PROCESSING")
    print("=" * 60)

    # Check FFmpeg availability
    if not FFMPEG_PATH or not FFMPEG_PATH.exists():
        msg = "ERROR: FFmpeg not found. Cannot process video."
        print(msg)
        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }
        return None

    cap = cv2.VideoCapture(
        str(input_path)
    )

    if not cap.isOpened():

        msg = "ERROR: Could not open video"
        print(msg)

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        return None

    # =================================================
    # Read video properties
    # =================================================

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    width = int(
        cap.get(
            cv2.CAP_PROP_FRAME_WIDTH
        )
    )

    height = int(
        cap.get(
            cv2.CAP_PROP_FRAME_HEIGHT
        )
    )

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    fourcc_code = int(
        cap.get(
            cv2.CAP_PROP_FOURCC
        )
    )

    input_codec = "".join(
        chr((fourcc_code >> 8 * i) & 0xFF)
        for i in range(4)
    )

    # Safety fallback
    if fps <= 0 or fps > 120:

        print(
            f"Invalid FPS detected: {fps}, "
            f"using fallback 30.0"
        )

        fps = 30.0

    input_duration = (
        total_frames / fps
        if fps > 0 and total_frames > 0
        else 0
    )

    print(f"Input file: {input_path.name}")
    print(f"Input codec: {input_codec}")
    print(f"FPS: {fps}")
    print(f"Resolution: {width}x{height}")
    print(f"Total frames: {total_frames}")
    print(f"Duration: {input_duration:.2f}s")

    # =================================================
    # Temporary video
    # =================================================

    temp_path = TEMP_DIR / (
        f"temp_{input_path.stem}.avi"
    )

    print(
        f"Temporary output: {temp_path}"
    )

    # MJPG is much more reliable for frame-by-frame
    # OpenCV processing than directly writing MP4.
    fourcc = cv2.VideoWriter_fourcc(
        *"MJPG"
    )

    out = cv2.VideoWriter(
        str(temp_path),
        fourcc,
        fps,
        (width, height)
    )

    if not out.isOpened():

        msg = "ERROR: Could not create temporary video writer"
        print(msg)

        cap.release()

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        return None

    # =================================================
    # Frame processing
    # =================================================

    frame_count = 0
    start_time = time.time()

    try:

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_count += 1

            # -----------------------------------------
            # AI pipeline
            # -----------------------------------------

            results = pipeline.process_frame(
                frame,
                frame_count
            )

            vehicles = results.get(
                "vehicles",
                []
            )

            potholes = results.get(
                "potholes",
                []
            )

            road_damage = results.get(
                "road_damage",
                []
            )

            anpr = results.get(
                "anpr",
                []
            )

            # =========================================
            # VEHICLES
            # =========================================

            for vehicle in vehicles:

                x1, y1, x2, y2 = map(
                    int,
                    vehicle["bbox"]
                )

                vehicle_name = vehicle.get(
                    "class_name",
                    "vehicle"
                )

                track_id = vehicle.get(
                    "track_id"
                )

                label = vehicle_name

                if track_id is not None:

                    label += (
                        f" ID:{track_id}"
                    )

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    label,
                    (
                        x1,
                        max(y1 - 10, 25)
                    ),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 255, 0),
                    2
                )

            # =========================================
            # ANPR
            # =========================================

            for plate in anpr:

                x1, y1, x2, y2 = map(
                    int,
                    plate["bbox"]
                )

                track_id = plate.get(
                    "track_id"
                )

                plate_text = plate.get(
                    "plate",
                    ""
                )

                ocr_confidence = plate.get(
                    "ocr_confidence",
                    0.0
                )

                label = (
                    f"Plate ID:{track_id}"
                )

                if plate_text:

                    label += (
                        f" | {plate_text}"
                        f" ({ocr_confidence:.2f})"
                    )

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (255, 0, 0),
                    2
                )

                cv2.putText(
                    frame,
                    label,
                    (
                        x1,
                        max(y1 - 10, 25)
                    ),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 0, 0),
                    2
                )

            # =========================================
            # POTHOLES
            # =========================================

            for pothole in potholes:

                x1, y1, x2, y2 = map(
                    int,
                    pothole["bbox"]
                )

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 0, 255),
                    2
                )

                cv2.putText(
                    frame,
                    "Pothole",
                    (
                        x1,
                        max(y1 - 10, 25)
                    ),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 0, 255),
                    2
                )

            # =========================================
            # ROAD DAMAGE
            # =========================================

            for damage in road_damage:

                x1, y1, x2, y2 = map(
                    int,
                    damage["bbox"]
                )

                damage_name = damage.get(
                    "class_name",
                    "Road Damage"
                )

                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 165, 255),
                    2
                )

                cv2.putText(
                    frame,
                    damage_name,
                    (
                        x1,
                        max(y1 - 10, 25)
                    ),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (0, 165, 255),
                    2
                )

            # =========================================
            # FRAME DIMENSION CHECK + WRITE
            # =========================================

            # Verify frame dimensions match expected
            if frame.shape[:2] != (height, width):
                frame = cv2.resize(
                    frame, (width, height)
                )

            out.write(frame)

            # =========================================
            # PROGRESS
            # =========================================

            if frame_count % 50 == 0:

                if total_frames > 0:

                    progress = (
                        frame_count
                        / total_frames
                    ) * 100

                    print(
                        f"Processing: "
                        f"{frame_count}/"
                        f"{total_frames} "
                        f"({progress:.1f}%)"
                    )

                    if job_key:
                        processing_jobs[job_key] = {
                            "status": "processing",
                            "progress": round(
                                progress, 1
                            )
                        }

    except Exception as e:

        print(
            f"PROCESSING ERROR: {e}"
        )

        cap.release()
        out.release()

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": str(e)
            }

        raise

    finally:

        cap.release()
        out.release()

    processing_time = time.time() - start_time

    print("=" * 60)
    print("AI PROCESSING COMPLETE")
    print(f"Frames processed: {frame_count}")
    print(f"Processing time: {processing_time:.1f}s")
    print("=" * 60)

    # =================================================
    # Convert AVI → H.264 MP4 using FFmpeg
    # =================================================

    print("Converting output to H.264 MP4...")
    print(f"FFmpeg path: {FFMPEG_PATH}")

    command = [
        str(FFMPEG_PATH),
        "-y",
        "-i",
        str(temp_path),
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output_path)
    ]

    try:

        ffmpeg_result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=600
        )

        if ffmpeg_result.returncode != 0:
            print(
                "FFmpeg STDERR:\n"
                f"{ffmpeg_result.stderr}"
            )
            raise subprocess.CalledProcessError(
                ffmpeg_result.returncode,
                command
            )

        print(
            "H.264 conversion successful."
        )

    except FileNotFoundError:

        msg = (
            "ERROR: FFmpeg executable not found at: "
            f"{FFMPEG_PATH}"
        )
        print(msg)

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        # Keep temp file for debugging
        return None

    except subprocess.CalledProcessError as e:

        msg = f"FFmpeg conversion failed: {e}"
        print(msg)

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        # Keep temp file for debugging
        return None

    except subprocess.TimeoutExpired:

        msg = "FFmpeg conversion timed out (600s)"
        print(msg)

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        return None

    # =================================================
    # Validate output with FFprobe
    # =================================================

    is_valid, probe_info = validate_video_with_ffprobe(
        output_path,
        expected_fps=fps,
        expected_width=width,
        expected_height=height,
        expected_frame_count=frame_count
    )

    if not is_valid:
        msg = "Output video validation FAILED"
        print(msg)

        if job_key:
            processing_jobs[job_key] = {
                "status": "failed",
                "error": msg
            }

        # Keep temp file for debugging
        return None

    # =================================================
    # Remove temporary file
    # =================================================

    if temp_path.exists():

        temp_path.unlink()
        print(f"Removed temp file: {temp_path}")

    # =================================================
    # Mark job as completed
    # =================================================

    output_duration = probe_info.get(
        "duration", input_duration
    )

    result_info = {
        "status": "completed",
        "input_fps": fps,
        "output_fps": probe_info.get("fps", fps),
        "input_frames": total_frames,
        "output_frames": frame_count,
        "input_duration": round(input_duration, 2),
        "output_duration": round(output_duration, 2),
        "output_codec": probe_info.get("codec", "h264"),
        "output_pix_fmt": probe_info.get(
            "pix_fmt", "yuv420p"
        ),
        "width": width,
        "height": height,
        "processing_time_seconds": round(
            processing_time, 2
        ),
        "output_path": str(output_path)
    }

    if job_key:
        processing_jobs[job_key] = result_info

    print("=" * 60)
    print("PROCESSING COMPLETE")
    print(f"FINAL OUTPUT: {output_path}")
    print(f"Input FPS: {fps}")
    print(f"Output FPS: {probe_info.get('fps', fps)}")
    print(f"Input frames: {total_frames}")
    print(f"Output frames: {frame_count}")
    print(f"Output codec: {probe_info.get('codec', 'h264')}")
    print(f"Output duration: {output_duration:.2f}s")
    print(f"Processing time: {processing_time:.1f}s")
    print("=" * 60)

    return result_info


# =====================================================
# Serve processed video
# =====================================================

@router.get("/video/{filename}")
async def serve_processed_video(filename: str):
    """Serve a processed video file."""

    video_path = OUTPUT_DIR / filename

    if not video_path.exists():
        return {
            "status": "error",
            "message": "Processed video not found"
        }

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=filename
    )


# =====================================================
# Single-shot upload + process endpoint
# (This is what the frontend calls)
# =====================================================

ai_router = APIRouter(
    prefix="/api/ai",
    tags=["AI Processing"]
)


@ai_router.post("/process-video")
async def ai_process_video(
    file: UploadFile = File(...)
):
    """
    Single-shot endpoint: upload video + run full AI
    pipeline + FFmpeg encode + return processed URL.

    This is the endpoint the frontend calls at:
    POST /api/ai/process-video
    """

    print("=" * 60)
    print("RECEIVED VIDEO FOR AI PROCESSING")
    print(f"Filename: {file.filename}")
    print("=" * 60)

    # Save uploaded file
    file_id = str(uuid.uuid4())
    extension = Path(file.filename).suffix or ".mp4"
    upload_filename = f"{file_id}{extension}"
    input_path = UPLOAD_DIR / upload_filename

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"Saved upload: {input_path}")

    # Determine output path
    # Ensure output is always .mp4
    output_stem = f"processed_{file_id}"
    output_filename = f"{output_stem}.mp4"
    output_path = OUTPUT_DIR / output_filename

    # Run processing synchronously
    result = process_video_file(
        input_path,
        output_path,
        job_key=upload_filename
    )

    if result is None:
        return {
            "success": False,
            "error": "Video processing failed. Check server logs."
        }

    # Build the video URL the frontend can use
    video_url = (
        f"http://127.0.0.1:8000"
        f"/api/detection/video/{output_filename}"
    )

    return {
        "success": True,
        "video_url": video_url,
        "total_frames": result.get("output_frames", 0),
        "duration_seconds": result.get(
            "output_duration", 0
        ),
        "processing_time_seconds": result.get(
            "processing_time_seconds", 0
        ),
        "fps": result.get("input_fps", 0),
        "width": result.get("width", 0),
        "height": result.get("height", 0),
        "codec": result.get("output_codec", "h264")
    }


@ai_router.get("/video/{filename}")
async def ai_serve_video(filename: str):
    """Serve processed video (alias under /api/ai/)."""

    video_path = OUTPUT_DIR / filename

    if not video_path.exists():
        return {
            "status": "error",
            "message": "Processed video not found"
        }

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=filename
    )