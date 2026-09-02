from fastapi import APIRouter
from typing import Dict, Any
from services.mock_data import get_mock_overview

router = APIRouter(prefix="/api", tags=["Overview"])


@router.get("/overview", summary="Get City-Wide Overview Telemetry")
def get_overview() -> Dict[str, Any]:
    return get_mock_overview()
