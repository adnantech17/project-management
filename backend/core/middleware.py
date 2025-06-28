from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from models.user import User
import re

from .database import SessionLocal
from .auth import decode_token, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES


class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Routes that don't require authentication
        self.public_routes = [
            r'^/auth/login$',
            r'^/auth/register$',
            r'^/docs.*',
            r'^/openapi\.json$',
            r'^/redoc.*',
            r'^/$'
        ]

    def is_public_route(self, path: str) -> bool:
        """Check if the route is public (doesn't require authentication)"""
        for pattern in self.public_routes:
            if re.match(pattern, path):
                return True
        return False

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)
            
        if self.is_public_route(request.url.path):
            return await call_next(request)

        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")

        if not access_token and not refresh_token:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"}
            )

        valid_user = None
        new_access_token = None

        if access_token:
            payload = decode_token(access_token)

            if payload and payload.get("type") == "access":
                valid_user = payload.get("sub")

        if not valid_user and refresh_token:
            payload = decode_token(refresh_token)

            if payload and payload.get("type") == "refresh":
                username = payload.get("sub")
                db = SessionLocal()

                try:
                    user = db.query(User).filter(User.username == username).first()

                    if user:
                        valid_user = username
                        new_access_token = create_access_token({"sub": username})
                finally:
                    db.close()

        if not valid_user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"}
            )

        request.state.validated_user = valid_user
        request.state.token_refreshed = bool(new_access_token)

        response = await call_next(request)

        if new_access_token:
            response.set_cookie(
                key="access_token",
                value=new_access_token,
                max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                httponly=True,
                secure=True,
                samesite="lax"
            )

        return response
