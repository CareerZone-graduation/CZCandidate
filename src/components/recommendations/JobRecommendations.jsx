import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecommendations, generateRecommendations } from '@/services/recommendationService';
import JobRecommendationCard from './JobRecommendationCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  FileText,
  MapPin,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

/**
 * JobRecommendations component
 * Displays personalized job recommendations with infinite scroll
 */
const JobRecommendations = ({
  limit = 10,
  showHeader = true,
  className
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch recommendations with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['recommendations', limit],
    queryFn: ({ pageParam = 1 }) => getRecommendations({ page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Generate new recommendations
  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onMutate: () => {
      setIsGenerating(true);
    },
    onSuccess: (response) => {
      setIsGenerating(false);
      toast.success(response.message || 'Đã tạo gợi ý việc làm mới');
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      refetch();
    },
    onError: (err) => {
      setIsGenerating(false);
      const errorMessage = err.response?.data?.message || 'Không thể tạo gợi ý việc làm';
      toast.error(errorMessage);
    }
  });

  const handleGenerateRecommendations = () => {
    generateMutation.mutate({ limit: 20 });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    refetch();
  };

  // Get all jobs from all pages
  const allJobs = data?.pages?.flatMap(page => page.data).filter(item => item.jobId) || [];
  const totalItems = data?.pages?.[0]?.pagination?.totalItems || 0;
  const lastUpdated = data?.pages?.[0]?.lastUpdated;

  const LoadingSkeletons = () => (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden border-muted shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-32 w-32 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Loading state (Initial or Refetching while empty)
  if (isLoading || (allJobs.length === 0 && isFetching && !isError)) {
    return <LoadingSkeletons />;
  }

  // Error state
  if (isError) {
    const errorMessage = error?.response?.data?.message || 'Không thể tải gợi ý việc làm';
    const isProfileIncomplete = errorMessage.includes('60%') || errorMessage.toLowerCase().includes('profile');

    return (
      <Card className={cn("border-2 border-dashed border-amber-200 bg-amber-50/30", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-amber-100 rounded-full dark:bg-amber-900/20">
              {isProfileIncomplete ? (
                <UserCheck className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-400 mb-2">
                {isProfileIncomplete ? 'Hồ sơ chưa đủ dữ liệu' : 'Đã có lỗi xảy ra'}
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-6 max-w-md mx-auto">
                {isProfileIncomplete
                  ? 'Để AI có thể gợi ý việc làm chính xác, bạn cần cập nhật thêm thông tin kỹ năng và kinh nghiệm.'
                  : errorMessage}
              </p>
            </div>
            {isProfileIncomplete ? (
              <Button
                onClick={() => navigate('/profile')}
                className="btn-gradient shadow-md"
              >
                <FileText className="h-4 w-4 mr-2" />
                Hoàn thiện hồ sơ
              </Button>
            ) : (
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No recommendations state
  if (allJobs.length === 0) {
    return (
      <Card className={cn("border-2 border-dashed border-muted bg-muted/30", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="p-5 bg-background rounded-full shadow-sm ring-1 ring-border">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                Chưa tìm thấy gợi ý phù hợp
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Hệ thống chưa tìm thấy công việc nào khớp với hồ sơ của bạn lúc này. Hãy thử cập nhật thêm thông tin hoặc tạo gợi ý mới.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left bg-background p-5 rounded-xl border shadow-sm">
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Kỹ năng</p>
                  <p className="text-muted-foreground text-xs">Cập nhật skills</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Địa điểm</p>
                  <p className="text-muted-foreground text-xs">Thêm nơi làm việc</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Mức lương</p>
                  <p className="text-muted-foreground text-xs">Cập nhật mong muốn</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="hover:bg-muted"
              >
                <FileText className="h-4 w-4 mr-2" />
                Cập nhật hồ sơ
              </Button>
              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="btn-gradient shadow-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tạo gợi ý ngay
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Việc làm gợi ý cho bạn
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} việc làm phù hợp với hồ sơ của bạn
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isFetching}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
              Làm mới
            </Button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {allJobs.map((job) => (
          <JobRecommendationCard
            key={job.jobId?._id || job._id} // Handle structure variation
            job={job.jobId || job}
            recommendationScore={job.score}
            recommendationReasons={job.reasons}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="border-2 border-primary/40 text-primary hover:bg-primary/10"
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Xem thêm việc làm
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden border-muted shadow-sm">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-32 w-32 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
