"""
Building Detector - Determines which building localizer to use
Routes image to appropriate CV localization module
"""

import sys
import os
from typing import Dict, Optional, Any

# Add Library to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'Library'))

try:
    from LC_Lib import localize_library
except ImportError as e:
    print(f"Warning: Could not import LC_Lib: {e}")
    localize_library = None

class BuildingDetector:
    """
    Detects which building the user is in and routes to appropriate localizer
    """
    
    def __init__(self):
        """Initialize building detector with available localizers"""
        self.available_localizers = {
            'Library': localize_library if localize_library else None,
            # Add more building localizers here as you create them:
            # 'Admin': localize_admin if localize_admin else None,
            # 'FME': localize_fme if localize_fme else None,
            # 'FCSE': localize_fcse if localize_fcse else None,
        }
        
        print(f"Available localizers: {list(self.available_localizers.keys())}")
    
    def detect_and_localize(self, image_data: str) -> Dict[str, Any]:
        """
        Main function that detects building and localizes user position
        
        Args:
            image_data: Base64 encoded image string
            
        Returns:
            Dictionary with localization results
        """
        
        # For now, we'll try Library first (you can expand this logic)
        # In a full implementation, you'd use a building classifier first
        
        result = self._try_library_localization(image_data)
        
        if result and result.get('success', False):
            return self._format_result('Library', result)
        
        # Fallback to default location
        return self._fallback_result()
    
    def _try_library_localization(self, image_data: str) -> Optional[Dict]:
        """Try Library localization"""
        if not self.available_localizers.get('Library'):
            print("Library localizer not available")
            return None
        
        try:
            # Convert base64 to temporary image file
            import base64
            import cv2
            import numpy as np
            
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            img_data = base64.b64decode(image_data)
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Save temporary image
            temp_path = "temp_library_image.jpg"
            cv2.imwrite(temp_path, img)
            
            # Use Library localizer
            result = localize_library(temp_path)
            
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return result
            
        except Exception as e:
            print(f"Library localization error: {e}")
            return None
    
    def _format_result(self, building: str, localization_result: Dict) -> Dict[str, Any]:
        """Format successful localization result"""
        return {
            'success': True,
            'building': building,
            'node_id': localization_result.get('node_id', 'N64'),
            'x': float(localization_result.get('map_x', 1240)),
            'y': float(localization_result.get('map_y', 780)),
            'confidence': float(localization_result.get('confidence', 0.8)),
            'localization_method': f'{building}_CV'
        }
    
    def _fallback_result(self) -> Dict[str, Any]:
        """Return fallback result when localization fails"""
        return {
            'success': False,
            'building': 'Unknown',
            'node_id': None,
            'x': 1200.0,  # Campus entrance
            'y': 200.0,
            'confidence': 0.0,
            'localization_method': 'fallback'
        }
    
    def get_available_buildings(self) -> list:
        """Get list of available building localizers"""
        return [name for name, localizer in self.available_localizers.items() if localizer is not None]

# Global instance for easy access
detector = BuildingDetector()

def detect_building_and_localize(image_data: str) -> Dict[str, Any]:
    """
    Convenience function for building detection and localization
    
    Args:
        image_data: Base64 encoded image string
        
    Returns:
        Dictionary with localization results
    """
    return detector.detect_and_localize(image_data)

if __name__ == "__main__":
    # Test the building detector
    print("Building Detector Test")
    print(f"Available buildings: {detector.get_available_buildings()}")
    print("Ready to detect and localize!")
