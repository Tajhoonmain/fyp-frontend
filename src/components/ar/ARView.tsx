import React, { useEffect, useRef, useState } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useNavigation } from '@/contexts/NavigationContext';

export function ARView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentPosition } = useLocalization();
  const { currentDestination, isNavigating, hasArrived } = useNavigation();
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawFrame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw camera feed if active
      if (cameraActive && video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback to gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a2332');
        gradient.addColorStop(0.5, '#0f1923');
        gradient.addColorStop(1, '#0a0e14');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw navigation arrows if navigating and not arrived
      if (isNavigating && currentDestination && !hasArrived && currentPosition) {
        drawNavigationArrows(ctx, canvas, currentPosition, currentDestination.coordinate);
      }

      // Draw "Arrived" message if at destination
      if (hasArrived) {
        drawArrivedMessage(ctx, canvas);
      }

      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }, [cameraActive, currentPosition, currentDestination, isNavigating, hasArrived]);

  const drawNavigationArrows = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentPos: { x: number; y: number },
    destination: { x: number; y: number }
  ) => {
    // Calculate direction to destination
    const dx = destination.x - currentPos.x;
    const dy = destination.y - currentPos.y;
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Center of screen for arrow
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw directional arrow
    ctx.save();
    ctx.translate(centerX, centerY - 100); // Position arrow above center
    ctx.rotate(angle);

    // Arrow glow effect
    ctx.shadowColor = '#00FF88';
    ctx.shadowBlur = 20;

    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.lineTo(-20, 20);
    ctx.lineTo(-10, 15);
    ctx.lineTo(-10, 30);
    ctx.lineTo(10, 30);
    ctx.lineTo(10, 15);
    ctx.lineTo(20, 20);
    ctx.closePath();

    ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // Draw distance indicator
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(distance)}m to destination`, centerX, centerY + 50);
  };

  const drawArrivedMessage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw glowing background
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 30;

    ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.fillRect(centerX - 150, centerY - 50, 300, 100);

    // Draw text
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Arrived', centerX, centerY);

    ctx.shadowBlur = 0;
  };

  return (
    <div className="relative w-full h-full">
      {/* Hidden video element for camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />
      
      {/* Canvas for AR overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
