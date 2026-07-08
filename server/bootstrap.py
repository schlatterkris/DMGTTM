"""Application bootstrap helpers for the FastAPI server."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server.routes import ALL_ROUTERS

FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"


def init_app(app: FastAPI) -> None:
    """Apply shared middleware, routers to ``app``."""

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in ALL_ROUTERS:
        app.include_router(router)

    dist = FRONTEND_DIST
    if dist.is_dir():
        app.mount("/", StaticFiles(directory=str(dist), html=True), name="frontend")
