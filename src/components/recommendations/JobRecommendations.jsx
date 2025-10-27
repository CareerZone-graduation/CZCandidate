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
  Briefcase
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
  const allJobs = data?.pages?.flatMap(page => page.data) || [];
  const totalItems = data?.pages?.[0]?.pagination?.totalItems || 0;
  const lastUpdated = data?.pages?.[0]?.lastUpdated;

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showHeader && (
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
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
  }

  // Error state
  if (isError) {
    const errorMessage = error?.response?.data?.message || 'Không thể tải gợi ý việc làm';
    const isProfileIncomplete = errorMessage.includes('60%');

    return (
      <Card className={cn("border-2 border-amber-200 bg-amber-50/50", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-amber-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                {isProfileIncomplete ? 'Hồ sơ chưa đủ để tạo gợi ý' : 'Không thể tải gợi ý'}
              </h3>
              <p className="text-amber-700 mb-4">
                {errorMessage}
              </p>
            </div>
            {isProfileIncomplete ? (
              <Button
                onClick={() => navigate('/profile')}
                className="btn-gradient"
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
      <Card className={cn("border-2 border-blue-200 bg-blue-50/50", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Chưa có gợi ý việc làm
              </h3>
              <p className="text-blue-700 mb-4">
                Hãy tạo gợi ý việc làm dựa trên hồ sơ của bạn
              </p>
            </div>
            <div className="space-y-3 text-left bg-white p-4 rounded-lg border border-blue-200 max-w-md">
              <p className="text-sm font-semibold text-blue-900 mb-2">Để nhận gợi ý tốt hơn, hãy:</p>
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Cập nhật kỹ năng và kinh nghiệm</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Thêm địa điểm làm việc mong muốn</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-blue-700">
                <Briefcase className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Điền mức lương và hình thức làm việc</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                Cập nhật hồ sơ
              </Button>
              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="btn-gradient"
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
              {lastUpdated && ` • Cập nhật ${new Date(lastUpdated).toLocaleString('vi-VN')}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Làm mới
            </Button>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              size="sm"
              className="btn-gradient"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tạo gợi ý mới
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-4">
        {allJobs.map((job) => (
          <JobRecommendationCard 
            key={job._id} 
            job={job}
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
            <Card key={i} className="overflow-hidden">
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
