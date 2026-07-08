"""Application bootstrap helpers for the FastAPI server."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routes import ALL_ROUTERS


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
