'use client';

import React, { useEffect } from 'react';
import type { GameUIProps } from './types';

const GameUI: React.FC<GameUIProps> = ({
  gameActive,
  emotionsMatched,
  recordingTime,
  countdown,
  gameWon,
  buttonState,
  totalEmotionsToMatch,
  onRestartGame,
  onTimeExpired // New prop to handle time expiration
}) => {
  // Add an effect to monitor the recordingTime
  useEffect(() => {
    // Check if the timer has reached 0 and game is still active
    if (gameActive && recordingTime === 0 && onTimeExpired) {
      console.log('⏱️⏱️⏱️ TIME EXPIRED in GameUI component! ⏱️⏱️⏱️');
      // Call the onTimeExpired callback to end the game
      onTimeExpired();
    }
  }, [recordingTime, gameActive, onTimeExpired]);

  return (
    <>
      {/* Game Progress */}
      {gameActive && (
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
          <span className="text-white text-lg font-bold">
            {emotionsMatched} / {totalEmotionsToMatch}
          </span>
        </div>
      )}

      {/* Timer - Now with color warning based on time left */}
      {gameActive && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            recordingTime > 10 ? 'bg-green-500' : 
            recordingTime > 5 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className={`text-white text-lg font-bold ${
            recordingTime > 10 ? 'bg-green-500/50' : 
            recordingTime > 5 ? 'bg-yellow-500/50' : 'bg-red-500/50'
          } px-3 py-1 rounded`}>
            {recordingTime}s
          </span>
        </div>
      )}

      {/* Countdown Display */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-8xl font-bold text-white animate-ping">
            {countdown}
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {!gameActive && buttonState === 'recording' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <div className={`text-5xl mb-6 ${gameWon ? 'text-green-400' : 'text-red-400'}`}>
            {gameWon ? '🎉 You won! 🎉' : '⏱️ Time\'s up!'}
          </div>
          <div className="text-white text-xl mb-8">
            {gameWon 
              ? `You matched all ${totalEmotionsToMatch} emotions!` 
              : `You matched ${emotionsMatched} out of ${totalEmotionsToMatch} emotions`}
          </div>
          <button
            onClick={onRestartGame}
            className="mt-4 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg shadow-lg transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </>
  );
};

export default GameUI;