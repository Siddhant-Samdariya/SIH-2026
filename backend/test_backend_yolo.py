import os
import time
from services.multi_yolo import multi_yolo_engine

TEST_VIDEO_PATH = r"c:\Users\samda\OneDrive\Pictures\CODE\SIH FRONTED\[Top 10] Cars Vs Potholes #35  Flying Car Series - HY BYS (1080p, h264).mp4"
OUTPUT_VIDEO_PATH = os.path.join("outputs", "standalone_test_output.mp4")

def run_standalone_test():
    print("=" * 60)
    print("URBANSENSE AI: TESTING MULTI-MODEL YOLO BACKEND ENGINE")
    print("=" * 60)

    if not os.path.exists(TEST_VIDEO_PATH):
        print(f"\n⚠️ Test video file not found at:\n{TEST_VIDEO_PATH}")
        return

    print(f"\nStarting Video Processing Test on:\n{TEST_VIDEO_PATH}")
    start_t = time.time()
    
    result = multi_yolo_engine.process_video(
        input_video_path=TEST_VIDEO_PATH,
        output_video_path=OUTPUT_VIDEO_PATH,
        frame_stride=2
    )

    elapsed = round(time.time() - start_t, 2)

    print("\n" + "=" * 60)
    print("STANDALONE TEST COMPLETE!")
    print("=" * 60)
    print(f"Elapsed Time       : {elapsed} seconds")
    print(f"Total Video Frames : {result['total_frames']}")
    print(f"Video Duration     : {result['duration_seconds']} seconds")
    print("-" * 60)
    print("Output Video Saved to:", os.path.abspath(OUTPUT_VIDEO_PATH))
    print("=" * 60)

if __name__ == "__main__":
    run_standalone_test()
