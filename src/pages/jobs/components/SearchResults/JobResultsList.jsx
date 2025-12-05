import React from 'react';
import JobResultCard from './JobResultCard';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * JobResultsList - Professional job results list with loading states
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
  // Loading Skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-5 border border-slate-200">
          <div className="flex gap-4 animate-pulse">
            {/* Logo Skeleton */}
            <div className="w-16 h-16 rounded-xl bg-slate-200 flex-shrink-0" />
            
            <div className="flex-1 space-y-3">
              {/* Title */}
              <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
              
              {/* Company */}
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              
              {/* Tags */}
              <div className="flex gap-2">
                <div className="h-6 bg-slate-100 rounded-full w-24" />
                <div className="h-6 bg-slate-100 rounded-full w-20" />
                <div className="h-6 bg-slate-100 rounded-full w-28" />
              </div>
              
              {/* Meta */}
              <div className="flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
              
              {/* Skills */}
              <div className="flex gap-2 pt-1">
                <div className="h-5 bg-slate-100 rounded w-16" />
                <div className="h-5 bg-slate-100 rounded w-20" />
                <div className="h-5 bg-slate-100 rounded w-14" />
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <div className="h-9 bg-slate-100 rounded-full w-28" />
            <div className="h-9 bg-slate-200 rounded-full w-24" />
          </div>
        </Card>
      ))}
    </div>
  );

  // Error State
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

  // Empty State
  const renderEmptyState = () => {
    if (query) {
      return (
        <EmptyState
          title="Không tìm thấy việc làm"
          message={`Không có kết quả phù hợp với "${query}". Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.`}
          actionLabel="Xóa bộ lọc"
          onAction={() => {
            window.location.href = '/jobs/search?query=' + encodeURIComponent(query);
          }}
          className="py-12"
        />
      );
    }

    return (
      <EmptyState
        title="Chưa có việc làm nào"
        message="Hiện tại chưa có việc làm phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc."
        actionLabel="Xóa bộ lọc"
        onAction={() => {
          window.location.href = '/jobs/search';
        }}
        className="py-12"
      />
    );
  };

  // Job Results
  const renderJobResults = () => (
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

  return (
    <div className={cn("", className)}>
      {isLoading && renderLoadingSkeleton()}
      {!isLoading && isError && renderErrorState()}
      {!isLoading && !isError && jobs.length === 0 && renderEmptyState()}
      {!isLoading && !isError && jobs.length > 0 && renderJobResults()}
    </div>
  );
};

export default JobResultsList;
