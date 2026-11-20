import socket

from sqlalchemy import text

from fastapi import APIRouter

from app.config import get_settings
from app.database import engine
from app.responses import success

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return success(
        {
            "hostname": socket.gethostname(),
            "ip_address": get_settings().lab_ip,
            "database_reachable": db_ok,
        },
        "Health check",
    )