import { useState, useEffect, useRef, useCallback } from 'react';
import { getJobTitleSuggestions } from '@/services/jobService';
import { useDebounce } from './useDebounce';

/**
 * Custom hook để xử lý logic autocomplete
 * Bao gồm API calls, caching, error handling, và loading states
 * 
 * @param {Object} options - Tùy chọn cấu hình
 * @param {number} options.delay - Thời gian debounce (ms), mặc định 300ms
 * @param {number} options.minLength - Độ dài tối thiểu để trigger autocomplete, mặc định 1
 * @param {number} options.maxSuggestions - Số lượng suggestions tối đa, mặc định 10
 * @param {number} options.cacheSize - Kích thước cache tối đa, mặc định 50
 * @returns {Object} - Object chứa states và methods cho autocomplete
 */
export const useAutocomplete = (options = {}) => {
  const {
    delay = 10, //10ms
    minLength = 1,
    maxSuggestions = 10,
    cacheSize = 50
  } = options;

  // States
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [previousSuggestions, setPreviousSuggestions] = useState([]); // Store previous results
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  // Refs để quản lý request cancellation và caching
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  // Debounce query để tối ưu hóa API calls
  const debouncedQuery = useDebounce(query, delay);

  /**
   * Reset selected index khi suggestions thay đổi
   */
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  /**
   * Fetch suggestions từ API hoặc cache
   */
  const fetchSuggestions = useCallback(async (searchQuery) => {
    // Kiểm tra điều kiện để fetch
    if (!searchQuery || searchQuery.length < minLength) {
      setSuggestions([]);
      setPreviousSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Kiểm tra cache trước
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (cacheRef.current.has(normalizedQuery)) {
      const cachedData = cacheRef.current.get(normalizedQuery);
      setSuggestions(cachedData);
      setPreviousSuggestions(cachedData);
      setShowDropdown(true);
      return;
    }

    // Giữ kết quả cũ thay vì hiển thị loading
    // Chỉ hiển thị loading nếu chưa có suggestions nào
    if (suggestions.length === 0) {
      setIsLoading(true);
    }

    // Cancel request trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Tạo AbortController mới
    abortControllerRef.current = new AbortController();
    
    try {
      setError(null);

      const response = await getJobTitleSuggestions(searchQuery, maxSuggestions);
      
      // Kiểm tra nếu request bị cancel
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        const suggestionData = response.data;
        
        // Cache kết quả (với giới hạn kích thước)
        if (cacheRef.current.size >= cacheSize) {
          // Xóa entry cũ nhất khi cache đầy
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(normalizedQuery, suggestionData);

        setSuggestions(suggestionData);
        setPreviousSuggestions(suggestionData);
        setShowDropdown(true);
      } else {
        // API thành công nhưng không có data hoặc thất bại
        // Giữ kết quả cũ nếu có, nếu không thì clear
        if (previousSuggestions.length === 0) {
          setSuggestions([]);
          setShowDropdown(false);
        }
        if (!response.success) {
          console.warn('Autocomplete API warning:', response.message);
        }
      }
    } catch (err) {
      // Kiểm tra nếu error do request bị cancel
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      console.error('Autocomplete error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải gợi ý');
      // Giữ kết quả cũ nếu có lỗi, không clear suggestions
      if (previousSuggestions.length === 0) {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [minLength, maxSuggestions, cacheSize]);

  /**
   * Effect để trigger fetch khi debouncedQuery thay đổi
   */
  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  /**
   * Cleanup effect để cancel requests khi component unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Xử lý thay đổi input
   */
  const handleInputChange = useCallback((value) => {
    setQuery(value);
    if (!value || value.length < minLength) {
      setShowDropdown(false);
      setSuggestions([]);
      setPreviousSuggestions([]);
    }
  }, [minLength]);

  /**
   * Xử lý keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          return selectedSuggestion.title; // Return selected suggestion
        }
        return query; // Return current query if no selection
      
      case 'Escape':
        event.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      
      case 'Tab':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
    return null;
  }, [showDropdown, suggestions, selectedIndex, query]);

  /**
   * Xử lý click trên suggestion
   */
  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion.title);
    setShowDropdown(false);
    setSelectedIndex(-1);
    return suggestion.title;
  }, []);

  /**
   * Xử lý mouse hover trên suggestion
   */
  const handleSuggestionHover = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  /**
   * Đóng dropdown
   */
  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, []);

  /**
   * Clear all states
   */
  const clear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setPreviousSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * Retry fetch (để sử dụng khi có lỗi)
   */
  const retry = useCallback(() => {
    setError(null);
    fetchSuggestions(query);
  }, [query, fetchSuggestions]);

  return {
    // States
    query,
    suggestions,
    isLoading,
    error,
    selectedIndex,
    showDropdown,
    
    // Actions
    handleInputChange,
    handleKeyDown,
    handleSuggestionClick,
    handleSuggestionHover,
    closeDropdown,
    clear,
    retry,
    
    // Computed values
    hasResults: suggestions.length > 0,
    isEmpty: !isLoading && suggestions.length === 0 && query.length >= minLength,
    selectedSuggestion: selectedIndex >= 0 ? suggestions[selectedIndex] : null
  };
};

export default useAutocomplete;