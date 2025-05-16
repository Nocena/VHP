// ChallengeMode.tsx
'use client';

import React, { useState } from 'react';
import ThematicContainer from '../ui/ThematicContainer';
import ChallengeCompletion from './ChallengeCompletion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  color: 'nocenaPink' | 'nocenaPurple' | 'nocenaBlue';
  profileImage: string;
  reward: number;
}

interface ChallengeModeProps {
  onSuccess: (token: string) => void;
  onFailed: (error: string) => void;
  apiEndpoint: string;
  onBack?: () => void;
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({
  onSuccess,
  onFailed,
  apiEndpoint,
  onBack,
}) => {
  const [stage, setStage] = useState<'select' | 'capture' | 'success'>('select');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [verificationToken, setVerificationToken] = useState<string>('');

  // Mock challenges with colors
  const challenges: Challenge[] = [
    { 
      id: '1', 
      title: 'Vibe check', 
      description: 'Simply match the random vibe with a selfie',
      color: 'nocenaPink',
      profileImage: '/images/1.jpg',
      reward: 1
    },
    { 
      id: '2', 
      title: 'Mood mashup', 
      description: 'Match two moods at once in one selfie',
      color: 'nocenaPurple',
      profileImage: '/images/2.jpg',
      reward: 5
    },
    { 
      id: '3', 
      title: 'Mood attack', 
      description: 'Match at least 10 moods in 30 second time period',
      color: 'nocenaBlue',
      profileImage: '/images/3.jpg',
      reward: 25
    },
  ];

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setStage('capture');
  };
  
  const handleChallengeComplete = (videoBlob: Blob, selfieBlob: Blob) => {
    // TODO: Submit to API with wallet address
    console.log('Challenge completed!', { videoBlob, selfieBlob, walletAddress });
    
    // Mock successful verification
    const mockToken = 'vhp_challenge_' + Math.random().toString(36).substr(2, 9);
    setVerificationToken(mockToken);
    setStage('success');
    
    // Call onSuccess after showing success state
    setTimeout(() => {
      onSuccess(mockToken);
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack} 
          className="absolute top-0 left-4 text-gray-400 hover:text-white z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {stage === 'select' && (
        <>
          {/* Powered by Nocena */}
          <div className="mb-6 flex flex-col items-center">
            <p className="text-sm text-gray-400 mb-2 font-thin">Powered by</p>
            <img 
              src="/images/logo-full.png" 
              alt="Nocena" 
              className="h-12 object-contain"
            />
          </div>

          {/* Challenges - Full Width */}
          <div className="w-full space-y-4">
            {challenges.map((challenge) => (
              <ThematicContainer
                key={challenge.id}
                asButton={false}
                glassmorphic={true}
                color={challenge.color}
                rounded="xl"
                className="w-full px-6 py-2 cursor-pointer hover:brightness-110 transition-all"
                onClick={() => handleChallengeSelect(challenge)}
              >
                {/* Challenge Title */}
                <div className="text-lg font-light mb-2">{challenge.title}</div>
                
                {/* User and Reward Info Row */}
                <div className="flex items-center justify-between">
                  {/* User Info with Profile Picture */}
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture with Pink Circle */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border border-nocenaPink p-0.5">
                        <img 
                          src={challenge.profileImage} 
                          alt={`${challenge.title} challenger`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    {/* Challenge Description */}
                    <span className="text-sm text-gray-300">{challenge.description}</span>
                  </div>

                  {/* Reward Display - Always Pink */}
                  <ThematicContainer
                    asButton={false}
                    color="nocenaPink"
                    className="px-4 py-1"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xl font-semibold">{challenge.reward}</span>
                      <img src="/nocenix.ico" alt="Nocenix" width={24} height={24} />
                    </div>
                  </ThematicContainer>
                </div>
              </ThematicContainer>
            ))}
          </div>
        </>
      )}

      {stage === 'capture' && selectedChallenge && (
        <ChallengeCompletion
          challenge={selectedChallenge}
          walletAddress={walletAddress}
          onComplete={handleChallengeComplete}
          onBack={() => setStage('select')}
        />
      )}

      {stage === 'success' && (
        <div className="flex flex-col items-center justify-center py-12">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h3 className="text-xl font-medium text-green-400 mb-2">Success!</h3>
          <p className="text-sm text-gray-300 text-center mb-4">Your challenge has been verified</p>
          
          {/* Show verification token */}
          <div className="bg-gray-800/50 rounded-lg px-4 py-2 mb-4">
            <p className="text-xs text-gray-400">Token:</p>
            <p className="text-sm text-white font-mono">{verificationToken}</p>
          </div>
          
          {walletAddress && (
            <p className="text-xs text-gray-400 text-center mb-2">
              Nocenix will be sent to: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
          
          <p className="text-xs text-gray-400">Redirecting...</p>
        </div>
      )}
    </div>
  );
};

export default ChallengeMode;