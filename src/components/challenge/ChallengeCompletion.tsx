import React, { useState, useEffect } from 'react';
import VideoRecording from './VideoRecording';
import SelfieView from './SelfieView';
import ReviewView from './ReviewView';

interface Challenge {
  id: string;
  title: string;
  description: string;
  color: 'nocenaPink' | 'nocenaPurple' | 'nocenaBlue';
  profileImage: string;
}

interface ChallengeCompletionProps {
  challenge: Challenge;
  walletAddress: string;
  onComplete: (videoBlob: Blob, selfieBlob: Blob, faceData?: any) => void;
  onBack: () => void;
}

// Interface for face data including vibe check
interface FaceData {
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
}

const ChallengeCompletion: React.FC<ChallengeCompletionProps> = ({
  challenge,
  walletAddress,
  onComplete,
  onBack,
}) => {
  const [stage, setStage] = useState<'video' | 'selfie' | 'review'>('video');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleVideoComplete = (blob: Blob) => {
    setVideoBlob(blob);
    setStage('selfie');
  };

  const handleSelfieCapture = (media: { 
    type: 'selfie'; 
    file: File; 
    isFrontCamera: boolean;
    faceData?: FaceData;
  }) => {
    // Convert File to Blob
    const blob = new Blob([media.file], { type: media.file.type });
    setSelfieBlob(blob);
    
    // Store face data if provided
    if (media.faceData) {
      setFaceData(media.faceData);
      console.log('Received face data with vibe check:', media.faceData);
    }
    
    setStage('review');
  };

  const handleSubmit = () => {
    if (videoBlob && selfieBlob) {
      // Pass the face data to the completion handler
      onComplete(videoBlob, selfieBlob, faceData);
    }
  };

  const handleBack = () => {
    if (stage === 'selfie') {
      // Go back to video recording
      setSelfieBlob(null);
      setFaceData(null);
      setStage('video');
    } else if (stage === 'review') {
      // Go back to selfie
      setStage('selfie');
    } else {
      // In video stage, go back to challenge selection
      onBack();
    }
  };

  const handleRestartVideo = () => {
    setVideoBlob(null);
    setSelfieBlob(null);
    setFaceData(null);
    setStage('video');
  };

  const handleRetakeSelfie = () => {
    setSelfieBlob(null);
    setFaceData(null);
    setStage('selfie');
  };

  return (
    <div className="flex flex-col w-full h-full mt-10">
      {/* Content */}
      <div className="flex-grow flex flex-col">
        {stage === 'video' && (
          <VideoRecording 
            onComplete={handleVideoComplete} 
            maxDuration={30} 
            challengeTitle={challenge.title}
          />
        )}

        {stage === 'selfie' && (
          <SelfieView 
            onStatusChange={setStatus}
            onMediaCapture={handleSelfieCapture}
            onError={handleBack}
          />
        )}

        {stage === 'review' && videoBlob && selfieBlob && (
          <ReviewView
            videoBlob={videoBlob}
            selfieBlob={selfieBlob}
            faceData={faceData || undefined}
            onSubmit={handleSubmit}
            onRetakeVideo={handleRestartVideo}
            onRetakeSelfie={handleRetakeSelfie}
          />
        )}
      </div>
    </div>
  );
};

export default ChallengeCompletion;