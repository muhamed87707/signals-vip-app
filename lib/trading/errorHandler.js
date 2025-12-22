/**
 * Error Handler for Trading System
 * Provides consistent error handling and fallback mechanisms
 */

export class TradingError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'TradingError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export const ERROR_CODES = {
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  API_ERROR: 'API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_SYMBOL: 'INVALID_SYMBOL',
  ANALYSIS_FAILED: 'ANALYSIS_FAILED',
  AI_ERROR: 'AI_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Handle API errors with fallback
 */
export async function withFallback(primaryFn, fallbackFn, errorHandler) {
  try {
    return await primaryFn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    }
    
    if (fallbackFn) {
      try {
        return await fallbackFn();
      } catch (fallbackError) {
        throw new TradingError(
          'Both primary and fallback failed',
          ERROR_CODES.API_ERROR,
          { primary: error.message, fallback: fallbackError.message }
        );
      }
    }
    
    throw error;
  }
}

/**
 * Retry with exponential backoff
 */
export async function withRetry(fn, options = {}) {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error.code === ERROR_CODES.VALIDATION_ERROR) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const response = {
    success: false,
    error: {
      message: error.message || 'An unexpected error occurred',
      code: error.code || ERROR_CODES.UNKNOWN_ERROR
    }
  };
  
  // Include details in development
  if (!isProduction && error.details) {
    response.error.details = error.details;
  }
  
  // Bilingual error messages
  response.error.messages = getErrorMessages(error.code);
  
  return response;
}

/**
 * Get bilingual error messages
 */
function getErrorMessages(code) {
  const messages = {
    [ERROR_CODES.INSUFFICIENT_DATA]: {
      en: 'Insufficient market data available',
      ar: 'بيانات السوق غير كافية'
    },
    [ERROR_CODES.API_ERROR]: {
      en: 'External service temporarily unavailable',
      ar: 'الخدمة الخارجية غير متاحة مؤقتاً'
    },
    [ERROR_CODES.RATE_LIMITED]: {
      en: 'Too many requests. Please try again later',
      ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً'
    },
    [ERROR_CODES.INVALID_SYMBOL]: {
      en: 'Invalid trading symbol',
      ar: 'رمز التداول غير صالح'
    },
    [ERROR_CODES.ANALYSIS_FAILED]: {
      en: 'Analysis could not be completed',
      ar: 'تعذر إكمال التحليل'
    },
    [ERROR_CODES.AI_ERROR]: {
      en: 'AI service temporarily unavailable',
      ar: 'خدمة الذكاء الاصطناعي غير متاحة مؤقتاً'
    },
    [ERROR_CODES.DATABASE_ERROR]: {
      en: 'Database operation failed',
      ar: 'فشلت عملية قاعدة البيانات'
    },
    [ERROR_CODES.VALIDATION_ERROR]: {
      en: 'Invalid input data',
      ar: 'بيانات الإدخال غير صالحة'
    },
    [ERROR_CODES.UNKNOWN_ERROR]: {
      en: 'An unexpected error occurred',
      ar: 'حدث خطأ غير متوقع'
    }
  };
  
  return messages[code] || messages[ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * Log error for monitoring
 */
export function logError(error, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    context
  };
  
  console.error('[Trading Error]', JSON.stringify(logEntry, null, 2));
  
  // In production, send to monitoring service
  // Example: sendToMonitoring(logEntry);
}

export default {
  TradingError,
  ERROR_CODES,
  withFallback,
  withRetry,
  formatErrorResponse,
  logError
};
