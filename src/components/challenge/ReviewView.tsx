import React from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import ThematicContainer from '../ui/ThematicContainer';
import { formatEmotion, getEmotionEmoji } from '../../lib/faceVerification';

interface ReviewViewProps {
  videoBlob: Blob | null;
  selfieBlob: Blob | null;
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
  onRetakeVideo?: () => void;
  onRetakeSelfie?: () => void;
  isVideoChallenge: boolean;
  gameResults?: {
    emotionsMatched: number;
    totalEmotions: number;
    timeRemaining?: number;
    streakCount?: number;
    failedEmotion?: string;
  };
}

const ReviewView: React.FC<ReviewViewProps> = ({
  videoBlob,
  selfieBlob,
  faceData,
  onSubmit,
  onRetakeVideo,
  onRetakeSelfie,
  isVideoChallenge,
  gameResults
}) => {
  const vibeCheck = faceData?.vibeCheck;
  
  const matchPercentage = vibeCheck ? Math.round(vibeCheck.matchScore * 100) : 0;

  return (
    <div className="flex flex-col items-center w-full relative text-white max-w-sm mx-auto">
      {/* Header */}
      <div className="z-10 text-center mb-4">
        <h2 className="text-xl font-semibold tracking-wide text-white">
          Review Submission
        </h2>
        <p className="text-xs text-nocenaBlue tracking-tight">
          {isVideoChallenge ? 'Video preview' : 'Selfie preview'}
        </p>
      </div>

      {/* Status banner - only show for failed sync or video challenge results */}
      {(!vibeCheck?.passed || (isVideoChallenge && gameResults)) && (
        <ThematicContainer
          asButton={false}
          color={vibeCheck?.passed ? 'nocenaBlue' : 'nocenaPink'}
          glassmorphic={true}
          rounded="xl"
          className="w-full mb-3"
        >
          <div className="flex items-center p-3">
            {/* For failed sync */}
            {!vibeCheck?.passed && (
              <>
                <div className="flex items-center justify-center w-7 h-7 border-2 rounded border-nocenaPink text-nocenaPink mr-3">
                  <span className="text-xs">00</span>
                </div>
                <div>
                  <div className="text-sm font-bold uppercase">
                    SYNC_FAILED
                  </div>
                  <div className="text-[11px] text-nocenaBlue/70">
                    {formatEmotion(vibeCheck?.requestedEmotion || '')}.protocol_required
                  </div>
                </div>
              </>
            )}
            
            {/* For video game results - successful */}
            {vibeCheck?.passed && isVideoChallenge && gameResults && (
              <>
                <div className="flex items-center justify-center w-7 h-7 border-2 rounded border-nocenaBlue text-nocenaBlue mr-3">
                  <span className="text-xs">01</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold uppercase">
                    VIBE_SYNCED
                  </div>
                  <div className="text-[11px] text-nocenaBlue/70">
                    Emotions: {gameResults?.emotionsMatched}/{gameResults?.totalEmotions} matched
                  </div>
                </div>
                <div className="px-2 py-0.5 border border-nocenaBlue/30 text-xs bg-black/50 text-nocenaBlue rounded">
                  +25<span className="text-nocenaBlue/70"> NCNX</span>
                </div>
              </>
            )}
          </div>
        </ThematicContainer>
      )}

      {/* Preview Block */}
      <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4 border border-nocenaBlue/10">
        {isVideoChallenge && videoBlob && (
          <video 
            src={URL.createObjectURL(videoBlob)} 
            controls 
            className="w-full h-full object-cover"
          />
        )}
        {!isVideoChallenge && selfieBlob && (
          <img 
            src={URL.createObjectURL(selfieBlob)} 
            alt="Selfie" 
            className="w-full h-full object-cover" 
          />
        )}
        {vibeCheck?.passed && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 border border-nocenaBlue text-[10px] rounded">
            EMOTION_UNLOCKED
          </div>
        )}
      </div>

      {/* Stats panel */}
      {vibeCheck && (
        <ThematicContainer
          asButton={false}
          color="nocenaBlue"
          glassmorphic={true}
          rounded="xl"
          className="w-full mb-4 p-3 text-xs text-white space-y-1"
        >
          {/* Stats panel */}
          {vibeCheck && (
            <ThematicContainer
              asButton={false}
              color="nocenaBlue"
              glassmorphic={true}
              rounded="xl"
              className="w-full mb-4 p-3 text-xs text-white space-y-1"
            >
              {/* For selfie challenge */}
              {!isVideoChallenge && (
                <>
                  <div className="flex justify-between">
                    <span>Dominant</span>
                    <span className="font-medium">{vibeCheck.dominantEmotion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Match</span>
                    <span className="font-medium">{matchPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`${vibeCheck.passed ? 'text-nocenaBlue' : 'text-nocenaPink'} font-semibold`}>
                      {vibeCheck.passed ? 'ACCESS GRANTED' : 'SYNC ERROR'}
                    </span>
                  </div>
                </>
              )}
              
              {/* For video challenge */}
              {isVideoChallenge && gameResults && (
                <>
                  <div className="flex justify-between">
                    <span>Emotions</span>
                    <span className="font-medium">{gameResults.emotionsMatched}/{gameResults.totalEmotions}</span>
                  </div>
                  {gameResults.streakCount !== undefined && (
                    <div className="flex justify-between">
                      <span>Max Streak</span>
                      <span className="font-medium">{gameResults.streakCount}x</span>
                    </div>
                  )}
                  {gameResults.timeRemaining !== undefined && (
                    <div className="flex justify-between">
                      <span>Time Left</span>
                      <span className="font-medium">{gameResults.timeRemaining}s</span>
                    </div>
                  )}
                  {gameResults.failedEmotion && (
                    <div className="flex justify-between">
                      <span>Failed On</span>
                      <span className="font-medium">{gameResults.failedEmotion}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`${vibeCheck.passed ? 'text-nocenaBlue' : 'text-nocenaPink'} font-semibold`}>
                      {vibeCheck.passed ? 'SYNC COMPLETE' : 'SYNC FAILED'}
                    </span>
                  </div>
                </>
              )}
            </ThematicContainer>
          )}
          
          {/* For video challenge */}
          {isVideoChallenge && gameResults && (
            <>
              <div className="flex justify-between">
                <span>Emotions</span>
                <span className="font-medium">{gameResults.emotionsMatched}/{gameResults.totalEmotions}</span>
              </div>
              {gameResults.streakCount && (
                <div className="flex justify-between">
                  <span>Max Streak</span>
                  <span className="font-medium">{gameResults.streakCount}x</span>
                </div>
              )}
              {gameResults.timeRemaining !== undefined && (
                <div className="flex justify-between">
                  <span>Time Left</span>
                  <span className="font-medium">{gameResults.timeRemaining}s</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`${vibeCheck.passed ? 'text-nocenaBlue' : 'text-nocenaPink'} font-semibold`}>
                  {vibeCheck.passed ? 'Good job' : 'Try again'}
                </span>
              </div>
            </>
          )}
        </ThematicContainer>
      )}

      {/* Buttons */}
      <div className="w-full space-y-3 flex flex-col items-center">
        {/* Retake button */}
        {isVideoChallenge ? (
          <ThematicContainer
            color="nocenaBlue"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeVideo}
            className="py-2 px-8 text-sm text-center"
          >
            Retake video
          </ThematicContainer>
        ) : (
          <ThematicContainer
            color="nocenaBlue"
            glassmorphic={true}
            rounded="xl"
            asButton={true}
            onClick={onRetakeSelfie}
            className="py-2 px-8 text-sm text-center"
          >
            Retake selfie
          </ThematicContainer>
        )}

        {/* Submit button */}
        <div className="w-full">
          <PrimaryButton
            text={vibeCheck?.passed ? 'Continue' : 'Try again'}
            onClick={vibeCheck?.passed ? onSubmit : isVideoChallenge ? onRetakeVideo : onRetakeSelfie}
            className="w-full tracking-wider text-sm"
          />
        </div>

        {/* Footer text */}
        <div className="text-center text-[10px] text-nocenaBlue mt-0 w-full">
          {vibeCheck?.passed 
            ? "Go claim your reward" 
            : "You need to vibe to earn!"}
        </div>
      </div>
    </div>
  );
};

export default ReviewView;