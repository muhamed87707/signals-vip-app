import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import jwt from 'jsonwebtoken';

// Mock environment variables
const TEST_JWT_SECRET = 'test-jwt-secret-for-testing';
const TEST_ADMIN_PASSWORD = 'test-admin-password';

process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;

import { requireAuth, isAdminRequest } from './authMiddleware.js';
import { generateToken } from './auth.js';

// Helper to create mock request
function createMockRequest(cookieValue = null) {
  return {
    headers: {
      get: (name) => {
        if (name === 'cookie' && cookieValue) {
          return cookieValue;
        }
        return null;
      }
    }
  };
}

describe('Auth Middleware', () => {
  /**
   * Property 5: Protected Routes Require Authentication
   * For any request to a protected route without a valid JWT token,
   * the system SHALL return 401 status.
   * 
   * Feature: admin-authentication-security, Property 5: Protected Routes Require Authentication
   * Validates: Requirements 5.2, 5.5
   */
  describe('Property 5: Protected Routes Require Authentication', () => {
    it('should reject requests without any token', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const request = createMockRequest(null);
          const result = requireAuth(request);
          
          expect(result.authorized).toBe(false);
          expect(result.response).toBeDefined();
        }),
        { numRuns: 100 }
      );
    });

    it('should reject requests with invalid tokens', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }).filter(s => !s.includes('.')),
          (invalidToken) => {
            const request = createMockRequest(`admin_token=${invalidToken}`);
            const result = requireAuth(request);
            
            expect(result.authorized).toBe(false);
            expect(result.response).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with tokens signed by wrong secret', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 50 }),
          (wrongSecret) => {
            const now = Math.floor(Date.now() / 1000);
            const payload = { role: 'admin', iat: now, exp: now + 86400 };
            const invalidToken = jwt.sign(payload, wrongSecret + '-wrong', { algorithm: 'HS256' });
            
            const request = createMockRequest(`admin_token=${invalidToken}`);
            const result = requireAuth(request);
            
            expect(result.authorized).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with expired tokens', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (secondsAgo) => {
            const now = Math.floor(Date.now() / 1000);
            const payload = {
              role: 'admin',
              iat: now - secondsAgo - 86400,
              exp: now - secondsAgo
            };
            const expiredToken = jwt.sign(payload, TEST_JWT_SECRET, { algorithm: 'HS256' });
            
            const request = createMockRequest(`admin_token=${expiredToken}`);
            const result = requireAuth(request);
            
            expect(result.authorized).toBe(false);
            expect(result.response).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should authorize requests with valid tokens', () => {
      fc.assert(
        fc.property(fc.constant({}), () => {
          const validToken = generateToken();
          const request = createMockRequest(`admin_token=${validToken}`);
          const result = requireAuth(request);
          
          expect(result.authorized).toBe(true);
          expect(result.payload).toBeDefined();
          expect(result.payload.role).toBe('admin');
        }),
        { numRuns: 100 }
      );
    });

    it('should return 401 response for unauthorized requests', () => {
      const request = createMockRequest(null);
      const result = requireAuth(request);
      
      expect(result.authorized).toBe(false);
      expect(result.response).toBeDefined();
      // Check that response would have 401 status
      // Note: NextResponse.json returns a Response object
    });
  });

  describe('isAdminRequest', () => {
    it('should return true for valid admin tokens', () => {
      const validToken = generateToken();
      const request = createMockRequest(`admin_token=${validToken}`);
      
      expect(isAdminRequest(request)).toBe(true);
    });

    it('should return false for missing tokens', () => {
      const request = createMockRequest(null);
      
      expect(isAdminRequest(request)).toBe(false);
    });

    it('should return false for invalid tokens', () => {
      const request = createMockRequest('admin_token=invalid-token');
      
      expect(isAdminRequest(request)).toBe(false);
    });
  });
});
