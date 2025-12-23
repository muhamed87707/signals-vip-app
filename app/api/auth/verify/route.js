import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const authResult = verifyAuth(request);

    if (authResult.authenticated) {
      // Calculate expiration time from payload
      const expiresAt = authResult.payload?.exp 
        ? new Date(authResult.payload.exp * 1000).toISOString()
        : null;

      return NextResponse.json({
        authenticated: true,
        expiresAt
      });
    }

    return NextResponse.json({
      authenticated: false,
      error: authResult.error || 'Not authenticated'
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({
      authenticated: false,
      error: 'Verification failed'
    });
  }
}
