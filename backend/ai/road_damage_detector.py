from pathlib import Path
from ultralytics import YOLO


class RoadDamageDetector:

    def __init__(self):

        model_path = (
            Path(__file__).resolve().parents[2]
            / "models"
            / "road_damage"
            / "Other type of road damages.pt"
        )

        if not model_path.exists():
            raise FileNotFoundError(
                f"Road damage model not found: {model_path}"
            )

        print(f"Loading road damage model: {model_path}")

        self.model = YOLO(str(model_path))

    def detect(self, frame):

        results = self.model.predict(
            source=frame,
            device=0,
            verbose=False
        )

        detections = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                class_name = self.model.names[class_id]

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2]
                })

        return detections