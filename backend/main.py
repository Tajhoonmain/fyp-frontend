"""
FastAPI Backend for MapMate Navigation System
Integrates Computer Vision localization with campus navigation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import api_router

# Initialize FastAPI app
app = FastAPI(title="MapMate Backend", version="1.0.0")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-app.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "MapMate Backend API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "localization": "active",
            "navigation": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
