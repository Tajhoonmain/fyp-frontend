import osmnx as ox
import matplotlib.pyplot as plt
import os

# ================= CONFIGURATION =================
# Path to your .osm file
OSM_FILE = r"C:\Users\r_haq\Downloads\map.osm"

# Output path
OUTPUT_DIR = r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\maps"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "giki_map_fixed.png")

# Colors
BG_COLOR = "black"
BUILDING_COLOR = "#404040"  # Dark Gray
ROAD_COLOR = "#E0E0E0"      # Light Gray (High Contrast)

# ================= PROCESSING =================
def generate_map():
    print("📂 Loading OSM data...")

    # 1. Load Road Network (Graph)
    # logic to handle potential osmnx version differences
    try:
        G = ox.graph_from_xml(OSM_FILE, simplify=True)
    except AttributeError:
        # Fallback for newer osmnx versions if graph_from_xml is moved
        print("⚠️ 'graph_from_xml' not found, trying raw load...")
        # (This is rare, usually graph_from_xml works for local files)
        return

    print(f"✅ Loaded Graph: {len(G.nodes)} nodes, {len(G.edges)} edges")

    # 2. Project Graph to 2D (Meters)
    # This is critical for looking like a real flat map
    G = ox.project_graph(G)

    # 3. Load Buildings (Geometries/Features)
    try:
        # New OSMnx API (v1.5+)
        buildings = ox.features_from_xml(OSM_FILE, tags={"building": True})
    except AttributeError:
        # Old OSMnx API (v1.0-1.4)
        print("⚠️ Using legacy geometry loader...")
        buildings = ox.geometries_from_xml(OSM_FILE, tags={"building": True})

    print(f"✅ Loaded Buildings: {len(buildings)} found")

    # 4. Project Buildings to match the Graph
    if not buildings.empty:
        buildings = buildings.to_crs(G.graph['crs'])

    # ================= PLOTTING =================
    print("🎨 Plotting map...")
    
    # Create figure
    fig, ax = plt.subplots(figsize=(15, 15), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    # A. Plot Buildings (Layer 0)
    if not buildings.empty:
        buildings.plot(ax=ax, facecolor=BUILDING_COLOR, edgecolor="none", alpha=1.0)

    # B. Plot Roads (Layer 1)
    # We use osmnx's native plotter for best results
    ox.plot_graph(
        G, 
        ax=ax, 
        node_size=0, 
        edge_color=ROAD_COLOR, 
        edge_linewidth=1.5, 
        edge_alpha=1.0,
        show=False, 
        close=False,
        bgcolor=BG_COLOR
    )

    # C. Formatting
    ax.set_axis_off()
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Save
    plt.savefig(OUTPUT_FILE, dpi=300, bbox_inches='tight', pad_inches=0, facecolor=BG_COLOR)
    plt.close()
    
    print("\n🎉 Success! Map saved to:")
    print(OUTPUT_FILE)

if __name__ == "__main__":
    generate_map()