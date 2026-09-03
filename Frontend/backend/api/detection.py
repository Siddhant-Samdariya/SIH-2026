from fastapi import APIRouter, BackgroundTasks
from pathlib import Path
import cv2

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


# --------------------------------------------------
# Project paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

UPLOAD_DIR = PROJECT_ROOT / "Backend" / "uploads"

OUTPUT_DIR = PROJECT_ROOT / "Backend" / "outputs"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# --------------------------------------------------
# Load AI pipeline once
# --------------------------------------------------

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

print("=" * 60)
print("AI PIPELINE READY")
print("=" * 60)


# --------------------------------------------------
# PROCESS VIDEO API
# --------------------------------------------------

@router.post("/process/{filename}")
async def process_video(
    filename: str,
    background_tasks: BackgroundTasks
):

    video_path = UPLOAD_DIR / filename

    if not video_path.exists():

        return {
            "status": "error",
            "message": "Video not found",
            "filename": filename
        }

    # Start processing in background
    background_tasks.add_task(
        process_video_file,
        video_path
    )

    return {
        "status": "processing",
        "filename": filename,
        "message": "AI processing started"
    }


# --------------------------------------------------
# VIDEO PROCESSING
# --------------------------------------------------

def process_video_file(video_path: Path):

    print("\n" + "=" * 60)
    print("AI VIDEO PROCESSING STARTED")
    print(f"Input: {video_path}")
    print("=" * 60)

    cap = cv2.VideoCapture(str(video_path))

    if not cap.isOpened():

        print("ERROR: Could not open video")

        return

    # Video information
    fps = cap.get(cv2.CAP_PROP_FPS)

    width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    print(f"FPS: {fps}")
    print(f"Resolution: {width} x {height}")
    print(f"Total frames: {total_frames}")

    # ------------------------------------------------
    # Output video
    # ------------------------------------------------

    output_path = (
        OUTPUT_DIR
        / f"processed_{video_path.name}"
    )

    fourcc = cv2.VideoWriter_fourcc(
        *"mp4v"
    )

    writer = cv2.VideoWriter(
        str(output_path),
        fourcc,
        fps,
        (width, height)
    )

    frame_number = 0

    total_vehicles = 0
    total_potholes = 0
    total_road_damage = 0

    # ------------------------------------------------
    # Process frames
    # ------------------------------------------------

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_number += 1

        # Run all AI models
        results = pipeline.process_frame(
            frame
        )

        vehicles = results["vehicles"]
        potholes = results["potholes"]
        road_damage = results["road_damage"]

        # Update counters
        total_vehicles += len(vehicles)
        total_potholes += len(potholes)
        total_road_damage += len(road_damage)

        # ------------------------------------------------
        # Draw vehicle detections
        # ------------------------------------------------

        for detection in vehicles:

            x1, y1, x2, y2 = map(
                int,
                detection["bbox"]
            )

            label = (
                f"Vehicle "
                f"{detection['confidence']:.2f}"
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
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 0, 0),
                2
            )

        # ------------------------------------------------
        # Draw potholes
        # ------------------------------------------------

        for detection in potholes:

            x1, y1, x2, y2 = map(
                int,
                detection["bbox"]
            )

            label = (
                f"{detection['class_name']} "
                f"{detection['confidence']:.2f}"
            )

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 255),
                2
            )

            cv2.putText(
                frame,
                label,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2
            )

        # ------------------------------------------------
        # Draw road damage
        # ------------------------------------------------

        for detection in road_damage:

            x1, y1, x2, y2 = map(
                int,
                detection["bbox"]
            )

            label = (
                f"{detection['class_name']} "
                f"{detection['confidence']:.2f}"
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
                label,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 255),
                2
            )

        # ------------------------------------------------
        # Information overlay
        # ------------------------------------------------

        cv2.putText(
            frame,
            f"Vehicles: {len(vehicles)}",
            (20, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Potholes: {len(potholes)}",
            (20, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        cv2.putText(
            frame,
            f"Road Damage: {len(road_damage)}",
            (20, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        # ------------------------------------------------
        # Save processed frame
        # ------------------------------------------------

        writer.write(frame)

        # Print progress every 30 frames
        if frame_number % 30 == 0:

            print(
                f"Processed "
                f"{frame_number}/{total_frames} frames"
            )

    # ------------------------------------------------
    # Cleanup
    # ------------------------------------------------

    cap.release()
    writer.release()

    print("\n" + "=" * 60)
    print("AI VIDEO PROCESSING FINISHED")
    print("=" * 60)

    print(f"Output: {output_path}")

    print(f"Total vehicle detections: {total_vehicles}")
    print(f"Total pothole detections: {total_potholes}")
    print(f"Total road damage detections: {total_road_damage}")

    print("=" * 60)