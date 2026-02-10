# routes/navigate.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from Navigation.Maps_campus import CampusNavigator
from pathlib import Path
import json

router = APIRouter()

GRAPH_PATH = Path("maps/campus_graph.json")

# Load campus navigator
nav = CampusNavigator(str(GRAPH_PATH))

# Map building names to nodes (use same as LOCATIONS in Maps_campus)
LOCATIONS = nav.nodes  # Or define a subset mapping building names to node IDs

@router.post("/navigate")
async def navigate(start_node: str, destination_node: str):
    # Validate nodes
    if start_node not in nav.nodes or destination_node not in nav.nodes:
        return JSONResponse(
            status_code=404,
            content={"error": "Invalid start or destination node"}
        )

    # Get path
    path, status = nav.get_path(start_node, destination_node)
    if path is None:
        return JSONResponse(
            status_code=404,
            content={"error": status}
        )

    # Generate instructions
    instructions = nav.get_readable_instructions(path)

    return {
        "path": path,
        "instructions": instructions
    }
