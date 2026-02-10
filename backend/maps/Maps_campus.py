import json
import math
import heapq
import matplotlib.pyplot as plt

# =========================
# 1. CONFIGURATION
# =========================
GRAPH_PATH = r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\maps\campus_graph.json"
IMG_PATH = r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\maps\giki_map_fixed.png"

# ✅ YOUR GROUND TRUTH
LOCATIONS = {
    "Admin": "N55",
    "FCSE": "N58",
    "FBS": "N60",
    "ACB": "N62",
    "Library": "N64",
    "Materials": "N66",
    "Mechanical": "N67",
    "Brabers": "N69",
    # Add your Main Gate ID here once you have it
    # "Main Gate": "N194" 
}

# =========================
# 2. THE PATHFINDER (A*)
# =========================
class CampusNavigator:
    def __init__(self, graph_file):
        with open(graph_file, 'r') as f:
            self.data = json.load(f)
        
        self.nodes = self.data["nodes"]
        self.adj = {nid: [] for nid in self.nodes}
        
        # Build adjacency list
        for u, v in self.data["edges"]:
            if u in self.nodes and v in self.nodes:
                dist = self._dist(u, v)
                self.adj[u].append((v, dist))
                self.adj[v].append((u, dist))

    def _dist(self, n1, n2):
        x1, y1 = self.nodes[n1]
        x2, y2 = self.nodes[n2]
        return math.hypot(x2 - x1, y2 - y1)

    def get_path(self, start_id, goal_id):
        if start_id not in self.nodes or goal_id not in self.nodes:
            return None, "Invalid Start or Goal Node ID"

        pq = [(0, start_id)]
        came_from = {}
        cost_so_far = {start_id: 0}

        while pq:
            _, current = heapq.heappop(pq)

            if current == goal_id:
                return self._reconstruct_path(came_from, current), "Success"

            for neighbor, weight in self.adj[current]:
                new_cost = cost_so_far[current] + weight
                if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                    cost_so_far[neighbor] = new_cost
                    priority = new_cost + self._dist(neighbor, goal_id)
                    heapq.heappush(pq, (priority, neighbor))
                    came_from[neighbor] = current
        
        return None, "No path found (Graph might be disconnected)"

    def _reconstruct_path(self, came_from, current):
        path = [current]
        while current in came_from:
            current = came_from[current]
            path.append(current)
        path.reverse()
        return path

    # --- NEW: DIRECTION LOGIC ---
    def get_turn_direction(self, p_prev, p_curr, p_next):
        # 1. Get coordinates
        x1, y1 = self.nodes[p_prev]
        x2, y2 = self.nodes[p_curr]
        x3, y3 = self.nodes[p_next]

        # 2. Calculate vectors
        # Vector 1: Prev -> Curr
        dx1, dy1 = x2 - x1, y2 - y1
        # Vector 2: Curr -> Next
        dx2, dy2 = x3 - x2, y3 - y2

        # 3. Calculate angles (in degrees)
        angle1 = math.degrees(math.atan2(dy1, dx1))
        angle2 = math.degrees(math.atan2(dy2, dx2))

        # 4. Calculate difference (Change in heading)
        diff = angle2 - angle1
        
        # Normalize to [-180, 180]
        while diff <= -180: diff += 360
        while diff > 180: diff -= 360

        # 5. Determine Turn (Threshold = 25 degrees)
        # Note: In Image Coords (Y-down), Negative Diff is LEFT, Positive is RIGHT
        if -25 < diff < 25:
            return "Straight"
        elif diff <= -25:
            return "Turn LEFT"
        else:
            return "Turn RIGHT"

    def get_readable_instructions(self, path):
        if not path or len(path) < 2:
            return ["You are already there."]
        
        instructions = []
        total_dist = 0
        
        # First Step (Always "Head towards...")
        first_dist = self._dist(path[0], path[1]) * 0.5 # Scale: 1px = 0.5m
        instructions.append(f"• Start at {path[0]}, head towards {path[1]} ({int(first_dist)}m)")
        total_dist += first_dist

        # Subsequent Steps (Check turns)
        for i in range(1, len(path) - 1):
            prev = path[i-1]
            curr = path[i]
            nxt = path[i+1]
            
            dist = self._dist(curr, nxt) * 0.5
            total_dist += dist
            
            turn = self.get_turn_direction(prev, curr, nxt)
            
            if turn == "Straight":
                instructions.append(f"• Continue straight to {nxt} ({int(dist)}m)")
            else:
                instructions.append(f"• {turn} towards {nxt} ({int(dist)}m)")
            
        instructions.append(f"🏁 Arrived! Total Distance: {int(total_dist)}m")
        return instructions

# =========================
# 3. VISUALIZATION
# =========================
def visualize_path(nav, path, start_name, end_name):
    img = plt.imread(IMG_PATH)
    plt.figure(figsize=(12, 8))
    plt.imshow(img, cmap='gray')
    
    # Plot edges
    for u, neighbors in nav.adj.items():
        for v, _ in neighbors:
            x1, y1 = nav.nodes[u]
            x2, y2 = nav.nodes[v]
            plt.plot([x1, x2], [y1, y2], 'cyan', alpha=0.3, linewidth=1)

    # Plot path
    if path:
        path_x = [nav.nodes[n][0] for n in path]
        path_y = [nav.nodes[n][1] for n in path]
        plt.plot(path_x, path_y, 'r-', linewidth=3, label='Route')
        plt.scatter(path_x, path_y, c='yellow', s=30, zorder=5)
        
        plt.text(path_x[0], path_y[0], start_name, color='lime', fontsize=12, fontweight='bold', bbox=dict(facecolor='black', alpha=0.7))
        plt.text(path_x[-1], path_y[-1], end_name, color='red', fontsize=12, fontweight='bold', bbox=dict(facecolor='black', alpha=0.7))

    plt.title(f"Navigation: {start_name} -> {end_name}")
    plt.axis('off')
    plt.legend()
    plt.show()

# =========================
# 4. MAIN INTERFACE
# =========================
if __name__ == "__main__":
    nav = CampusNavigator(GRAPH_PATH)
    
    print("\n📍 AVAILABLE LOCATIONS:")
    print(", ".join(LOCATIONS.keys()))
    print("-" * 30)

    start_name = input("Enter Start Location: ").strip()
    end_name = input("Enter Destination: ").strip()

    start_id = LOCATIONS.get(start_name, start_name)
    end_id = LOCATIONS.get(end_name, end_name)

    if start_id in nav.nodes and end_id in nav.nodes:
        print(f"\n🚀 Calculating route from {start_name} ({start_id}) to {end_name} ({end_id})...")
        path, status = nav.get_path(start_id, end_id)
        
        if path:
            print("\n📋 NAVIGATION INSTRUCTIONS:")
            for step in nav.get_readable_instructions(path):
                print(step)
            visualize_path(nav, path, start_name, end_name)
        else:
            print(f"❌ Error: {status}")
    else:
        print("❌ Unknown location name.")