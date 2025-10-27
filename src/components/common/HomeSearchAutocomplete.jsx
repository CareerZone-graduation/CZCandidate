import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import SearchHistoryDropdown from '@/components/jobs/SearchHistoryDropdown';
import {
  fetchSearchHistory,
  saveSearchHistory,
  deleteSearchHistory,
  selectSearchHistory
} from '@/redux/searchHistorySlice';
import { getJobTitleSuggestions } from '@/services/jobService';
import { toast } from 'sonner';

/**
 * Component tìm kiếm với autocomplete cho job titles (phiên bản cho trang Home)
 * Tích hợp với navigation để chuyển đến trang kết quả tìm kiếm
 * 
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder text cho input
 * @param {string} props.initialValue - Giá trị ban đầu
 * @param {function} props.onSearch - Callback khi search (optional, mặc định là navigate)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.inputProps - Additional props cho Input component
 * @param {Object} props.autocompleteOptions - Options cho useAutocomplete hook
 */
const HomeSearchAutocomplete = forwardRef(({
  placeholder = "Vị trí công việc, kỹ năng, công ty...",
  initialValue = "",
  onSearch,
  className,
  inputProps = {}
}, ref) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const searchHistory = useSelector(selectSearchHistory);

  // State management
  const [query, setQuery] = useState(initialValue || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState({
    history: [],
    autocomplete: []
  });
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);

  // Load search history on mount
  useEffect(() => {
    dispatch(fetchSearchHistory({ limit: 10, page: 1 }));
  }, [dispatch]);

  // Set initial value if provided
  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Effect for history suggestions (no debounce)
  useEffect(() => {
    if (query.trim().length > 0) {
      const filteredHistory = Array.isArray(searchHistory)
        ? searchHistory.filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        : [];
      setSuggestions(prev => ({
        ...prev,
        history: filteredHistory.slice(0, 5)
      }));
    } else {
      // When query is empty, show recent history
      setSuggestions(prev => ({
        ...prev,
        history: Array.isArray(searchHistory) ? searchHistory.slice(0, 10) : []
      }));
    }
  }, [query, searchHistory]);

  // Effect for autocomplete suggestions (with debounce to avoid excessive API calls)
  useEffect(() => {
    // Clear autocomplete if query is too short
    if (!query || query.trim().length < 1) {
      setSuggestions(prev => ({ ...prev, autocomplete: [] }));
      setIsLoadingAutocomplete(false);
      return;
    }

    // Set loading state immediately
    setIsLoadingAutocomplete(true);

    // Debounce API call
    const timeoutId = setTimeout(async () => {
      try {
        const autocompleteResults = await getJobTitleSuggestions(query, 5).catch(() => ({ data: [] }));
        setSuggestions(prev => ({
          ...prev,
          autocomplete: Array.isArray(autocompleteResults.data) ? autocompleteResults.data : []
        }));
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setSuggestions(prev => ({ ...prev, autocomplete: [] }));
      } finally {
        setIsLoadingAutocomplete(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup function to cancel pending API call
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  /**
   * Handle focus - show history when input is empty
   */
  const handleFocus = useCallback(() => {
    // Always show dropdown on focus
    setShowDropdown(true);
    // Load history immediately if query is empty (even if empty array to show empty state)
    if (!query.trim()) {
      setSuggestions({
        history: Array.isArray(searchHistory) ? searchHistory.slice(0, 10) : [],
        autocomplete: []
      });
    }
  }, [query, searchHistory]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((value) => {
    setQuery(value);
    setShowDropdown(true);
    if (!value || value.trim().length === 0) {
      setSuggestions({
        history: Array.isArray(searchHistory) ? searchHistory.slice(0, 10) : [],
        autocomplete: []
      });
    }
  }, [searchHistory]);

  /**
   * Xử lý search action - navigate đến trang JobList với query params
   */
  const handleSearch = useCallback(async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setShowDropdown(false);

    // Save to history
    try {
      await dispatch(saveSearchHistory({
        query: trimmedQuery
      })).unwrap();
    } catch (error) {
      console.error('Failed to save search history:', error);
    }

    if (onSearch) {
      // Nếu có custom onSearch handler
      onSearch(trimmedQuery, {
        page: 1,
        size: 10,
        query: trimmedQuery
      });
    } else {
      // Mặc định navigate đến /jobs với query parameters
      const searchParams = new URLSearchParams();
      searchParams.set('query', trimmedQuery);
      searchParams.set('page', '1');
      searchParams.set('size', '10');

      navigate(`/jobs?${searchParams.toString()}`);
    }
  }, [query, dispatch, onSearch, navigate]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion, isHistory) => {
    if (isHistory) {
      // Apply search from history
      setQuery(suggestion.query || '');
      setShowDropdown(false);
      setSelectedIndex(-1);
      handleSearch(suggestion.query || '');
    } else {
      // Just set query for autocomplete
      setQuery(suggestion.title);
      setShowDropdown(false);
      setSelectedIndex(-1);
      handleSearch(suggestion.title);
    }
  }, [handleSearch]);

  /**
   * Handle delete history entry with optimistic update
   */
  const handleDeleteHistory = useCallback(async (e, entryId) => {
    e.stopPropagation();
    
    // Optimistic update: Xóa ngay trên UI
    setSuggestions(prev => ({
      ...prev,
      history: prev.history.filter(h => h._id !== entryId)
    }));
    
    // Hiển thị toast ngay lập tức
    toast.success('Đã xóa lịch sử tìm kiếm');
    
    try {
      // Gọi API ở background (không cần await)
      dispatch(deleteSearchHistory(entryId));
    } catch (error) {
      // Nếu có lỗi, không cần làm gì vì đã xóa trên UI
      console.error('Error deleting history:', error);
    }
  }, [dispatch]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event) => {
    const totalSuggestions = suggestions.history.length + suggestions.autocomplete.length;

    if (!showDropdown || totalSuggestions === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalSuggestions) {
          // Determine if it's history or autocomplete
          if (selectedIndex < suggestions.history.length) {
            const selectedSuggestion = suggestions.history[selectedIndex];
            handleSuggestionClick(selectedSuggestion, true);
          } else {
            const autocompleteIndex = selectedIndex - suggestions.history.length;
            const selectedSuggestion = suggestions.autocomplete[autocompleteIndex];
            handleSuggestionClick(selectedSuggestion, false);
          }
        } else {
          handleSearch();
        }
        break;

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
  }, [showDropdown, suggestions, selectedIndex, handleSuggestionClick, handleSearch]);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setSuggestions({
      history: Array.isArray(searchHistory) ? searchHistory.slice(0, 10) : [],
      autocomplete: []
    });
    setShowDropdown(false);
    setSelectedIndex(-1);
  }, [searchHistory]);

  /**
   * Focus vào input
   */
  const focus = () => {
    inputRef.current?.focus();
  };

  /**
   * Expose methods qua ref
   */
  useImperativeHandle(ref, () => ({
    focus,
    clear,
    getValue: () => query,
    setValue: handleInputChange
  }));

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        {/* Search Icon */}
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={cn(
            "pl-12 pr-4 h-12 text-base",
            "border-2 border-border focus:border-primary",
            "focus:ring-4 focus:ring-primary/20",
            "bg-background rounded-xl font-medium",
            "placeholder:text-muted-foreground text-foreground",
            "transition-all duration-200",
            showDropdown && "rounded-b-none border-b-0"
          )}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
          }
          {...inputProps}
        />

        {/* Search History Dropdown */}
        <SearchHistoryDropdown
          historySuggestions={suggestions.history}
          autocompleteSuggestions={suggestions.autocomplete}
          query={query}
          isLoading={isLoadingAutocomplete}
          error={null}
          selectedIndex={selectedIndex}
          isVisible={showDropdown}
          onSuggestionClick={handleSuggestionClick}
          onSuggestionHover={(index) => setSelectedIndex(index)}
          onDeleteHistory={handleDeleteHistory}
          onClose={closeDropdown}
          onRetry={() => { }}
          className={cn(
            "absolute top-full left-0 z-50 w-full",
            "border-t-0 rounded-t-none rounded-b-xl",
            "border-2 border-primary focus-within:border-primary",
            "shadow-lg shadow-primary/20",
             // Make dropdown span to align with search button
            // Input is 6/12 cols (50%), location is 3/12 (25%), button is 3/12 (25%)
            // Total: 200% width + 2 gaps (1rem each) = calc(200% + 2rem)
            "w-[calc(200%)]",
            // Ensure proper alignment
            "lg:w-[calc(200%+1rem)]"
          )}
        />
      </div>
    </div>
  );
});

HomeSearchAutocomplete.displayName = 'HomeSearchAutocomplete';

export default HomeSearchAutocomplete;
