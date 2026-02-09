import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        onClose();
      }
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-[80vh] mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Error message */}
        {error && (
          <div className="absolute top-4 left-4 right-16 z-10 p-3 bg-red-500 text-white rounded-lg">
            {error}
          </div>
        )}

        {/* Video preview */}
        <div className="relative w-full h-full flex items-center justify-center">
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Camera className="w-16 h-16 mb-4 animate-pulse" />
              <p className="text-lg">Starting camera...</p>
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Capture controls */}
        {isStreaming && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-[#00E5FF] text-black font-semibold rounded-full hover:bg-[#00B8E6] transition-colors flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Capture Location
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
