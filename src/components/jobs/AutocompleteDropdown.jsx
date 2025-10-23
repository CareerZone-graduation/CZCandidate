import React from 'react';
import { Clock, History, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Helper function để format filters thành text hiển thị
 */
const formatFilters = (filters) => {
  if (!filters) return '';
  
  const parts = [];
  
  if (filters.category) parts.push(filters.category);
  if (filters.province) parts.push(filters.province);
  if (filters.type) parts.push(filters.type);
  if (filters.minSalary || filters.maxSalary) {
    const min = filters.minSalary || 0;
    const max = filters.maxSalary || '∞';
    parts.push(`${min} - ${max} triệu`);
  }
  
  return parts.join(' • ');
};

/**
 * AutocompleteDropdown Component
 * 
 * Component hiển thị cả history suggestions và autocomplete suggestions
 * Phân biệt rõ ràng giữa history và autocomplete bằng icons
 * 
 * @param {Object} props
 * @param {Array} props.historySuggestions - Mảng history suggestions từ lịch sử tìm kiếm
 * @param {Array} props.autocompleteSuggestions - Mảng autocomplete suggestions từ hệ thống
 * @param {function} props.onSuggestionClick - Handler khi click vào suggestion (item, isHistory)
 * @param {function} props.onDeleteHistory - Handler khi xóa history entry (event, entryId)
 */
const AutocompleteDropdown = ({
  historySuggestions = [],
  autocompleteSuggestions = [],
  onSuggestionClick,
  onDeleteHistory
}) => {
  const hasHistory = historySuggestions.length > 0;
  const hasAutocomplete = autocompleteSuggestions.length > 0;

  // Empty state - không có lịch sử và không có autocomplete
  if (!hasHistory && !hasAutocomplete) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50">
        <div className="px-4 py-6">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-foreground">
                Chưa có lịch sử tìm kiếm
              </p>
              <p className="text-xs text-muted-foreground">
                Lịch sử tìm kiếm của bạn sẽ xuất hiện ở đây
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-[400px] overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-200">
      {/* History Section */}
      {hasHistory && (
        <div className="dropdown-section">
          <div className="px-4 py-2 bg-muted/30 border-b border-border">
            <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Tìm kiếm gần đây</span>
            </div>
          </div>
          
          <div className="max-h-[180px] overflow-y-auto">
            {historySuggestions.map((item) => (
              <div
                key={item._id}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  "hover:bg-muted/50 border-b border-border/50 last:border-b-0",
                  "group"
                )}
                onClick={() => onSuggestionClick(item, true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <History className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {item.query || 'Tất cả việc làm'}
                      </div>
                      {formatFilters(item.filters) && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {formatFilters(item.filters)}
                        </div>
                      )}
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
            ))}
          </div>
        </div>
      )}

      {/* Divider với label "Gợi ý khác" */}
      {hasHistory && hasAutocomplete && (
        <div className="px-4 py-2 bg-muted/20 border-y border-border">
          <div className="text-xs font-medium text-muted-foreground">
            Gợi ý khác
          </div>
        </div>
      )}

      {/* Autocomplete Section */}
      {hasAutocomplete && (
        <div className="dropdown-section">
          <div className="max-h-[180px] overflow-y-auto">
            {autocompleteSuggestions.map((item, index) => (
              <div
                key={`autocomplete-${index}`}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors",
                  "hover:bg-muted/50 border-b border-border/50 last:border-b-0",
                  "flex items-center gap-3"
                )}
                onClick={() => onSuggestionClick(item, false)}
              >
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground truncate">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteDropdown;
