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

        print(f"Loading vehicle model: {model_path}")

        self.model = YOLO(str(model_path))

    def detect(self, frame):

        results = self.model.predict(
            source=frame,
            device=0,
            verbose=False
        )

        detections = []

        for result in results:

            boxes = result.boxes

            for box in boxes:

                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class_id": cls_id,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2]
                })

        return detections