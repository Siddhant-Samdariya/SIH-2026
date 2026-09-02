from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from services.mock_data import (
    get_mock_cameras,
    get_mock_camera_by_id,
    get_mock_events,
    get_mock_analytics
)

router = APIRouter(prefix="/api/cameras", tags=["Cameras"])


@router.get("", summary="Get All Connected Cameras")
def get_cameras() -> List[Dict[str, Any]]:
    return get_mock_cameras()


@router.get("/{camera_id}", summary="Get Single Camera Details")
def get_camera_by_id(camera_id: str) -> Dict[str, Any]:
    camera = get_mock_camera_by_id(camera_id)
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID '{camera_id}' not found"
        )
    return camera


@router.get("/{camera_id}/events", summary="Get Camera-Specific Events")
def get_camera_events(camera_id: str) -> List[Dict[str, Any]]:
    camera = get_mock_camera_by_id(camera_id)
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID '{camera_id}' not found"
        )
    return get_mock_events(camera_id)


@router.get("/{camera_id}/analytics", summary="Get Camera-Specific Analytics")
def get_camera_analytics(camera_id: str) -> Dict[str, Any]:
    camera = get_mock_camera_by_id(camera_id)
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Camera with ID '{camera_id}' not found"
        )
    return get_mock_analytics(camera_id)
