"""
FastAPI Backend for MapMate Navigation System
Integrates Computer Vision localization with campus navigation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import cv2
import numpy as np
import json
import sys
import os
from pathlib import Path

# Add Library to path for imports
sys.path.append(str(Path(__file__).parent / "Library"))

try:
    from LC_Lib import localize_library
except ImportError as e:
    print(f"Warning: Could not import LC_Lib: {e}")
    localize_library = None

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

# Pydantic models
class LocationRequest(BaseModel):
    image: str  # Base64 encoded image

class Coordinate(BaseModel):
    lat: float
    lng: float

class DirectionsRequest(BaseModel):
    from_coord: Coordinate
    to_coord: Coordinate

class LocationResponse(BaseModel):
    location_name: str
    coordinates: Coordinate
    confidence: float
    landmark_type: Optional[str] = None

class DirectionsResponse(BaseModel):
    route: List[dict]
    distance_meters: float
    estimated_time_minutes: float

# Load campus navigation data
def load_campus_graph():
    """Load campus graph data for navigation"""
    graph_path = Path(__file__).parent / "maps" / "giki_graph.json"
    try:
        with open(graph_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Warning: Campus graph file not found")
        return {"nodes": [], "edges": []}

# Global variables
campus_graph = load_campus_graph()

def base64_to_cv2(base64_string: str) -> np.ndarray:
    """Convert base64 string to OpenCV image"""
    # Remove header if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode
    img_data = base64.b64decode(base64_string)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    return img

def find_nearest_node(lat: float, lng: float) -> Optional[int]:
    """Find nearest graph node to given coordinates"""
    if not campus_graph["nodes"]:
        return None
    
    # Convert GPS to approximate map coordinates (simplified)
    # You may need to adjust this conversion based on your coordinate system
    x = (lng - 73.0479) * 111320
    y = (33.6844 - lat) * 111320
    
    min_dist = float('inf')
    nearest_node = None
    
    for node in campus_graph["nodes"]:
        node_x, node_y = node["x"], node["y"]
        dist = ((x - node_x) ** 2 + (y - node_y) ** 2) ** 0.5
        
        if dist < min_dist:
            min_dist = dist
            nearest_node = node["id"]
    
    return nearest_node

def calculate_path(from_node: int, to_node: int) -> List[dict]:
    """Calculate path between two nodes using simple BFS"""
    if not campus_graph["edges"]:
        return []
    
    # Build adjacency list
    adj = {}
    for edge in campus_graph["edges"]:
        from_id, to_id = edge["from"], edge["to"]
        if from_id not in adj:
            adj[from_id] = []
        if to_id not in adj:
            adj[to_id] = []
        adj[from_id].append(to_id)
        adj[to_id].append(from_id)
    
    # BFS for shortest path
    from collections import deque
    queue = deque([(from_node, [from_node])])
    visited = {from_node}
    
    while queue:
        current, path = queue.popleft()
        
        if current == to_node:
            return path
        
        for neighbor in adj.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return []  # No path found

@app.get("/")
async def root():
    return {"message": "MapMate Backend API"}

@app.post("/api/classify-location", response_model=LocationResponse)
async def classify_location(request: LocationRequest):
    """Classify user location from image using CV or fallback to GPS"""
    
    # Try Library localization first
    if localize_library:
        try:
            # Convert base64 to image
            img = base64_to_cv2(request.image)
            
            # Save temporary image for LC_Lib
            temp_path = "temp_image.jpg"
            cv2.imwrite(temp_path, img)
            
            # Use Library localization
            result = localize_library(temp_path)
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            if result["success"]:
                # Convert map coordinates back to GPS
                map_x, map_y = result["map_x"], result["map_y"]
                lat = 33.6844 - (map_y / 111320)
                lng = 73.0479 + (map_x / 111320)
                
                return LocationResponse(
                    location_name=result["building"],
                    coordinates=Coordinate(lat=lat, lng=lng),
                    confidence=result["confidence"],
                    landmark_type="building"
                )
        except Exception as e:
            print(f"Library localization failed: {e}")
    
    # Fallback: simulate location classification
    # In real implementation, you'd add more location classifiers here
    return LocationResponse(
        location_name="Main Gate",
        coordinates=Coordinate(lat=33.6844, lng=73.0479),
        confidence=0.7,
        landmark_type="entrance"
    )

@app.post("/api/get-directions", response_model=DirectionsResponse)
async def get_directions(request: DirectionsRequest):
    """Get navigation directions between two points"""
    
    # Find nearest nodes
    from_node = find_nearest_node(request.from_coord.lat, request.from_coord.lng)
    to_node = find_nearest_node(request.to_coord.lat, request.to_coord.lng)
    
    if from_node is None or to_node is None:
        raise HTTPException(status_code=400, detail="Could not find nearby nodes")
    
    # Calculate path
    path_nodes = calculate_path(from_node, to_node)
    
    if not path_nodes:
        raise HTTPException(status_code=400, detail="No path found between locations")
    
    # Build route with instructions
    route = []
    total_distance = 0
    
    for i, node_id in enumerate(path_nodes):
        # Find node coordinates
        node = next((n for n in campus_graph["nodes"] if n["id"] == node_id), None)
        if node:
            lat = 33.6844 - (node["y"] / 111320)
            lng = 73.0479 + (node["x"] / 111320)
            
            instruction = "Start" if i == 0 else "Continue" if i < len(path_nodes) - 1 else "Arrive"
            
            route.append({
                "lat": lat,
                "lng": lng,
                "instruction": f"{instruction} at node {node_id}"
            })
            
            # Calculate distance (simplified)
            if i > 0:
                total_distance += 15  # Assume 15m per edge
    
    return DirectionsResponse(
        route=route,
        distance_meters=total_distance,
        estimated_time_minutes=total_distance / 60  # Assume 1m per second walking
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "library_localization": localize_library is not None,
        "campus_graph_loaded": len(campus_graph["nodes"]) > 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
