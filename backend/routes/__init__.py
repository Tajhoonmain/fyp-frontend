from fastapi import APIRouter
from . import localize, navigate

# Create main router that includes all route modules
api_router = APIRouter()

# Include all route modules
api_router.include_router(localize.router, prefix="/api", tags=["localization"])
api_router.include_router(navigate.router, prefix="/api", tags=["navigation"])

__all__ = ["api_router"]
