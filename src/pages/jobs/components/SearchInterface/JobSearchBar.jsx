import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
// --- THAY ĐỔI 1: Import hook mới ---
import { useSonioxSearch } from '@/hooks/useSonioxSearch';
import VoiceSearchButton from '@/components/common/VoiceSearchButton';
// Search history imports
import SearchHistoryDropdown from '@/components/jobs/SearchHistoryDropdown';
import { 
  fetchSearchHistory, 
  saveSearchHistory, 
  deleteSearchHistory,
  selectSearchHistory 
} from '@/redux/searchHistorySlice';
import { getJobTitleSuggestions } from '@/services/jobService';
import { toast } from 'sonner';

const JobSearchBar = forwardRef(({
  placeholder = "Tìm kiếm công việc, kỹ năng, công ty...",
  initialQuery = "",
  onSearch,
  inputProps = {}
}, ref) => {
  const inputRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const dispatch = useDispatch();
  const searchHistory = useSelector(selectSearchHistory);

  // --- THAY ĐỔI 2: State management cho search history ---
  const [query, setQuery] = useState(initialQuery || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState({
    history: [],
    autocomplete: []
  });
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  
  // Debounce query để tối ưu hóa API calls
  const debouncedQuery = useDebounce(query, 300);

  // --- THAY ĐỔI 3: Khởi tạo hook Soniox ---
  const {
    state: voiceState,
    isListening,
    fullTranscript,
    isSupported: isVoiceSupported,
    toggleSearch: toggleVoiceSearch
  } = useSonioxSearch({
    onResult: (text) => {
      setQuery(text);
      handleSearch(text);
    }
  });

  // Cập nhật input với transcript real-time từ Soniox
  useEffect(() => {
    if (isListening) {
      setQuery(fullTranscript);
    }
  }, [fullTranscript, isListening]);

  // Load search history on mount
  useEffect(() => {
    dispatch(fetchSearchHistory({ limit: 10, page: 1 }));
  }, [dispatch]);

  // Sync with initialQuery
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Effect for history suggestions (no debounce) - Filter on frontend
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

  // Effect for autocomplete suggestions (with debounce)
  useEffect(() => {
    // Clear autocomplete if query is too short
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setSuggestions(prev => ({ ...prev, autocomplete: [] }));
      setIsLoadingAutocomplete(false);
      return;
    }

    // Set loading state immediately
    setIsLoadingAutocomplete(true);

    // Debounce API call for autocomplete only
    const fetchAutocomplete = async () => {
      try {
        const autocompleteResults = await getJobTitleSuggestions(debouncedQuery, 5).catch(() => ({ data: [] }));
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
    };

    fetchAutocomplete();
  }, [debouncedQuery]);

  /**
   * Handle focus - show history when input is empty
   */
  const handleFocus = useCallback(() => {
    setIsActive(true);
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
   * Handle search submission
   */
  const handleSearch = useCallback(async (searchQuery = query) => {
    const trimmedQuery = searchQuery.trim();
    
    setIsActive(false);
    setShowDropdown(false);
    
    if (inputRef.current) {
      inputRef.current.blur();
    }

    // Save to history (only query, no filters)
    try {
      await dispatch(saveSearchHistory({
        query: trimmedQuery
      })).unwrap();
      // Show success toast for save operation
    } catch (error) {
      // Show error toast but don't interrupt search flow
      toast.error('Không thể lưu lịch sử tìm kiếm');
      console.error('Failed to save search history:', error);
    }

    // Perform search
    if (onSearch) {
      onSearch(trimmedQuery);
    }
  }, [query, dispatch, onSearch]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion, isHistory) => {
    if (isHistory) {
      // Apply search from history (only query)
      setQuery(suggestion.query || '');
      setShowDropdown(false);
      setSelectedIndex(-1);
      
      // Perform search
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
   * Handle delete history entry
   */
  const handleDeleteHistory = useCallback(async (e, entryId) => {
    e.stopPropagation();
    try {
      await dispatch(deleteSearchHistory(entryId)).unwrap();
      toast.success('Đã xóa lịch sử tìm kiếm');
      
      // Update suggestions to remove deleted entry
      setSuggestions(prev => ({
        ...prev,
        history: prev.history.filter(h => h._id !== entryId)
      }));
    } catch (error) {
      toast.error('Không thể xóa lịch sử tìm kiếm');
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

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };
  
  const handleSearchButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    handleSearch();
  };

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

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear,
    getValue: () => query,
    setValue: handleInputChange
  }));

  return (
    <div className={cn(
      "relative w-full transition-all duration-500",
      isListening && "scale-105"
    )}>
      <form onSubmit={handleSubmit} className="relative flex gap-3">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10",
            "transition-all duration-300",
            isActive ? "text-primary scale-110" : "text-muted-foreground"
          )} />
          
          <div className={cn(
            "relative rounded-xl transition-all duration-500",
            isActive && "shadow-lg shadow-primary/20",
            isListening && "shadow-2xl shadow-red-500/50 scale-105"
          )}>
            <Input
              ref={inputRef}
              type="text"
              placeholder={isListening ? "🎤 Đang nghe..." : placeholder}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              disabled={isListening} // Vô hiệu hóa input khi đang nghe
              className={cn(
                "pl-12 pr-16 h-14 text-base w-full", // Tăng padding-right cho nút voice
                "border-2 transition-all duration-500",
                "bg-background rounded-xl font-medium",
                "placeholder:text-muted-foreground text-foreground",
                isListening
                  ? "border-red-500 bg-gradient-to-r from-red-50 via-pink-50 to-red-50 text-red-900 placeholder:text-red-600 shadow-2xl shadow-red-500/50 ring-4 ring-red-500/30"
                  : isActive
                  ? "border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/50",
                (showDropdown && isActive && !isListening) && "rounded-b-none border-b-0"
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

            {/* --- THAY ĐỔI 4: Thêm VoiceSearchButton vào Input --- */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceSearchButton
                    state={voiceState}
                    isSupported={isVoiceSupported}
                    onClick={toggleVoiceSearch}
                />
            </div>
          </div>

          <SearchHistoryDropdown
            historySuggestions={suggestions.history}
            autocompleteSuggestions={suggestions.autocomplete}
            query={query}
            isLoading={isLoadingAutocomplete}
            error={null}
            selectedIndex={selectedIndex}
            isVisible={showDropdown && isActive}
            onSuggestionClick={handleSuggestionClick}
            onSuggestionHover={(index) => setSelectedIndex(index)}
            onDeleteHistory={handleDeleteHistory}
            onClose={closeDropdown}
            onRetry={() => {}}
            className={cn(
              "absolute top-full left-0 right-0 z-50",
              "border-t-0 rounded-t-none rounded-b-xl",
              "border-2 border-primary focus-within:border-primary",
              "shadow-lg shadow-primary/20"
            )}
          />
        </div>

        <Button
          type="button"
          size="lg"
          className={cn(
            "h-14 px-8 rounded-xl font-semibold flex-shrink-0",
            "btn-gradient text-primary-foreground",
            "transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
            "group",
            isListening && "scale-105 shadow-2xl shadow-red-500/50 ring-4 ring-red-500/30"
          )}
          onClick={handleSearchButtonClick}
          disabled={isListening}
        >
          <Search className={cn(
            "h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110",
            isListening && "animate-pulse"
          )} />
          {isListening ? "Đang nghe..." : "Tìm kiếm"}
        </Button>
      </form>

      {/* Spotlight glow effect around search bar when listening */}
      {isListening && (
        <>
          {/* Outer glow ring */}
          <div className="absolute -inset-8 rounded-3xl bg-gradient-radial from-red-500/30 via-pink-500/20 to-transparent blur-3xl animate-pulse-glow pointer-events-none" />
          
          {/* Middle glow ring */}
          <div className="absolute -inset-4 rounded-2xl bg-gradient-radial from-red-400/40 via-pink-400/30 to-transparent blur-2xl animate-pulse-glow pointer-events-none" 
               style={{ animationDelay: '0.5s' }} />
          
          {/* Inner glow ring */}
          <div className="absolute -inset-2 rounded-xl bg-gradient-radial from-red-300/50 via-pink-300/40 to-transparent blur-xl animate-pulse-glow pointer-events-none" 
               style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Custom styles */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
});

JobSearchBar.displayName = 'JobSearchBar';

export default JobSearchBar;
