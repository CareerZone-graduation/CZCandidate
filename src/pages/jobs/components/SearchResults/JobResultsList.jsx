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
  className
}) => {
  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Company Logo Skeleton */}
                <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                
                <div className="flex-1 space-y-3">
                  {/* Job Title and Company */}
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  
                  {/* Badges */}
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
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
        title="Bắt đầu tìm kiếm việc làm"
        message="Nhập từ khóa vào ô tìm kiếm để khám phá các cơ hội nghề nghiệp phù hợp với bạn."
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