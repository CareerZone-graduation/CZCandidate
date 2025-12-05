import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase, LayoutGrid, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchResultsHeader - Clean, professional results header
 */
const SearchResultsHeader = ({
  query = '',
  totalResults = 0,
  currentPage = 1,
  totalPages = 0,
  viewMode = 'list',
  onViewModeChange,
  className
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Title & Query */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-primary/10"
          )}>
            {query ? (
              <Search className="h-5 w-5 text-primary" />
            ) : (
              <Briefcase className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {query ? 'Kết quả tìm kiếm' : 'Việc làm mới nhất'}
            </h2>
            {query && (
              <p className="text-sm text-slate-500">
                Từ khóa: <span className="text-slate-700 font-medium">"{query}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Stats & View Toggle */}
        <div className="flex items-center gap-3">
          {onViewModeChange && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  viewMode === 'list'
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
                title="Xem danh sách"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('map')}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  viewMode === 'map'
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
                title="Xem bản đồ"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          )}

          {totalResults > 0 && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-0 px-3 py-1"
            >
              {totalResults.toLocaleString()} việc làm
            </Badge>
          )}
          {totalPages > 1 && (
            <span className="text-sm text-slate-500">
              Trang {currentPage}/{totalPages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;
