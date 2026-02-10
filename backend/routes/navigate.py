from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sys
import os

# Import Maps_campus from the maps directory
maps_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'maps')
sys.path.append(maps_path)

try:
    from Maps_campus import Maps_campus
except ImportError as e:
    print(f"Warning: Could not import Maps_campus: {e}")
    Maps_campus = None

router = APIRouter()

class NavigationRequest(BaseModel):
    start_node: str
    destination: str

class NavigationResponse(BaseModel):
    path: List[str]
    distance_meters: float
    estimated_time_minutes: float
    instructions: List[str]
    success: bool

@router.post("/navigate", response_model=NavigationResponse)
async def get_navigation_directions(request: NavigationRequest):
    """
    Get navigation directions from start to destination
    
    This endpoint:
    1. Receives start and destination node IDs
    2. Uses Maps_campus for pathfinding (A* algorithm)
    3. Returns optimal path with turn-by-turn instructions
    """
    
    try:
        print(f"Navigation request: {request.start_node} -> {request.destination}")
        
        # Initialize campus navigator
        navigator = Maps_campus()
        
        # Get path using A* algorithm
        path = navigator.find_path(request.start_node, request.destination)
        
        if not path:
            print(f"No path found between {request.start_node} and {request.destination}")
            raise HTTPException(status_code=404, detail="No path found between nodes")
        
        # Calculate total distance
        total_distance = navigator.calculate_path_distance(path)
        
        # Generate turn-by-turn instructions
        instructions = generate_instructions(path)
        
        print(f"Navigation successful: path={path}, distance={total_distance:.1f}m")
        
        return NavigationResponse(
            path=path,
            distance_meters=total_distance,
            estimated_time_minutes=total_distance / 50.0,  # Assume 50m/min walking speed
            instructions=instructions,
            success=True
        )
        
    except Exception as e:
        print(f"Navigation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Navigation failed: {str(e)}")

def generate_instructions(path: List[str]) -> List[str]:
    """Generate human-readable navigation instructions"""
    if not path or len(path) < 2:
        return ["No navigation instructions available"]
    
    instructions = []
    instructions.append(f"Start at {path[0]}")
    
    for i in range(len(path) - 1):
        current = path[i]
        next_node = path[i + 1]
        instructions.append(f"Proceed to {next_node}")
    
    instructions.append(f"Arrived at {path[-1]}")
    return instructions

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "navigation"}
