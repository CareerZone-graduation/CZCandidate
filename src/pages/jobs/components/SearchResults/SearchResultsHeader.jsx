import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchResultsHeader component
 * Displays search results count, pagination info, and filter controls
 */
const SearchResultsHeader = ({
  query = '',
  currentPage = 1,
  totalPages = 0,
  hasActiveFilters = false,
  onClearFilters,
  className
}) => {
  /**
   * Get pagination text
   */
  const getPaginationText = () => {
    if (totalPages <= 1) return null;
    
    return (
      <span className="text-sm text-muted-foreground">
        Trang {currentPage} / {totalPages}
      </span>
    );
  };

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* Main Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">
            {query ? `Kết quả tìm kiếm` : 'Tìm kiếm việc làm'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {getPaginationText()}
        </div>
      </div>

      {/* Active Filters & Controls */}
      {(hasActiveFilters || query) && (
        <div className="flex flex-wrap items-center gap-2">
          {query && (
            <Badge variant="secondary" className="px-3 py-1">
              <span className="text-sm">Từ khóa: {query}</span>
            </Badge>
          )}
          
          {hasActiveFilters && (
            <>
              <Badge variant="outline" className="px-3 py-1">
                <Filter className="h-3 w-3 mr-1" />
                <span className="text-sm">Đã áp dụng bộ lọc</span>
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 px-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </>
          )}
        </div>
      )}

      <Separator />
    </div>
  );
};

export default SearchResultsHeader;