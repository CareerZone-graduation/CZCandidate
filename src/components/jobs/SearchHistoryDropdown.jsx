import React, { useRef, useEffect } from 'react';
import { Loader2, AlertCircle, Clock, History, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import SuggestionItem from '@/components/common/SuggestionItem';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Helper function to highlight matching text
 */
const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <span key={index} className="text-primary font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

/**
 * Component dropdown hiển thị cả history suggestions và autocomplete suggestions
 * 
 * @param {Object} props
 * @param {Array} props.historySuggestions - Mảng history suggestions
 * @param {Array} props.autocompleteSuggestions - Mảng autocomplete suggestions
 * @param {string} props.query - Query string hiện tại
 * @param {boolean} props.isLoading - Trạng thái loading
 * @param {string} props.error - Error message nếu có
 * @param {number} props.selectedIndex - Index của item được chọn
 * @param {boolean} props.isVisible - Có hiển thị dropdown không
 * @param {function} props.onSuggestionClick - Handler khi click suggestion
 * @param {function} props.onSuggestionHover - Handler khi hover suggestion
 * @param {function} props.onDeleteHistory - Handler khi xóa history entry
 * @param {function} props.onClose - Handler để đóng dropdown
 * @param {function} props.onRetry - Handler để retry khi có lỗi
 * @param {string} props.className - Additional CSS classes
 */
const SearchHistoryDropdown = ({
  historySuggestions = [],
  autocompleteSuggestions = [],
  query = '',
  isLoading = false,
  error = null,
  selectedIndex = -1,
  isVisible = false,
  onSuggestionClick,
  onSuggestionHover,
  onDeleteHistory,
  onClose,
  onRetry,
  className
}) => {
  const dropdownRef = useRef(null);

  const hasHistory = historySuggestions.length > 0;
  const hasAutocomplete = autocompleteSuggestions.length > 0;
  const totalSuggestions = historySuggestions.length + autocompleteSuggestions.length;

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
        "bg-background border border-border rounded-lg shadow-lg",
        "max-h-[500px] overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        "w-full",
        className
      )}
    >
      {/* Error State */}
      {error && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="text-xs font-medium text-destructive">
                Không thể tải gợi ý
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

      {/* History Section */}
      {hasHistory && (
        <div className="dropdown-section">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Tìm kiếm gần đây</span>
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {historySuggestions.map((item, index) => {
              // Safety check for item
              if (!item || !item._id) return null;
              
              return (
                <div
                  key={item._id}
                  data-index={index}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    "hover:bg-muted/50 border-b border-border/50 last:border-b-0",
                    "group",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => onSuggestionClick(item, true)}
                  onMouseEnter={() => onSuggestionHover?.(index)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground text-left">
                          {highlightMatch(item.query || 'Tất cả việc làm', query)}
                        </div>
                      </div>
                    </div>

                    <button
                      className={cn(
                        "flex-shrink-0 p-1 rounded hover:bg-destructive/10 transition-colors",
                        "opacity-0 group-hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistory?.(e, item._id);
                      }}
                      aria-label="Xóa lịch sử"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      {hasHistory && hasAutocomplete && (
        <div className="px-4 py-2 bg-muted/20 border-y border-border">
          <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            <span>Gợi ý khác</span>
          </div>
        </div>
      )}

      {/* Autocomplete Section */}
      {hasAutocomplete && (
        <div className="dropdown-section">
          <div className="max-h-[300px] overflow-y-auto">
            <ul role="listbox" aria-label="Gợi ý tiêu đề công việc" className="py-1">
              {autocompleteSuggestions.map((suggestion, index) => {
                const globalIndex = historySuggestions.length + index;
                return (
                  <div key={suggestion.title + index} data-index={globalIndex}>
                    <SuggestionItem
                      suggestion={suggestion}
                      query={query}
                      isSelected={globalIndex === selectedIndex}
                      onClick={() => onSuggestionClick(suggestion, false)}
                      onMouseEnter={() => onSuggestionHover?.(globalIndex)}
                      index={globalIndex}
                    />
                  </div>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasHistory && !hasAutocomplete && (
        <div className="px-4 py-8 text-left">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Đang tìm kiếm...</span>
          </div>

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

      {/* Empty State */}
      {!isLoading && !error && !hasHistory && !hasAutocomplete && query.length === 0 && (
        <div className="px-4 py-6">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1 flex-1 text-left">
              <p className="text-sm font-medium text-foreground">
                Chưa có lịch sử tìm kiếm
              </p>
              <p className="text-xs text-muted-foreground">
                Lịch sử tìm kiếm của bạn sẽ xuất hiện ở đây
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && !hasHistory && !hasAutocomplete && query.length > 0 && (
        <div className="px-4 py-6">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <Search className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="space-y-1 flex-1 text-left">
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

      {/* Footer với keyboard shortcuts hint */}
      {totalSuggestions > 0 && (
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
      )}
    </div>
  );
};

export default SearchHistoryDropdown;
