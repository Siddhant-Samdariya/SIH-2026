import os
from typing import List, Dict, Any, Optional

class YOLOService:
    """
    YOLO Computer Vision Model Handler
    Loads trained PyTorch / Ultralytics models for vehicle detection, ANPR, and pothole inspection.
    """
    def __init__(self, weights_path: Optional[str] = None):
        self.weights_path = weights_path or os.path.join(os.path.dirname(__file__), "weights")
        self.model = None
        self.is_loaded = False

    def load_model(self, model_filename: str = "best.pt"):
        """Loads YOLO model weights from the models/weights directory."""
        full_path = os.path.join(self.weights_path, model_filename)
        if not os.path.exists(full_path):
            print(f"[YOLOService Warning] Model file '{full_path}' not found yet. Using mock detections.")
            return False

        try:
            from ultralytics import YOLO
            self.model = YOLO(full_path)
            self.is_loaded = True
            print(f"[YOLOService] Successfully loaded YOLO model from '{full_path}'!")
            return True
        except Exception as e:
            print(f"[YOLOService Error] Failed to load YOLO model: {e}")
            return False

    def detect_frame(self, frame_bytes_or_path: Any) -> Dict[str, Any]:
        """Runs inference on a single image frame or video stream."""
        if not self.is_loaded or self.model is None:
            # Fallback mock detection structure
            return {
                "boxes": [
                    {"label": "bus", "confidence": 0.94, "bbox": [120, 80, 450, 320]},
                    {"label": "car", "confidence": 0.88, "bbox": [500, 200, 680, 360]}
                ],
                "total_vehicles": 2,
                "status": "mock_inference"
            }

        # Real YOLO Inference
        results = self.model(frame_bytes_or_path)
        detections = []
        for result in results:
            for box in result.boxes:
                coords = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = self.model.names[cls_id]
                detections.append({
                    "label": label,
                    "confidence": round(conf, 3),
                    "bbox": [round(c, 1) for c in coords]
                })

        return {
            "boxes": detections,
            "total_vehicles": len(detections),
            "status": "live_yolo_inference"
        }

# Singleton instance for route handlers
yolo_engine = YOLOService()
