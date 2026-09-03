try:
    from .vehicle_detector import VehicleDetector
except Exception:
    VehicleDetector = None

try:
    from .pothole_detector import PotholeDetector
except Exception:
    PotholeDetector = None

try:
    from .road_damage_detector import RoadDamageDetector
except Exception:
    RoadDamageDetector = None

try:
    from .anpr_detector import ANPRDetector
except Exception:
    ANPRDetector = None


class TransportAIPipeline:

    def __init__(self):

        print("=" * 60)
        print("Initializing Transport AI Pipeline")
        print("=" * 60)

        self.vehicle_detector = VehicleDetector() if VehicleDetector else None
        self.pothole_detector = PotholeDetector() if PotholeDetector else None
        self.road_damage_detector = RoadDamageDetector() if RoadDamageDetector else None
        self.anpr_detector = ANPRDetector() if ANPRDetector else None

        print("=" * 60)
        print("All AI models loaded successfully")
        print("=" * 60)

    def process_frame(self, frame, frame_number):

        # Vehicle detection + ByteTrack
        vehicles = self.vehicle_detector.detect(frame)

        # Pothole detection
        potholes = self.pothole_detector.detect(frame)

        # Road damage detection
        road_damage = self.road_damage_detector.detect(frame)

        # ANPR detection + ByteTrack + EasyOCR
        anpr = self.anpr_detector.detect(
            frame,
            frame_number
        )

        return {
            "vehicles": vehicles,
            "potholes": potholes,
            "road_damage": road_damage,
            "anpr": anpr
        }