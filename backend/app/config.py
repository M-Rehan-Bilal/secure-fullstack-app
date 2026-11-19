from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    jwt_secret: str = Field(min_length=32)
    jwt_expire_minutes: int = 15
    encryption_key: str
    cookie_secure: bool = True
    lab_ip: str = "127.0.0.1"


@lru_cache
def get_settings() -> Settings:
    return Settings()