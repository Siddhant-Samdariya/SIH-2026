from fastapi import APIRouter
from typing import List, Dict, Any
from services.mock_data import get_mock_alerts

router = APIRouter(prefix="/api", tags=["Alerts"])


@router.get("/alerts", summary="Get Active Security & Traffic Alerts")
def get_alerts() -> List[Dict[str, Any]]:
    return get_mock_alerts()
