import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Sparkles, Filter, X, TrendingUp } from 'lucide-react';
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
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg",
        "bg-gradient-to-r from-primary/10 to-primary/5",
        "border border-primary/20"
      )}>
        <span className="text-sm font-semibold text-primary">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* Main Results Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {query ? (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Kết quả tìm kiếm
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    Từ khóa: <span className="text-foreground font-semibold">"{query}"</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 animate-pulse">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/70 bg-clip-text text-transparent">
                    Tất cả việc làm
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Khám phá các cơ hội việc làm mới nhất
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getPaginationText()}
        </div>
      </div>

      {/* Active Filters & Controls */}
      {(hasActiveFilters || query) && (
        <div className="flex flex-wrap items-center gap-2">
          {query && (
            <Badge 
              variant="secondary" 
              className={cn(
                "px-4 py-2 rounded-lg font-semibold",
                "bg-gradient-to-r from-blue-500/15 to-cyan-500/10",
                "text-blue-600 border border-blue-500/30",
                "hover:from-blue-500/25 hover:to-cyan-500/15",
                "transition-all duration-300"
              )}
            >
              <Search className="h-3 w-3 mr-2" />
              <span className="text-sm">"{query}"</span>
            </Badge>
          )}
          
          {hasActiveFilters && (
            <>
              <Badge 
                variant="outline" 
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold",
                  "bg-gradient-to-r from-primary/10 to-primary/5",
                  "text-primary border-2 border-primary/30",
                  "hover:from-primary/20 hover:to-primary/10",
                  "transition-all duration-300 animate-pulse"
                )}
              >
                <Filter className="h-3 w-3 mr-2" />
                <span className="text-sm">Bộ lọc đang áp dụng</span>
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className={cn(
                  "h-9 px-4 rounded-lg font-semibold",
                  "text-muted-foreground hover:text-red-600",
                  "hover:bg-red-50/20 border-2 border-transparent",
                  "hover:border-red-500/30",
                  "transition-all duration-300 hover:scale-105"
                )}
              >
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            </>
          )}
        </div>
      )}

      <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
};

export default SearchResultsHeader;