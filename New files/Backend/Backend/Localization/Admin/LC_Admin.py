"""
LC_Admin.py
---------------------------------
Admin Building localization module
Uses:
- ORB feature matching
- 2D–3D correspondences
- PnP for camera pose
- Pre-aligned Admin → Campus transform

Called by backend API
"""

import cv2
import json
import numpy as np
from pathlib import Path

# =========================================================
# PATH SETUP (matches YOUR project structure)
# =========================================================

THIS_DIR = Path(__file__).resolve().parent  # Backend/Localization/Admin

# 3D feature bank (Admin building only)
KEYPOINTS_3D_PATH = THIS_DIR / "keypoints_3d.npy"
DESCRIPTORS_3D_PATH = THIS_DIR / "descriptors_3d.npy"

# Alignment data: Admin → Campus map
TRANSFORM_PATH = Path(
    r"C:\WOLF\Private\VS_CODE\FYP_TEST\TEST_Hybrid\3D_construction\output_Admin\transform_admin.json"
)

# =========================================================
# CAMERA INTRINSICS (TEMP — replace with real calibration)
# =========================================================
CAMERA_MATRIX = np.array([
    [1200, 0, 640],
    [0, 1200, 360],
    [0, 0, 1]
], dtype=np.float32)

DIST_COEFFS = np.zeros((4, 1))

# =========================================================
# LOAD STATIC DATA (ONCE)
# =========================================================
points_3d = np.load(KEYPOINTS_3D_PATH)        # (N, 3)
descriptors_3d = np.load(DESCRIPTORS_3D_PATH) # (N, 32) ORB

# Load Admin → Campus transform
with open(TRANSFORM_PATH, "r") as f:
    T = json.load(f)

# 2×3 affine transform
transform_matrix = np.array(T["transform_matrix"], dtype=np.float32)

# =========================================================
# CORE LOCALIZATION FUNCTION
# =========================================================

def localize_admin(image_path: str) -> dict:
    """
    Localizes user standing OUTSIDE Admin building

    Input:
        image_path (str) - image from AR frontend

    Output:
        dict with campus map coordinates
    """

    # -----------------------------
    # 1. Load image
    # -----------------------------
    img = cv2.imread(image_path)
    if img is None:
        return {"success": False, "reason": "Image not readable"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # -----------------------------
    # 2. Extract 2D features
    # -----------------------------
    orb = cv2.ORB_create(nfeatures=4000)
    kp2d, des2d = orb.detectAndCompute(gray, None)

    if des2d is None or len(kp2d) < 30:
        return {"success": False, "reason": "Insufficient features"}

    # -----------------------------
    # 3. Match with 3D descriptors
    # -----------------------------
    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = matcher.match(des2d, descriptors_3d)

    if len(matches) < 25:
        return {"success": False, "reason": "Not enough matches"}

    matches = sorted(matches, key=lambda x: x.distance)[:200]

    # -----------------------------
    # 4. Build 2D–3D correspondences
    # -----------------------------
    pts_2d, pts_3d = [], []

    for m in matches:
        pts_2d.append(kp2d[m.queryIdx].pt)
        pts_3d.append(points_3d[m.trainIdx])

    pts_2d = np.asarray(pts_2d, np.float32)
    pts_3d = np.asarray(pts_3d, np.float32)

    # ----------------------------- 
    # 5. Solve PnP (Camera pose)
    # -----------------------------
    ok, rvec, tvec, inliers = cv2.solvePnPRansac(
        pts_3d,
        pts_2d,
        CAMERA_MATRIX,
        DIST_COEFFS,
        reprojectionError=8.0,
        confidence=0.99,
        iterationsCount=100
    )

    if not ok or inliers is None or len(inliers) < 15:
        return {"success": False, "reason": "PnP failed"}

    # -----------------------------
    # 6. Camera position in Admin frame
    # -----------------------------
    R_cam, _ = cv2.Rodrigues(rvec)
    cam_pos = -R_cam.T @ tvec
    cam_pos = cam_pos.flatten()

    # Ground plane assumption
    x_admin = cam_pos[0]
    z_admin = cam_pos[2]

    # -----------------------------
    # 7. Transform → Campus map
    # -----------------------------
    pt_admin_h = np.array([x_admin, z_admin, 1.0], dtype=np.float32)
    cam_map = transform_matrix @ pt_admin_h

    # -----------------------------
    # 8. Confidence score
    # -----------------------------
    confidence = min(1.0, len(inliers) / 120)

    return {
        "success": True,
        "building": "Admin",
        "map_x": float(cam_map[0]),
        "map_y": float(cam_map[1]),
        "confidence": float(confidence)
    }
