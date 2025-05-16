'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ThematicContainer from '../../ui/ThematicContainer';
import CameraSetup from './CameraSetup';
import EmotionDetector from './EmotionDetector';
import GameUI from './GameUI';
import { loadFaceApiModels, formatEmotion, getEmotionEmoji } from '../../../lib/faceVerification';
import type { ButtonState, FacingMode } from './types';

interface VideoRecordingProps {
  onComplete: (videoBlob: Blob) => void;
  maxDuration?: number; // in seconds
  challengeTitle?: string; // Add this prop to display the challenge title
}

const TOTAL_EMOTIONS_TO_MATCH = 10;

const VideoRecording: React.FC<VideoRecordingProps> = ({
  onComplete,
  maxDuration = 10,
  challengeTitle,
}) => {
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  
  // UI state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(maxDuration);
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  
  // Face detection state
  const [dominantEmotion, setDominantEmotion] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [targetEmotion, setTargetEmotion] = useState<string | null>(null);
  const [emotionsMatched, setEmotionsMatched] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [emotionMatchedRecently, setEmotionMatchedRecently] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const gameEndedRef = useRef<boolean>(false);

  // Load face-api models on component mount
  useEffect(() => {
    console.log('🔄 Component mounted, attempting to load face-api models...');
    const loadModels = async () => {
      try {
        await loadFaceApiModels();
        console.log('✅ Face detection models loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load face detection models:', error);
      }
    };
    loadModels();
  }, []);

  // Handle camera setup when facingMode changes
  useEffect(() => {
    console.log('🎥 Setting up camera with facing mode:', facingMode);
    startCamera();
    return () => {
      console.log('🧹 Cleaning up camera resources and intervals');
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

  // Handle win condition
  useEffect(() => {
    if (gameActive && emotionsMatched >= TOTAL_EMOTIONS_TO_MATCH && !gameEndedRef.current) {
      console.log('🏆 Game won! All emotions matched.');
      gameEndedRef.current = true;
      setGameWon(true);
      
      // Stop the game timer
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      // After a short victory delay, finalize the recording
      setTimeout(() => {
        console.log('🎬 Finishing game recording after win');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 2000); // Give 2 seconds to celebrate the win
    }
  }, [emotionsMatched, gameActive]);

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

  const stopCamera = () => {
    console.log('🛑 Stopping camera and clearing resources');
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log(`🛑 Stopping track: ${track.kind}`);
        track.stop();
      });
      setStream(null);
    }
    
    setVideoReady(false);
  };

  const startCountdown = () => {
    console.log('⏱️ Starting countdown');
    setButtonState('countdown');
    setCountdown(3);
    
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          console.log('⏱️ Countdown complete');
          clearInterval(countdownInterval.current!);
          startGame();
          return null;
        }
        console.log(`⏱️ Countdown: ${prev - 1}`);
        return prev - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    if (!stream) {
      console.error('❌ Cannot start game: no stream available');
      return;
    }

    console.log('🎮 Starting emotion matching game');
    // Clear any existing interval before starting a new one
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    // Reset game state
    setEmotionsMatched(0);
    setTargetEmotion(null); // Reset so useEffect will set a new one
    setGameActive(true);
    setGameWon(false);
    setEmotionMatchedRecently(false);
    setShowSuccessAnimation(false);
    gameEndedRef.current = false;
    
    setButtonState('recording');
    setCountdown(null);
    setRecordingTime(maxDuration);

    // Start recording video
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        console.log(`📼 Recorded chunk: ${(event.data.size / 1024).toFixed(2)}KB`);
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      console.log('🛑 MediaRecorder STOP event triggered');
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log(`📼 Final recording size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
        setGameActive(false);
        
        console.log('📤 Calling onComplete with the recorded blob');
        onComplete(blob);
      } else {
        console.error('❌ No recorded chunks available');
      }
    };

    mediaRecorder.start();
    console.log('🔴 MediaRecorder started');

    // Start game timer
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => {
        const newTime = prev - 1;
        console.log(`⏱️ Time remaining: ${newTime}s`);
        
        if (newTime <= 0) {
          console.log('⏱️ Game time expired in recordingInterval');
          clearInterval(recordingInterval.current!);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // Define the endGame function using useCallback to avoid recreating it unnecessarily
  const endGame = useCallback((won: boolean) => {
    console.error(`🎮🎮🎮 GAME ENDED - ${won ? 'WON' : 'LOST'} 🎮🎮🎮`);
    
    // Prevent multiple calls
    if (gameEndedRef.current) {
      console.log('Game already ended, ignoring repeated call to endGame');
      return;
    }
    
    // Set the ref first to prevent multiple calls
    gameEndedRef.current = true;
    
    // Only update state if the game is still active
    if (gameActive) {
      setGameActive(false);
      setGameWon(won);
      
      // Clear all timers
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      // Stop the media recorder to trigger the onStop event,
      // which will create the blob and call onComplete
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.error('🛑 STOPPING RECORDING DUE TO GAME END');
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping media recorder:', e);
          // If stopping fails, manually call onComplete
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          onComplete(blob);
        }
      } else {
        // If media recorder isn't running, manually call onComplete
        console.error('⚠️ MediaRecorder not active, manually calling onComplete');
        // Create a blob with whatever chunks we have, or a placeholder if none
        const blob = chunksRef.current.length > 0 
          ? new Blob(chunksRef.current, { type: 'video/webm' })
          : new Blob(['game ended'], { type: 'text/plain' });
        
        onComplete(blob);
      }
      
      setButtonState('idle');
    }
  }, [gameActive, onComplete]);

  // Handle time expiration from the GameUI component
  const handleTimeExpired = useCallback(() => {
    console.error('⏱️⏱️⏱️ TIME EXPIRED CALLBACK FROM GAMEUI ⏱️⏱️⏱️');
    endGame(false);
  }, [endGame]);

  const restartGame = () => {
    stopCamera();
    startCamera();
    setButtonState('idle');
  };

  const handleButtonClick = () => {
    console.log(`🖱️ Button clicked in state: ${buttonState}`);
    if (buttonState === 'idle') {
      startCountdown();
    } else if (buttonState === 'recording') {
      endGame(false); // Forfeit game
    }
  };

  const handleEmotionMatch = () => {
    // This is called when an emotion is matched
    // Any additional match handling logic can go here
    console.log('Emotion matched callback in parent component');
  };

  // Render the current emotion UI - completely separate from video
  const renderTargetEmotion = () => {
    if (!gameActive || !targetEmotion) return null;
    
    return (
      <div className="w-full flex justify-center mb-3">
        <div className="px-5 py-2.5 bg-gradient-to-r from-purple-900/80 to-pink-800/80 backdrop-blur-sm rounded-full border border-pink-500/50 shadow-lg shadow-pink-500/30 flex items-center gap-3">
          <span className="text-white text-xs uppercase tracking-wider">Target</span>
          <span className="text-3xl">{getEmotionEmoji(targetEmotion)}</span>
          <span className="text-white text-lg font-bold">
            {formatEmotion(targetEmotion)}
          </span>
        </div>
      </div>
    );
  };

  // Debug timer monitoring
  useEffect(() => {
    if (recordingTime === 0 && gameActive) {
      console.error('⏱️⏱️⏱️ RECORDING TIME REACHED ZERO ⏱️⏱️⏱️');
      endGame(false);
    }
  }, [recordingTime, gameActive, endGame]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Challenge Title */}
      {challengeTitle && (
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-1">Emotion Challenge</h2>
          <p className="text-lg text-gray-300 font-thin">
            {gameActive 
              ? `Match ${TOTAL_EMOTIONS_TO_MATCH} emotions in ${maxDuration} seconds`
              : gameWon
                ? '🎉 Challenge completed! 🎉'
                : buttonState === 'recording'
                  ? 'Time expired! Try again?'
                  : 'Are you ready to start?'
            }
          </p>
        </div>
      )}
      
      {/* Target Emotion - Rendered completely outside the video element */}
      {renderTargetEmotion()}

      {/* Camera Container with Overlays */}
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-6">
        {/* Camera Setup - Video and Controls */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${hasPermission ? 'block' : 'hidden'}`}
          onLoadedData={() => {
            console.log('📹 Video data loaded and ready');
            setVideoReady(true);
          }}
        />
        
        {!hasPermission && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <p className="text-white text-center mb-4">
              {error || 'Requesting camera access...'}
            </p>
            {error && (
              <button 
                onClick={() => startCamera()}
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
            onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
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

        {/* Current Emotion Badge - Only show during active game */}
        {gameActive && faceDetected && dominantEmotion && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-500/50 flex items-center gap-2">
            <span className="text-2xl">{getEmotionEmoji(dominantEmotion)}</span>
            <span className="text-white text-sm font-mono">
              {formatEmotion(dominantEmotion)}
            </span>
          </div>
        )}
        
        {/* Success Animation - overlay that flashes when emotion is matched */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 bg-green-500/30 animate-pulse flex items-center justify-center">
            <div className="text-6xl animate-bounce">✅</div>
          </div>
        )}
        
        {/* Game UI Elements (Progress, Timer, Countdown, Game Over) */}
        <GameUI
          gameActive={gameActive}
          emotionsMatched={emotionsMatched}
          recordingTime={recordingTime}
          countdown={countdown}
          gameWon={gameWon}
          buttonState={buttonState}
          totalEmotionsToMatch={TOTAL_EMOTIONS_TO_MATCH}
          onRestartGame={restartGame}
          onTimeExpired={handleTimeExpired}
        />
        
        {/* Non-visual components */}
        <EmotionDetector
          videoRef={videoRef}
          videoReady={videoReady}
          hasPermission={hasPermission}
          gameActive={gameActive}
          targetEmotion={targetEmotion}
          emotionMatchedRecently={emotionMatchedRecently}
          setFaceDetected={setFaceDetected}
          setDominantEmotion={setDominantEmotion}
          setEmotionMatchedRecently={setEmotionMatchedRecently}
          setShowSuccessAnimation={setShowSuccessAnimation}
          setEmotionsMatched={setEmotionsMatched}
          emotionsMatched={emotionsMatched}
          setTargetEmotion={setTargetEmotion}
          onEmotionMatch={handleEmotionMatch}
        />
      </div>

      {/* Main Button */}
      <div className="flex justify-center">
        {buttonState === 'idle' ? (
          <ThematicContainer
            color="nocenaBlue"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={handleButtonClick}
            disabled={!hasPermission}
            className={`px-6 py-3 text-lg font-bold ${!hasPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Start Challenge
          </ThematicContainer>
        ) : (
            <button
            onClick={handleButtonClick}
            disabled={!hasPermission || buttonState === 'countdown' || !gameActive}
            className={`relative w-20 h-20 rounded-full border-4 ${
              (buttonState as ButtonState) === 'recording' 
                ? 'border-nocenaPink' 
                : 'border-white'
            } transition-all duration-200 ${
              !hasPermission || !gameActive ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className={`absolute inset-0 m-auto transition-all duration-200 ${
              (buttonState as ButtonState) === 'idle' 
                ? 'w-12 h-12 rounded-full bg-gray-500' 
                : (buttonState as ButtonState) === 'recording' 
                  ? 'w-8 h-8 rounded-sm bg-nocenaPink' 
                  : 'w-12 h-12 rounded-full bg-gray-500'
            }`} />
          </button>
        )}
      </div>

      {/* Instructions - Removed "Neutral" message before game starts */}
      <p className="text-sm text-gray-400 mt-4 text-center">
        {!hasPermission 
          ? 'Please grant camera access to continue'
          : buttonState === 'idle'
            ? 'Position your face in the camera'
            : buttonState === 'countdown'
              ? 'Get ready...'
              : gameActive
                ? `Match the target emotion: ${formatEmotion(targetEmotion || 'loading...')}`
                : 'Game over'
        }
      </p>
    </div>
  );
};

export default VideoRecording;