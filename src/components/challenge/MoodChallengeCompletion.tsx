// MoodChallengeCompletion.tsx - Fixed TypeScript errors
import React, { useState } from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import SelfieView from './SelfieView';
import DualMoodSelfieView from './DualMoodSelfieView';
import MoodStreakVideo from './MoodStreakVideo';
import ReviewView from './ReviewView';
import { getRandomEmotion } from '../../lib/faceVerification';

interface Challenge {
  id: string;
  title: string;
  description: string;
  color: 'nocenaPink' | 'nocenaPurple' | 'nocenaBlue';
  profileImage: string;
  reward: number;
}

interface MoodChallengeCompletionProps {
  challenge: Challenge;
  walletAddress: string;
  onComplete: (videoBlob: Blob, selfieBlob: Blob) => void;
  onBack: () => void;
}

const MoodChallengeCompletion: React.FC<MoodChallengeCompletionProps> = ({
  challenge,
  walletAddress,
  onComplete,
  onBack,
}) => {
  const [stage, setStage] = useState<'intro' | 'capture' | 'review'>('intro');
  const [status, setStatus] = useState('Ready to start');
  const [mediaCaptured, setMediaCaptured] = useState<{
    videoBlob?: Blob;
    selfieBlob?: Blob;
    faceData?: any;
  }>({});

  // For challenge 2 (mood mashup)
  const [dualEmotions] = useState([getRandomEmotion(), getRandomEmotion()]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleMediaCapture = (result: any) => {
    console.log('Media captured:', result);
    
    // Handle different media types based on challenge
    if (challenge.id === '1') {
      // Simple vibe check - single selfie
      if (result.type === 'selfie') {
        setMediaCaptured({
          selfieBlob: result.file,
          faceData: result.faceData
        });
        setStage('review');
      }
    } else if (challenge.id === '2') {
      // Dual mood challenge
      setMediaCaptured({
        selfieBlob: result.file,
        faceData: result.faceData,
      });
      setStage('review');
    } else if (challenge.id === '3') {
      // Mood streak challenge
      setMediaCaptured({
        videoBlob: result.videoBlob,
        selfieBlob: result.selfieBlob,
        faceData: result.faceData,
      });
      setStage('review');
    }
  };

  const handleSubmit = () => {
    if (mediaCaptured.videoBlob && mediaCaptured.selfieBlob) {
      onComplete(mediaCaptured.videoBlob, mediaCaptured.selfieBlob);
    } else if (mediaCaptured.selfieBlob) {
      // For challenge types without video, create a dummy video blob (in real implementation this would be handled differently)
      const dummyVideoBlob = new Blob([], { type: 'video/webm' });
      onComplete(dummyVideoBlob, mediaCaptured.selfieBlob);
    }
  };

  const renderChallengeContent = () => {
    if (stage === 'intro') {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">{challenge.title}</h2>
          <p className="text-gray-300 mb-6">{challenge.description}</p>
          
          {/* Challenge-specific instructions */}
          {challenge.id === '1' && (
            <p className="mb-6 text-cyan-400">Match a random emotion with your best selfie!</p>
          )}
          {challenge.id === '2' && (
            <p className="mb-6 text-pink-400">Try to express two emotions at the same time!</p>
          )}
          {challenge.id === '3' && (
            <p className="mb-6 text-blue-400">Race against the clock to match as many emotions as possible!</p>
          )}
          
          <PrimaryButton
            text="START CHALLENGE"
            onClick={() => setStage('capture')}
            className="w-full"
          />
        </div>
      );
    }
    
    if (stage === 'capture') {
      // Return the appropriate component based on challenge type
      if (challenge.id === '1') {
        return (
          <SelfieView
            onStatusChange={handleStatusChange}
            onMediaCapture={handleMediaCapture}
            onError={onBack}
          />
        );
      } else if (challenge.id === '2') {
        return (
          <DualMoodSelfieView
            emotions={dualEmotions}
            onCapture={handleMediaCapture}
            onStatusChange={handleStatusChange}
            onError={onBack}
          />
        );
      } else if (challenge.id === '3') {
        return (
          <MoodStreakVideo
            onComplete={handleMediaCapture}
            onStatusChange={handleStatusChange}
            onError={onBack}
          />
        );
      }
    }
    
    if (stage === 'review') {
      return (
        <ReviewView
          videoBlob={mediaCaptured.videoBlob || new Blob([], { type: 'video/webm' })}
          selfieBlob={mediaCaptured.selfieBlob || new Blob([], { type: 'image/jpeg' })}
          faceData={mediaCaptured.faceData}
          challengeType={challenge.id}
          onSubmit={handleSubmit}
          onRetakeVideo={() => setStage('capture')}
          onRetakeSelfie={() => setStage('capture')}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-black/50 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center flex-1">
          <div className="text-xs text-gray-400">Challenge</div>
          <div className="text-white font-bold">{challenge.title}</div>
        </div>
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Status bar */}
      <div 
        className={`px-4 py-2 text-sm text-center ${
          status.includes('✅') ? 'bg-green-900/30' : 
          status.includes('❌') ? 'bg-red-900/30' : 'bg-blue-900/30'
        }`}
      >
        {status}
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {renderChallengeContent()}
      </div>
    </div>
  );
};

export default MoodChallengeCompletion;