import React from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import ThematicContainer from '../ui/ThematicContainer';
import { formatEmotion, getEmotionEmoji } from '../../lib/faceVerification';

interface ReviewViewProps {
  videoBlob: Blob;
  selfieBlob: Blob;
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
  faceData,
  onSubmit,
  onRetakeVideo,
  onRetakeSelfie,
}) => {
  // Get vibe check data
  const vibeCheck = faceData?.vibeCheck;
  
  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white">Review Your Submission</h2>
        <p className="text-xs text-gray-400">
          Check your video and selfie before submitting
        </p>
      </div>

      {/* CYBERPUNK ACHIEVEMENT CONCEPT */}
      {vibeCheck && (
        <div className="w-full mb-3">
          <ThematicContainer
            asButton={false}
            color={vibeCheck.passed ? "nocenaBlue" : "nocenaPink"}
            glassmorphic={true}
            rounded="xl"
            className={`p-0.5 overflow-hidden ${vibeCheck.passed ? 'border border-cyan-500/50' : ''}`}
          >
            <div className={`relative w-full p-2 ${vibeCheck.passed ? 'bg-gradient-to-r from-black via-cyan-950/30 to-black' : 'bg-black'}`}>
              {/* Cyberpunk neon glow effect (when passed) */}
              {vibeCheck.passed && (
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
                                 ${vibeCheck.passed ? 'border-cyan-500 text-cyan-400' : 'border-red-500 text-red-400'}`}>
                    <span className="text-xs font-mono">{vibeCheck.passed ? '01' : '00'}</span>
                  </div>
                  <div className="ml-2">
                    <div className="font-mono text-sm font-bold tracking-wider">
                      {vibeCheck.passed ? 'VIBE_SYNCED' : 'SYNC_FAILED'}
                    </div>
                    <div className="text-xs opacity-80 font-mono tracking-tight">
                      {vibeCheck.passed ? 
                        `${formatEmotion(vibeCheck.dominantEmotion)}.protocol_activated` : 
                        `${formatEmotion(vibeCheck.requestedEmotion || '')}.protocol_required`}
                    </div>
                  </div>
                </div>
                
                {/* Right: XP counter with cyberpunk styling */}
                {vibeCheck.passed && (
                  <div className="font-mono text-xs bg-black border border-cyan-500/50 px-2 py-0.5">
                    <span className="text-cyan-400 animate-pulse">+50</span>
                    <span className="text-cyan-300">_XP</span>
                  </div>
                )}
              </div>
            </div>
          </ThematicContainer>
        </div>
      )}

      {/* Video container */}
      <div className="relative w-full mb-4">
        {/* Cyber effects overlay (only when passed) */}
        {vibeCheck?.passed && (
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
        
        {/* Main Video */}
        <div className="w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
          <video 
            src={URL.createObjectURL(videoBlob)} 
            controls 
            className="w-full h-full object-cover"
          />
          
          {/* Achievement Badge (Tron-style) */}
          {vibeCheck?.passed && (
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur px-2 py-1 
                           border border-cyan-500/50 font-mono text-xs tracking-wide flex items-center">
              <div className="w-2 h-2 bg-cyan-400 mr-1.5"></div>
              <span>EMOTION_UNLOCKED</span>
            </div>
          )}
        </div>
        
        {/* Selfie in corner */}
        <div className="absolute top-2 right-2 z-20">
          <ThematicContainer
            color={vibeCheck?.passed ? "nocenaBlue" : "nocenaPink"}
            glassmorphic={true}
            rounded="xl"
            asButton={false}
            className={`p-0.5 ${vibeCheck?.passed ? 'border border-cyan-500/80' : ''}`}
          >
            <div className="w-20 h-28 bg-black rounded-xl overflow-hidden relative">
              <img 
                src={URL.createObjectURL(selfieBlob)} 
                alt="Selfie" 
                className="w-full h-full object-cover"
              />
              
              {/* Cyberpunk HUD overlay */}
              {vibeCheck?.passed && (
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
      </div>

      {/* Buttons - Properly aligned */}
      <div className="w-full space-y-4">
        {/* Retake buttons */}
        <div className="flex gap-4">
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
          
          <ThematicContainer
            color="nocenaPurple"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeSelfie}
            className="ml-3 flex-1 py-2.5 px-6 text-sm text-center"
          >
            Retake Selfie
          </ThematicContainer>
        </div>

        {/* Submit button */}
        <PrimaryButton
          text={vibeCheck?.passed ? "ACCESS GRANTED" : "RETRY SYNC"}
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