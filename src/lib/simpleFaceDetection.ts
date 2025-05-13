/**
 * A simple face detection with mock vibe check results
 */
export async function detectFaceSimple(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  requestedEmotion?: string
): Promise<SimpleFaceResult> {
  return new Promise((resolve) => {
    console.log('Using simplified face detection as fallback with vibe check');
    
    // List of possible emotions
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted', 'neutral'];
    
    // If no emotion is requested, pick a random one
    const requestedEmotionValue = requestedEmotion || emotions[Math.floor(Math.random() * emotions.length)];
    
    // Get emoji for the emotion
    const emojiMap: Record<string, string> = {
      neutral: '😐',
      happy: '😀',
      sad: '😢',
      angry: '😡',
      fearful: '😨',
      disgusted: '🤢',
      surprised: '😲'
    };
    
    // Simulate either matching the requested emotion or picking another one
    const matchRequested = Math.random() > 0.2; // 80% chance of "success" for demo purposes
    const dominantEmotion = matchRequested ? requestedEmotionValue : emotions.filter(e => e !== requestedEmotionValue)[Math.floor(Math.random() * (emotions.length - 1))];
    
    // Generate a match score between 70-100 for the dominant emotion
    const matchScore = Math.floor(Math.random() * 30) + 70;
    
    // Format the emotion name for display
    const formatEmotion = (emotion: string) => emotion.charAt(0).toUpperCase() + emotion.slice(1);
    
    // Create fake emotion scores
    const detectedEmotions: Record<string, number> = {};
    emotions.forEach(emotion => {
      if (emotion === dominantEmotion) {
        detectedEmotions[emotion] = matchScore / 100;
      } else {
        detectedEmotions[emotion] = Math.random() * 0.3; // Lower scores for non-dominant emotions
      }
    });
    
    // For hackathon purposes, always return a successful result
    // but simulate the real API behavior
    resolve({
      isHuman: true,
      confidence: 85,
      message: 'Verification completed',
      vibeCheck: {
        requestedEmotion: requestedEmotionValue,
        detectedEmotions,
        dominantEmotion,
        matchScore,
        passed: matchRequested, // Success if we matched the requested emotion
        message: matchRequested
          ? `Great ${formatEmotion(requestedEmotionValue)} vibe! ${emojiMap[requestedEmotionValue]}`
          : `Try to look more ${requestedEmotionValue}! ${emojiMap[requestedEmotionValue]}`
      }
    });
  });
}

export interface SimpleFaceResult {
  isHuman: boolean;
  confidence: number;
  message?: string;
  vibeCheck?: {
    requestedEmotion?: string;
    detectedEmotions?: Record<string, number>;
    dominantEmotion: string;
    matchScore: number;
    passed: boolean;
    message: string;
  };
}