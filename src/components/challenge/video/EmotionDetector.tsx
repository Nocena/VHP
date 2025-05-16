'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import type { EmotionDetectorProps } from './types';
import { formatEmotion, getEmotionEmoji, EMOTIONS } from '../../../lib/faceVerification';

// Constants
const MATCH_THRESHOLD = 0.6; // Confidence threshold to consider an emotion matched
const DETECTION_INTERVAL = 200; // How often to check for emotions (ms)
const TOTAL_EMOTIONS_TO_MATCH = 10;

const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  videoRef,
  videoReady,
  hasPermission,
  gameActive,
  targetEmotion,
  emotionMatchedRecently,
  setFaceDetected,
  setDominantEmotion,
  setEmotionMatchedRecently,
  setShowSuccessAnimation,
  setEmotionsMatched,
  emotionsMatched,
  setTargetEmotion,
  onEmotionMatch
}) => {
  const faceDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const matchAnimationTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Use refs to track latest state values for use in the interval
  const targetEmotionRef = useRef<string | null>(null);
  const gameActiveRef = useRef<boolean>(false);
  const emotionMatchedRecentlyRef = useRef<boolean>(false);
  const emotionsMatchedRef = useRef<number>(0);

  // Update refs when props change to ensure interval has latest values
  useEffect(() => {
    targetEmotionRef.current = targetEmotion;
    console.log(`Updated targetEmotionRef: ${targetEmotionRef.current}`);
  }, [targetEmotion]);

  useEffect(() => {
    gameActiveRef.current = gameActive;
    console.log(`Updated gameActiveRef: ${gameActiveRef.current}`);
  }, [gameActive]);

  useEffect(() => {
    emotionMatchedRecentlyRef.current = emotionMatchedRecently;
    console.log(`Updated emotionMatchedRecentlyRef: ${emotionMatchedRecentlyRef.current}`);
  }, [emotionMatchedRecently]);
  
  useEffect(() => {
    emotionsMatchedRef.current = emotionsMatched;
    console.log(`Updated emotionsMatchedRef: ${emotionsMatchedRef.current}`);
  }, [emotionsMatched]);

  // Pick a random emotion, excluding 'neutral' and the current target
  const getRandomEmotion = useCallback(() => {
    // Make a copy of emotions excluding 'neutral'
    const gameEmotions = EMOTIONS.filter(e => e !== 'neutral');
    
    // If we have a current target emotion, exclude it to ensure a different one
    if (targetEmotionRef.current) {
      const filteredEmotions = gameEmotions.filter(e => e !== targetEmotionRef.current);
      const randomIndex = Math.floor(Math.random() * filteredEmotions.length);
      console.log(`🎲 Picking new emotion from ${filteredEmotions.length} choices`);
      return filteredEmotions[randomIndex];
    }
    
    // Initial emotion selection (no current target)
    const randomIndex = Math.floor(Math.random() * gameEmotions.length);
    return gameEmotions[randomIndex];
  }, []);

  // Set initial target emotion when game activates
  useEffect(() => {
    if (gameActive && !targetEmotion) {
      const initialEmotion = getRandomEmotion();
      console.log(`🎮 Game started, setting initial emotion: ${initialEmotion}`);
      setTargetEmotion(initialEmotion);
    }
  }, [gameActive, targetEmotion, setTargetEmotion, getRandomEmotion]);

  // Auto-reset the emotionMatchedRecently after a delay
  useEffect(() => {
    if (emotionMatchedRecently) {
      const timer = setTimeout(() => {
        console.log('🔄 Ready for next emotion match - auto reset');
        setEmotionMatchedRecently(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [emotionMatchedRecently, setEmotionMatchedRecently]);

  // Add DEBUG logging to help diagnose the issue
  useEffect(() => {
    console.log('DEBUG - Current game state:');
    console.log(`- Target emotion: ${targetEmotion}`);
    console.log(`- Emotions matched: ${emotionsMatched}`);
    console.log(`- Match prevention active: ${emotionMatchedRecently}`);
    console.log(`- Game active: ${gameActive}`);
  }, [gameActive, targetEmotion, emotionsMatched, emotionMatchedRecently]);

  // Face detection logic
  const performEmotionDetection = useCallback(async () => {
    if (!videoRef.current || !videoReady) {
      return;
    }

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 320,
        scoreThreshold: 0.5
      });
      
      const result = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceExpressions();
      
      if (result) {
        setFaceDetected(true);
        
        // Find dominant emotion
        const emotions = result.expressions;
        
        const emotionEntries = Object.entries(emotions);
        emotionEntries.sort((a, b) => b[1] - a[1]);
        const detectedEmotion = emotionEntries[0][0];
        const confidence = emotionEntries[0][1];
        
        console.log(`🎭 Detected emotion: ${detectedEmotion} (${(confidence * 100).toFixed(2)}%)`);
        setDominantEmotion(detectedEmotion);
        
        // CRITICAL: Explicitly log all variables used in the condition check
        console.log(`DEBUG - Condition checks:
- gameActiveRef: ${gameActiveRef.current}
- targetEmotionRef: ${targetEmotionRef.current}
- emotionMatchedRecentlyRef: ${emotionMatchedRecentlyRef.current}
- all conditions met: ${gameActiveRef.current && targetEmotionRef.current && !emotionMatchedRecentlyRef.current}`);
        
        // Check if we're in game mode and this emotion matches the target
        // Using refs to ensure we have the latest values
        if (gameActiveRef.current && targetEmotionRef.current && !emotionMatchedRecentlyRef.current) {
          console.log(`🎮 Comparing: ${detectedEmotion} vs ${targetEmotionRef.current} (conf: ${confidence.toFixed(2)}, threshold: ${MATCH_THRESHOLD})`);
          
          if (detectedEmotion === targetEmotionRef.current && confidence > MATCH_THRESHOLD) {
            console.log(`🎯 MATCHED target emotion: ${targetEmotionRef.current}!`);
            
            // Prevent multiple matches in quick succession
            setEmotionMatchedRecently(true);
            emotionMatchedRecentlyRef.current = true;
            
            // Show success animation
            setShowSuccessAnimation(true);
            
            // Increment matched count
            const newCount = emotionsMatchedRef.current + 1;
            console.log(`🔢 Emotions matched: ${newCount}/${TOTAL_EMOTIONS_TO_MATCH}`);
            setEmotionsMatched(newCount);
            emotionsMatchedRef.current = newCount;
            
            // Call the match handler from parent component
            onEmotionMatch();
            
            // Only end the game if we've matched all emotions
            if (newCount < TOTAL_EMOTIONS_TO_MATCH) {
              // Otherwise, set a new target emotion and continue
              const newEmotion = getRandomEmotion();
              console.log(`🎭 New target emotion: ${newEmotion}`);
              setTargetEmotion(newEmotion);
              targetEmotionRef.current = newEmotion;
            }
            
            // Reset the match prevention after a short delay
            if (matchAnimationTimeout.current) {
              clearTimeout(matchAnimationTimeout.current);
            }
            
            matchAnimationTimeout.current = setTimeout(() => {
              console.log('🔄 Ready for next emotion match');
              setEmotionMatchedRecently(false);
              emotionMatchedRecentlyRef.current = false;
              setShowSuccessAnimation(false);
            }, 1200); // Slightly reduced delay for better game flow
          }
        }
      } else {
        setFaceDetected(false);
        setDominantEmotion(null);
      }
    } catch (error) {
      console.error('❌ Face detection error:', error);
    }
  }, [videoRef, videoReady, setFaceDetected, setDominantEmotion, onEmotionMatch, setEmotionMatchedRecently, setShowSuccessAnimation, setEmotionsMatched, setTargetEmotion, getRandomEmotion]);

  // Start/stop face detection based on video readiness and permissions
  useEffect(() => {
    if (videoReady && hasPermission) {
      console.log('🎬 Video is ready and we have permission, starting face detection');
      
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
      }
      
      faceDetectionInterval.current = setInterval(performEmotionDetection, DETECTION_INTERVAL);
      
      return () => {
        if (faceDetectionInterval.current) {
          clearInterval(faceDetectionInterval.current);
          faceDetectionInterval.current = null;
        }
      };
    }
  }, [videoReady, hasPermission, performEmotionDetection]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (faceDetectionInterval.current) {
        clearInterval(faceDetectionInterval.current);
        faceDetectionInterval.current = null;
      }
      
      if (matchAnimationTimeout.current) {
        clearTimeout(matchAnimationTimeout.current);
        matchAnimationTimeout.current = null;
      }
    };
  }, []);

  // This component doesn't render anything directly
  return null;
};

export default EmotionDetector;