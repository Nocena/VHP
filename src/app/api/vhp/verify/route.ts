// Mock API endpoint for testing
export async function POST(request: Request) {
    const body = await request.json();
    
    // Simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful verification
    return Response.json({
      success: true,
      token: 'vhp_' + Math.random().toString(36).substr(2, 9),
      message: 'Verification successful'
    });
  }