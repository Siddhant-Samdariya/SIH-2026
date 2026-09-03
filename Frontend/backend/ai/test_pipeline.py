import cv2
from pathlib import Path

from Backend.ai.pipeline import TransportAIPipeline


# ==================================================
# PATH
# ==================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

VIDEO_PATH = (
    PROJECT_ROOT
    / "test videos"
    / "istockphoto-2159760544-640_adpp_is.mp4"
)


print("=" * 60)
print("TRANSPORT AI TEST")
print("=" * 60)

print("Video:", VIDEO_PATH)
print("Exists:", VIDEO_PATH.exists())


if not VIDEO_PATH.exists():
    raise FileNotFoundError(
        f"Video not found:\n{VIDEO_PATH}"
    )


# ==================================================
# LOAD PIPELINE
# ==================================================

pipeline = TransportAIPipeline()


# ==================================================
# VIDEO
# ==================================================

cap = cv2.VideoCapture(str(VIDEO_PATH))

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video:\n{VIDEO_PATH}"
    )


print("\nVideo opened successfully.")
print("Press Q to quit.\n")


# ==================================================
# PROCESS
# ==================================================

while True:

    ret, frame = cap.read()

    if not ret:
        print("Video finished.")
        break

    results = pipeline.process_frame(frame)

    # ----------------------------------------------
    # Print results
    # ----------------------------------------------

    print(
        f"Vehicles: {len(results['vehicles'])} | "
        f"Potholes: {len(results['potholes'])} | "
        f"Road Damage: {len(results['road_damage'])}"
    )

    # ----------------------------------------------
    # Draw vehicle detections
    # ----------------------------------------------

    for detection in results["vehicles"]:

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

    # ----------------------------------------------
    # Draw potholes
    # ----------------------------------------------

    for detection in results["potholes"]:

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

    # ----------------------------------------------
    # Draw road damage
    # ----------------------------------------------

    for detection in results["road_damage"]:

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

    # ----------------------------------------------
    # Display
    # ----------------------------------------------

    cv2.imshow(
        "SIH Transport AI",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ==================================================
# CLEANUP
# ==================================================

cap.release()
cv2.destroyAllWindows()

print("\nPipeline test completed.")