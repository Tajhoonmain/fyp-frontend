import React, { useRef, useEffect } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useNavigation } from '@/contexts/NavigationContext';

export function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentPosition, localizationMode } = useLocalization();
  const { currentDestination, isNavigating } = useNavigation();

  useEffect(() => {
    console.log('MapView component mounted');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a2332');
    gradient.addColorStop(1, '#0a0e14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw title
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 28px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🗺️ Campus Map View', canvas.width / 2, 60);

    // Draw subtitle
    ctx.fillStyle = '#00E5FF80';
    ctx.font = '16px IBM Plex Sans, sans-serif';
    ctx.fillText('Select a destination to begin navigation', canvas.width / 2, 90);

    // Try to load map image
    const mapImage = new Image();
    mapImage.onload = () => {
      console.log('Map image loaded successfully');
      
      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate map scaling to fit screen
      const scale = Math.min(
        canvas.width / mapImage.width,
        canvas.height / mapImage.height
      ) * 0.7;

      const mapWidth = mapImage.width * scale;
      const mapHeight = mapImage.height * scale;
      const mapX = (canvas.width - mapWidth) / 2;
      const mapY = (canvas.height - mapHeight) / 2 + 40;

      // Draw map with shadow
      ctx.shadowColor = 'rgba(0, 229, 255, 0.3)';
      ctx.shadowBlur = 20;
      ctx.drawImage(mapImage, mapX, mapY, mapWidth, mapHeight);
      ctx.shadowBlur = 0;

      // Draw current position
      if (currentPosition) {
        const mapX = (canvas.width - mapWidth) / 2 + (currentPosition.x / 1000) * mapWidth;
        const mapY = (canvas.height - mapHeight) / 2 + 40 + (currentPosition.y / 1000) * mapHeight;

        // Position glow
        ctx.beginPath();
        ctx.arc(mapX, mapY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.fill();

        // Position dot
        ctx.beginPath();
        ctx.arc(mapX, mapY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#00E5FF';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw direction arrow if navigating
        if (isNavigating && currentDestination) {
          const destX = (canvas.width - mapWidth) / 2 + (currentDestination.coordinate.x / 1000) * mapWidth;
          const destY = (canvas.height - mapHeight) / 2 + 40 + (currentDestination.coordinate.y / 1000) * mapHeight;

          // Calculate arrow direction
          const angle = Math.atan2(destY - mapY, destX - mapX);
          
          // Draw arrow
          ctx.save();
          ctx.translate(mapX, mapY);
          ctx.rotate(angle);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-20, -10);
          ctx.lineTo(-20, 10);
          ctx.closePath();
          
          ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.restore();

          // Draw destination
          ctx.beginPath();
          ctx.arc(destX, destY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = '#FF6B6B';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Draw localization mode indicator
      ctx.fillStyle = 'rgba(15, 25, 35, 0.9)';
      ctx.fillRect(10, 10, 180, 35);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 180, 35);
      
      ctx.fillStyle = '#00E5FF';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText(`Mode: ${localizationMode}`, 20, 32);
    };
    mapImage.onerror = () => {
      console.error('Failed to load map image');
      ctx.fillStyle = '#FF6B6B';
      ctx.fillText('Map image failed to load', canvas.width / 2, canvas.height / 2);
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
