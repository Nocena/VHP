'use client';

import React from 'react';
import type { EmotionDisplayProps } from './types';
import { formatEmotion, getEmotionEmoji } from '../../../lib/faceVerification';

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  faceDetected,
  dominantEmotion,
  gameActive,
  targetEmotion,
  showSuccessAnimation
}) => {
  return (
    <>
      {/* Current Emotion Display Badge - Top Left */}
      {faceDetected && dominantEmotion && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-500/50 flex items-center gap-2">
          <span className="text-2xl">{getEmotionEmoji(dominantEmotion)}</span>
          <span className="text-white text-sm font-mono">
            {formatEmotion(dominantEmotion)}
          </span>
        </div>
      )}

      {/* Target Emotion Display - Now ABOVE the video container */}
      {gameActive && targetEmotion && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 transform bg-black/80 backdrop-blur-md px-5 py-3 rounded-xl border-2 border-yellow-500 shadow-xl">
          <div className="flex flex-col items-center gap-1">
            <span className="text-white text-sm font-medium mb-1">
              Make this face:
            </span>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getEmotionEmoji(targetEmotion)}</span>
              <span className="text-white text-lg font-bold">
                {formatEmotion(targetEmotion)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation - overlay that flashes when emotion is matched */}
      {showSuccessAnimation && (
        <div className="absolute inset-0 bg-green-500/30 animate-pulse flex items-center justify-center">
          <div className="text-6xl animate-bounce">✅</div>
        </div>
      )}
    </>
  );
};

export default EmotionDisplay;