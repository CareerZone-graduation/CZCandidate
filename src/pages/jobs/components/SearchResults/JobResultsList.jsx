import React from 'react';
import JobResultCard from './JobResultCard';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * JobResultsList component
 * Handles displaying job results with loading, error, and empty states
 */
const JobResultsList = ({
  jobs = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  query = '',
  className,
  userLocation,
  searchParameters
}) => {
  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card 
            key={index} 
            className={cn(
              "border-2 border-border/50 shadow-lg shadow-primary/5",
              "bg-card/95 backdrop-blur-sm",
              "overflow-hidden relative animate-pulse"
            )}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            
            <CardContent className="p-6 relative z-10">
              <div className="flex gap-4">
                {/* Company Logo Skeleton */}
                <Skeleton className={cn(
                  "h-32 w-32 rounded-2xl flex-shrink-0",
                  "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
                )} />
                
                <div className="flex-1 space-y-4">
                  {/* Job Title and Company */}
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4 rounded-lg bg-gradient-to-r from-primary/15 to-primary/5" />
                    <Skeleton className="h-5 w-1/2 rounded-lg bg-gradient-to-r from-primary/10 to-transparent" />
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-7 w-24 rounded-lg bg-gradient-to-r from-blue-500/15 to-cyan-500/10" />
                    <Skeleton className="h-7 w-28 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/10" />
                    <Skeleton className="h-7 w-32 rounded-lg bg-gradient-to-r from-emerald-500/15 to-green-500/10" />
                    <Skeleton className="h-7 w-28 rounded-lg bg-gradient-to-r from-purple-500/15 to-violet-500/10" />
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded bg-gradient-to-r from-primary/10 to-transparent" />
                    <Skeleton className="h-4 w-5/6 rounded bg-gradient-to-r from-primary/10 to-transparent" />
                  </div>
                  
                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-gradient-to-r from-primary/15 to-primary/5" />
                    <Skeleton className="h-6 w-24 rounded-full bg-gradient-to-r from-primary/15 to-primary/5" />
                    <Skeleton className="h-6 w-18 rounded-full bg-gradient-to-r from-primary/15 to-primary/5" />
                    <Skeleton className="h-6 w-16 rounded-full bg-gradient-to-r from-primary/15 to-primary/5" />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-20 rounded bg-gradient-to-r from-primary/10 to-transparent" />
                      <Skeleton className="h-4 w-24 rounded bg-gradient-to-r from-primary/10 to-transparent" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-9 w-28 rounded-lg bg-gradient-to-r from-primary/15 to-primary/10" />
                      <Skeleton className="h-9 w-24 rounded-lg bg-gradient-to-r from-primary/20 to-primary/15" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => {
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        'Có lỗi xảy ra khi tải danh sách việc làm';

    return (
      <ErrorState
        message={errorMessage}
        onRetry={onRetry}
        className="py-12"
      />
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (query) {
      return (
        <EmptyState
          title="Không tìm thấy việc làm nào"
          message={`Không có kết quả phù hợp với từ khóa "${query}". Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.`}
          actionLabel="Xóa bộ lọc"
          onAction={() => {
            // Clear filters functionality would be handled by parent
            window.location.href = '/jobs/search?query=' + encodeURIComponent(query);
          }}
          className="py-12"
        />
      );
    }

    return (
      <EmptyState
        title="Chưa có việc làm nào"
        message="Hiện tại chưa có việc làm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc quay lại sau."
        actionLabel="Xóa bộ lọc"
        onAction={() => {
          // Clear all filters
          window.location.href = '/jobs/search';
        }}
        className="py-12"
      />
    );
  };

  /**
   * Render job results
   */
  const renderJobResults = () => {
    return (
      <div className="space-y-6">
        {jobs.map((job, index) => (
          <JobResultCard
            key={job.id || job._id || index}
            job={job}
            showSaveButton={true}
            compact={false}
            userLocation={userLocation}
            searchParameters={searchParameters}
          />
        ))}
      </div>
    );
  };

  // Main render logic
  return (
    <div className={cn("", className)}>
      {/* Loading State */}
      {isLoading && renderLoadingSkeleton()}

      {/* Error State */}
      {!isLoading && isError && renderErrorState()}

      {/* Empty State */}
      {!isLoading && !isError && jobs.length === 0 && renderEmptyState()}

      {/* Results */}
      {!isLoading && !isError && jobs.length > 0 && renderJobResults()}
    </div>
  );
};

export default JobResultsList;
