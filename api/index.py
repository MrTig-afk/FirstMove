import os
import sys
import traceback
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from routers import packs
from security import limiter, get_client_ip
from services.notify import notify_error, notify_security

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

if os.getenv("DEV_MODE") == "true":
    origins = [
        "http://localhost:5173",
        "https://localhost:5173",
        "https://192.168.1.108:5173",
        "https://192.168.1.108:5174",
    ]
else:
    allowed = os.environ.get("ALLOWED_ORIGINS", "")
    if not allowed:
        raise RuntimeError("ALLOWED_ORIGINS must be set in production")
    origins = [allowed]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["X-API-Key", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


_NOISE_PATHS = {"/favicon.ico", "/robots.txt", "/sitemap.xml", "/.well-known"}

@app.exception_handler(404)
async def not_found(request: Request, exc):
    path = request.url.path
    if not any(path.startswith(p) for p in _NOISE_PATHS):
        await notify_security("404 hit 🔒", f"Path: {path}", get_client_ip(request))
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(Exception)
async def server_error(request: Request, exc):
    await notify_error("500 error 🚨", traceback.format_exc()[:500])
    return JSONResponse(status_code=500, content={"detail": "Internal error"})


app.include_router(packs.router)
handler = Mangum(app)
