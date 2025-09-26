import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AutocompleteDropdown from '@/components/common/AutocompleteDropdown';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { cn } from '@/lib/utils';

/**
 * Enhanced SearchBar component for the job search page
 * Integrates with existing autocomplete functionality
 */
const SearchBar = forwardRef(({
  placeholder = "Tìm kiếm công việc, kỹ năng, công ty...",
  initialQuery = "",
  onSearch,
  className,
  inputProps = {},
  autocompleteOptions = {}
}, ref) => {
  const inputRef = useRef(null);

  // Initialize autocomplete hook with custom options
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
    delay: 300,
    minLength: 1,
    maxSuggestions: 10,
    ...autocompleteOptions
  });

  // Set initial value if provided
  React.useEffect(() => {
    if (initialQuery && !query) {
      handleInputChange(initialQuery);
    }
  }, [initialQuery, query, handleInputChange]);

  /**
   * Handle search execution
   * @param {string} searchQuery - The search query to execute
   */
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    closeDropdown();
    
    // Blur the input to remove focus after search
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  /**
   * Handle input key down events
   * @param {KeyboardEvent} event - The keyboard event
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
   * Handle suggestion selection
   * @param {Object} suggestion - The selected suggestion
   */
  const handleSuggestionSelect = (suggestion) => {
    const selectedTitle = handleSuggestionClick(suggestion);
    if (selectedTitle) {
      handleSearch(selectedTitle);
    }
  };

  /**
   * Handle form submission
   * @param {Event} event - The form submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  /**
   * Focus the input
   */
  const focus = () => {
    inputRef.current?.focus();
  };

  /**
   * Expose methods via ref
   */
  useImperativeHandle(ref, () => ({
    focus,
    clear,
    getValue: () => query,
    setValue: handleInputChange
  }));

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <div className="relative flex-1">
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
              // Show dropdown if there are suggestions and query is long enough
              if (suggestions.length > 0 && query.length >= 1) {
                // Trigger dropdown by "faking" an input change
                handleInputChange(query);
              }
            }}
            className={cn(
              "pl-12 pr-4 h-12 text-base w-full",
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

          {/* Autocomplete Dropdown - positioned relative to input container */}
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
              // Match input width and positioning
              "absolute top-full left-0 right-0 z-50",
              "border-t-0 rounded-t-none rounded-b-xl",
              "border-2 border-primary focus-within:border-primary"
            )}
          />
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 rounded-xl font-medium flex-shrink-0"
          disabled={!query.trim()}
          onClick={() => {
            // Blur input when clicking search button
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }}
        >
          <Search className="h-5 w-5 mr-2" />
          Tìm kiếm
        </Button>
      </form>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;