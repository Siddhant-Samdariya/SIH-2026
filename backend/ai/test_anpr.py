import cv2
from pathlib import Path
from collections import Counter

from Backend.ai.anpr_detector import ANPRDetector


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

VIDEO_PATH = (
    PROJECT_ROOT
    / "test videos"
    / "istockphoto-2159760544-640_adpp_is.mp4"
)


# --------------------------------------------------
# Load ANPR
# --------------------------------------------------

anpr = ANPRDetector()


# --------------------------------------------------
# Open video
# --------------------------------------------------

cap = cv2.VideoCapture(
    str(VIDEO_PATH)
)

if not cap.isOpened():

    raise RuntimeError(
        f"Could not open video:\n{VIDEO_PATH}"
    )


frame_number = 0


# --------------------------------------------------
# Process
# --------------------------------------------------

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame_number += 1

    detections = anpr.detect(
        frame,
        frame_number
    )

    for detection in detections:

        x1, y1, x2, y2 = map(
            int,
            detection["bbox"]
        )

        track_id = detection["track_id"]

        plate = detection["plate"]

        label = f"ID {track_id}"

        if plate:

            label += f" | {plate}"

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
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 0),
            2
        )

    cv2.imshow(
        "ANPR + ByteTrack + EasyOCR",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


cap.release()
cv2.destroyAllWindows()


# --------------------------------------------------
# Final readings
# --------------------------------------------------

print("\n" + "=" * 60)
print("FINAL ANPR RESULTS")
print("=" * 60)

for track_id, readings in anpr.track_texts.items():

    if not readings:
        continue

    counts = Counter(readings)

    final_text, occurrences = (
        counts.most_common(1)[0]
    )

    print(f"Track ID : {track_id}")
    print(f"Plate    : {final_text}")
    print(
        f"Votes    : "
        f"{occurrences}/{len(readings)}"
    )
    print(f"Readings : {readings}")
    print("-" * 40)