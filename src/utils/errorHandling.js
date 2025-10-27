/**
 * Error handling utilities for onboarding and form validation
 */

// Error types
export const ErrorType = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  SERVER: 'server',
  TIMEOUT: 'timeout',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not_found',
  CONFLICT: 'conflict',
  UNKNOWN: 'unknown'
};

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
  if (!error) return ErrorType.UNKNOWN;

  // Network errors
  if (error.message === 'Network Error' || !error.response) {
    return ErrorType.NETWORK;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return ErrorType.TIMEOUT;
  }

  // HTTP status code errors
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return ErrorType.VALIDATION;
      case 401:
        return ErrorType.UNAUTHORIZED;
      case 403:
        return ErrorType.FORBIDDEN;
      case 404:
        return ErrorType.NOT_FOUND;
      case 409:
        return ErrorType.CONFLICT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  return ErrorType.UNKNOWN;
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @param {string} context - Context of the error (e.g., 'saving profile')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, context = '') => {
  const errorType = getErrorType(error);
  const contextPrefix = context ? `${context}: ` : '';

  // Check for custom error message from backend
  if (error.response?.data?.message) {
    return `${contextPrefix}${error.response.data.message}`;
  }

  // Default messages based on error type
  const messages = {
    [ErrorType.VALIDATION]: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
    [ErrorType.NETWORK]: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
    [ErrorType.TIMEOUT]: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
    [ErrorType.UNAUTHORIZED]: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    [ErrorType.FORBIDDEN]: 'Bạn không có quyền thực hiện thao tác này.',
    [ErrorType.NOT_FOUND]: 'Không tìm thấy dữ liệu yêu cầu.',
    [ErrorType.CONFLICT]: 'Dữ liệu đã tồn tại hoặc xung đột.',
    [ErrorType.SERVER]: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    [ErrorType.UNKNOWN]: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
  };

  return `${contextPrefix}${messages[errorType] || messages[ErrorType.UNKNOWN]}`;
};

/**
 * Check if error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (error) => {
  const errorType = getErrorType(error);
  
  // Retryable error types
  const retryableTypes = [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.SERVER
  ];

  return retryableTypes.includes(errorType);
};

/**
 * Get retry delay based on attempt number (exponential backoff)
 * @param {number} attempt - Attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (attempt, baseDelay = 1000) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
  const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 500;
  return delay + jitter;
};

/**
 * Format validation errors from Zod
 * @param {Array} zodErrors - Zod error array
 * @returns {Object} Formatted errors by field
 */
export const formatZodErrors = (zodErrors) => {
  if (!zodErrors || !Array.isArray(zodErrors)) return {};

  return zodErrors.reduce((acc, error) => {
    const path = error.path.join('.');
    acc[path] = error.message;
    return acc;
  }, {});
};

/**
 * Format validation errors from backend
 * @param {Object} backendErrors - Backend error object
 * @returns {Object} Formatted errors by field
 */
export const formatBackendErrors = (backendErrors) => {
  if (!backendErrors || typeof backendErrors !== 'object') return {};

  // Handle different backend error formats
  if (Array.isArray(backendErrors)) {
    return backendErrors.reduce((acc, error) => {
      if (error.field && error.message) {
        acc[error.field] = error.message;
      }
      return acc;
    }, {});
  }

  // Handle object format
  return backendErrors;
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {Function} shouldRetry - Function to determine if should retry
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (
  fn,
  maxAttempts = 3,
  shouldRetry = isRetryableError
) => {
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxAttempts - 1 || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if user is online
 * @returns {boolean} Whether user is online
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Wait for online connection
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} Whether connection was restored
 */
export const waitForOnline = (timeout = 30000) => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      resolve(false);
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };

    window.addEventListener('online', onlineHandler);
  });
};

/**
 * Create error object with additional context
 * @param {Error} error - Original error
 * @param {Object} context - Additional context
 * @returns {Object} Enhanced error object
 */
export const enhanceError = (error, context = {}) => {
  return {
    type: getErrorType(error),
    message: getErrorMessage(error),
    originalError: error,
    isRetryable: isRetryableError(error),
    timestamp: new Date().toISOString(),
    ...context
  };
};

/**
 * Log error for debugging (can be extended to send to error tracking service)
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const enhancedError = enhanceError(error, context);
  
  console.error('[Error]', {
    ...enhancedError,
    stack: error.stack
  });

  // TODO: Send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracking(enhancedError);
  // }
};
