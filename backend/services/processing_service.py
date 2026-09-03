from pathlib import Path
import cv2
import subprocess
import shutil
import time
import json
from typing import Optional, Dict, Any

from Backend.ai.pipeline import TransportAIPipeline
from Backend.database.connection import SessionLocal
from Backend.database import crud
from Backend.services.association_service import associate_plate_to_vehicle


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


# =====================================================
# FFmpeg & FFprobe Binary Resolution
# =====================================================

def find_ffmpeg() -> Optional[Path]:
    known_path = Path(
        r"C:\Users\sanka\AppData\Local\Microsoft\WinGet"
        r"\Packages\Gyan.FFmpeg_Microsoft.Winget.Source"
        r"_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"
        r"\ffmpeg.exe"
    )
    if known_path.exists():
        return known_path

    try:
        res = subprocess.run(["where", "ffmpeg"], capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            first_line = res.stdout.strip().split("\n")[0].strip()
            if Path(first_line).exists():
                return Path(first_line)
    except Exception:
        pass
    return None


def find_ffprobe() -> Optional[Path]:
    ffmpeg = find_ffmpeg()
    if ffmpeg and ffmpeg.parent:
        probe = ffmpeg.parent / "ffprobe.exe"
        if probe.exists():
            return probe
    return None


FFMPEG_PATH = find_ffmpeg()
FFPROBE_PATH = find_ffprobe()


# =====================================================
# Video Validation with FFprobe
# =====================================================

def validate_video_with_ffprobe(
    video_path: Path,
    expected_fps: float = None,
    expected_width: int = None,
    expected_height: int = None,
    expected_frame_count: int = None
) -> (bool, Dict[str, Any]):
    if not FFPROBE_PATH or not FFPROBE_PATH.exists():
        print("[Validation] FFprobe not available, skipping probe check.")
        return True, {}

    try:
        cmd = [
            str(FFPROBE_PATH),
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(video_path)
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if res.returncode != 0:
            print(f"[Validation Error] FFprobe returned code {res.returncode}: {res.stderr}")
            return False, {}

        data = json.loads(res.stdout)
        video_stream = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
        if not video_stream:
            return False, {}

        info = {
            "codec": video_stream.get("codec_name", ""),
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "pix_fmt": video_stream.get("pix_fmt", ""),
            "duration": float(data.get("format", {}).get("duration", 0.0)),
            "nb_frames": video_stream.get("nb_frames", "N/A"),
        }

        r_frame_rate = video_stream.get("r_frame_rate", "0/1")
        try:
            num, den = r_frame_rate.split("/")
            info["fps"] = float(num) / float(den)
        except Exception:
            info["fps"] = 0.0

        # Validate codec and pixel format
        is_valid = True
        if info["codec"] != "h264":
            print(f"[Validation Warning] Expected h264 codec, got {info['codec']}")
            is_valid = False

        # Support both standard yuv420p and full-range yuvj420p
        if info["pix_fmt"] not in ("yuv420p", "yuvj420p"):
            print(f"[Validation Warning] Expected yuv420p/yuvj420p, got {info['pix_fmt']}")
            is_valid = False

        if expected_width and info["width"] != expected_width:
            is_valid = False
        if expected_height and info["height"] != expected_height:
            is_valid = False

        return is_valid, info

    except Exception as e:
        print(f"[Validation Exception] {e}")
        return True, {}


# =====================================================
# Video Processing Execution Function
# =====================================================

def execute_video_processing(
    input_path: Path,
    output_path: Path,
    pipeline: TransportAIPipeline,
    job_id: Optional[int] = None
) -> Optional[Dict[str, Any]]:
    """
    Main processing routine:
    1. Read input video with OpenCV.
    2. Process frames through TransportAIPipeline.
    3. Associate license plates to vehicles using association_service.
    4. Persist clean records into SQLite database.
    5. Write frames to temporary MJPG AVI intermediate file.
    6. Close OpenCV writer.
    7. Convert to H.264 MP4 using FFmpeg (libx264, yuv420p, +faststart).
    8. Validate output file with FFprobe.
    9. Delete temp AVI and mark job completed.
    """
    print("=" * 60)
    print(f"STARTING VIDEO PROCESSING: {input_path.name}")
    print("=" * 60)

    db = SessionLocal()

    if not FFMPEG_PATH or not FFMPEG_PATH.exists():
        err = f"FFmpeg executable not found at: {FFMPEG_PATH}"
        print(f"[ERROR] {err}")
        if job_id:
            crud.update_job_failed(db, job_id, err)
        db.close()
        return None

    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        err = f"Could not open input video: {input_path}"
        print(f"[ERROR] {err}")
        if job_id:
            crud.update_job_failed(db, job_id, err)
        db.close()
        return None

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if fps <= 0 or fps > 120:
        fps = 30.0

    input_duration = total_frames / fps if fps > 0 and total_frames > 0 else 0.0

    if job_id:
        crud.update_job_started(db, job_id, total_frames)

    # Temporary intermediate AVI
    temp_path = TEMP_DIR / f"temp_{input_path.stem}.avi"
    fourcc = cv2.VideoWriter_fourcc(*"MJPG")
    out = cv2.VideoWriter(str(temp_path), fourcc, fps, (width, height))

    if not out.isOpened():
        err = f"Could not create temporary intermediate writer at: {temp_path}"
        print(f"[ERROR] {err}")
        cap.release()
        if job_id:
            crud.update_job_failed(db, job_id, err)
        db.close()
        return None

    frame_count = 0
    start_time = time.time()

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Run AI pipeline
            results = pipeline.process_frame(frame, frame_count)
            vehicles = results.get("vehicles", [])
            potholes = results.get("potholes", [])
            road_damage = results.get("road_damage", [])
            anpr = results.get("anpr", [])

            # Vehicle <-> Plate Association Map
            plate_to_veh_map = {}
            for plate in anpr:
                plate_bbox = plate.get("bbox", [])
                p_track_id = plate.get("track_id")
                if plate_bbox and p_track_id is not None:
                    matched_veh_id = associate_plate_to_vehicle(plate_bbox, vehicles)
                    plate_to_veh_map[p_track_id] = matched_veh_id

            # Persist & Draw Vehicles
            for vehicle in vehicles:
                v_track_id = vehicle.get("track_id")
                v_class = vehicle.get("class_name", "vehicle")
                v_conf = vehicle.get("confidence", 0.0)
                v_bbox = vehicle.get("bbox", [0, 0, 0, 0])

                matched_plate_text = None
                matched_plate_conf = None
                # Check if an associated plate was found for this vehicle
                for p in anpr:
                    p_id = p.get("track_id")
                    if plate_to_veh_map.get(p_id) == v_track_id:
                        matched_plate_text = p.get("plate")
                        matched_plate_conf = p.get("ocr_confidence")
                        break

                if v_track_id is not None:
                    crud.upsert_vehicle(
                        db=db,
                        track_id=v_track_id,
                        vehicle_type=v_class,
                        confidence=v_conf,
                        plate_text=matched_plate_text,
                        plate_confidence=matched_plate_conf
                    )

                x1, y1, x2, y2 = map(int, v_bbox)
                label = f"{v_class} ID:{v_track_id}" if v_track_id is not None else v_class
                if matched_plate_text:
                    label += f" [{matched_plate_text}]"

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label, (x1, max(y1 - 10, 25)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # Persist & Draw ANPR Plates
            for plate in anpr:
                p_bbox = plate.get("bbox", [0, 0, 0, 0])
                p_track_id = plate.get("track_id")
                plate_text = plate.get("plate", "")
                ocr_conf = plate.get("ocr_confidence", 0.0)
                matched_veh_id = plate_to_veh_map.get(p_track_id)

                if plate_text and p_track_id is not None:
                    crud.record_plate_detection(
                        db=db,
                        plate_track_id=p_track_id,
                        plate_text=plate_text,
                        ocr_confidence=ocr_conf,
                        bbox=p_bbox,
                        vehicle_track_id=matched_veh_id
                    )

                x1, y1, x2, y2 = map(int, p_bbox)
                label = f"Plate ID:{p_track_id}"
                if plate_text:
                    label += f" | {plate_text} ({ocr_conf:.2f})"
                if matched_veh_id:
                    label += f" -> Veh:{matched_veh_id}"

                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(frame, label, (x1, max(y1 - 10, 25)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

            # Persist & Draw Potholes
            for pothole in potholes:
                p_bbox = pothole.get("bbox", [0, 0, 0, 0])
                p_conf = pothole.get("confidence", 0.0)
                crud.record_road_incident(db, "pothole", "Pothole", p_conf, p_bbox)

                x1, y1, x2, y2 = map(int, p_bbox)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, "Pothole", (x1, max(y1 - 10, 25)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

            # Persist & Draw Road Damage
            for damage in road_damage:
                d_bbox = damage.get("bbox", [0, 0, 0, 0])
                d_name = damage.get("class_name", "Road Damage")
                d_conf = damage.get("confidence", 0.0)
                crud.record_road_incident(db, "road_damage", d_name, d_conf, d_bbox)

                x1, y1, x2, y2 = map(int, d_bbox)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 165, 255), 2)
                cv2.putText(frame, d_name, (x1, max(y1 - 10, 25)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 165, 255), 2)

            # Frame dimension check
            if frame.shape[:2] != (height, width):
                frame = cv2.resize(frame, (width, height))

            out.write(frame)

            # Progress update in DB every 50 frames
            if frame_count % 50 == 0:
                db.commit()
                if job_id:
                    crud.update_job_progress(db, job_id, frame_count)
                progress = (frame_count / total_frames * 100) if total_frames > 0 else 0
                print(f"Processing: {frame_count}/{total_frames} ({progress:.1f}%)")

        db.commit()

    except Exception as e:
        print(f"[Processing Exception] {e}")
        db.rollback()
        if job_id:
            crud.update_job_failed(db, job_id, str(e))
        raise
    finally:
        cap.release()
        out.release()
        db.close()

    processing_time = time.time() - start_time
    print("=" * 60)
    print(f"AI PROCESSING COMPLETE: {frame_count} frames in {processing_time:.1f}s")
    print("=" * 60)

    # Convert intermediate AVI to H.264 MP4 with FFmpeg
    print(f"Encoding final H.264 MP4 using FFmpeg: {FFMPEG_PATH}")
    ffmpeg_cmd = [
        str(FFMPEG_PATH),
        "-y",
        "-i", str(temp_path),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(output_path)
    ]

    try:
        res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=600)
        if res.returncode != 0:
            print(f"[FFmpeg Error] Code {res.returncode}: {res.stderr}")
            db = SessionLocal()
            if job_id:
                crud.update_job_failed(db, job_id, f"FFmpeg failed: {res.stderr}")
            db.close()
            return None

        print("H.264 conversion successful.")

    except Exception as e:
        err = f"FFmpeg execution failed: {e}"
        print(f"[FFmpeg Exception] {err}")
        db = SessionLocal()
        if job_id:
            crud.update_job_failed(db, job_id, err)
        db.close()
        return None

    # Validate output file with FFprobe
    is_valid, probe_info = validate_video_with_ffprobe(
        output_path,
        expected_fps=fps,
        expected_width=width,
        expected_height=height,
        expected_frame_count=frame_count
    )

    if not is_valid:
        err = "Output video validation failed."
        print(f"[ERROR] {err}")
        db = SessionLocal()
        if job_id:
            crud.update_job_failed(db, job_id, err)
        db.close()
        return None

    # Remove temporary AVI on success
    if temp_path.exists():
        temp_path.unlink()
        print(f"Removed temporary file: {temp_path}")

    # Mark job as completed in DB
    db = SessionLocal()
    if job_id:
        crud.update_job_completed(db, job_id, output_path.name, frame_count)
    db.close()

    output_duration = probe_info.get("duration", input_duration)
    return {
        "status": "completed",
        "job_id": job_id,
        "input_fps": fps,
        "output_fps": probe_info.get("fps", fps),
        "total_frames": frame_count,
        "output_frames": frame_count,
        "duration_seconds": round(output_duration, 2),
        "processing_time_seconds": round(processing_time, 2),
        "output_codec": probe_info.get("codec", "h264"),
        "width": width,
        "height": height,
        "output_filename": output_path.name,
        "output_path": str(output_path)
    }
