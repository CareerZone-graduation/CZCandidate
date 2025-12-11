import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Building, Calendar, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionHeader } from '@/components/common/SectionHeader';
import { getRecommendations, generateRecommendations } from '@/services/recommendationService';
import { getOnboardingStatus } from '@/services/onboardingService';
import { getAllJobs } from '@/services/jobService';
import { formatSalaryVND, formatWorkType, formatExperience } from '@/utils/formatters';

const RecommendedJobs = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  // 1. Fetch Onboarding Status
  const {
    data: statusData,
    isLoading: isStatusLoading
  } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: getOnboardingStatus,
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const completeness = statusData?.data?.profileCompleteness?.percentage || 0;
  const isProfileComplete = completeness >= 60;

  // 2. Fetch Featured Jobs (Always needed as fallback)
  const {
    data: featuredJobsData,
    isLoading: isFeaturedLoading
  } = useQuery({
    queryKey: ['jobs', 'featured'],
    queryFn: () => getAllJobs({ page: 1, limit: 6, sortBy: 'newest' }),
    staleTime: 10 * 60 * 1000,
  });

  const featuredJobs = Array.isArray(featuredJobsData?.data?.data) ? featuredJobsData.data.data : [];

  // 3. Fetch Recommendations (Enabled only if profile complete)
  const {
    data: recResponse,
    isLoading: isRecLoading,
    refetch: refetchRecommendations
  } = useQuery({
    queryKey: ['recommendations', 'home'],
    queryFn: () => getRecommendations({ page: 1, limit: 6 }),
    enabled: !!isAuthenticated && isProfileComplete,
    staleTime: 5 * 60 * 1000,
  });

  // Recommendation Generation Mutation
  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      refetchRecommendations();
    },
  });

  // Extract recommended jobs
  const recommendedJobs = recResponse?.data
    ?.filter(rec => rec.jobId)
    .map(rec => ({
      ...rec.jobId,
      recommendationScore: rec.score,
      recommendationReasons: rec.reasons
    })) || [];

  // Determine what to display
  // Logic: 
  // - If IsAuthenticated AND ProfileComplete AND Have Recommendations -> Show Recommendations
  // - Else -> Show Featured Jobs
  const shouldShowRecommendations = isAuthenticated && isProfileComplete && recommendedJobs.length > 0;
  const displayJobs = shouldShowRecommendations ? recommendedJobs : featuredJobs;

  // Loading state: complex because we might be waiting for recommendation check
  // If Authenticated and Profile Complete -> Wait for Rec Loading. 
  // If Rec Loading finishes and empty -> we might trigger generate -> Wait? 
  // Simplification: display loading if critical data is missing.

  const isGlobalLoading = isFeaturedLoading || (isAuthenticated && isStatusLoading) || (isAuthenticated && isProfileComplete && isRecLoading);

  // Auto-generate effect
  useEffect(() => {
    if (isAuthenticated && isProfileComplete && !isRecLoading && recommendedJobs.length === 0 && !generateMutation.isPending) {
      // Debounce generation to avoid loops
      const timer = setTimeout(() => {
        generateMutation.mutate({ limit: 20 });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isProfileComplete, isRecLoading, recommendedJobs.length]);


  const handleRefreshRecommendations = () => {
    generateMutation.mutate({ limit: 20 });
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const renderReasonBadges = (reasons) => {
    if (!reasons || reasons.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {reasons.slice(0, 2).map((reason, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            {reason.value}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <SectionHeader
          badgeText={shouldShowRecommendations ? '✨ Dành riêng cho bạn' : '⭐ Việc làm nổi bật'}
          title={
            shouldShowRecommendations ? (
              <>
                Việc làm <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">phù hợp với bạn</span>
              </>
            ) : (
              <>
                Cơ hội nghề nghiệp <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">hàng đầu</span>
              </>
            )
          }
          description={
            shouldShowRecommendations
              ? 'Những công việc được gợi ý dựa trên kỹ năng, kinh nghiệm và mong muốn của bạn.'
              : 'Khám phá những vị trí chất lượng từ các công ty uy tín, với mức lương hấp dẫn và môi trường chuyên nghiệp.'
          }
        />

        {/* Alert for incomplete profile (Only if authenticated, not loading, and profile incomplete) */}
        {!isGlobalLoading && isAuthenticated && !isProfileComplete && (
          <Alert className="mb-8 bg-amber-50 border-amber-200/50 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 flex items-center gap-2 justify-between flex-wrap">
              <span>
                Hồ sơ của bạn mới hoàn thiện <span className="font-bold">{completeness}%</span>.
                Cần tối thiểu <span className="font-bold">60%</span> để nhận được gợi ý việc làm tốt nhất.
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                onClick={() => navigate('/profile')}
              >
                Hoàn thiện ngay <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh button */}
        {shouldShowRecommendations && (
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRecommendations}
              disabled={generateMutation.isPending}
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              {generateMutation.isPending ? 'Đang phân tích...' : 'Làm mới gợi ý'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(isGlobalLoading || generateMutation.isPending) ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 shadow-md border-muted">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <Skeleton className="w-12 h-12 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : displayJobs.length > 0 ? (
            displayJobs.map((job) => (
              <Card
                key={job._id || job.id}
                className="group relative overflow-hidden border border-muted shadow-md hover:shadow-xl bg-card cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                onClick={() => handleJobClick(job._id || job.id)}
              >
                {/* Recommendation score badge */}
                {shouldShowRecommendations && job.recommendationScore && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold border-0 shadow-sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {job.recommendationScore}%
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white shadow-sm rounded-xl">
                      <AvatarImage
                        src={job.recruiterProfileId?.company?.logo || job.company?.logo || ''}
                        alt={job.recruiterProfileId?.company?.name || job.company?.name || 'Logo'}
                        className="object-contain bg-white"
                      />
                      <AvatarFallback className="rounded-xl">
                        {(job.recruiterProfileId?.company?.name || job.company?.name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 mb-1 text-lg group-hover:text-primary transition-colors">
                        {job.title || 'Không có tiêu đề'}
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.recruiterProfileId?.company?.name || job.company?.name || 'Không rõ công ty'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.location?.province
                              ? `${job.location.district ? job.location.district + ', ' : ''}${job.location.province}`
                              : 'Không rõ địa điểm'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                      <DollarSign className="w-3 h-3" />
                      {formatSalaryVND(job.minSalary, job.maxSalary)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                      <Clock className="w-3 h-3" />
                      {formatWorkType(job.workType)}
                    </Badge>
                    {(shouldShowRecommendations ? job.recommendationReasons : [1]).length > 0 ? null : (
                      <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                        <Briefcase className="w-3 h-3" />
                        {formatExperience(job.experience)}
                      </Badge>
                    )}
                  </div>

                  {shouldShowRecommendations && renderReasonBadges(job.recommendationReasons)}
                </CardContent>

                <CardFooter className="border-t pt-3 flex justify-between items-center bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    {job.deadline ? `Hạn nộp: ${new Date(job.deadline).toLocaleDateString('vi-VN')}` : ''}
                  </div>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id || job.id);
                    }}
                  >
                    Chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy việc làm phù hợp</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl font-bold"
            onClick={() => navigate(shouldShowRecommendations ? '/jobs/recommended' : '/jobs/search')}
          >
            {shouldShowRecommendations ? 'Xem tất cả gợi ý' : 'Khám phá thêm việc làm'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedJobs;
