// components/video/types.ts
import { Dispatch, RefObject, SetStateAction } from 'react';

// Shared types for video components
export type ButtonState = 'idle' | 'countdown' | 'recording';
export type FacingMode = 'user' | 'environment';

// Camera setup related props
export interface CameraProps {
  facingMode: FacingMode;
  setFacingMode: Dispatch<SetStateAction<FacingMode>>;
  videoRef: RefObject<HTMLVideoElement>;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
  setHasPermission: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setVideoReady: Dispatch<SetStateAction<boolean>>;
  hasPermission: boolean;
  error: string | null;
  videoReady: boolean;
  buttonState: ButtonState;
  stream: MediaStream | null;
}

// Emotion detection related props
export interface EmotionDetectorProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoReady: boolean;
  hasPermission: boolean;
  gameActive: boolean;
  targetEmotion: string | null;
  emotionMatchedRecently: boolean;
  setFaceDetected: Dispatch<SetStateAction<boolean>>;
  setDominantEmotion: Dispatch<SetStateAction<string | null>>;
  setEmotionMatchedRecently: Dispatch<SetStateAction<boolean>>;
  setShowSuccessAnimation: Dispatch<SetStateAction<boolean>>;
  setEmotionsMatched: Dispatch<SetStateAction<number>>;
  emotionsMatched: number;
  setTargetEmotion: Dispatch<SetStateAction<string | null>>;
  onEmotionMatch: () => void;
}

// Game controller related props
export interface GameControllerProps {
  stream: MediaStream | null;
  maxDuration: number;
  setButtonState: Dispatch<SetStateAction<ButtonState>>;
  setRecordingTime: Dispatch<SetStateAction<number>>;
  setGameActive: Dispatch<SetStateAction<boolean>>;
  setEmotionsMatched: Dispatch<SetStateAction<number>>;
  setGameWon: Dispatch<SetStateAction<boolean>>;
  setTargetEmotion: Dispatch<SetStateAction<string | null>>;
  setEmotionMatchedRecently: Dispatch<SetStateAction<boolean>>;
  setShowSuccessAnimation: Dispatch<SetStateAction<boolean>>;
  setCountdown: Dispatch<SetStateAction<number | null>>;
  buttonState: ButtonState;
  recordingTime: number;
  gameActive: boolean;
  emotionsMatched: number;
  gameWon: boolean;
  onComplete: (videoBlob: Blob) => void;
}

// UI components props
export interface EmotionDisplayProps {
  faceDetected: boolean;
  dominantEmotion: string | null;
  gameActive: boolean;
  targetEmotion: string | null;
  showSuccessAnimation: boolean;
}

export interface GameUIProps {
  gameActive: boolean;
  emotionsMatched: number;
  recordingTime: number;
  countdown: number | null;
  gameWon: boolean;
  buttonState: ButtonState;
  totalEmotionsToMatch: number;
  onRestartGame: () => void;
  onTimeExpired?: () => void;
}