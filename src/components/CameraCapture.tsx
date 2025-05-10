'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  facingMode?: 'user' | 'environment';
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onCancel,
  facingMode = 'user',
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  const startCapture = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          capture();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: facingMode,
  };

  return (
    <div className="relative flex-1 flex flex-col">
      <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
        />
        
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-6xl font-bold text-white animate-ping">
              {countdown}
            </span>w
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
        >
          Cancel
        </button>
        <button
          onClick={startCapture}
          disabled={countdown !== null}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium"
        >
          {countdown !== null ? 'Capturing...' : 'Capture'}
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;