// ReviewView.tsx
import React from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import ThematicContainer from '../ui/ThematicContainer';
import { formatEmotion, getEmotionEmoji } from '../../lib/faceVerification';

interface ReviewViewProps {
  videoBlob: Blob;
  selfieBlob: Blob;
  challengeType: string; // '1', '2', or '3'
  faceData?: {
    isHuman: boolean;
    confidence: number;
    faceVector?: string;
    vibeCheck?: {
      requestedEmotion?: string;
      dominantEmotion: string;
      matchScore: number;
      passed: boolean;
      message: string;
    };
  };
  onSubmit: () => void;
  onRetakeVideo: () => void;
  onRetakeSelfie: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({
  videoBlob,
  selfieBlob,
  challengeType,
  faceData,
  onSubmit,
  onRetakeVideo,
  onRetakeSelfie,
}) => {
  // Get vibe check data
  const vibeCheck = faceData?.vibeCheck;
  
  // Determine if the challenge was passed
  const isPassed = vibeCheck?.passed || false;
  
  // Challenge-specific UI elements
  const renderChallengeDetails = () => {
    if (challengeType === '1') {
      // Simple vibe check
      return (
        <div className="flex items-center justify-center mb-4">
          <div className="bg-black/70 p-3 rounded-lg inline-flex items-center gap-3">
            <span className="text-3xl">{getEmotionEmoji(vibeCheck?.dominantEmotion || 'neutral')}</span>
            <div>
              <p className="text-xs text-gray-400">Requested emotion</p>
              <p className="text-lg text-cyan-400 font-bold">
                {formatEmotion(vibeCheck?.requestedEmotion || 'neutral')}
              </p>
            </div>
            <div className="h-10 w-px bg-gray-700 mx-1"></div>
            <div>
              <p className="text-xs text-gray-400">Match score</p>
              <p className={`text-lg font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                {vibeCheck?.matchScore || 0}%
              </p>
            </div>
          </div>
        </div>
      );
    } else if (challengeType === '2') {
      // Dual mood
      const emotions = vibeCheck?.requestedEmotion?.split(' and ') || ['', ''];
      return (
        <div className="flex items-center justify-center mb-4">
          <div className="bg-black/70 p-3 rounded-lg">
            <div className="text-center mb-2">
              <p className="text-white font-bold">Dual Mood Result</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-3xl block">{getEmotionEmoji(emotions[0])}</span>
                <p className="text-xs text-gray-400">{formatEmotion(emotions[0])}</p>
                <div className="mt-1 w-full bg-black/30 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${isPassed ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${faceData?.vibeCheck?.matchScore || 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-2xl text-pink-500">+</span>
              <div className="text-center">
                <span className="text-3xl block">{getEmotionEmoji(emotions[1])}</span>
                <p className="text-xs text-gray-400">{formatEmotion(emotions[1])}</p>
                <div className="mt-1 w-full bg-black/30 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${isPassed ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${faceData?.vibeCheck?.matchScore || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (challengeType === '3') {
      // Mood streak
      return (
        <div className="flex items-center justify-center mb-4">
          <div className="bg-black/70 p-3 rounded-lg">
            <div className="text-center mb-2">
              <p className="text-white font-bold">Mood Streak Challenge</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{faceData?.vibeCheck?.matchScore || 0}</div>
                <p className="text-xs text-gray-400">Moods Matched</p>
              </div>
              <div className="h-10 w-px bg-gray-700 mx-1"></div>
              <div className="text-center">
                <div className={`text-xl font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                  {isPassed ? 'CHALLENGE COMPLETE' : 'TRY AGAIN'}
                </div>
                <p className="text-xs text-gray-400">
                  {isPassed ? 'You did it!' : 'Need 10 matches to pass'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col items-center py-4 px-2">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">Review Your Submission</h2>
        <p className="text-xs text-gray-400">
          {isPassed ? 'Great job! Verify before submitting.' : 'Check your capture before trying again.'}
        </p>
      </div>

      {/* CYBERPUNK ACHIEVEMENT CONCEPT */}
      <div className="w-full mb-3">
        <ThematicContainer
          asButton={false}
          color={isPassed ? "nocenaBlue" : "nocenaPink"}
          glassmorphic={true}
          rounded="xl"
          className={`p-0.5 overflow-hidden ${isPassed ? 'border border-cyan-500/50' : ''}`}
        >
          <div className={`relative w-full p-2 ${isPassed ? 'bg-gradient-to-r from-black via-cyan-950/30 to-black' : 'bg-black'}`}>
            {/* Cyberpunk neon glow effect (when passed) */}
            {isPassed && (
              <>
                <div className="absolute top-0 left-0 w-full h-px bg-cyan-500/80"></div>
                <div className="absolute bottom-0 left-0 w-full h-px bg-cyan-500/80"></div>
              </>
            )}
            
            {/* Achievement content */}
            <div className="flex items-center justify-between z-10 relative">
              {/* Left: Hacker-style achievement */}
              <div className="flex items-center">
                <div className={`flex-none w-7 h-7 border-2 flex items-center justify-center
                              ${isPassed ? 'border-cyan-500 text-cyan-400' : 'border-red-500 text-red-400'}`}>
                  <span className="text-xs font-mono">{isPassed ? '01' : '00'}</span>
                </div>
                <div className="ml-2">
                  <div className="font-mono text-sm font-bold tracking-wider">
                    {isPassed ? 'VIBE_SYNCED' : 'SYNC_FAILED'}
                  </div>
                  <div className="text-xs opacity-80 font-mono tracking-tight">
                    {challengeType === '1' && `${formatEmotion(vibeCheck?.requestedEmotion || '')}.protocol_activated`}
                    {challengeType === '2' && `dual_emotion.protocol_${isPassed ? 'complete' : 'failed'}`}
                    {challengeType === '3' && `mood_streak.${isPassed ? 'threshold_reached' : 'below_threshold'}`}
                  </div>
                </div>
              </div>
              
              {/* Right: XP counter with cyberpunk styling */}
              {isPassed && (
                <div className="font-mono text-xs bg-black border border-cyan-500/50 px-2 py-0.5">
                  <span className="text-cyan-400 animate-pulse">+{challengeType === '1' ? '50' : challengeType === '2' ? '100' : '250'}</span>
                  <span className="text-cyan-300">_XP</span>
                </div>
              )}
            </div>
          </div>
        </ThematicContainer>
      </div>

      {/* Challenge-specific details */}
      {renderChallengeDetails()}

      {/* Video/Selfie container */}
      <div className="relative w-full mb-4">
        {/* Cyber effects overlay (only when passed) */}
        {isPassed && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-cyan-500/80"></div>
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-500/80"></div>
            <div className="absolute left-0 inset-y-0 w-0.5 bg-cyan-500/80"></div>
            <div className="absolute right-0 inset-y-0 w-0.5 bg-cyan-500/80"></div>
            
            {/* Corner circuit pattern effects */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-cyan-500/80"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-cyan-500/80"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-cyan-500/80"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyan-500/80"></div>
          </div>
        )}
        
        {/* Main Video or Image */}
        <div className="w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
          {challengeType === '3' && videoBlob.size > 0 ? (
            <video 
              src={URL.createObjectURL(videoBlob)} 
              controls 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={URL.createObjectURL(selfieBlob)} 
              alt="Captured selfie" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Achievement Badge (Tron-style) */}
          {isPassed && (
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-1 
                           border border-cyan-500/50 font-mono text-xs tracking-wide flex items-center">
              <div className="w-2 h-2 bg-cyan-400 mr-1.5"></div>
              <span>
                {challengeType === '1' && 'EMOTION_DETECTED'}
                {challengeType === '2' && 'DUAL_EMOTION_SYNCED'}
                {challengeType === '3' && 'MOOD_STREAK_UNLOCKED'}
              </span>
            </div>
          )}
        </div>
        
        {/* Selfie in corner - only for challenge 3 */}
        {challengeType === '3' && (
          <div className="absolute top-2 right-2 z-20">
            <ThematicContainer
              color={isPassed ? "nocenaBlue" : "nocenaPink"}
              glassmorphic={true}
              rounded="xl"
              asButton={false}
              className={`p-0.5 ${isPassed ? 'border border-cyan-500/80' : ''}`}
            >
              <div className="w-20 h-28 bg-black rounded-xl overflow-hidden relative">
                <img 
                  src={URL.createObjectURL(selfieBlob)} 
                  alt="Selfie" 
                  className="w-full h-full object-cover"
                />
                
                {/* Cyberpunk HUD overlay */}
                {isPassed && (
                  <>
                    {/* Corner targeting brackets */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-cyan-500/80"></div>
                    <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-cyan-500/80"></div>
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-cyan-500/80"></div>
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-cyan-500/80"></div>
                    
                    {/* Data readout at bottom */}
                    <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-t from-black to-transparent flex items-center justify-center">
                      <div className="text-[8px] font-mono text-cyan-400 tracking-widest">IDENTITY:VERIFIED</div>
                    </div>
                  </>
                )}
              </div>
            </ThematicContainer>
          </div>
        )}
      </div>

      {/* Buttons - Properly aligned */}
      <div className="w-full space-y-4">
        {/* Retake buttons */}
        <div className="flex gap-4">
          {challengeType === '3' && (
            <ThematicContainer
              color="nocenaBlue"
              glassmorphic={true}
              rounded="xl"
              asButton={true}
              onClick={onRetakeVideo}
              className="flex-1 py-2.5 px-6 text-sm text-center"
            >
              Retake Video
            </ThematicContainer>
          )}
          
          <ThematicContainer
            color="nocenaPurple"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeSelfie}
            className={`${challengeType === '3' ? 'ml-3 ' : ''}flex-1 py-2.5 px-6 text-sm text-center`}
          >
            Retake {challengeType === '1' ? 'Selfie' : challengeType === '2' ? 'Dual Mood' : 'Challenge'}
          </ThematicContainer>
        </div>

        {/* Submit button */}
        <PrimaryButton
          text={isPassed ? "ACCESS GRANTED" : "RETRY CHALLENGE"}
          onClick={onSubmit}
          className="w-full font-mono tracking-wider"
        />

        {/* Footer text */}
        <div className="text-center text-xs text-gray-400 font-mono tracking-tight">
          <p>BY SUBMITTING YOU AGREE TO BIOMETRIC SCANNING PROTOCOL</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewView;