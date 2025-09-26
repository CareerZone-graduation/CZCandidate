import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import AutocompleteDropdown from './AutocompleteDropdown';

/**
 * Component tìm kiếm với autocomplete cho job titles
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
const SearchAutocomplete = forwardRef(({
  placeholder = "Vị trí công việc, kỹ năng, công ty...",
  initialValue = "",
  onSearch,
  className,
  inputProps = {},
  autocompleteOptions = {}
}, ref) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize autocomplete hook
  const {
    query,
    suggestions,
    isLoading,
    error,
    selectedIndex,
    showDropdown,
    handleInputChange,
    handleKeyDown,
    handleSuggestionClick,
    handleSuggestionHover,
    closeDropdown,
    clear,
    retry
  } = useAutocomplete({
    delay: 0,
    minLength: 1,
    maxSuggestions: 10,
    ...autocompleteOptions
  });

  // Set initial value if provided
  React.useEffect(() => {
    if (initialValue && !query) {
      handleInputChange(initialValue);
    }
  }, [initialValue, query, handleInputChange]);

  /**
   * Xử lý search action - navigate đến trang JobList với query params
   */
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    closeDropdown();

    if (onSearch) {
      // Nếu có custom onSearch handler
      onSearch(searchQuery.trim(), {
        page: 1,
        size: 10,
        query: searchQuery.trim()
      });
    } else {
      // Mặc định navigate đến /jobs với query parameters
      const searchParams = new URLSearchParams();
      searchParams.set('query', searchQuery.trim());
      searchParams.set('page', '1');
      searchParams.set('size', '10');
      
      navigate(`/jobs?${searchParams.toString()}`);
    }
  };

  /**
   * Xử lý sự kiện key down
   */
  const handleInputKeyDown = (event) => {
    const result = handleKeyDown(event);
    
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchTerm = result || query;
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }
  };

  /**
   * Xử lý click trên suggestion
   */
  const handleSuggestionSelect = (suggestion) => {
    const selectedTitle = handleSuggestionClick(suggestion);
    if (selectedTitle) {
      handleSearch(selectedTitle);
    }
  };

  /**
   * Xử lý submit form (khi click search button hoặc submit)
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

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
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
        
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}  
          onKeyDown={handleInputKeyDown}
          onFocus={() => {
            // Hiển thị dropdown nếu có suggestions và query đủ dài
            if (suggestions.length > 0 && query.length >= 1) {
              // Trigger dropdown bằng cách "fake" một input change
              handleInputChange(query);
            }
          }}
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

        {/* Autocomplete Dropdown */}
        <AutocompleteDropdown
          suggestions={suggestions}
          query={query}
          isLoading={isLoading}
          error={error}
          selectedIndex={selectedIndex}
          isVisible={showDropdown}
          onSuggestionClick={handleSuggestionSelect}
          onSuggestionHover={handleSuggestionHover}
          onClose={closeDropdown}
          onRetry={retry}
          className={cn(
            // Match input styling
            "border-t-0 rounded-t-none rounded-b-xl",
            "border-2 border-primary focus-within:border-primary"
          )}
        />
      </form>
    </div>
  );
});

SearchAutocomplete.displayName = 'SearchAutocomplete';

export default SearchAutocomplete;