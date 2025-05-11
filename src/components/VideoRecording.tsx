'use client';

import React, { useState, useRef, useEffect } from 'react';
import ThematicContainer from './ThematicContainer';

interface VideoRecordingProps {
  onComplete: (videoBlob: Blob) => void;
  maxDuration?: number; // in seconds
  challengeTitle?: string; // Add this prop to display the challenge title
}

const VideoRecording: React.FC<VideoRecordingProps> = ({
  onComplete,
  maxDuration = 30,
  challengeTitle,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(maxDuration);
  const [buttonState, setButtonState] = useState<'idle' | 'countdown' | 'recording'>('idle');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop camera when component unmounts
      stopCamera();
      // Also stop recording if it's still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      // Clear intervals
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available. Please use HTTPS or localhost.');
      }

      // For development/testing, let's try without specific constraints first
      const constraints = {
        video: true,
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
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
      
      setError(errorMessage);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Add a manual permission request button
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      // Immediately stop the stream after getting permission
      stream.getTracks().forEach(track => track.stop());
      // Now start the camera normally
      startCamera();
    } catch (err) {
      console.error('Permission request failed:', err);
      setError('Permission denied. Please allow camera access in your browser settings.');
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Camera will restart automatically due to useEffect
  };

  const startCountdown = () => {
    setButtonState('countdown');
    setCountdown(3);
    
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval.current!);
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!stream) return;

    // Clear any existing interval before starting a new one
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    setButtonState('recording');
    setCountdown(null);
    setRecordingTime(maxDuration);

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      stopCamera(); // Stop camera when recording completes
      onComplete(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Start recording timer
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev <= 1) {
          clearInterval(recordingInterval.current!);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setButtonState('idle');
      // Stop the camera after recording
      stopCamera();
    }
  };

  const handleButtonClick = () => {
    if (buttonState === 'idle') {
      startCountdown();
    } else if (buttonState === 'recording') {
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Challenge Title */}
      {challengeTitle && (
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-1">Completing</h2>
          <p className="text-lg text-gray-300 font-thin">{challengeTitle} challenge</p>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-6 mt-6">
        {hasPermission ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <p className="text-white text-center mb-4">
              {error || 'Requesting camera access...'}
            </p>
          </div>
        )}
        
        {/* Camera Switch Button - Only show if we have permission */}
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

        {/* Recording Timer */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-lg font-bold bg-black/50 px-3 py-1 rounded">
              {recordingTime}s
            </span>
          </div>
        )}

        {/* Countdown Display */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-white text-8xl font-bold animate-ping">
              {countdown}
            </div>
          </div>
        )}
      </div>

      {/* Recording Button */}
      <div className="flex justify-center">
        <button
          onClick={handleButtonClick}
          disabled={!hasPermission || buttonState === 'countdown'}
          className={`relative w-20 h-20 rounded-full border-4 ${
            buttonState === 'recording' 
              ? 'border-nocenaPink' 
              : 'border-white'
          } transition-all duration-200 ${
            !hasPermission ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className={`absolute inset-0 m-auto transition-all duration-200 ${
            buttonState === 'idle' ? 'w-12 h-12 rounded-full bg-gray-500' :
            buttonState === 'recording' ? 'w-8 h-8 rounded-sm bg-nocenaPink' :
            'w-12 h-12 rounded-full bg-gray-500'
          }`} />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-400 mt-4 text-center">
        {!hasPermission 
          ? 'Please grant camera access to continue'
          : buttonState === 'idle'
            ? 'Press the button to start recording'
            : buttonState === 'countdown'
              ? 'Get ready...'
              : `Recording... ${recordingTime}s remaining`}
      </p>
    </div>
  );
};

export default VideoRecording;