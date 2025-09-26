import React, { useRef, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuggestionItem from './SuggestionItem';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Component dropdown chứa autocomplete suggestions với keyboard navigation (phiên bản cho trang Home)
 * 
 * @param {Object} props
 * @param {Array} props.suggestions - Mảng suggestions
 * @param {string} props.query - Query string hiện tại
 * @param {boolean} props.isLoading - Trạng thái loading
 * @param {string} props.error - Error message nếu có
 * @param {number} props.selectedIndex - Index của item được chọn
 * @param {boolean} props.isVisible - Có hiển thị dropdown không
 * @param {function} props.onSuggestionClick - Handler khi click suggestion
 * @param {function} props.onSuggestionHover - Handler khi hover suggestion
 * @param {function} props.onClose - Handler để đóng dropdown
 * @param {function} props.onRetry - Handler để retry khi có lỗi
 * @param {string} props.className - Additional CSS classes
 */
const HomeAutocompleteDropdown = ({
  suggestions = [],
  query = '',
  isLoading = false,
  error = null,
  selectedIndex = -1,
  isVisible = false,
  onSuggestionClick,
  onSuggestionHover,
  onClose,
  onRetry,
  className
}) => {
  const dropdownRef = useRef(null);

  /**
   * Đóng dropdown khi click outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible, onClose]);

  /**
   * Auto scroll để đảm bảo selected item visible
   */
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

 // Không render nếu không visible
  if (!isVisible) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute top-full left-0 z-50 mt-1",
        "bg-background border border-border rounded-lg shadow-lg",
        "max-h-[300px] overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        // Mobile: full available width
        "w-full",
        // Desktop: span across the entire search row (input + location + button)
        "lg:w-[calc(200%+2rem)]", // Double width + gaps to cover all 3 grid sections
        className
      )}
    >
      {/* Error State - Show above suggestions if there are any */}
      {error && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-destructive">
                Không thể tải gợi ý mới
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-xs text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                >
                  Thử lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions List - Show even when loading */}
      {!error && suggestions.length > 0 && (
        <div className="max-h-[240px] overflow-y-auto">
          <ul
            role="listbox"
            aria-label="Gợi ý tiêu đề công việc"
            className="py-1"
          >
            {suggestions.map((suggestion, index) => (
              <div key={suggestion.title + index} data-index={index}>
                <SuggestionItem
                  suggestion={suggestion}
                  query={query}
                  isSelected={index === selectedIndex}
                  onClick={onSuggestionClick}
                  onMouseEnter={onSuggestionHover}
                  index={index}
                />
              </div>
            ))}
          </ul>
          
          {/* Footer với keyboard shortcuts hint */}
          <div className="border-t border-border px-4 py-2 bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border rounded">↑↓</kbd> điều hướng
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border rounded">Enter</kbd> chọn
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 text-xs bg-background border border-border rounded">Esc</kbd> đóng
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State - Only show when no suggestions */}
      {isLoading && suggestions.length === 0 && (
        <div className="px-4 py-8">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Đang tìm kiếm...</span>
          </div>
          
          {/* Loading Skeleton */}
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="px-4 py-3 flex items-center space-x-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - Only show when not loading and no suggestions */}
      {!isLoading && !error && suggestions.length === 0 && query.length > 0 && (
        <div className="px-4 py-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-foreground">
                Không tìm thấy gợi ý nào
              </p>
              <p className="text-xs text-muted-foreground">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeAutocompleteDropdown;
