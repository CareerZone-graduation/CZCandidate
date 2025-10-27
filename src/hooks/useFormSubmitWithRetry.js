import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  getErrorMessage, 
  isRetryableError, 
  retryWithBackoff,
  isOnline,
  waitForOnline,
  logError
} from '@/utils/errorHandling';

/**
 * Custom hook for form submission with retry logic and error handling
 * @param {Function} submitFn - Async function to submit form data
 * @param {Object} options - Configuration options
 * @returns {Object} Submit handler and state
 */
export const useFormSubmitWithRetry = (submitFn, options = {}) => {
  const {
    maxRetries = 3,
    onSuccess,
    onError,
    successMessage = 'Đã lưu thành công',
    errorContext = 'Lưu dữ liệu',
    showSuccessToast = true,
    showErrorToast = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = useCallback(async (data) => {
    // Check if online before submitting
    if (!isOnline()) {
      const errorMsg = 'Không có kết nối mạng. Vui lòng kiểm tra và thử lại.';
      setError(errorMsg);
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      return { success: false, error: errorMsg };
    }

    setIsSubmitting(true);
    setError(null);
    setRetryCount(0);

    try {
      // Attempt submission with retry logic
      const result = await retryWithBackoff(
        async () => {
          try {
            return await submitFn(data);
          } catch (err) {
            // If network error, wait for connection
            if (!isOnline()) {
              if (showErrorToast) {
                toast.loading('Đang chờ kết nối mạng...', { id: 'waiting-online' });
              }
              
              const connected = await waitForOnline(30000);
              
              if (showErrorToast) {
                toast.dismiss('waiting-online');
              }
              
              if (!connected) {
                throw new Error('Không thể kết nối sau 30 giây');
              }
              
              // Retry after connection restored
              return await submitFn(data);
            }
            throw err;
          }
        },
        maxRetries,
        (error) => {
          setRetryCount(prev => prev + 1);
          return isRetryableError(error);
        }
      );

      // Success
      setIsSubmitting(false);
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };

    } catch (err) {
      // Log error for debugging
      logError(err, { context: errorContext, data });

      // Get user-friendly error message
      const errorMsg = getErrorMessage(err, errorContext);
      setError(errorMsg);
      setIsSubmitting(false);

      if (showErrorToast) {
        toast.error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      return { success: false, error: errorMsg };
    }
  }, [submitFn, maxRetries, onSuccess, onError, successMessage, errorContext, showSuccessToast, showErrorToast]);

  const reset = useCallback(() => {
    setError(null);
    setRetryCount(0);
    setIsSubmitting(false);
  }, []);

  return {
    handleSubmit,
    isSubmitting,
    error,
    retryCount,
    reset
  };
};
