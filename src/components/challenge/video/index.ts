'use client';

// Import components
import VideoRecordingComponent from './VideoRecording';
import CameraSetupComponent from './CameraSetup';
import EmotionDetectorComponent from './EmotionDetector';
import EmotionDisplayComponent from './EmotionDisplay';
import GameUIComponent from './GameUI';

// Import types explicitly
import type { 
  ButtonState as ButtonStateType,
  FacingMode as FacingModeType,
  CameraProps as CameraPropsType,
  EmotionDetectorProps as EmotionDetectorPropsType,
  GameControllerProps as GameControllerPropsType,
  EmotionDisplayProps as EmotionDisplayPropsType,
  GameUIProps as GameUIPropsType
} from './types';

// Re-export components
export const VideoRecording = VideoRecordingComponent;
export const CameraSetup = CameraSetupComponent;
export const EmotionDetector = EmotionDetectorComponent;
export const EmotionDisplay = EmotionDisplayComponent;
export const GameUI = GameUIComponent;

// Re-export types
export type ButtonState = ButtonStateType;
export type FacingMode = FacingModeType;
export type CameraProps = CameraPropsType;
export type EmotionDetectorProps = EmotionDetectorPropsType;
export type GameControllerProps = GameControllerPropsType;
export type EmotionDisplayProps = EmotionDisplayPropsType;
export type GameUIProps = GameUIPropsType;

// Default export
export default VideoRecordingComponent;