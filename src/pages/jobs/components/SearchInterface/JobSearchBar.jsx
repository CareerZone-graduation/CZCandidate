import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AutocompleteDropdown from '@/components/common/AutocompleteDropdown';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { cn } from '@/lib/utils';

/**
 * JobSearchBar component specifically for the job search page
 * Includes search button and auto-blur functionality
 */
const JobSearchBar = forwardRef(({
  placeholder = "Tìm kiếm công việc, kỹ năng, công ty...",
  initialQuery = "",
  onSearch,
  className,
  inputProps = {},
  autocompleteOptions = {}
}, ref) => {
  const inputRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

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
    delay: 10,
    minLength: 1,
    maxSuggestions: 10,
    ...autocompleteOptions
  });

  // Set initial value if provided
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      handleInputChange(initialQuery);
    }
  }, [initialQuery]);

  /**
   * Handle search execution with auto-blur
   * @param {string} searchQuery - The search query to execute
   */
  const handleSearch = (searchQuery = query) => {
    setIsActive(false);
    closeDropdown();
    
    // Blur the input to remove focus after search
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    if (onSearch) {
      // Allow empty search - will show all jobs
      onSearch(searchQuery.trim());
    }
  };

  /**
   * Handle input key down events
   * @param {KeyboardEvent} event - The keyboard event
   */
  const handleInputKeyDown = (event) => {
    setIsActive(true);
    const result = handleKeyDown(event);
    
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchTerm = result || query;
      // Allow search even with empty query
      handleSearch(searchTerm);
    }
  };

  /**
   * Handle suggestion selection
   * @param {Object} suggestion - The selected suggestion
   */
  const handleSuggestionSelect = (suggestion) => {
    const selectedTitle = handleSuggestionClick(suggestion);
    // Always search, even if empty
    handleSearch(selectedTitle || '');
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
   * Handle search button click
   */
  const handleSearchButtonClick = () => {
    // Blur input immediately when clicking search button
    if (inputRef.current) {
      inputRef.current.blur();
    }
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
      <form onSubmit={handleSubmit} className="relative flex gap-3">
        <div className="relative flex-1">
          {/* Search Icon with animation */}
          <Search className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10",
            "transition-all duration-300",
            isActive ? "text-primary scale-110" : "text-muted-foreground"
          )} />
          
          {/* Input Field with enhanced styling */}
          <div className={cn(
            "relative rounded-xl transition-all duration-300",
            isActive && "shadow-lg shadow-primary/20"
          )}>
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}  
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsActive(true)}
              className={cn(
                "pl-12 pr-4 h-14 text-base w-full",
                "border-2 transition-all duration-300",
                "bg-background rounded-xl font-medium",
                "placeholder:text-muted-foreground text-foreground",
                isActive 
                  ? "border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10" 
                  : "border-border hover:border-primary/50",
                (showDropdown && isActive) && "rounded-b-none border-b-0"
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
          </div>

          {/* Autocomplete Dropdown - positioned relative to input container */}
          <AutocompleteDropdown
            suggestions={suggestions}
            query={query}
            isLoading={isLoading}
            error={error}
            selectedIndex={selectedIndex}
            isVisible={showDropdown && isActive}
            onSuggestionClick={handleSuggestionSelect}
            onSuggestionHover={handleSuggestionHover}
            onClose={closeDropdown}
            onRetry={retry}
            className={cn(
              // Match input width and positioning
              "absolute top-full left-0 right-0 z-50",
              "border-t-0 rounded-t-none rounded-b-xl",
              "border-2 border-primary focus-within:border-primary",
              "shadow-lg shadow-primary/20"
            )}
          />
        </div>

        {/* Enhanced Search Button with gradient */}
        <Button
          type="button"
          size="lg"
          className={cn(
            "h-14 px-8 rounded-xl font-semibold flex-shrink-0",
            "btn-gradient text-primary-foreground",
            "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
            "group"
          )}
          onClick={handleSearchButtonClick}
        >
          <Search className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
          Tìm kiếm
        </Button>
      </form>
    </div>
  );
});

JobSearchBar.displayName = 'JobSearchBar';

export default JobSearchBar;
