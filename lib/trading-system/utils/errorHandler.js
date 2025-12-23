/**
 * Error Handler
 * نظام معالجة الأخطاء
 * 
 * Features:
 * - Custom error types
 * - Error recovery strategies
 * - Retry logic with backoff
 * - Circuit breaker pattern
 */

import { getLogger } from './logger';

// Custom Error Types
export class IESError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'IESError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

export class DataFetchError extends IESError {
  constructor(message, source, context = {}) {
    super(message, 'DATA_FETCH_ERROR', { source, ...context });
    this.name = 'DataFetchError';
  }
}

export class AnalysisError extends IESError {
  constructor(message, analyzer, context = {}) {
    super(message, 'ANALYSIS_ERROR', { analyzer, ...context });
    this.name = 'AnalysisError';
  }
}

export class ValidationError extends IESError {
  constructor(message, layer, context = {}) {
    super(message, 'VALIDATION_ERROR', { layer, ...context });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends IESError {
  constructor(message, config, context = {}) {
    super(message, 'CONFIG_ERROR', { config, ...context });
    this.name = 'ConfigurationError';
  }
}

// Error Codes
export const ErrorCodes = {
  // Data errors (1xxx)
  DATA_SOURCE_UNAVAILABLE: 1001,
  DATA_PARSE_ERROR: 1002,
  DATA_TIMEOUT: 1003,
  DATA_RATE_LIMITED: 1004,
  
  // Analysis errors (2xxx)
  ANALYSIS_FAILED: 2001,
  INSUFFICIENT_DATA: 2002,
  INVALID_SYMBOL: 2003,
  
  // Validation errors (3xxx)
  VALIDATION_FAILED: 3001,
  CRITICAL_LAYER_FAILED: 3002,
  
  // System errors (4xxx)
  INTERNAL_ERROR: 4001,
  CONFIG_MISSING: 4002,
  RATE_LIMIT_EXCEEDED: 4003,
};

/**
 * Retry with exponential backoff
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryOn = () => true,
  } = options;

  const logger = getLogger();
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !retryOn(error)) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        error: error.message,
        delay: `${delay}ms`,
      });

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Circuit Breaker
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000,
      halfOpenRequests: 1,
      ...options,
    };

    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.halfOpenAttempts = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenAttempts = 0;
      } else {
        throw new IESError('Circuit breaker is OPEN', 'CIRCUIT_OPEN');
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenAttempts >= this.options.halfOpenRequests) {
      throw new IESError('Circuit breaker is HALF_OPEN, waiting for test requests', 'CIRCUIT_HALF_OPEN');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.options.halfOpenRequests) {
        this.reset();
      }
    } else {
      this.failures = 0;
    }
  }

  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.halfOpenAttempts = 0;
    } else if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.halfOpenAttempts = 0;
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Safe execution wrapper
 */
export async function safeExecute(fn, fallback = null, context = {}) {
  const logger = getLogger();
  
  try {
    return await fn();
  } catch (error) {
    logger.error('Safe execution failed', {
      ...context,
      error: error.message,
      code: error.code,
    });
    
    if (typeof fallback === 'function') {
      return fallback(error);
    }
    return fallback;
  }
}

/**
 * Timeout wrapper
 */
export function withTimeout(fn, timeout = 30000) {
  return Promise.race([
    fn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new IESError('Operation timed out', 'TIMEOUT', { timeout })), timeout)
    ),
  ]);
}

/**
 * Error response formatter for API
 */
export function formatErrorResponse(error) {
  if (error instanceof IESError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        context: error.context,
      },
    };
  }

  return {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
  };
}
