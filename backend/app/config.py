from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(ENV_PATH), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Defaults allow immediate local testing without manual config
    database_url: str = "sqlite:///./student_portal.db"
    jwt_secret: str = Field(
        default="4efa967de295dde41b37fd3bd74560752b2d7ca993e19ec6fea5e37ff14006d1",
        min_length=32,
    )
    jwt_expire_minutes: int = 60
    encryption_key: str = "mfkLqCGM6H7eHcqfTCW7ago6oiw+XngGGsLULaQry7A="
    cookie_secure: bool = False
    lab_ip: str = "127.0.0.1"


@lru_cache
def get_settings() -> Settings:
    return Settings()