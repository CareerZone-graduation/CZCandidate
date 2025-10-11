import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AutocompleteDropdown from '@/components/common/AutocompleteDropdown';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { cn } from '@/lib/utils';
// --- THAY ĐỔI 1: Import hook mới ---
import { useSonioxSearch } from '@/hooks/useSonioxSearch';
import VoiceSearchButton from '@/components/common/VoiceSearchButton';

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

  // --- THAY ĐỔI 2: Sử dụng useAutocomplete và giữ nguyên ---
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

  // --- THAY ĐỔI 3: Khởi tạo hook Soniox ---
  const {
    state: voiceState,
    isListening,
    fullTranscript,
    isSupported: isVoiceSupported,
    toggleSearch: toggleVoiceSearch
  } = useSonioxSearch({
    onResult: (text) => {
      handleInputChange(text); // Cập nhật query trong autocomplete hook
      handleSearch(text);     // Thực hiện tìm kiếm
    }
  });

  // Cập nhật input với transcript real-time từ Soniox
  useEffect(() => {
    if (isListening) {
      handleInputChange(fullTranscript);
    }
  }, [fullTranscript, isListening, handleInputChange]);

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      handleInputChange(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (searchQuery = query) => {
    setIsActive(false);
    closeDropdown();
    if (inputRef.current) {
      inputRef.current.blur();
    }
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleInputKeyDown = (event) => {
    setIsActive(true);
    const result = handleKeyDown(event);
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchTerm = result || query;
      handleSearch(searchTerm);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    const selectedTitle = handleSuggestionClick(suggestion);
    handleSearch(selectedTitle || '');
  };

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
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsActive(true)}
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
