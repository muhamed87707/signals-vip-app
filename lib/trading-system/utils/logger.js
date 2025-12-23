/**
 * Logger
 * نظام التسجيل والمراقبة
 * 
 * Features:
 * - Multiple log levels
 * - Structured logging
 * - Performance tracking
 * - Error aggregation
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

export class Logger {
  constructor(config = {}) {
    this.config = {
      level: LOG_LEVELS.INFO,
      prefix: 'IES',
      enableConsole: true,
      enableMetrics: true,
      maxErrorHistory: 100,
      ...config,
    };

    this.errorHistory = [];
    this.metrics = {
      operations: {},
      errors: {},
    };
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (typeof level === 'string') {
      this.config.level = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
    } else {
      this.config.level = level;
    }
  }

  /**
   * Format log message
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS).find(k => LOG_LEVELS[k] === level);
    
    return {
      timestamp,
      level: levelName,
      prefix: this.config.prefix,
      message,
      context,
    };
  }

  /**
   * Log message
   */
  log(level, message, context = {}) {
    if (level < this.config.level) return;

    const formatted = this.formatMessage(level, message, context);

    if (this.config.enableConsole) {
      const consoleMethod = level >= LOG_LEVELS.ERROR ? 'error' 
        : level >= LOG_LEVELS.WARN ? 'warn' 
        : 'log';
      
      console[consoleMethod](
        `[${formatted.timestamp}] [${formatted.prefix}] [${formatted.level}]`,
        message,
        Object.keys(context).length > 0 ? context : ''
      );
    }

    // Track errors
    if (level >= LOG_LEVELS.ERROR) {
      this.trackError(formatted);
    }

    return formatted;
  }

  debug(message, context = {}) {
    return this.log(LOG_LEVELS.DEBUG, message, context);
  }

  info(message, context = {}) {
    return this.log(LOG_LEVELS.INFO, message, context);
  }

  warn(message, context = {}) {
    return this.log(LOG_LEVELS.WARN, message, context);
  }

  error(message, context = {}) {
    return this.log(LOG_LEVELS.ERROR, message, context);
  }

  fatal(message, context = {}) {
    return this.log(LOG_LEVELS.FATAL, message, context);
  }

  /**
   * Track error for aggregation
   */
  trackError(formatted) {
    this.errorHistory.push(formatted);
    
    // Keep only recent errors
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift();
    }

    // Aggregate by message
    const key = formatted.message.substring(0, 100);
    this.metrics.errors[key] = (this.metrics.errors[key] || 0) + 1;
  }

  /**
   * Start timing an operation
   */
  startTimer(operationName) {
    return {
      name: operationName,
      startTime: performance.now(),
    };
  }

  /**
   * End timing and log
   */
  endTimer(timer, context = {}) {
    const duration = performance.now() - timer.startTime;
    
    if (this.config.enableMetrics) {
      if (!this.metrics.operations[timer.name]) {
        this.metrics.operations[timer.name] = {
          count: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
        };
      }

      const op = this.metrics.operations[timer.name];
      op.count++;
      op.totalTime += duration;
      op.minTime = Math.min(op.minTime, duration);
      op.maxTime = Math.max(op.maxTime, duration);
    }

    this.debug(`${timer.name} completed`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`,
    });

    return duration;
  }

  /**
   * Wrap async function with timing
   */
  async timed(operationName, fn, context = {}) {
    const timer = this.startTimer(operationName);
    try {
      const result = await fn();
      this.endTimer(timer, { ...context, success: true });
      return result;
    } catch (error) {
      this.endTimer(timer, { ...context, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Get operation metrics
   */
  getMetrics() {
    const operations = {};
    
    for (const [name, data] of Object.entries(this.metrics.operations)) {
      operations[name] = {
        count: data.count,
        avgTime: data.count > 0 ? (data.totalTime / data.count).toFixed(2) + 'ms' : '0ms',
        minTime: data.minTime === Infinity ? '0ms' : data.minTime.toFixed(2) + 'ms',
        maxTime: data.maxTime.toFixed(2) + 'ms',
      };
    }

    return {
      operations,
      errors: this.metrics.errors,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      operations: {},
      errors: {},
    };
    this.errorHistory = [];
  }
}

// Singleton instance
let globalLogger = null;

export function getLogger() {
  if (!globalLogger) {
    globalLogger = new Logger({
      level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
    });
  }
  return globalLogger;
}

export { LOG_LEVELS };
