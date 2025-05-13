// Updated route.ts with correct imports
// src/app/api/vhp/verify/route.ts
import { NextResponse } from 'next/server';
import { base64ToFloatArray } from '../../../../lib/faceVerification';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Extract required data
    const { selfieData, challengeData } = body;
    
    if (!selfieData || !selfieData.faceVector) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Face data is required' 
        }, 
        { status: 400 }
      );
    }
    
    // Validate face data
    if (!selfieData.isHuman || selfieData.confidence < 70) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Face verification failed',
          details: {
            isHuman: selfieData.isHuman,
            confidence: selfieData.confidence
          }
        }, 
        { status: 400 }
      );
    }
    
    // Store face vector for future verification (simulate)
    // In production, you would store this in your database
    const faceVectorHash = generateSimpleHash(selfieData.faceVector);
    
    // Generate a VHP token for the user
    const vhpToken = `vhp_${faceVectorHash}_${Date.now().toString(36)}`;
    
    // In production, associate this token with the user in your database
    
    // Return verification success response
    return NextResponse.json({
      success: true,
      token: vhpToken, 
      message: 'Verification successful',
      details: {
        faceVerification: {
          confidence: selfieData.confidence,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('VHP verification error:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Verification processing error' 
      }, 
      { status: 500 }
    );
  }
}

// This is just a simple hash function for demo purposes
// In production, use a secure cryptographic function
function generateSimpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

// If you need face matching functionality, implement it here
// This is a simplified version without using the non-existent compareFaceDescriptors function
async function matchFaceWithStored(
  currentFaceVector: string,
  storedFaceVector: string
): Promise<boolean> {
  try {
    // Convert base64 vectors to Float32Array
    const currentDescriptor = base64ToFloatArray(currentFaceVector);
    const storedDescriptor = base64ToFloatArray(storedFaceVector);
    
    // Simple Euclidean distance calculation (simplified)
    let distance = 0;
    const length = Math.min(currentDescriptor.length, storedDescriptor.length);
    
    for (let i = 0; i < length; i++) {
      const diff = currentDescriptor[i] - storedDescriptor[i];
      distance += diff * diff;
    }
    
    distance = Math.sqrt(distance);
    
    // Lower distance = better match, threshold around 0.6 is common
    return distance < 0.6;
  } catch (error) {
    console.error('Face matching error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}