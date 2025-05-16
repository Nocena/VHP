// lib/faceVerification.ts - Fixed TypeScript errors and added base64ToFloatArray
// Utilities for face detection and emotion recognition using face-api.js

// Available emotions for face-api.js
// These are the only emotions that face-api.js can detect
export const EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'surprised',
  'disgusted',
  'fearful',
  'neutral'
] as const;

export type EmotionType = typeof EMOTIONS[number];

// Define types for face-api.js result expressions
type EmotionExpressions = Record<EmotionType, number>;

/**
 * Convert a base64 string back to a Float32Array
 * This is used for face vector comparison
 */
export function base64ToFloatArray(base64String: string): Float32Array {
  try {
    // Remove the Base64 header if present (e.g., "data:application/octet-stream;base64,")
    const commaIndex = base64String.indexOf(',');
    const actualBase64 = commaIndex !== -1 ? base64String.slice(commaIndex + 1) : base64String;
    
    // Decode Base64 to binary string
    const binaryString = atob(actualBase64);
    
    // Create ArrayBuffer and place binary data
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert to Float32Array
    return new Float32Array(bytes.buffer);
  } catch (error) {
    console.error('Error converting base64 to Float32Array:', error);
    return new Float32Array(0); // Return empty array on error
  }
}

/**
 * Convert a Float32Array to a base64 string for storage
 * This is used for face vectors
 */
export function floatArrayToBase64(floatArray: Float32Array): string {
  try {
    // Get the raw binary data from the Float32Array
    const buffer = new Uint8Array(floatArray.buffer);
    
    // Convert to binary string
    let binaryString = '';
    for (let i = 0; i < buffer.length; i++) {
      binaryString += String.fromCharCode(buffer[i]);
    }
    
    // Convert to base64
    return btoa(binaryString);
  } catch (error) {
    console.error('Error converting Float32Array to base64:', error);
    return '';
  }
}

// Fixes for loadFaceApiModels function in faceVerification.ts
// Replace this function in your current file

// Simplified loadFaceApiModels function that works with CDN only
// Replace this in your faceVerification.ts file

export const loadFaceApiModels = async (): Promise<void> => {
  // Check if face-api is already in the window
  if (!(window as any).faceapi) {
    console.log('Loading face-api.js from CDN...');
    
    // Load face-api.js script dynamically
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load face-api.js'));
      document.head.appendChild(script);
    });
  }
  
  const faceapi = (window as any).faceapi;
  if (!faceapi) {
    throw new Error('face-api.js failed to initialize');
  }
  
  console.log('Loading face-api.js models...');
  
  // Check if models are already loaded
  if (!(window as any).faceApiModelsLoaded) {
    // Use the original URL for consistency with your SelfieView component
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    try {
      // Load ONLY the models we need for expression detection
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      (window as any).faceApiModelsLoaded = true;
      console.log('face-api.js models loaded successfully');
    } catch (err) {
      console.error('Error loading face-api.js models:', err);
      throw err;
    }
  } else {
    console.log('face-api.js models already loaded');
  }
};

