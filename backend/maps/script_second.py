import osmnx as ox
import numpy as np
import cv2
import json
import os

# ================= CONFIGURATION =================
OSM_FILE = r"C:\Users\r_haq\Downloads\map.osm"
OUTPUT_DIR = r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\maps"
IMG_FILE = "giki_map.png"
JSON_FILE = "giki_graph.json"

# Map Visual Settings
MAP_WIDTH = 2048  # High resolution width
BG_COLOR = (0, 0, 0)      # Black (BGR)
ROAD_COLOR = (200, 200, 200) # Light Gray (BGR)
ROAD_THICKNESS = 2

# ================= MAIN SCRIPT =================
def generate_robust_map():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("📦 Loading OSM Graph...")
    # Load and Project to Meters (UTM)
    G = ox.graph_from_xml(OSM_FILE, simplify=True, retain_all=True)
    G = ox.project_graph(G)
    
    print(f"✅ Loaded {len(G.nodes)} nodes and {len(G.edges)} edges.")

    # 1. Calculate Bounds & Scale
    # We need the min/max X and Y to scale everything to our image size
    xs = [data['x'] for _, data in G.nodes(data=True)]
    ys = [data['y'] for _, data in G.nodes(data=True)]
    
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    
    # Calculate Aspect Ratio
    world_width = max_x - min_x
    world_height = max_y - min_y
    scale = MAP_WIDTH / world_width
    
    # Calculate Height to keep aspect ratio correct
    MAP_HEIGHT = int(world_height * scale)
    
    print(f"📏 Map Dimensions: {MAP_WIDTH}x{MAP_HEIGHT} pixels")

    # 2. Coordinate Converter Function
    def world_to_pixel(wx, wy):
        # Normalize (0 to 1) -> Scale to Pixels
        px = int((wx - min_x) * scale)
        # Flip Y (Image origin is Top-Left, World is Bottom-Left)
        py = int(MAP_HEIGHT - (wy - min_y) * scale)
        return px, py

    # 3. Draw the Map (Using OpenCV)
    # Create blank black image
    canvas = np.zeros((MAP_HEIGHT, MAP_WIDTH, 3), dtype=np.uint8)
    canvas[:] = BG_COLOR
    
    # Draw Edges
    print("🎨 Drawing roads...")
    for u, v, data in G.edges(data=True):
        ux, uy = G.nodes[u]['x'], G.nodes[u]['y']
        vx, vy = G.nodes[v]['x'], G.nodes[v]['y']
        
        p1 = world_to_pixel(ux, uy)
        p2 = world_to_pixel(vx, vy)
        
        cv2.line(canvas, p1, p2, ROAD_COLOR, ROAD_THICKNESS, lineType=cv2.LINE_AA)

    # 4. Generate JSON Data
    print("📝 Building Graph JSON...")
    
    json_nodes = []
    node_lookup = {} # Fast lookup for edge creation
    
    for node_id, data in G.nodes(data=True):
        px, py = world_to_pixel(data['x'], data['y'])
        
        node_info = {
            "id": node_id,
            "x": px,
            "y": py,
            "lat": data.get('lat'),
            "lon": data.get('lon')
        }
        json_nodes.append(node_info)
        node_lookup[node_id] = node_info

    json_edges = []
    for u, v, data in G.edges(data=True):
        # Calculate pixel distance (Cost)
        if u in node_lookup and v in node_lookup:
            p1 = node_lookup[u]
            p2 = node_lookup[v]
            
            dist = np.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)
            
            json_edges.append({
                "from": u,
                "to": v,
                "cost": round(dist, 2)
            })

    # 5. Save Files
    img_path = os.path.join(OUTPUT_DIR, IMG_FILE)
    cv2.imwrite(img_path, canvas)
    
    json_path = os.path.join(OUTPUT_DIR, JSON_FILE)
    export_data = {"nodes": json_nodes, "edges": json_edges}
    
    with open(json_path, "w") as f:
        json.dump(export_data, f, indent=2)
        
    print("\n🎉 Done!")
    print(f"🖼️ Map Image: {img_path}")
    print(f"📄 Graph Data: {json_path}")

if __name__ == "__main__":
    generate_robust_map()