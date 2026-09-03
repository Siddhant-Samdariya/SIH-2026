from .vehicle_detector import VehicleDetector
from .pothole_detector import PotholeDetector
from .road_damage_detector import RoadDamageDetector


class TransportAIPipeline:

    def __init__(self):

        print("\n" + "=" * 60)
        print("INITIALIZING TRANSPORT AI PIPELINE")
        print("=" * 60)

        # Load all AI models
        self.vehicle_detector = VehicleDetector()
        self.pothole_detector = PotholeDetector()
        self.road_damage_detector = RoadDamageDetector()

        print("=" * 60)
        print("ALL MODELS LOADED SUCCESSFULLY")
        print("=" * 60 + "\n")

    def process_frame(self, frame):

        # -----------------------------
        # Vehicle detection
        # -----------------------------

        vehicles = self.vehicle_detector.detect(frame)

        # -----------------------------
        # Pothole detection
        # -----------------------------

        potholes = self.pothole_detector.detect(frame)

        # -----------------------------
        # Road damage detection
        # -----------------------------

        road_damage = self.road_damage_detector.detect(frame)

        # -----------------------------
        # Unified result
        # -----------------------------

        return {
            "vehicles": vehicles,
            "potholes": potholes,
            "road_damage": road_damage
        }