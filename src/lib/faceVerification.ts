// Enhanced faceVerification.ts with Vibe Check feature
import * as faceapi from 'face-api.js';

declare module 'face-api.js' {
  interface FaceExpressions {
    [key: string]: number;
  }
}

export interface FaceVerificationResult {
  isHuman: boolean;
  confidence: number;
  faceVector?: string; // Base64 string of face descriptor
  message?: string;
  vibeCheck?: {
    requestedEmotion?: string;
    detectedEmotions: Record<string, number>;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
  };
}

// All possible emotions that face-api.js can detect
export const EMOTIONS = [
  'neutral', 
  'happy', 
  'sad', 
  'angry', 
  'fearful', 
  'disgusted', 
  'surprised'
];

// Track model loading status
let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

/**
 * Loads all required face-api.js models - using CDN for reliability
 */
export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelLoadingPromise) return modelLoadingPromise;
  
  // Create a promise that we can reuse if this is called multiple times during loading
  modelLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      // Use CDN-hosted models instead of local ones
      // These are guaranteed to be compatible with the face-api.js version
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      
      console.log('Loading face-api.js models from CDN:', MODEL_URL);
      
      // Load models one by one for better error tracking
      console.log('Loading tiny face detector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      console.log('Loading face landmark model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      console.log('Loading face recognition model...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      console.log('Loading face expression model...');
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      
      modelsLoaded = true;
      console.log('All face-api.js models loaded successfully');
      resolve();
    } catch (error) {
      console.error('Error loading Face-API models:', error instanceof Error ? error.message : String(error));
      reject(new Error(`Failed to load face detection models: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
  
  return modelLoadingPromise;
}

/**
 * Pick a random emotion for the vibe check
 */
export function getRandomEmotion(): string {
  // Exclude neutral for more interesting challenges
  const emojisWithoutNeutral = EMOTIONS.filter(e => e !== 'neutral');
  const randomIndex = Math.floor(Math.random() * emojisWithoutNeutral.length);
  return emojisWithoutNeutral[randomIndex];
}

/**
 * Get an emoji representing the emotion
 */
export function getEmotionEmoji(emotion: string): string {
  const emojiMap: Record<string, string> = {
    neutral: '😐',
    happy: '😀',
    sad: '😢',
    angry: '😡',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲'
  };
  
  return emojiMap[emotion] || '❓';
}

/**
 * Convert emotion name to nice display format
 */
export function formatEmotion(emotion: string): string {
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
}

/**
 * Verifies if an image contains a human face and performs vibe check
 */
export async function verifyFace(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  requestedEmotion?: string
): Promise<FaceVerificationResult> {
  try {
    // Ensure models are loaded
    if (!modelsLoaded) {
      await loadFaceApiModels();
    }
    
    // Detection options
    const options = new faceapi.TinyFaceDetectorOptions({ 
      inputSize: 320,
      scoreThreshold: 0.5
    });
    
    // Run full detection
    const detectionWithDescriptors = await faceapi
      .detectSingleFace(imageElement, options)
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();
    
    // No face detected
    if (!detectionWithDescriptors) {
      return {
        isHuman: false,
        confidence: 0,
        message: 'No face detected in image'
      };
    }
    
    const { detection, descriptor, expressions, landmarks } = detectionWithDescriptors;
    
    // Check detection quality
    if (detection.score < 0.7) {
      return {
        isHuman: false,
        confidence: detection.score * 100,
        message: 'Low confidence face detection'
      };
    }
    
    // Check for key facial features visibility
    const faceFeaturesVisible = checkFaceFeaturesVisibility(landmarks);
    if (!faceFeaturesVisible.allFeaturesVisible) {
      return {
        isHuman: false,
        confidence: 30,
        message: `Missing facial features: ${faceFeaturesVisible.missingFeatures.join(', ')}`
      };
    }
    
    // Calculate face size relative to image (face too small may indicate fake/distant)
    const imageArea = imageElement.width * imageElement.height;
    const faceBox = detection.box;
    const faceArea = faceBox.width * faceBox.height;
    const faceToImageRatio = faceArea / imageArea;
    
    if (faceToImageRatio < 0.03) { // Face is less than 3% of the image
      return {
        isHuman: false,
        confidence: 40,
        message: 'Face too small in frame'
      };
    }
    
    // Convert face descriptor to base64 for storage - fixed for browser
    const faceVector = floatArrayToBase64(descriptor);
    
    // Calculate confidence score (0-100)
    const confidenceScore = calculateConfidenceScore(
      detection.score,
      expressions,
      faceToImageRatio
    );
    
    // Find dominant emotion
    const emotionEntries = Object.entries(expressions);
    emotionEntries.sort((a, b) => b[1] - a[1]);
    const dominantEmotion = emotionEntries[0][0];
    
    // Process vibe check if requested
    let vibeCheck;
    if (requestedEmotion) {
      const emotionScore = expressions[requestedEmotion] || 0;
      const passed = emotionScore > 0.3; // Threshold for considering emotion successfully displayed
      
      vibeCheck = {
        requestedEmotion,
        detectedEmotions: { ...expressions },
        dominantEmotion,
        matchScore: Math.round(emotionScore * 100),
        passed,
        message: passed 
          ? `Great ${formatEmotion(requestedEmotion)} vibe! ${getEmotionEmoji(requestedEmotion)}` 
          : `Try to look more ${requestedEmotion}! ${getEmotionEmoji(requestedEmotion)}`
      };
    } else {
      // If no specific emotion was requested, just report the dominant emotion
      vibeCheck = {
        detectedEmotions: { ...expressions },
        dominantEmotion,
        matchScore: Math.round(expressions[dominantEmotion] * 100),
        passed: true,
        message: `Your vibe is ${formatEmotion(dominantEmotion)} ${getEmotionEmoji(dominantEmotion)}`
      };
    }
    
    return {
      isHuman: confidenceScore > 70,
      confidence: confidenceScore,
      faceVector,
      vibeCheck
    };
  } catch (error) {
    console.error('Face verification error:', error instanceof Error ? error.message : String(error));
    return {
      isHuman: false,
      confidence: 0,
      message: `Error during face analysis: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Checks if all key facial features are visible
 */
function checkFaceFeaturesVisibility(landmarks: faceapi.FaceLandmarks68) {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();
  const mouth = landmarks.getMouth();
  
  const missingFeatures = [];
  
  if (leftEye.length === 0) missingFeatures.push('left eye');
  if (rightEye.length === 0) missingFeatures.push('right eye');
  if (nose.length === 0) missingFeatures.push('nose');
  if (mouth.length === 0) missingFeatures.push('mouth');
  
  return {
    allFeaturesVisible: missingFeatures.length === 0,
    missingFeatures
  };
}

/**
 * Calculates a confidence score (0-100) based on various factors
 */
function calculateConfidenceScore(
  detectionScore: number,
  expressions: faceapi.FaceExpressions,
  faceToImageRatio: number
): number {
  // Base score from detection confidence
  let score = detectionScore * 50; // 0-50 range
  
  // Add points for appropriate face size (10-30 points)
  // Ideal face takes up 10-30% of image
  const faceRatioScore = Math.min(faceToImageRatio * 100, 30);
  score += faceRatioScore;
  
  // Check for expression variance (up to 20 points)
  // Real faces usually have some expression, not perfectly neutral
  const expressionValues = Object.values(expressions);
  const expressionVariance = calculateVariance(expressionValues);
  const expressionScore = Math.min(expressionVariance * 1000, 20);
  score += expressionScore;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculates variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Convert Float32Array to Base64 string - browser-safe implementation
 */
function floatArrayToBase64(float32Array: Float32Array): string {
  // Get the underlying buffer
  const buffer = float32Array.buffer;
  const bytes = new Uint8Array(buffer);
  
  // Convert to a binary string
  let binaryString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  // Convert to base64
  return btoa(binaryString);
}

/**
 * Convert Base64 string back to Float32Array - browser-safe implementation
 */
export function base64ToFloatArray(base64: string): Float32Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Float32Array(bytes.buffer);
}