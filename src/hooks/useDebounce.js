import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce một giá trị
 * Hữu ích để giảm số lượng API calls khi user đang typing
 * 
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms), mặc định 300ms
 * @returns {any} - Giá trị đã được debounce
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update debounced value sau delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout nếu value thay đổi trước khi timeout hoàn thành
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;