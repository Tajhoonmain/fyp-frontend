import json
import os
from typing import List, Dict, Optional, Tuple

class Maps_campus:
    """Campus navigation system using graph-based pathfinding"""
    
    def __init__(self):
        """Initialize campus navigator with graph data"""
        self.graph = self._load_campus_graph()
        self.nodes = {node['id']: node for node in self.graph['nodes']}
        self.edges = self.graph['edges']
        
    def _load_campus_graph(self) -> Dict:
        """Load campus graph from JSON file"""
        graph_path = os.path.join(os.path.dirname(__file__), 'giki_graph.json')
        
        try:
            with open(graph_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Campus graph file not found at {graph_path}")
            return {"nodes": [], "edges": []}
        except json.JSONDecodeError as e:
            print(f"Error parsing campus graph: {e}")
            return {"nodes": [], "edges": []}
    
    def find_path(self, start_node: str, end_node: str) -> List[str]:
        """
        Find shortest path between two nodes using A* algorithm
        Returns list of node IDs representing the path
        """
        
        if start_node not in self.nodes or end_node not in self.nodes:
            print(f"Warning: Node {start_node} or {end_node} not found in graph")
            return []
        
        # Convert to A* algorithm (simplified version)
        path = self._astar_search(start_node, end_node)
        
        if path:
            print(f"Path found: {' -> '.join(path)}")
        else:
            print(f"No path found between {start_node} and {end_node}")
            
        return path
    
    def _astar_search(self, start: str, goal: str) -> List[str]:
        """
        Simplified A* pathfinding algorithm
        """
        
        # For now, use simple BFS (you can upgrade to A* later)
        return self._bfs_search(start, goal)
    
    def _bfs_search(self, start: str, goal: str) -> List[str]:
        """
        Breadth-First Search for pathfinding
        """
        
        from collections import deque
        
        queue = deque([(start, [start])])
        visited = {start}
        
        while queue:
            current, path = queue.popleft()
            
            if current == goal:
                return path
            
            # Get neighbors of current node
            neighbors = self._get_neighbors(current)
            
            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        
        return []
    
    def _get_neighbors(self, node_id: str) -> List[str]:
        """
        Get all neighboring nodes for a given node
        """
        neighbors = []
        
        for edge in self.edges:
            if edge['from'] == node_id:
                neighbors.append(edge['to'])
            elif edge['to'] == node_id:
                neighbors.append(edge['from'])
        
        return neighbors
    
    def calculate_path_distance(self, path: List[str]) -> float:
        """
        Calculate total distance of a path
        """
        if not path or len(path) < 2:
            return 0.0
        
        total_distance = 0.0
        
        for i in range(len(path) - 1):
            current_node = path[i]
            next_node = path[i + 1]
            
            # Find edge between current and next
            for edge in self.edges:
                if (edge['from'] == current_node and edge['to'] == next_node) or \
                   (edge['to'] == current_node and edge['from'] == next_node):
                    total_distance += edge.get('distance', 15.0)  # Default 15m per edge
                    break
        
        return total_distance
    
    def get_node_info(self, node_id: str) -> Optional[Dict]:
        """Get information about a specific node"""
        return self.nodes.get(node_id)
    
    def get_all_nodes(self) -> List[Dict]:
        """Get all nodes in the graph"""
        return list(self.nodes.values())
    
    def health_check(self) -> Dict:
        """Health check for the navigation system"""
        return {
            "status": "healthy",
            "nodes_loaded": len(self.nodes),
            "edges_loaded": len(self.edges),
            "graph_loaded": bool(self.graph)
        }
