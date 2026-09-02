from fastapi import APIRouter
from typing import Dict, Any
from services.mock_data import get_mock_analytics, get_mock_system_status

router = APIRouter(prefix="/api", tags=["Analytics & System Status"])


@router.get("/analytics", summary="Get Aggregated AI Detection Analytics")
def get_analytics() -> Dict[str, Any]:
    return get_mock_analytics()


@router.get("/system/status", summary="Get AI System Pipeline Operational Status")
def get_system_status() -> Dict[str, str]:
    return get_mock_system_status()
