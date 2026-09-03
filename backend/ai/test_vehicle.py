import cv2
from pathlib import Path

from Backend.ai.vehicle_detector import VehicleDetector


PROJECT_ROOT = Path(__file__).resolve().parents[2]

VIDEO_PATH = (
    PROJECT_ROOT
    / "test videos"
    / "istockphoto-2159760544-640_adpp_is.mp4"
)


detector = VehicleDetector()

cap = cv2.VideoCapture(
    str(VIDEO_PATH)
)

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video:\n{VIDEO_PATH}"
    )


while True:

    ret, frame = cap.read()

    if not ret:
        break

    detections = detector.detect(frame)

    for detection in detections:

        x1, y1, x2, y2 = map(
            int,
            detection["bbox"]
        )

        track_id = detection["track_id"]

        label = (
            f"ID {track_id} "
            f"{detection['class_name']} "
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

    cv2.imshow(
        "Vehicle ByteTrack",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()