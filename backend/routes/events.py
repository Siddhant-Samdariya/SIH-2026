from fastapi import APIRouter
from typing import List, Dict, Any, Optional
from services.mock_data import get_mock_events

router = APIRouter(prefix="/api", tags=["Live AI Events"])


@router.get("/events", summary="Get Live AI Events Feed")
def get_events(camera_id: Optional[str] = None) -> List[Dict[str, Any]]:
    return get_mock_events(camera_id)
