"""
Campeonato Canguru — FastAPI backend + static frontend
Port: 3202
"""
from contextlib import asynccontextmanager
from pathlib import Path
import mimetypes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from routers import matches as matches_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Campeonato Canguru", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches_router.router)


@app.get("/status")
def status():
    return {"status": "ok", "service": "campeonato-canguru"}


# ── Static frontend ────────────────────────────────────────────────────────────
DIST = Path(__file__).resolve().parent.parent / "dist"
TEAMS_DIR = Path("/var/www/rotinadoatleticano/campeonato/teams")

_EXTRA = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml", ".ico": "image/x-icon",
    ".json": "application/json", ".webmanifest": "application/manifest+json",
    ".woff2": "font/woff2", ".js": "application/javascript", ".css": "text/css",
}

if DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST / "assets")), name="assets")

if TEAMS_DIR.exists():
    app.mount("/teams", StaticFiles(directory=str(TEAMS_DIR)), name="teams")


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    candidate = DIST / full_path
    if candidate.exists() and candidate.is_file():
        mime = _EXTRA.get(candidate.suffix.lower()) or mimetypes.guess_type(str(candidate))[0]
        return FileResponse(str(candidate), media_type=mime)
    return FileResponse(str(DIST / "index.html"), media_type="text/html")
