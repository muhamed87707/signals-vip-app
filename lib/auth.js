import jwt from 'jsonwebtoken';

// Get JWT secret from environment variable
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // In development, use a fallback (not recommended for production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('JWT_SECRET not set, using fallback for development');
      return 'dev-fallback-secret-do-not-use-in-production';
    }
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return secret;
};

// Get admin password from environment variable
export const getAdminPassword = () => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is not configured');
  }
  return password;
};

// Token expiration time (24 hours in seconds)
const TOKEN_EXPIRATION = 24 * 60 * 60;

/**
 * Generate a JWT token with admin claims
 * @param {Object} payload - Additional payload data
 * @returns {string} Signed JWT token
 */
export function generateToken(payload = {}) {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  
  const tokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + TOKEN_EXPIRATION,
    ...payload
  };
  
  return jwt.sign(tokenPayload, secret, { algorithm: 'HS256' });
}

/**
 * Verify a JWT token and return decoded payload
 * @param {string} token - JWT token to verify
 * @returns {{ valid: boolean, payload?: Object, error?: string }}
 */
export function verifyToken(token) {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    
    // Validate required claims
    if (!decoded.role || decoded.role !== 'admin') {
      return { valid: false, error: 'Invalid token claims' };
    }
    
    return { valid: true, payload: decoded };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' };
    }
    if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Verify password against environment variable
 * @param {string} password - Password to verify
 * @returns {{ valid: boolean, error?: string }}
 */
export function verifyPassword(password) {
  try {
    const adminPassword = getAdminPassword();
    if (password === adminPassword) {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid password' };
  } catch (error) {
    return { valid: false, error: 'Server configuration error' };
  }
}

// Cookie configuration
const COOKIE_NAME = 'admin_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: TOKEN_EXPIRATION
};

/**
 * Set authentication cookie in response
 * @param {Response} response - Next.js response object
 * @param {string} token - JWT token
 * @returns {Response} Response with cookie set
 */
export function setAuthCookie(token) {
  const cookieValue = `${COOKIE_NAME}=${token}; HttpOnly; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }SameSite=Strict; Path=/; Max-Age=${TOKEN_EXPIRATION}`;
  
  return cookieValue;
}

/**
 * Get cookie string to clear authentication
 * @returns {string} Cookie string that clears the auth cookie
 */
export function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Extract token from request cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null if not found
 */
export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies[COOKIE_NAME] || null;
}

/**
 * Verify authentication from request
 * @param {Request} request - Next.js request object
 * @returns {{ authenticated: boolean, payload?: Object, error?: string }}
 */
export function verifyAuth(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }
  
  const result = verifyToken(token);
  if (result.valid) {
    return { authenticated: true, payload: result.payload };
  }
  
  return { authenticated: false, error: result.error };
}

// Export cookie name for testing
export const AUTH_COOKIE_NAME = COOKIE_NAME;