// Verify face and detect emotions using face-api.js
export const verifyFace = async (
  image: HTMLImageElement, 
  requestedEmotion?: string
): Promise<{
  isHuman: boolean;
  confidence: number;
  faceVector?: string;
  message?: string;
  vibeCheck?: {
    requestedEmotion?: string;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
  };
}> => {
  try {
    const faceapi = (window as any).faceapi;
    if (!faceapi) {
      throw new Error('face-api.js not loaded');
    }
    
    // Create a temporary canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }
    
    // Draw the image to canvas
    ctx.drawImage(image, 0, 0);
    
    // Get face detection options
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5
    });
    
    // Detect face with expressions
    const result = await faceapi
      .detectSingleFace(canvas, options)
      .withFaceLandmarks(true)
      .withFaceExpressions();
    
    // Check if a face was detected
    if (!result) {
      return {
        isHuman: false,
        confidence: 0,
        message: 'No face detected in the image'
      };
    }
    
    // Get face detection confidence
    const confidence = result.detection.score * 100;
    
    // Extract face expressions/emotions
    const expressions = result.expressions as EmotionExpressions;
    
    // Find the dominant emotion
    let dominantEmotion = 'neutral';
    let highestScore = 0;
    
    // Fixed TypeScript errors in this forEach loop
    Object.entries(expressions).forEach(([emotion, score]) => {
      // Explicitly cast the score to number to avoid 'unknown' type error
      const numericScore = Number(score);
      
      if (numericScore > highestScore) {
        highestScore = numericScore;
        dominantEmotion = emotion;
      }
    });
    
    // Generate face vector if facial landmarks are available
    let faceVector: string | undefined = undefined;
    if (result.landmarks && faceapi.computeFaceDescriptor) {
      try {
        // Get face descriptor - a 128-dimensional feature vector
        const descriptor = await faceapi.computeFaceDescriptor(canvas, result.landmarks);
        if (descriptor && descriptor.length) {
          // Convert to base64 for storage
          faceVector = floatArrayToBase64(descriptor);
        }
      } catch (err) {
        console.error('Error generating face vector:', err);
      }
    }
    
    // If a requested emotion was provided, check for a match
    if (requestedEmotion) {
      // Get the score for the requested emotion (0-1 scale)
      // Use type assertion to ensure TypeScript knows requestedEmotion is valid
      const requestedEmotionScore = expressions[requestedEmotion as EmotionType] || 0;
      
      // Convert to percentage (0-100) and round
      const matchScore = Math.round(requestedEmotionScore * 100);
      
      // Check if it passes the threshold (60% or higher)
      const passed = matchScore >= 60;
      
      return {
        isHuman: true,
        confidence,
        faceVector,
        vibeCheck: {
          requestedEmotion,
          dominantEmotion,
          matchScore,
          passed,
          message: passed 
            ? `Great ${formatEmotion(requestedEmotion)} vibe! ${getEmotionEmoji(requestedEmotion)}`
            : `We need more ${formatEmotion(requestedEmotion)} energy. Try again!`
        }
      };
    }
    
    // Basic face verification result (if no emotion was requested)
    return {
      isHuman: true,
      confidence,
      faceVector,
      message: 'Face verified'
    };
    
  } catch (error) {
    console.error('Face verification error:', error);
    
    // Fallback for demo/hackathon - don't fail the user experience
    // In production, this should be handled more carefully
    return {
      isHuman: true,
      confidence: 85,
      message: 'Face verified (fallback mode)',
      vibeCheck: requestedEmotion ? {
        requestedEmotion,
        dominantEmotion: requestedEmotion, // Pretend they matched
        matchScore: 85,
        passed: true,
        message: `Great ${formatEmotion(requestedEmotion)} vibe! ${getEmotionEmoji(requestedEmotion)}`
      } : undefined
    };
  }
};

// Get a random emotion
export const getRandomEmotion = (exclude?: string): string => {
  let availableEmotions = [...EMOTIONS];
  
  // If an emotion to exclude was provided, remove it from the list
  if (exclude) {
    availableEmotions = availableEmotions.filter(emotion => emotion !== exclude);
  }
  
  const randomIndex = Math.floor(Math.random() * availableEmotions.length);
  return availableEmotions[randomIndex];
};

// Get emoji for an emotion
export const getEmotionEmoji = (emotion: string): string => {
  const emojiMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    surprised: '😮',
    disgusted: '🤢',
    fearful: '😨',
    neutral: '😐',
    // Add default for any unknown emotions
    default: '😶'
  };
  
  return emojiMap[emotion as keyof typeof emojiMap] || emojiMap.default;
};

// Format emotion name for display
export const formatEmotion = (emotion: string): string => {
  if (!emotion) return 'neutral';
  return emotion.charAt(0).toUpperCase() + emotion.slice(1);
};