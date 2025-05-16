'use client';

import React, { useState, useEffect } from 'react';
import VideoRecording from './video'; // Updated import path
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
  onComplete: (mediaBlob: Blob, faceData?: any) => void;
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
  // Determine if this challenge is video-only based on challenge id
  const isVideoChallenge = challenge.id === '3';
  
  // Initial stage based on challenge type
  const initialStage = isVideoChallenge ? 'video' : 'selfie';
  
  const [stage, setStage] = useState<'video' | 'selfie' | 'review'>(initialStage);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [faceData, setFaceData] = useState<FaceData | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleVideoComplete = (blob: Blob) => {
    console.log('Video completion handler called with blob size:', blob.size);
    setVideoBlob(blob);
    // For video challenges, go straight to review
    setStage('review');
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
    }
    
    // For selfie challenges, go straight to review
    setStage('review');
  };

  const handleSubmit = () => {
    // Submit the appropriate media blob based on challenge type
    if (isVideoChallenge && videoBlob) {
      onComplete(videoBlob, faceData);
    } else if (!isVideoChallenge && selfieBlob) {
      onComplete(selfieBlob, faceData);
    }
  };

  const handleBack = () => {
    if (stage === 'review') {
      // Go back to the appropriate capture stage
      setStage(isVideoChallenge ? 'video' : 'selfie');
    } else {
      // In capture stage, go back to challenge selection
      onBack();
    }
  };

  const handleRetakeVideo = () => {
    setVideoBlob(null);
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

        {stage === 'review' && (
          <ReviewView
            videoBlob={isVideoChallenge ? videoBlob : null}
            selfieBlob={!isVideoChallenge ? selfieBlob : null}
            faceData={faceData || undefined}
            onSubmit={handleSubmit}
            onRetakeVideo={isVideoChallenge ? handleRetakeVideo : undefined}
            onRetakeSelfie={!isVideoChallenge ? handleRetakeSelfie : undefined}
            isVideoChallenge={isVideoChallenge}
          />
        )}
      </div>
    </div>
  );
};

export default ChallengeCompletion;