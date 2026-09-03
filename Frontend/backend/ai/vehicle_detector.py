from pathlib import Path

from ultralytics import YOLO


class VehicleDetector:

    def __init__(self):

        model_path = (
            Path(__file__).resolve().parents[2]
            / "models"
            / "vehicle"
            / "vehicle.pt"
        )

        if not model_path.exists():
            raise FileNotFoundError(
                f"Vehicle model not found:\n{model_path}"
            )

        print(
            f"Loading vehicle model: {model_path}"
        )

        self.model = YOLO(
            str(model_path)
        )

    def detect(self, frame):

        results = self.model.track(
            source=frame,
            persist=True,
            tracker="bytetrack.yaml",
            device=0,
            conf=0.25,
            verbose=False
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            boxes = (
                result.boxes.xyxy
                .int()
                .cpu()
                .tolist()
            )

            confidences = (
                result.boxes.conf
                .cpu()
                .tolist()
            )

            classes = (
                result.boxes.cls
                .int()
                .cpu()
                .tolist()
            )

            # ByteTrack IDs
            if result.boxes.id is not None:

                track_ids = (
                    result.boxes.id
                    .int()
                    .cpu()
                    .tolist()
                )

            else:

                track_ids = [
                    None
                ] * len(boxes)

            for box, confidence, class_id, track_id in zip(
                boxes,
                confidences,
                classes,
                track_ids
            ):

                detection = {
                    "track_id": (
                        int(track_id)
                        if track_id is not None
                        else None
                    ),

                    "class_id": int(class_id),

                    "class_name": self.model.names[
                        int(class_id)
                    ],

                    "confidence": float(
                        confidence
                    ),

                    "bbox": box
                }

                detections.append(
                    detection
                )

        return detections