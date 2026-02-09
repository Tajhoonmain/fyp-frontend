import React, { useRef, useEffect } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useNavigation } from '@/contexts/NavigationContext';

export function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentPosition, localizationMode } = useLocalization();
  const { currentDestination, isNavigating } = useNavigation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Load and draw campus map
    const mapImage = new Image();
    mapImage.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate map scaling to fit screen
      const scale = Math.min(
        canvas.width / mapImage.width,
        canvas.height / mapImage.height
      ) * 0.9;

      const mapWidth = mapImage.width * scale;
      const mapHeight = mapImage.height * scale;
      const mapX = (canvas.width - mapWidth) / 2;
      const mapY = (canvas.height - mapHeight) / 2;

      // Draw map
      ctx.drawImage(mapImage, mapX, mapY, mapWidth, mapHeight);

      // Draw current position
      if (currentPosition) {
        // Convert local coordinates to map coordinates
        const mapX = (canvas.width - mapWidth) / 2 + (currentPosition.x / 1000) * mapWidth;
        const mapY = (canvas.height - mapHeight) / 2 + (currentPosition.y / 1000) * mapHeight;

        // Draw position dot
        ctx.beginPath();
        ctx.arc(mapX, mapY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#00E5FF';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw direction arrow if navigating
        if (isNavigating && currentDestination) {
          const destX = (canvas.width - mapWidth) / 2 + (currentDestination.coordinate.x / 1000) * mapWidth;
          const destY = (canvas.height - mapHeight) / 2 + (currentDestination.coordinate.y / 1000) * mapHeight;

          // Calculate arrow direction
          const angle = Math.atan2(destY - mapY, destX - mapX);
          
          // Draw arrow
          ctx.save();
          ctx.translate(mapX, mapY);
          ctx.rotate(angle);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-15, -8);
          ctx.lineTo(-15, 8);
          ctx.closePath();
          
          ctx.fillStyle = '#00FF88';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.restore();

          // Draw destination
          ctx.beginPath();
          ctx.arc(destX, destY, 10, 0, 2 * Math.PI);
          ctx.fillStyle = '#FF6B6B';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw localization mode indicator
      ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
      ctx.fillRect(10, 10, 150, 30);
      ctx.fillStyle = '#000000';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText(`Mode: ${localizationMode}`, 20, 30);
    };

    mapImage.src = '/maps/campus_map.png';
  }, [currentPosition, localizationMode, currentDestination, isNavigating]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0e14' }}
    />
  );
}
