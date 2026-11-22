from datetime import datetime, timedelta, timezone
from typing import get_args
import jwt
from jwt import InvalidTokenError
from passlib.context import CryptContext
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from models.user import UserRole
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)
def require_role(required_roles: list[str]):
    def wrapper(user: dict = Depends(get_current_user)):
        if user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Access forbidden")
        return user
    return wrapper
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        if len(token) > 8192:
            raise InvalidTokenError("Token too large")
        payload = jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM], options={"require": ["exp", "sub"]}
        )
        subject = payload["sub"]
        role = payload.get("role")
        if not subject.strip() or type(payload["exp"]) is not int or role not in get_args(UserRole):
            raise InvalidTokenError("Invalid token claims")
        return {"email": subject, "role": role}
    except (InvalidTokenError, TypeError, ValueError, OverflowError, RecursionError):
        raise HTTPException(
            status_code=401, detail="Invalid token", headers={"WWW-Authenticate": "Bearer"}
        ) from None
