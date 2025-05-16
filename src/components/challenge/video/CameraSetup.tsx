'use client';

import React from 'react';
import type { CameraProps } from './types';

const CameraSetup: React.FC<CameraProps> = ({
  facingMode,
  videoRef,
  hasPermission,
  error,
  buttonState,
  setStream,
  setHasPermission,
  setError,
  setVideoReady,
  setFacingMode
}) => {
  const startCamera = async () => {
    try {
      console.log('🎥 Starting camera...');
      setError(null);
      setVideoReady(false);
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ Camera API not available');
        throw new Error('Camera API not available. Please use HTTPS or localhost.');
      }

      // Set camera constraints with explicit facingMode
      const constraints = {
        video: { 
          facingMode: facingMode 
        },
        audio: false
      };

      console.log('📹 Requesting camera permission with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera permission granted, stream obtained');
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        console.log('🔄 Attaching stream to video element');
        videoRef.current.srcObject = mediaStream;
        // videoReady will be set in the onLoadedData event
      }
    } catch (err: any) {
      console.error('❌ Error accessing camera:', err);
      let errorMessage = 'Unable to access camera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (!window.isSecureContext) {
        errorMessage = 'Camera requires HTTPS. Please use localhost for development.';
      }
      
      console.error('❌ Camera error details:', errorMessage);
      setError(errorMessage);
      setHasPermission(false);
    }
  };

  const stopCamera = (stream: MediaStream | null) => {
    console.log('🛑 Stopping camera and clearing resources');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`🛑 Stopping track: ${track.kind}`);
        track.stop();
      });
    }
    
    setVideoReady(false);
  };

  const requestPermission = async () => {
    console.log('🔐 Manually requesting camera permission');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      // Immediately stop the stream after getting permission
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ Permission granted manually');
      // Now start the camera normally
      startCamera();
    } catch (err) {
      console.error('❌ Manual permission request failed:', err);
      setError('Permission denied. Please allow camera access in your browser settings.');
    }
  };

  const switchCamera = () => {
    console.log('🔄 Switching camera facing mode');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-6 mt-6">
      {hasPermission ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedData={() => {
            console.log('📹 Video data loaded and ready');
            setVideoReady(true);
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <p className="text-white text-center mb-4">
            {error || 'Requesting camera access...'}
          </p>
          {error && (
            <button 
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Grant Camera Access
            </button>
          )}
        </div>
      )}
      
      {/* Camera Switch Button - Only show if we have permission and not in game */}
      {hasPermission && buttonState === 'idle' && (
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 21 7 17 3" />
            <path d="M21 7H15" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Export the component
export { CameraSetup };
export default CameraSetup;