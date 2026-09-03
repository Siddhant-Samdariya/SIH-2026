import cv2
from pathlib import Path

from vehicle_detector import VehicleDetector


# --------------------------------------------------
# Project paths
# --------------------------------------------------

# test_vehicle.py
# D:\SIH_Transport_AI\Backend\ai\test_vehicle.py

PROJECT_ROOT = Path(__file__).resolve().parents[2]

VIDEO_PATH = (
    PROJECT_ROOT
    / "test videos"
    / "istockphoto-2159760544-640_adpp_is.mp4"
)


# --------------------------------------------------
# Check video
# --------------------------------------------------

print("Project root:")
print(PROJECT_ROOT)

print("\nVideo path:")
print(VIDEO_PATH)

print("\nVideo exists:", VIDEO_PATH.exists())


if not VIDEO_PATH.exists():
    raise FileNotFoundError(
        f"Video not found:\n{VIDEO_PATH}"
    )


# --------------------------------------------------
# Load model
# --------------------------------------------------

detector = VehicleDetector()


# --------------------------------------------------
# Open video
# --------------------------------------------------

cap = cv2.VideoCapture(str(VIDEO_PATH))

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video:\n{VIDEO_PATH}"
    )


print("\nVideo opened successfully.")
print("Press Q to quit.")


# --------------------------------------------------
# Process video
# --------------------------------------------------

while True:

    ret, frame = cap.read()

    if not ret:
        print("Video finished.")
        break

    detections = detector.detect(frame)

    print(detections)

    cv2.imshow("Vehicle Detection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# --------------------------------------------------
# Cleanup
# --------------------------------------------------

cap.release()
cv2.destroyAllWindows()