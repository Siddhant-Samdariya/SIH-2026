from pathlib import Path
from collections import defaultdict, Counter
import re

import cv2
import easyocr
from ultralytics import YOLO


class ANPRTracker:

    def __init__(self):

        # --------------------------------------------------
        # Model path
        # --------------------------------------------------

        model_path = (
            Path(__file__).resolve().parents[2]
            / "models"
            / "anpr"
            / "ANPR MODEL.pt"
        )

        if not model_path.exists():

            raise FileNotFoundError(
                f"ANPR model not found:\n{model_path}"
            )

        print(
            f"Loading ANPR model: {model_path}"
        )

        self.model = YOLO(
            str(model_path)
        )

        # --------------------------------------------------
        # EasyOCR
        # --------------------------------------------------

        print("Loading EasyOCR...")

        self.reader = easyocr.Reader(
            ["en"],
            gpu=True
        )

        # --------------------------------------------------
        # OCR settings
        # --------------------------------------------------

        self.ocr_every = 5
        self.ocr_confidence = 0.30

        # --------------------------------------------------
        # Store OCR readings per plate track
        # --------------------------------------------------

        self.track_texts = defaultdict(list)

    # ------------------------------------------------------
    # Clean plate text
    # ------------------------------------------------------

    def clean_text(self, text):

        text = re.sub(
            r"[^A-Za-z0-9]",
            "",
            text
        )

        return text.upper()

    # ------------------------------------------------------
    # Process frame
    # ------------------------------------------------------

    def process(self, frame, frame_number):

        results = self.model.track(
            frame,
            persist=True,
            tracker="bytetrack.yaml",
            conf=0.25,
            verbose=False
        )

        detections = []

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

                # Keep coordinates inside frame
                height, width = frame.shape[:2]

                x1 = max(0, x1)
                y1 = max(0, y1)
                x2 = min(width, x2)
                y2 = min(height, y2)

                plate_crop = frame[
                    y1:y2,
                    x1:x2
                ]

                if plate_crop.size == 0:
                    continue

                # ------------------------------------------------
                # OCR
                # ------------------------------------------------

                if frame_number % self.ocr_every == 0:

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
                                int(track_id)
                            ].append(text)

                # ------------------------------------------------
                # Determine best text for this track
                # ------------------------------------------------

                detected_text = ""

                readings = self.track_texts.get(
                    int(track_id),
                    []
                )

                if readings:

                    detected_text = Counter(
                        readings
                    ).most_common(1)[0][0]

                detections.append({

                    "track_id": int(track_id),

                    "bbox": [
                        x1,
                        y1,
                        x2,
                        y2
                    ],

                    "plate": detected_text,

                    "ocr_readings": readings
                })

        return detections