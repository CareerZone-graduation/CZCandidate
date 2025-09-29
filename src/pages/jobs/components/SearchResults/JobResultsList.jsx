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
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Company Logo Skeleton */}
                <Skeleton className="h-28 w-28 rounded-lg flex-shrink-0 bg-gradient-to-br from-primary/10 to-info/10" />
                
                <div className="flex-1 space-y-3">
                  {/* Job Title and Company */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-primary/10 to-info/10" />
                    <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-primary/10 to-info/10" />
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-md bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
                    <Skeleton className="h-6 w-24 rounded-md bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                    <Skeleton className="h-6 w-28 rounded-md bg-gradient-to-r from-emerald-500/10 to-green-500/10" />
                    <Skeleton className="h-6 w-22 rounded-md bg-gradient-to-r from-purple-500/10 to-violet-500/10" />
                    <Skeleton className="h-6 w-24 rounded-md bg-gradient-to-r from-red-500/10 to-rose-500/10" />
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gradient-to-r from-primary/10 to-info/10" />
                    <Skeleton className="h-4 w-2/3 bg-gradient-to-r from-primary/10 to-info/10" />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16 bg-gradient-to-r from-primary/10 to-info/10" />
                      <Skeleton className="h-4 w-20 bg-gradient-to-r from-primary/10 to-info/10" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-md bg-gradient-to-r from-primary/10 to-info/10" />
                      <Skeleton className="h-8 w-16 rounded-md bg-gradient-to-r from-primary/10 to-info/10" />
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
      <div className="space-y-4">
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
