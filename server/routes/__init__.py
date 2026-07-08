"""Aggregates API routers."""

from . import health, dm

ALL_ROUTERS = [
    health.router,
    dm.router,
]

__all__ = ["ALL_ROUTERS"]
