'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { GameControllerProps, ButtonState } from './types';

// Constants
const TOTAL_EMOTIONS_TO_MATCH = 10;

// Define startCountdown function outside the component
export const startCountdown = (
  setButtonState: React.Dispatch<React.SetStateAction<ButtonState>>,
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>,
  callback: () => void
): NodeJS.Timeout => {
  console.log('⏱️ Starting countdown');
  setButtonState('countdown');
  setCountdown(3);
  
  const interval = setInterval(() => {
    setCountdown((prev) => {
      if (prev === null || prev <= 1) {
        console.log('⏱️ Countdown complete');
        clearInterval(interval);
        callback();
        return null;
      }
      console.log(`⏱️ Countdown: ${prev - 1}`);
      return prev - 1;
    });
  }, 1000);
  
  return interval;
};

const GameController: React.FC<GameControllerProps> = ({
  stream,
  maxDuration,
  buttonState,
  recordingTime,
  gameActive,
  emotionsMatched,
  gameWon,
  setButtonState,
  setRecordingTime,
  setGameActive,
  setEmotionsMatched,
  setGameWon,
  setTargetEmotion,
  setEmotionMatchedRecently,
  setShowSuccessAnimation,
  setCountdown,
  onComplete
}) => {
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for win condition
  useEffect(() => {
    if (gameActive && emotionsMatched >= TOTAL_EMOTIONS_TO_MATCH) {
      console.log('🏆 Game won! All emotions matched.');
      setGameWon(true);
      
      // Stop the game timer
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      // Clear the game timeout
      if (gameTimeoutRef.current) {
        clearTimeout(gameTimeoutRef.current);
        gameTimeoutRef.current = null;
      }
      
      // After a short victory delay, finalize the recording
      setTimeout(() => {
        console.log('🎬 Finishing game recording after win');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, 2000); // Give 2 seconds to celebrate the win
    }
  }, [emotionsMatched, gameActive, setGameWon]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clear intervals
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      if (gameTimeoutRef.current) {
        clearTimeout(gameTimeoutRef.current);
        gameTimeoutRef.current = null;
      }
      
      // Stop recording if it's still active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const beginCountdown = () => {
    // Use the external startCountdown function
    countdownInterval.current = startCountdown(setButtonState, setCountdown, startGame);
  };

  const startGame = useCallback(() => {
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
      console.log('🛑 Recording stopped');
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      console.log(`📼 Final recording size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      setGameActive(false);
      onComplete(blob);
    };

    mediaRecorder.start();
    console.log('🔴 MediaRecorder started');

    // Start game timer
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev <= 1) {
          console.log('⏱️ Game time expired in interval');
          clearInterval(recordingInterval.current!);
          endGame(false); // Game lost due to timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set a hard timeout to end the game after maxDuration seconds
    // This ensures the game ends even if the interval somehow fails
    gameTimeoutRef.current = setTimeout(() => {
      console.log('⏱️ Game time expired in timeout');
      if (gameActive && !gameWon) {
        endGame(false);
      }
    }, maxDuration * 1000);
  }, [stream, maxDuration, setButtonState, setCountdown, setEmotionsMatched, setTargetEmotion, 
      setGameActive, setGameWon, setEmotionMatchedRecently, setShowSuccessAnimation, 
      setRecordingTime, onComplete, gameActive, gameWon]);

  const endGame = useCallback((won: boolean) => {
    console.log(`🎮 Game ended - ${won ? 'Won!' : 'Lost'}`);
    
    // Only update state if the game is still active
    if (gameActive) {
      setGameActive(false);
      setGameWon(won);
      
      // Clear the game timeout
      if (gameTimeoutRef.current) {
        clearTimeout(gameTimeoutRef.current);
        gameTimeoutRef.current = null;
      }
      
      // Clear the recording interval
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('🛑 Stopping recording due to game end');
        mediaRecorderRef.current.stop();
      }
      
      setButtonState('idle');
    }
  }, [gameActive, setGameActive, setGameWon, setButtonState]);

  // This component doesn't render anything directly
  return null;
};

// Export both the component and game controller functions
export { GameController };
export default GameController;