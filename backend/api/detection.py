from fastapi import APIRouter, BackgroundTasks
from pathlib import Path
import cv2
import subprocess
import shutil

from Backend.ai.pipeline import TransportAIPipeline


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


# =====================================================
# AI Pipeline
# =====================================================

pipeline = TransportAIPipeline()


# =====================================================
# Process video
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

    background_tasks.add_task(
        process_video_file,
        input_path,
        output_path
    )

    return {
        "status": "processing",
        "input": filename,
        "output": output_filename
    }


# =====================================================
# Process video file
# =====================================================

def process_video_file(
    input_path: Path,
    output_path: Path
):

    print("=" * 60)
    print("STARTING VIDEO PROCESSING")
    print("=" * 60)

    cap = cv2.VideoCapture(
        str(input_path)
    )

    if not cap.isOpened():

        print("ERROR: Could not open video")

        return

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

    # Safety fallback
    if fps <= 0 or fps > 120:

        print(
            f"Invalid FPS detected: {fps}"
        )

        fps = 30.0

    print(f"FPS: {fps}")
    print(f"Resolution: {width}x{height}")
    print(f"Total frames: {total_frames}")

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

        print(
            "ERROR: Could not create temporary video"
        )

        cap.release()

        return

    # =================================================
    # Frame processing
    # =================================================

    frame_count = 0

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
            # WRITE FRAME
            # =========================================

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

    except Exception as e:

        print(
            f"PROCESSING ERROR: {e}"
        )

        raise

    finally:

        cap.release()
        out.release()

    print("=" * 60)
    print("AI PROCESSING COMPLETE")
    print("=" * 60)

    # =================================================
    # Convert AVI → H.264 MP4
    # =================================================

    print("Converting output to H.264 MP4...")

    command = [
        "ffmpeg",
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

        subprocess.run(
            command,
            check=True
        )

        print(
            "H.264 conversion successful."
        )

    except FileNotFoundError:

        print(
            "ERROR: FFmpeg is not installed "
            "or not available in PATH."
        )

        # Don't silently pretend the conversion worked.
        # Keep the temporary file for debugging.

        return

    except subprocess.CalledProcessError as e:

        print(
            f"FFmpeg conversion failed: {e}"
        )

        return

    # =================================================
    # Remove temporary file
    # =================================================

    if temp_path.exists():

        temp_path.unlink()

    print("=" * 60)
    print("PROCESSING COMPLETE")
    print(f"FINAL OUTPUT: {output_path}")
    print("=" * 60)