from fastapi import APIRouter, UploadFile, File
from typing import Optional
import shutil
import os
from pathlib import Path

# Import your building localizers
from Localization.Admin.LC_Admin import localize_admin
from Localization.Library.LC_Lib import localize_library

router = APIRouter()

# Temporary upload folder
UPLOAD_DIR = Path(r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Map building types to functions
LOCALIZERS = {
    "admin": localize_admin,
    "library": localize_library,
}

@router.post("/localize/")
async def localize_building(building: str, image: UploadFile = File(...)):
    """
    Receives a building name and image, returns 2D campus coordinates
    """
    building = building.lower()

    if building not in LOCALIZERS:
        return {"success": False, "reason": f"Unknown building '{building}'"}

    # Save uploaded image to disk
    img_path = UPLOAD_DIR / image.filename
    with open(img_path, "wb") as f:
        shutil.copyfileobj(image.file, f)

    # Call the corresponding localization function
    result = LOCALIZERS[building](str(img_path))

    # Optional: delete the temp file after processing
    try:
        os.remove(img_path)
    except:
        pass

    return result
