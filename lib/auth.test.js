import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import jwt from 'jsonwebtoken';

// Mock environment variables before importing auth module
const TEST_JWT_SECRET = 'test-jwt-secret-for-testing';
const TEST_ADMIN_PASSWORD = 'test-admin-password';

// Set up environment variables
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;

// Import after setting env vars
import {
  generateToken,
  verifyToken,
  verifyPassword,
  setAuthCookie,
  clearAuthCookie,
  getTokenFromRequest,
  verifyAuth,
  AUTH_COOKIE_NAME
} from './auth.js';

describe('Auth Library', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;
  });

  /**
   * Property 3: Token Round-Trip Consistency
   * For any valid JWT token, encoding the claims then decoding the token
   * SHALL produce equivalent claims (role, iat, exp).
   * 
   * Feature: admin-authentication-security, Property 3: Token Round-Trip Consistency
   * Validates: Requirements 6.3
   */
  describe('Property 3: Token Round-Trip Consistency', () => {
    it('should produce equivalent claims when encoding then decoding', () => {
      fc.assert(
        fc.property(
          fc.record({
            customField: fc.string({ minLength: 0, maxLength: 50 }),
            userId: fc.integer({ min: 1, max: 1000000 })
          }),
          (additionalPayload) => {
            // Generate token with additional payload
            const token = generateToken(additionalPayload);
            
            // Verify and decode the token
            const result = verifyToken(token);
            
            // Token should be valid
            expect(result.valid).toBe(true);
            expect(result.payload).toBeDefined();
            
            // Required claims should be present
            expect(result.payload.role).toBe('admin');
            expect(typeof result.payload.iat).toBe('number');
            expect(typeof result.payload.exp).toBe('number');
            
            // Expiration should be 24 hours after issued time
            expect(result.payload.exp - result.payload.iat).toBe(24 * 60 * 60);
            
            // Additional payload should be preserved
            expect(result.payload.customField).toBe(additionalPayload.customField);
            expect(result.payload.userId).toBe(additionalPayload.userId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve role claim through round-trip', () => {
      fc.assert(
        fc.property(fc.constant({}), () => {
          const token = generateToken();
          const result = verifyToken(token);
          
          expect(result.valid).toBe(true);
          expect(result.payload.role).toBe('admin');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Token Validation Rejects Invalid Tokens
   * For any token that has an invalid signature, is expired, or has malformed structure,
   * the verification function SHALL reject it and return an appropriate error.
   * 
   * Feature: admin-authentication-security, Property 4: Token Validation Rejects Invalid Tokens
   * Validates: Requirements 6.2, 6.4, 6.5
   */
  describe('Property 4: Token Validation Rejects Invalid Tokens', () => {
    it('should reject tokens with invalid signatures', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          (wrongSecret) => {
            // Generate token with wrong secret
            const payload = { role: 'admin', iat: Math.floor(Date.now() / 1000) };
            payload.exp = payload.iat + 86400;
            const invalidToken = jwt.sign(payload, wrongSecret + '-different', { algorithm: 'HS256' });
            
            // Verification should fail
            const result = verifyToken(invalidToken);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject expired tokens', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (secondsAgo) => {
            // Create an expired token
            const now = Math.floor(Date.now() / 1000);
            const payload = {
              role: 'admin',
              iat: now - secondsAgo - 86400,
              exp: now - secondsAgo
            };
            const expiredToken = jwt.sign(payload, TEST_JWT_SECRET, { algorithm: 'HS256' });
            
            // Verification should fail with expiration error
            const result = verifyToken(expiredToken);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Token expired');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject malformed tokens', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (randomString) => {
            // Skip strings that might accidentally be valid JWT format
            if (randomString.split('.').length === 3) return;
            
            const result = verifyToken(randomString);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject tokens with missing role claim', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iat: now,
        exp: now + 86400
        // Missing role claim
      };
      const tokenWithoutRole = jwt.sign(payload, TEST_JWT_SECRET, { algorithm: 'HS256' });
      
      const result = verifyToken(tokenWithoutRole);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token claims');
    });

    it('should reject tokens with wrong role', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s !== 'admin'),
          (wrongRole) => {
            const now = Math.floor(Date.now() / 1000);
            const payload = {
              role: wrongRole,
              iat: now,
              exp: now + 86400
            };
            const tokenWithWrongRole = jwt.sign(payload, TEST_JWT_SECRET, { algorithm: 'HS256' });
            
            const result = verifyToken(tokenWithWrongRole);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid token claims');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null or undefined tokens', () => {
      expect(verifyToken(null).valid).toBe(false);
      expect(verifyToken(undefined).valid).toBe(false);
      expect(verifyToken('').valid).toBe(false);
    });
  });
});


describe('Password Verification', () => {
  /**
   * Property 1: Password Verification Correctness
   * For any password input, if it matches the ADMIN_PASSWORD environment variable,
   * the login API SHALL return success with a valid JWT token; otherwise it SHALL return failure.
   * 
   * Feature: admin-authentication-security, Property 1: Password Verification Correctness
   * Validates: Requirements 1.2, 1.4, 1.5
   */
  describe('Property 1: Password Verification Correctness', () => {
    it('should return success only for correct password', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (password) => {
            const result = verifyPassword(password);
            
            if (password === TEST_ADMIN_PASSWORD) {
              // Correct password should succeed
              expect(result.valid).toBe(true);
              expect(result.error).toBeUndefined();
            } else {
              // Incorrect password should fail
              expect(result.valid).toBe(false);
              expect(result.error).toBe('Invalid password');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always succeed for the correct password', () => {
      // Test multiple times to ensure consistency
      for (let i = 0; i < 100; i++) {
        const result = verifyPassword(TEST_ADMIN_PASSWORD);
        expect(result.valid).toBe(true);
      }
    });

    it('should always fail for incorrect passwords', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s !== TEST_ADMIN_PASSWORD),
          (wrongPassword) => {
            const result = verifyPassword(wrongPassword);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid password');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Password Never Exposed in Responses
   * For any API response from the authentication system,
   * the response body SHALL NOT contain the ADMIN_PASSWORD value.
   * 
   * Feature: admin-authentication-security, Property 6: Password Never Exposed in Responses
   * Validates: Requirements 1.3
   */
  describe('Property 6: Password Never Exposed in Responses', () => {
    it('should never include password in verifyPassword response', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 100 }),
          (password) => {
            const result = verifyPassword(password);
            const resultString = JSON.stringify(result);
            
            // The response should never contain the actual admin password
            expect(resultString).not.toContain(TEST_ADMIN_PASSWORD);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not expose password in error messages', () => {
      const wrongPasswords = ['wrong', '123', 'admin', 'password', ''];
      
      wrongPasswords.forEach(password => {
        const result = verifyPassword(password);
        expect(result.error).not.toContain(TEST_ADMIN_PASSWORD);
        expect(JSON.stringify(result)).not.toContain(TEST_ADMIN_PASSWORD);
      });
    });
  });
});

describe('Cookie Functions', () => {
  it('should generate valid cookie string for auth', () => {
    const token = generateToken();
    const cookieString = setAuthCookie(token);
    
    expect(cookieString).toContain('admin_token=');
    expect(cookieString).toContain(token);
    expect(cookieString).toContain('HttpOnly');
    expect(cookieString).toContain('SameSite=Strict');
    expect(cookieString).toContain('Path=/');
    expect(cookieString).toContain('Max-Age=');
  });

  it('should generate cookie string that clears auth', () => {
    const cookieString = clearAuthCookie();
    
    expect(cookieString).toContain('admin_token=');
    expect(cookieString).toContain('HttpOnly');
    expect(cookieString).toContain('Max-Age=0');
  });
});

describe('Request Token Extraction', () => {
  it('should extract token from request cookies', () => {
    const token = generateToken();
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'cookie') {
            return `admin_token=${token}; other_cookie=value`;
          }
          return null;
        }
      }
    };

    const extractedToken = getTokenFromRequest(mockRequest);
    expect(extractedToken).toBe(token);
  });

  it('should return null when no cookie header', () => {
    const mockRequest = {
      headers: {
        get: () => null
      }
    };

    const extractedToken = getTokenFromRequest(mockRequest);
    expect(extractedToken).toBeNull();
  });

  it('should return null when token cookie not present', () => {
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'cookie') {
            return 'other_cookie=value; another=test';
          }
          return null;
        }
      }
    };

    const extractedToken = getTokenFromRequest(mockRequest);
    expect(extractedToken).toBeNull();
  });
});

describe('verifyAuth', () => {
  it('should authenticate valid token from request', () => {
    const token = generateToken();
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'cookie') {
            return `admin_token=${token}`;
          }
          return null;
        }
      }
    };

    const result = verifyAuth(mockRequest);
    expect(result.authenticated).toBe(true);
    expect(result.payload).toBeDefined();
    expect(result.payload.role).toBe('admin');
  });

  it('should reject request without token', () => {
    const mockRequest = {
      headers: {
        get: () => null
      }
    };

    const result = verifyAuth(mockRequest);
    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('No token provided');
  });

  it('should reject request with invalid token', () => {
    const mockRequest = {
      headers: {
        get: (name) => {
          if (name === 'cookie') {
            return 'admin_token=invalid-token';
          }
          return null;
        }
      }
    };

    const result = verifyAuth(mockRequest);
    expect(result.authenticated).toBe(false);
    expect(result.error).toBeDefined();
  });
});
