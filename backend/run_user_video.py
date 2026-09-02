import os
import time
from services.multi_yolo import multi_yolo_engine

# Input & Output Paths
INPUT_VIDEO = r"c:\Users\samda\OneDrive\Pictures\CODE\SIH FRONTED\[Top 10] Cars Vs Potholes #35  Flying Car Series - HY BYS (1080p, h264).mp4"
OUTPUT_VIDEO = os.path.join(os.path.dirname(__file__), "outputs", "user_processed_video.mp4")

def main():
    print("=" * 65)
    print("URBANSENSE AI: RUNNING MULTI-MODEL YOLO INFERENCE ON VIDEO")
    print("=" * 65)

    if not os.path.exists(INPUT_VIDEO):
        print(f"❌ Input video not found at: {INPUT_VIDEO}")
        return

    print(f"\nProcessing Video: {INPUT_VIDEO}")
    print(f"Saving Output to: {OUTPUT_VIDEO}\n")

    start_time = time.time()
    result = multi_yolo_engine.process_video(
        input_video_path=INPUT_VIDEO,
        output_video_path=OUTPUT_VIDEO,
        frame_stride=2
    )
    elapsed = round(time.time() - start_time, 2)

    print("\n" + "=" * 65)
    print("URBANSENSE AI: VIDEO INFERENCE COMPLETE!")
    print("=" * 65)
    print(f"Processing Time    : {elapsed} seconds")
    print(f"Total Video Frames : {result['total_frames']}")
    print(f"Total Detections   : {result['summary']['total_detections']}")
    print(f"  • Potholes       : {result['summary']['potholes']}")
    print(f"  • Road Damage    : {result['summary']['road_damage']}")
    print(f"  • Vehicles/Peds  : {result['summary']['vehicles']}")
    print("-" * 65)
    print(f"Output Video Saved : {os.path.abspath(OUTPUT_VIDEO)}")
    print("=" * 65)

if __name__ == "__main__":
    main()
