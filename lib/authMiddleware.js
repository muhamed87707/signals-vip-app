import { NextResponse } from 'next/server';
import { verifyAuth } from './auth';

/**
 * Middleware to protect API routes that require admin authentication
 * @param {Request} request - Next.js request object
 * @returns {{ authorized: boolean, response?: NextResponse, payload?: Object }}
 */
export function requireAuth(request) {
  const authResult = verifyAuth(request);

  if (!authResult.authenticated) {
    return {
      authorized: false,
      response: NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Unauthorized',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    };
  }

  return {
    authorized: true,
    payload: authResult.payload
  };
}

/**
 * Helper function to wrap protected route handlers
 * @param {Function} handler - The route handler function
 * @returns {Function} Wrapped handler that checks authentication first
 */
export function withAuth(handler) {
  return async (request, context) => {
    const authCheck = requireAuth(request);
    
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Add auth payload to request for use in handler
    request.auth = authCheck.payload;
    
    return handler(request, context);
  };
}

/**
 * Check if request is from admin (for routes that have mixed access)
 * @param {Request} request - Next.js request object
 * @returns {boolean} True if request has valid admin token
 */
export function isAdminRequest(request) {
  const authResult = verifyAuth(request);
  return authResult.authenticated;
}
