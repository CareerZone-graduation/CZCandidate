import React from 'react';
import { Search, Briefcase, LayoutGrid, Map, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchResultsHeader - Professional minimalist results header (Swiss design system)
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
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3', className)}>
      {/* Left — Title + query chip */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20">
          {query
            ? <Search className="h-4 w-4 text-primary" />
            : <Briefcase className="h-4 w-4 text-primary" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-foreground leading-tight">
              {query ? 'Kết quả tìm kiếm' : 'Việc làm mới nhất'}
            </h2>
            {totalResults > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <TrendingUp className="h-3 w-3" />
                {totalResults.toLocaleString()} việc làm
              </span>
            )}
          </div>
          {query && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Từ khóa: <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
              {totalPages > 1 && (
                <span className="ml-2 opacity-70">· Trang {currentPage}/{totalPages}</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Right — View mode toggle */}
      {onViewModeChange && (
        <div className="flex items-center self-start sm:self-auto">
          <div
            role="group"
            aria-label="Chế độ xem"
            className="inline-flex items-center bg-muted/60 border border-border/60 p-0.5 rounded-lg gap-0.5"
          >
            {[
              { mode: 'list', icon: LayoutGrid, label: 'Danh sách' },
              { mode: 'map',  icon: Map,        label: 'Bản đồ' },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                aria-pressed={viewMode === mode}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer',
                  'transition-all duration-200',
                  viewMode === mode
                    ? 'bg-background text-primary shadow-sm border border-border/50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
