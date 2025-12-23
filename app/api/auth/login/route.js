import { NextResponse } from 'next/server';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password against environment variable
    const passwordResult = verifyPassword(password);

    if (!passwordResult.valid) {
      // Return 401 for invalid password or configuration error
      const status = passwordResult.error === 'Server configuration error' ? 500 : 401;
      return NextResponse.json(
        { success: false, error: passwordResult.error },
        { status }
      );
    }

    // Generate JWT token
    const token = generateToken();

    // Create response with success message
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
