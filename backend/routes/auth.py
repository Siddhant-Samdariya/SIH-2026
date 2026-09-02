from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", summary="Mock Authentication Login")
def login(credentials: LoginRequest) -> Dict[str, Any]:
    username = credentials.username.strip().lower()
    password = credentials.password.strip()

    # Allow 'admin'/'admin123' or non-empty prototype credentials
    if (username == "admin" and password == "admin123") or (len(username) > 0 and len(password) > 0):
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "username": credentials.username
            }
        }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "success": False,
            "message": "Invalid username or password"
        }
    )
