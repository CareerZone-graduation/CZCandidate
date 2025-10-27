import { useState, useCallback, useEffect } from 'react';
import { 
  isRetryableError, 
  getRetryDelay, 
  isOnline, 
  waitForOnline 
} from '@/utils/errorHandling';

/**
 * Custom hook for retry logic with offline detection
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration options
 * @returns {Object} Retry state and handlers
 */
export const useRetry = (fn, options = {}) => {
  const {
    maxRetries = 3,
    onSuccess,
    onError,
    onRetry,
    shouldRetry = isRetryableError,
    waitForConnection = true
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(isOnline());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setIsRetrying(true);
    setError(null);
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        // Check if online before attempting
        if (!isOnline()) {
          if (waitForConnection) {
            // Wait for connection to be restored
            const connected = await waitForOnline(30000);
            if (!connected) {
              throw new Error('Không thể kết nối sau 30 giây');
            }
          } else {
            throw new Error('Không có kết nối mạng');
          }
        }

        // Execute function
        const result = await fn(...args);
        
        // Success
        setIsRetrying(false);
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return { success: true, data: result };

      } catch (err) {
        setError(err);

        // Check if should retry
        const canRetry = currentRetry < maxRetries && shouldRetry(err);
        
        if (!canRetry) {
          setIsRetrying(false);
          
          if (onError) {
            onError(err);
          }
          
          return { success: false, error: err };
        }

        // Increment retry count
        currentRetry++;
        setRetryCount(currentRetry);

        if (onRetry) {
          onRetry(currentRetry, err);
        }

        // Wait before retrying
        const delay = getRetryDelay(currentRetry - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Max retries reached
    setIsRetrying(false);
    
    if (onError) {
      onError(error);
    }
    
    return { success: false, error };
  }, [fn, maxRetries, shouldRetry, waitForConnection, onSuccess, onError, onRetry, error]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setError(null);
  }, []);

  return {
    execute,
    isRetrying,
    retryCount,
    error,
    online,
    reset
  };
};

/**
 * Hook for manual retry with state management
 */
export const useManualRetry = () => {
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retry = useCallback(() => {
    setRetryTrigger(prev => prev + 1);
  }, []);

  return {
    retryTrigger,
    retry
  };
};
