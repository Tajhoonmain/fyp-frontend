import React, { useRef, useEffect } from 'react';

export function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('MapView component mounted');
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw simple background for testing
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw test text
    ctx.fillStyle = '#00E5FF';
    ctx.font = '24px Arial';
    ctx.fillText('Map View - Testing', 50, 50);

    // Try to load map image
    const mapImage = new Image();
    mapImage.onload = () => {
      console.log('Map image loaded successfully');
      ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    };
    mapImage.onerror = () => {
      console.error('Failed to load map image');
      ctx.fillStyle = '#FF6B6B';
      ctx.fillText('Map image failed to load', 50, 100);
    };
    mapImage.src = '/maps/campus_map.png';
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#0a0e14' }}
    />
  );
}
