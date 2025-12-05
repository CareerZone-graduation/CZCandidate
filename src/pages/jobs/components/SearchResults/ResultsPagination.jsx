import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ResultsPagination - Clean, professional pagination component
 */
const ResultsPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  pageSize = 10,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const pages = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    if (totalPages > 1) pages.push(1);
    if (rangeStart > 2) pages.push('...');
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    
    if (rangeEnd < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-center justify-center gap-4",
      "bg-white rounded-2xl border border-slate-200 shadow-sm p-4",
      className
    )}>
      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-lg text-slate-500 hover:text-primary disabled:opacity-40"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 rounded-lg text-slate-500 hover:text-primary disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span 
                  key={`ellipsis-${index}`} 
                  className="w-9 text-center text-slate-400"
                >
                  ···
                </span>
              );
            }

            const isActive = currentPage === page;
            return (
              <Button
                key={page}
                variant={isActive ? "default" : "ghost"}
                size="icon"
                onClick={() => handlePageChange(page)}
                className={cn(
                  "h-9 w-9 rounded-lg font-medium transition-all",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-slate-600 hover:text-primary hover:bg-primary/5"
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-lg text-slate-500 hover:text-primary disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 rounded-lg text-slate-500 hover:text-primary disabled:opacity-40"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Info */}
      <div className="text-sm text-slate-500">
        Trang <span className="font-medium text-slate-700">{currentPage}</span> / {totalPages}
        {totalResults > 0 && (
          <span className="hidden sm:inline ml-2">
            ({totalResults.toLocaleString()} kết quả)
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultsPagination;
