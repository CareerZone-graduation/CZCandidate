import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ResultsPagination — Swiss/Minimalist professional pagination
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
    pages.push(1);
    if (rangeStart > 2) pages.push('...');
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (rangeEnd < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  const pageNumbers = getPageNumbers();

  const NavBtn = ({ onClick, disabled, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer',
        'text-muted-foreground transition-all duration-200',
        'hover:bg-primary/10 hover:text-primary',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
        '@media (prefers-reduced-motion: reduce) transition-none'
      )}
    >
      {children}
    </button>
  );

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalResults);
  const endItem   = Math.min(currentPage * pageSize, totalResults);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3',
        'bg-card border border-border/60 rounded-xl px-4 py-3 shadow-sm',
        className
      )}
    >
      {/* Result range info */}
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Hiển thị{' '}
        <span className="font-semibold text-foreground">{startItem.toLocaleString()}–{endItem.toLocaleString()}</span>
        {' '}trong{' '}
        <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span>
        {' '}việc làm
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <NavBtn onClick={() => handlePageChange(1)} disabled={currentPage === 1} title="Trang đầu">
          <ChevronsLeft className="h-4 w-4" />
        </NavBtn>
        <NavBtn onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} title="Trang trước">
          <ChevronLeft className="h-4 w-4" />
        </NavBtn>

        <div className="flex items-center gap-0.5 mx-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="w-8 text-center text-xs text-muted-foreground select-none">
                  ···
                </span>
              );
            }
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium cursor-pointer',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        <NavBtn onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Trang sau">
          <ChevronRight className="h-4 w-4" />
        </NavBtn>
        <NavBtn onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} title="Trang cuối">
          <ChevronsRight className="h-4 w-4" />
        </NavBtn>
      </div>
    </div>
  );
};

export default ResultsPagination;
