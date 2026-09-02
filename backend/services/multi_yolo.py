import os
import cv2
import json
import time

# Check PyTorch & Device
try:
    import torch
    if torch.cuda.is_available():
        DEVICE = "cuda:0"
        print("=" * 60)
        print("URBANSENSE AI: GPU ACCELERATION ENABLED")
        print("GPU:", torch.cuda.get_device_name(0))
        print("=" * 60)
    else:
        DEVICE = "cpu"
        print("=" * 60)
        print("URBANSENSE AI: CUDA NOT AVAILABLE — USING CPU")
        print("=" * 60)
except Exception as e:
    DEVICE = "cpu"
    print(f"[YOLO Engine Warning] PyTorch device check error: {e}")

# Default Model Paths (Absolute & Relative Fallbacks)
PRIMARY_DIR = r"C:\Users\samda\OneDrive\Pictures\CODE\SIH\Deep learning models"
LOCAL_WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "..", "models", "weights")

def resolve_model_path(filename: str) -> str:
    p1 = os.path.join(PRIMARY_DIR, filename)
    if os.path.exists(p1):
        return p1
    p2 = os.path.join(LOCAL_WEIGHTS_DIR, filename)
    if os.path.exists(p2):
        return p2
    return p1

POTHOLE_MODEL_PATH = resolve_model_path("Potholes.pt")
DAMAGE_MODEL_PATH = resolve_model_path("Other type of road damages.pt")
VEHICLE_MODEL_PATH = resolve_model_path("Vehicle,pedestiran.pt")


class MultiYOLOEngine:
    def __init__(self):
        self.pothole_model = None
        self.damage_model = None
        self.vehicle_model = None
        self.is_loaded = False
        self._load_models()

    def _load_models(self):
        print("\nLoading UrbanSense YOLO Models on:", DEVICE)
        try:
            from ultralytics import YOLO
            
            # Load Potholes Model
            if os.path.exists(POTHOLE_MODEL_PATH):
                self.pothole_model = YOLO(POTHOLE_MODEL_PATH)
                self.pothole_model.to(DEVICE)
                print("✓ Pothole model loaded from:", POTHOLE_MODEL_PATH)

            # Load Damaged Road Model
            if os.path.exists(DAMAGE_MODEL_PATH):
                self.damage_model = YOLO(DAMAGE_MODEL_PATH)
                self.damage_model.to(DEVICE)
                print("✓ Damaged-road model loaded from:", DAMAGE_MODEL_PATH)

            # Load Vehicle/Pedestrian Model
            if os.path.exists(VEHICLE_MODEL_PATH):
                self.vehicle_model = YOLO(VEHICLE_MODEL_PATH)
                self.vehicle_model.to(DEVICE)
                print("✓ Vehicle model loaded from:", VEHICLE_MODEL_PATH)

            if self.pothole_model or self.damage_model or self.vehicle_model:
                self.is_loaded = True
                print("✓ UrbanSense Multi-Model YOLO Engine Ready!")

        except Exception as e:
            print(f"[MultiYOLOEngine Error] Failed to load YOLO models: {e}")

    def process_video(self, input_video_path: str, output_video_path: str, frame_stride: int = 2) -> dict:
        """
        High-performance parallel video processing pipeline displaying frame count & video time telemetry overlay.
        """
        cap = cv2.VideoCapture(input_video_path)
        if not cap.isOpened():
            raise RuntimeError(f"Could not open input video: {input_video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1280
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 720
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 0

        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

        events = []
        frame_number = 0

        start_time = time.time()
        print(f"\nProcessing Video: {input_video_path} -> {output_video_path}")

        last_rendered_frame = None

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame_number += 1
            video_time = frame_number / fps if fps > 0 else 0

            # Run inference every `frame_stride` frames
            if frame_number % frame_stride == 0 or last_rendered_frame is None:
                current_frame = frame.copy()

                # 1. POTHOLE DETECTION
                if self.pothole_model:
                    p_results = self.pothole_model.predict(
                        source=current_frame, device=DEVICE, imgsz=640, verbose=False
                    )
                    for res in p_results:
                        if res.boxes is not None:
                            for box in res.boxes:
                                conf = float(box.conf[0])
                                cls_id = int(box.cls[0])
                                cls_name = self.pothole_model.names[cls_id]
                                x1, y1, x2, y2 = map(int, box.xyxy[0])
                                events.append({
                                    "type": "pothole",
                                    "class": cls_name,
                                    "confidence": round(conf, 4),
                                    "frame": frame_number,
                                    "video_time": round(video_time, 3),
                                    "bbox": [x1, y1, x2, y2]
                                })
                    current_frame = p_results[0].plot(img=current_frame, labels=True, boxes=True)

                # 2. ROAD DAMAGE DETECTION
                if self.damage_model:
                    d_results = self.damage_model.predict(
                        source=current_frame, device=DEVICE, imgsz=640, verbose=False
                    )
                    for res in d_results:
                        if res.boxes is not None:
                            for box in res.boxes:
                                conf = float(box.conf[0])
                                cls_id = int(box.cls[0])
                                cls_name = self.damage_model.names[cls_id]
                                x1, y1, x2, y2 = map(int, box.xyxy[0])
                                events.append({
                                    "type": "road_damage",
                                    "class": cls_name,
                                    "confidence": round(conf, 4),
                                    "frame": frame_number,
                                    "video_time": round(video_time, 3),
                                    "bbox": [x1, y1, x2, y2]
                                })
                    current_frame = d_results[0].plot(img=current_frame, labels=True, boxes=True)

                # 3. VEHICLE & PEDESTRIAN DETECTION
                if self.vehicle_model:
                    v_results = self.vehicle_model.predict(
                        source=current_frame, device=DEVICE, imgsz=640, verbose=False
                    )
                    for res in v_results:
                        if res.boxes is not None:
                            for box in res.boxes:
                                conf = float(box.conf[0])
                                cls_id = int(box.cls[0])
                                cls_name = self.vehicle_model.names[cls_id]
                                x1, y1, x2, y2 = map(int, box.xyxy[0])
                                events.append({
                                    "type": "vehicle",
                                    "class": cls_name,
                                    "confidence": round(conf, 4),
                                    "frame": frame_number,
                                    "video_time": round(video_time, 3),
                                    "bbox": [x1, y1, x2, y2]
                                })
                    current_frame = v_results[0].plot(img=current_frame, labels=True, boxes=True)

                # Display Telemetry Overlay: Frame & Video Time
                cv2.putText(
                    current_frame,
                    f"Frame: {frame_number}/{total_frames}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 255, 255),
                    2
                )
                cv2.putText(
                    current_frame,
                    f"Video Time: {video_time:.2f}s",
                    (20, 75),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 255, 255),
                    2
                )

                last_rendered_frame = current_frame

            out.write(last_rendered_frame if last_rendered_frame is not None else frame)

        cap.release()
        out.release()

        elapsed_time = round(time.time() - start_time, 2)
        print(f"\nProcessing Complete in {elapsed_time}s!")

        return {
            "total_frames": total_frames,
            "duration_seconds": round(total_frames / fps if fps > 0 else 0, 2),
            "processing_time_seconds": elapsed_time,
            "events": events
        }

# Global Singleton
multi_yolo_engine = MultiYOLOEngine()
