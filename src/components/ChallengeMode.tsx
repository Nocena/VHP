'use client';

import React, { useState } from 'react';
import ThematicContainer from './ThematicContainer';

interface Challenge {
  id: string;
  title: string;
  description: string;
  color: 'nocenaPink' | 'nocenaPurple' | 'nocenaBlue';
  profileImage: string;
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
  const [stage, setStage] = useState<'select' | 'capture'>('select');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Mock challenges with colors
  const challenges: Challenge[] = [
    { 
      id: '1', 
      title: 'Touch Grass', 
      description: 'Go outside and touch some grass',
      color: 'nocenaPink',
      profileImage: '/images/1.jpg'
    },
    { 
      id: '2', 
      title: 'High-five Yourself', 
      description: 'Give yourself a high-five in the mirror',
      color: 'nocenaPurple',
      profileImage: '/images/2.jpg'
    },
    { 
      id: '3', 
      title: 'Do 3 Squats', 
      description: 'Complete 3 squats',
      color: 'nocenaBlue',
      profileImage: '/images/3.jpg'
    },
  ];

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setStage('capture');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 text-gray-400 hover:text-white z-10"
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

          {/* Wallet Input Section */}
          <div className="mb-6">
            <p className="text-base text-gray-300 text-center mb-3 font-thin">
              Enter your EVM wallet address if you want to be rewarded with Nocenix
            </p>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
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
                <div className="text-xl font-thin mb-2">{challenge.title}</div>
                
                {/* User and Reward Info Row */}
                <div className="flex items-center justify-between">
                  {/* User Info with Profile Picture */}
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture with Pink Circle */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border border-nocenaPink p-1">
                        <img 
                          src={challenge.profileImage} 
                          alt={`${challenge.title} challenger`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                    {/* Challenge Description */}
                    <span className="text-sm text-gray-300 font-thin">{challenge.description}</span>
                  </div>

                  {/* Reward Display - Always Pink */}
                  <ThematicContainer
                    asButton={false}
                    color="nocenaPink"
                    className="px-4 py-1 ml-4"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-xl font-semibold">1</span>
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
        <div className="flex flex-col items-center justify-center py-8">
          <h2 className="text-xl font-medium text-white mb-4">
            {selectedChallenge.title}
          </h2>
          <p className="text-gray-300 mb-6">
            {selectedChallenge.description}
          </p>
          {/* TODO: Add camera/video capture component here */}
          <p className="text-sm text-gray-400">Camera capture will go here</p>
        </div>
      )}
    </div>
  );
};

export default ChallengeMode;