import cv2
import os
import torch
from collections import Counter
from ultralytics import YOLO

from database import (
    test_connection,
    save_detection,
    save_analytics
)


# ==========================================================
# CONFIGURATION
# ==========================================================

MODEL_PATH = "models\\best_xl_ITD_v1.2.pt"
VIDEO_PATH = "videos\\13588981_3840_2160_30fps.mp4"

CAMERA_ID = 1

CONFIDENCE_THRESHOLD = 0.40

# Save DB records every N frames
SAVE_EVERY_N_FRAMES = 30

# YOLO inference size
# 640 is a good starting point for speed.
IMAGE_SIZE = 640


# ==========================================================
# GPU / CPU
# ==========================================================

if torch.cuda.is_available():

    DEVICE = "cuda"

    print("\n======================================")
    print("GPU ACCELERATION ENABLED")
    print("======================================")
    print("GPU:", torch.cuda.get_device_name(0))

else:

    DEVICE = "cpu"

    print("\n======================================")
    print("WARNING: CUDA NOT AVAILABLE")
    print("Using CPU")
    print("======================================")


# ==========================================================
# MAIN
# ==========================================================

def main():

    print("\n==============================================")
    print(" SIH TRANSPORT AI")
    print(" YOLO + GPU + POSTGRESQL")
    print("==============================================")

    # ------------------------------------------------------
    # DATABASE
    # ------------------------------------------------------

    if not test_connection():

        print("\nDatabase connection failed.")

        return


    # ------------------------------------------------------
    # MODEL CHECK
    # ------------------------------------------------------

    if not os.path.exists(MODEL_PATH):

        print("\nERROR: Model not found:")
        print(MODEL_PATH)

        return


    # ------------------------------------------------------
    # VIDEO CHECK
    # ------------------------------------------------------

    if not os.path.exists(VIDEO_PATH):

        print("\nERROR: Video not found:")
        print(VIDEO_PATH)

        return


    # ------------------------------------------------------
    # LOAD MODEL
    # ------------------------------------------------------

    print("\nLoading model...")

    model = YOLO(MODEL_PATH)

    print("Model loaded.")

    print("Inference device:", DEVICE)


    # ------------------------------------------------------
    # OPEN VIDEO
    # ------------------------------------------------------

    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():

        print("ERROR: Cannot open video.")

        return


    # ------------------------------------------------------
    # VIDEO INFORMATION
    # ------------------------------------------------------

    original_width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    original_height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )


    print("\n======================================")
    print("VIDEO INFORMATION")
    print("======================================")

    print("Resolution:",
          original_width,
          "x",
          original_height)

    print("FPS:", fps)

    print("Total frames:", total_frames)

    print("======================================")


    # ------------------------------------------------------
    # CREATE NORMAL WINDOW
    # ------------------------------------------------------

    WINDOW_NAME = "SIH Transport AI"

    cv2.namedWindow(
        WINDOW_NAME,
        cv2.WINDOW_NORMAL
    )


    # Maximum display size
    MAX_WIDTH = 1280
    MAX_HEIGHT = 720


    # ------------------------------------------------------
    # CALCULATE DISPLAY SIZE
    # ------------------------------------------------------

    scale = min(

        MAX_WIDTH / original_width,

        MAX_HEIGHT / original_height

    )

    display_width = int(
        original_width * scale
    )

    display_height = int(
        original_height * scale
    )


    cv2.resizeWindow(

        WINDOW_NAME,

        display_width,

        display_height

    )


    # ------------------------------------------------------
    # VARIABLES
    # ------------------------------------------------------

    frame_number = 0

    total_saved = 0


    # ======================================================
    # VIDEO LOOP
    # ======================================================

    while True:

        ret, frame = cap.read()


        if not ret:

            break


        frame_number += 1


        # --------------------------------------------------
        # YOLO INFERENCE
        # --------------------------------------------------

        results = model.predict(

            source=frame,

            imgsz=IMAGE_SIZE,

            conf=CONFIDENCE_THRESHOLD,

            device=DEVICE,

            verbose=False,

            # FP16 is faster on NVIDIA GPUs
            half=(DEVICE == "cuda")

        )


        current_counts = Counter()


        # --------------------------------------------------
        # PROCESS DETECTIONS
        # --------------------------------------------------

        for result in results:


            if result.boxes is None:

                continue


            for box in result.boxes:


                confidence = float(
                    box.conf[0]
                )


                if confidence < CONFIDENCE_THRESHOLD:

                    continue


                class_id = int(
                    box.cls[0]
                )


                class_name = str(
                    result.names[class_id]
                ).lower()


                # ------------------------------------------------
                # BOUNDING BOX
                # ------------------------------------------------

                x1, y1, x2, y2 = (
                    box.xyxy[0].tolist()
                )


                # ------------------------------------------------
                # COUNT
                # ------------------------------------------------

                current_counts[
                    class_name
                ] += 1


                # ------------------------------------------------
                # DRAW BOX
                # ------------------------------------------------

                cv2.rectangle(

                    frame,

                    (
                        int(x1),
                        int(y1)
                    ),

                    (
                        int(x2),
                        int(y2)
                    ),

                    (0, 255, 0),

                    2

                )


                # ------------------------------------------------
                # LABEL
                # ------------------------------------------------

                label = (

                    f"{class_name} "
                    f"{confidence:.2f}"

                )


                cv2.putText(

                    frame,

                    label,

                    (
                        int(x1),
                        max(
                            20,
                            int(y1) - 10
                        )
                    ),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.6,

                    (0, 255, 0),

                    2

                )


                # ------------------------------------------------
                # SAVE TO DATABASE
                # ------------------------------------------------

                if (
                    frame_number
                    % SAVE_EVERY_N_FRAMES
                    == 0
                ):

                    try:

                        detection_id = save_detection(

                            camera_id=CAMERA_ID,

                            class_name=class_name,

                            confidence=confidence,

                            x1=x1,
                            y1=y1,
                            x2=x2,
                            y2=y2

                        )


                        total_saved += 1


                    except Exception as e:

                        print(
                            "\nDATABASE ERROR:",
                            e
                        )


        # ======================================================
        # DISPLAY INFORMATION
        # ======================================================

        y = 30


        cv2.putText(

            frame,

            f"Device: {DEVICE.upper()}",

            (10, y),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.7,

            (0, 255, 255),

            2

        )


        y += 30


        cv2.putText(

            frame,

            f"Frame: {frame_number}",

            (10, y),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.6,

            (255, 255, 255),

            2

        )


        y += 30


        # ------------------------------------------------------
        # VEHICLE COUNTS
        # ------------------------------------------------------

        for class_name, count in sorted(
            current_counts.items()
        ):

            text = (
                f"{class_name}: {count}"
            )


            cv2.putText(

                frame,

                text,

                (10, y),

                cv2.FONT_HERSHEY_SIMPLEX,

                0.6,

                (255, 255, 255),

                2

            )


            y += 25


        # ======================================================
        # SAVE ANALYTICS
        # ======================================================

        if (
            frame_number
            % SAVE_EVERY_N_FRAMES
            == 0
        ):

            try:

                save_analytics(

                    CAMERA_ID,

                    current_counts

                )

            except Exception as e:

                print(
                    "\nANALYTICS DATABASE ERROR:",
                    e
                )


        # ======================================================
        # DISPLAY VIDEO
        # ======================================================

        cv2.imshow(

            WINDOW_NAME,

            frame

        )


        # Q = quit
        key = cv2.waitKey(1) & 0xFF


        if key == ord("q"):

            break


    # ======================================================
    # CLEANUP
    # ======================================================

    cap.release()

    cv2.destroyAllWindows()


    print("\n======================================")
    print("PROCESSING FINISHED")
    print("======================================")

    print(
        "Frames processed:",
        frame_number
    )

    print(
        "Database detections:",
        total_saved
    )


# ==========================================================
# RUN
# ==========================================================

if __name__ == "__main__":

    main()