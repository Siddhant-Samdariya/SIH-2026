from typing import List, Dict, Any, Optional


def compute_center(bbox: List[int]) -> (float, float):
    """Returns center (cx, cy) of bounding box [x1, y1, x2, y2]."""
    x1, y1, x2, y2 = bbox
    return (x1 + x2) / 2.0, (y1 + y2) / 2.0


def is_point_inside(point: (float, float), bbox: List[int]) -> bool:
    """Checks if a point (px, py) is strictly inside [x1, y1, x2, y2]."""
    px, py = point
    x1, y1, x2, y2 = bbox
    return x1 <= px <= x2 and y1 <= py <= y2


def compute_intersection_area(boxA: List[int], boxB: List[int]) -> float:
    """Computes area of intersection between boxA and boxB."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interW = max(0, xB - xA)
    interH = max(0, yB - yA)

    return float(interW * interH)


def associate_plate_to_vehicle(
    plate_bbox: List[int],
    vehicles: List[Dict[str, Any]]
) -> Optional[int]:
    """
    Associates a license plate bounding box to the enclosing vehicle.
    
    1. Compare plate center with vehicle bounding boxes.
    2. If plate center is inside a vehicle box, that vehicle is a candidate.
    3. If multiple candidates contain the center, pick the candidate with the smallest
       bounding box area (tightest fit around the vehicle).
    4. If center is not strictly inside any vehicle, fall back to best spatial intersection area.
    
    Returns the associated vehicle['track_id'], or None if no match.
    """
    if not vehicles:
        return None

    plate_center = compute_center(plate_bbox)

    candidates = []

    for v in vehicles:
        v_bbox = v.get("bbox")
        v_track_id = v.get("track_id")

        if not v_bbox or v_track_id is None:
            continue

        if is_point_inside(plate_center, v_bbox):
            # Area of vehicle box (smaller area = tighter enclosing vehicle)
            area = (v_bbox[2] - v_bbox[0]) * (v_bbox[3] - v_bbox[1])
            candidates.append((v_track_id, area))

    if candidates:
        # Sort by smallest enclosing area
        candidates.sort(key=lambda item: item[1])
        return candidates[0][0]

    # Fallback: check maximum intersection area with plate box
    best_overlap = 0.0
    best_track_id = None

    for v in vehicles:
        v_bbox = v.get("bbox")
        v_track_id = v.get("track_id")
        if not v_bbox or v_track_id is None:
            continue

        overlap = compute_intersection_area(plate_bbox, v_bbox)
        if overlap > best_overlap:
            best_overlap = overlap
            best_track_id = v_track_id

    # Accept fallback only if significant portion of plate (e.g. > 30%) is inside
    plate_area = (plate_bbox[2] - plate_bbox[0]) * (plate_bbox[3] - plate_bbox[1])
    if plate_area > 0 and (best_overlap / plate_area) >= 0.30:
        return best_track_id

    return None
