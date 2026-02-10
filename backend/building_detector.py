"""
building_detector.py
---------------------------------
Offline building recognition using ORB descriptor matching
Chooses which building localizer to run
"""

import cv2
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# -------------------------------------------------
# Load descriptor banks (LIGHTWEIGHT)
# -------------------------------------------------

BUILDINGS = {
    "library": {
        "descriptors": np.load(
            BASE_DIR / "localization" / "Library" / "descriptors_3d.npy"
        )
    },
    "admin": {
        "descriptors": np.load(
            BASE_DIR / "localization" / "Admin" / "descriptors_3d.npy"
        )
    }
}

# -------------------------------------------------
# ORB extractor
# -------------------------------------------------

orb = cv2.ORB_create(nfeatures=3000)
matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)


def detect_building(image_path: str) -> str | None:
    """
    Returns:
        building name or None
    """

    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return None

    kp, des = orb.detectAndCompute(img, None)
    if des is None:
        return None

    best_building = None
    best_score = 0

    for name, data in BUILDINGS.items():
        matches = matcher.match(des, data["descriptors"])

        good_matches = [m for m in matches if m.distance < 50]

        score = len(good_matches)

        if score > best_score:
            best_score = score
            best_building = name

    # Minimum confidence threshold
    if best_score < 40:
        return None

    return best_building
