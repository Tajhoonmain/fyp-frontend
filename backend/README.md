# MapMate Backend

FastAPI backend for MapMate navigation system with Computer Vision localization and campus navigation.

## Features

- **Computer Vision Localization**: ORB feature matching for Library area
- **Campus Navigation**: Graph-based pathfinding using campus map data
- **GPS Fallback**: Automatic fallback to GPS when CV fails
- **REST API**: Clean API endpoints for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. File Structure

```
backend/
├── main.py              # FastAPI application
├── start_backend.py     # Startup script
├── requirements.txt     # Python dependencies
├── Library/            # CV localization data
│   ├── LC_Lib.py       # Library localization logic
│   ├── keypoints_3d.npy
│   └── descriptors_3d.npy
├── maps/               # Campus navigation data
│   ├── giki_graph.json # Campus graph for pathfinding
│   ├── giki_map.png    # Campus map image
│   └── script.py       # Map generation script
└── transform_library.json # Coordinate transformation
```

### 3. Start the Backend

```bash
# Option 1: Using startup script
python start_backend.py

# Option 2: Direct uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will start at `http://localhost:8000`

## API Endpoints

### POST `/api/classify-location`

Classify user location from image.

**Request:**
```json
{
  "image": "base64_encoded_image_data"
}
```

**Response:**
```json
{
  "location_name": "Library",
  "coordinates": {"lat": 33.6844, "lng": 73.0479},
  "confidence": 0.85,
  "landmark_type": "building"
}
```

### POST `/api/get-directions`

Get navigation directions between two points.

**Request:**
```json
{
  "from": {"lat": 33.6844, "lng": 73.0479},
  "to": {"lat": 33.6850, "lng": 73.0485}
}
```

**Response:**
```json
{
  "route": [
    {"lat": 33.6844, "lng": 73.0479, "instruction": "Start at node 123"},
    {"lat": 33.6846, "lng": 73.0480, "instruction": "Continue at node 456"}
  ],
  "distance_meters": 120,
  "estimated_time_minutes": 2
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "library_localization": true,
  "campus_graph_loaded": true
}
```

## How It Works

### 1. Computer Vision Localization

1. User takes photo outside Library
2. Backend extracts ORB features from image
3. Matches with pre-computed 3D Library features
4. Uses PnP to calculate camera position
5. Transforms coordinates to campus map system

### 2. Campus Navigation

1. Converts GPS coordinates to nearest graph nodes
2. Uses BFS to find shortest path
3. Returns turn-by-turn directions
4. Calculates distance and estimated time

### 3. Fallback System

- If CV localization fails → GPS fallback
- If pathfinding fails → Error response
- Always returns confidence scores

## Development

### Adding New Locations

1. Create new localization module (similar to `LC_Lib.py`)
2. Generate 3D features for new location
3. Add coordinate transformation data
4. Update `classify_location` endpoint

### Improving Pathfinding

Current implementation uses simple BFS. For production:
- Implement A* algorithm
- Add real-time traffic data
- Include accessibility information
- Add multiple route options

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test location classification (with base64 image)
curl -X POST http://localhost:8000/api/classify-location \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_image_data"}'
```

## Deployment

For production deployment:
1. Use Gunicorn instead of Uvicorn
2. Set up environment variables
3. Configure proper CORS origins
4. Add authentication/authorization
5. Set up monitoring and logging

```bash
# Production startup
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
