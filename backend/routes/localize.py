from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from Library.LC_Lib import localize_library
import sys
import os

# Import Maps_campus from maps directory
maps_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'maps')
sys.path.append(maps_path)

# Import building detector
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from building_detector import detect_building_and_localize

try:
    from Maps_campus import Maps_campus
except ImportError as e:
    print(f"Warning: Could not import Maps_campus: {e}")
    Maps_campus = None

router = APIRouter()

class LocalizationRequest(BaseModel):
    image: str

class LocalizationResponse(BaseModel):
    building: str
    node_id: Optional[str] = None
    x: float
    y: float
    confidence: float
    location_name: str

@router.post("/localize", response_model=LocalizationResponse)
async def localize_image(request: LocalizationRequest):
    """
    Localize user position from camera image
    
    This endpoint:
    1. Receives base64 image from frontend
    2. Uses building detector to determine which localizer to use
    3. Calls appropriate CV localizer (LC_Lib.py, etc.)
    4. Returns coordinates in campus map system
    """
    
    try:
        print(f"Received localization request with image length: {len(request.image)}")
        
        # Use building detector to determine location
        result = detect_building_and_localize(request.image)
        
        print(f"Building detector result: {result}")
        
        if result.get('success', False):
            print(f"Localization successful: {result}")
            
            return LocalizationResponse(
                building=result['building'],
                node_id=result.get('node_id'),
                x=result['x'],
                y=result['y'],
                confidence=result['confidence'],
                location_name=result['building']
            )
        else:
            print(f"Localization failed, using fallback")
            
            # Return fallback response
            return LocalizationResponse(
                building="Unknown",
                node_id=None,
                x=1200.0,  # Campus entrance
                y=200.0,
                confidence=0.0,
                location_name="Unknown Location"
            )
            
    except Exception as e:
        print(f"Localization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Localization failed: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "localization"}
