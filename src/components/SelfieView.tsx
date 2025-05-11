import React, { useRef, useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';

interface SelfieViewProps {
  onStatusChange?: (status: string) => void;
  onMediaCapture: (media: {
    type: 'selfie';
    file: File;
    isFrontCamera: boolean;
  }) => void;
  onError?: () => void;
}

const SelfieView: React.FC<SelfieViewProps> = ({ onStatusChange, onMediaCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [hasCapture, setHasCapture] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      onStatusChange?.('📸 PREPARING CAMERA...');
      
      // Always use front camera for selfies
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreamReady(true);
          onStatusChange?.('📸 TAKE YOUR SELFIE');
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
      onStatusChange?.('❌ CAMERA ERROR');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreamReady(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    onStatusChange?.('📸 CAPTURING...');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImageData(imageData);
    setHasCapture(true);
    
    stopCamera();
    onStatusChange?.('✅ SELFIE CAPTURED');

    // Convert dataURL to File and notify parent
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onMediaCapture({
            type: 'selfie',
            file,
            isFrontCamera: true
          });
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const retakeSelfie = () => {
    setHasCapture(false);
    setCapturedImageData(null);
    setError(null);
    startCamera();
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="bg-red-900/50 text-white p-6 rounded-lg text-center max-w-sm">
          <h3 className="text-lg font-bold mb-2">Camera Error</h3>
          <p className="mb-4">{error}</p>
          <PrimaryButton 
            text="Return"
            onClick={onError}
          />
        </div>
      </div>
    );
  }

  if (hasCapture && capturedImageData) {
    return (
      <div className="h-full flex flex-col items-center justify-between">
        {/* Header text */}
        <div className="text-center mb-4 px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Identity Verification</h2>
          <p className="text-sm text-gray-300">Review your selfie below</p>
        </div>

        {/* Image preview - fullscreen on mobile, constrained on desktop */}
        <div className="flex-1 flex items-center justify-center w-full md:p-4">
          <img 
            src={capturedImageData} 
            alt="Captured selfie" 
            className="w-full h-full md:max-w-md md:max-h-[calc(100vh-300px)] object-contain md:rounded-lg md:shadow-2xl"
          />
        </div>
        {/* Button - fixed at bottom on mobile */}
        <div className="w-full p-4 md:max-w-md">
          <PrimaryButton 
            text="RETAKE SELFIE"
            onClick={retakeSelfie} 
            className="w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-between">
      {/* Header text */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">Identity selfie</h2>
        <p className="text-lg text-gray-400 font-thin">
          This helps us confirm you're a real person
        </p>
      </div>

      {/* Camera view - fullscreen on mobile, constrained on desktop */}
      <div className="flex-1 relative w-full md:max-w-md md:aspect-[3/4]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover md:rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Selfie guide overlay - only visible when stream is ready */}
        {isStreamReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 md:w-64 md:h-64 border-4 border-white rounded-full shadow-2xl">
              <div className="w-full h-full rounded-full border-2 border-white/20" />
            </div>
          </div>
        )}

        {/* Tips overlay */}
        {isStreamReady && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-sm mx-auto">
              <p className="text-xs text-white text-center font-thin">
                💡 Tip: Face the camera directly and ensure good lighting
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Capture button - fixed at bottom on mobile */}
      <div className="w-full p-4 md:max-w-md">
        <PrimaryButton 
          text={isStreamReady ? 'CAPTURE SELFIE' : 'PREPARING CAMERA...'}
          onClick={capturePhoto} 
          disabled={!isStreamReady}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SelfieView;