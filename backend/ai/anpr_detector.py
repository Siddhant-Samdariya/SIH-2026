from pathlib import Path
from collections import defaultdict, Counter
import re

try:
    import easyocr
    import torch
    from ultralytics import YOLO
    HAS_ANPR_DEPS = True
except ModuleNotFoundError:
    HAS_ANPR_DEPS = False
    easyocr = None
    torch = None
    YOLO = None


class ANPRDetector:

    def __init__(self):

        # =================================================
        # Model path
        # =================================================

        PROJECT_ROOT = Path(__file__).resolve().parents[2]

        model_path = (
            PROJECT_ROOT
            / "Backend"
            / "models"
            / "anpr"
            / "anpr.pt"
        )

        if not model_path.exists():
            raise FileNotFoundError(
                f"ANPR model not found:\n{model_path}"
            )

        print("=" * 60)
        print("Loading ANPR model")
        print(model_path)
        print("=" * 60)

        self.model = YOLO(str(model_path))

        print("ANPR classes:", self.model.names)

        # =================================================
        # GPU
        # =================================================

        self.device = 0 if torch.cuda.is_available() else "cpu"

        print("ANPR device:", self.device)

        # =================================================
        # EasyOCR
        # =================================================

        print("Loading EasyOCR...")

        self.reader = easyocr.Reader(
            ["en"],
            gpu=torch.cuda.is_available()
        )

        print("EasyOCR loaded.")

        # =================================================
        # Settings
        # =================================================

        self.confidence = 0.25

        # Run OCR every 5 frames
        self.ocr_every = 5

        # Minimum OCR confidence
        self.ocr_confidence = 0.30

        # =================================================
        # OCR readings per ByteTrack ID
        # =================================================

        self.track_texts = defaultdict(list)

        # Confidence values for each track
        self.track_confidences = defaultdict(list)

    # =================================================
    # Clean OCR result
    # =================================================

    def clean_text(self, text):

        text = re.sub(
            r"[^A-Za-z0-9]",
            "",
            text
        )

        return text.upper()

    # =================================================
    # Get best plate reading
    # =================================================

    def get_best_plate(self, track_id):

        readings = self.track_texts.get(
            track_id,
            []
        )

        confidences = self.track_confidences.get(
            track_id,
            []
        )

        if not readings:
            return "", 0.0

        # Most frequently detected text
        best_text = Counter(
            readings
        ).most_common(1)[0][0]

        # Get confidence values belonging to this text
        matching_confidences = []

        for text, confidence in zip(
            readings,
            confidences
        ):
            if text == best_text:
                matching_confidences.append(
                    confidence
                )

        if matching_confidences:

            best_confidence = max(
                matching_confidences
            )

        else:

            best_confidence = 0.0

        return best_text, best_confidence

    # =================================================
    # Process frame
    # =================================================

    def detect(self, frame, frame_number):

        results = self.model.track(
            source=frame,
            persist=True,
            tracker="bytetrack.yaml",
            conf=self.confidence,
            device=self.device,
            verbose=False
        )

        detections = []

        height, width = frame.shape[:2]

        for result in results:

            if result.boxes is None:
                continue

            if result.boxes.id is None:
                continue

            track_ids = (
                result.boxes.id
                .int()
                .cpu()
                .tolist()
            )

            boxes = (
                result.boxes.xyxy
                .int()
                .cpu()
                .tolist()
            )

            for track_id, box in zip(
                track_ids,
                boxes
            ):

                x1, y1, x2, y2 = box

                # -----------------------------------------
                # Keep bounding box inside frame
                # -----------------------------------------

                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(width, x2)
                y2 = min(height, y2)

                if x2 <= x1 or y2 <= y1:
                    continue

                # -----------------------------------------
                # Crop number plate
                # -----------------------------------------

                plate_crop = frame[
                    y1:y2,
                    x1:x2
                ]

                if plate_crop.size == 0:
                    continue

                track_id = int(track_id)

                # -----------------------------------------
                # OCR every N frames
                # -----------------------------------------

                if frame_number % self.ocr_every == 0:

                    try:

                        ocr_results = self.reader.readtext(
                            plate_crop
                        )

                        if ocr_results:

                            best = max(
                                ocr_results,
                                key=lambda x: x[2]
                            )

                            text = self.clean_text(
                                best[1]
                            )

                            ocr_confidence = float(
                                best[2]
                            )

                            if (
                                text
                                and
                                ocr_confidence
                                >= self.ocr_confidence
                            ):

                                self.track_texts[
                                    track_id
                                ].append(text)

                                self.track_confidences[
                                    track_id
                                ].append(
                                    ocr_confidence
                                )

                                print(
                                    f"[ANPR] "
                                    f"Track {track_id}: "
                                    f"{text} "
                                    f"({ocr_confidence:.2f})"
                                )

                    except Exception as e:

                        print(
                            f"[ANPR OCR ERROR] "
                            f"Track {track_id}: {e}"
                        )

                # -----------------------------------------
                # Get best reading for this track
                # -----------------------------------------

                best_text, best_confidence = (
                    self.get_best_plate(track_id)
                )

                # -----------------------------------------
                # Save detection
                # -----------------------------------------

                detections.append({

                    "track_id": track_id,

                    "bbox": [
                        x1,
                        y1,
                        x2,
                        y2
                    ],

                    "plate": best_text,

                    "ocr_confidence": best_confidence,

                    "readings": list(
                        self.track_texts.get(
                            track_id,
                            []
                        )
                    )
                })

        return detections