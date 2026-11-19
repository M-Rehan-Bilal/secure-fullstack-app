import base64
import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config import get_settings

COOKIE_NAME = "access_token"
JWT_ALGORITHM = "HS256"
NONCE_SIZE = 12
PHONE_AAD = b"student_registrations.phone_encrypted"

_hasher = PasswordHasher()
_DUMMY_HASH = _hasher.hash("timing-equaliser-password")


# ---------- Passwords (Argon2id) ----------

def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def burn_password_time() -> None:
    """Run a dummy check so unknown emails take as long as known ones (prevents user enumeration)."""
    verify_password("dummy", _DUMMY_HASH)


# ---------- JWT ----------

def create_access_token(user_id: int, role: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    claims = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(claims, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    # Raises a PyJWT error if the signature is wrong or the token has expired.
    return jwt.decode(token, get_settings().jwt_secret, algorithms=[JWT_ALGORITHM])


# ---------- AES-256-GCM for sensitive fields ----------

def _encryption_key() -> bytes:
    key = base64.b64decode(get_settings().encryption_key)
    if len(key) != 32:
        raise RuntimeError("ENCRYPTION_KEY must be 32 bytes, base64-encoded")
    return key


def encrypt_field(plaintext: str) -> str:
    nonce = os.urandom(NONCE_SIZE)
    ciphertext = AESGCM(_encryption_key()).encrypt(nonce, plaintext.encode("utf-8"), PHONE_AAD)
    return base64.b64encode(nonce + ciphertext).decode("ascii")


def decrypt_field(token: str) -> str:
    raw = base64.b64decode(token)
    nonce, ciphertext = raw[:NONCE_SIZE], raw[NONCE_SIZE:]
    return AESGCM(_encryption_key()).decrypt(nonce, ciphertext, PHONE_AAD).decode("utf-8")