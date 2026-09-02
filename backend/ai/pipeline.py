from .vehicle_detector import VehicleDetector
from .pothole_detector import PotholeDetector
from .road_damage_detector import RoadDamageDetector
from .anpr_detector import ANPRDetector


class TransportAIPipeline:

    def __init__(self):

        print("=" * 60)
        print("Initializing Transport AI Pipeline")
        print("=" * 60)

        self.vehicle_detector = VehicleDetector()
        self.pothole_detector = PotholeDetector()
        self.road_damage_detector = RoadDamageDetector()
        self.anpr_detector = ANPRDetector()

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