import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Calendar,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  FileText,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getRecommendations, generateRecommendations } from '@/services/recommendationService';
import { getOnboardingStatus } from '@/services/onboardingService';
import { formatSalaryVND, formatWorkType, formatExperience } from '@/utils/formatters';
import { toast } from 'sonner';

const RecommendedJobsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch Onboarding Status
  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError
  } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: getOnboardingStatus,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const completeness = statusData?.data?.profileCompleteness?.percentage || 0;
  // Threshold is 60%
  const isProfileComplete = completeness >= 60;

  // Fetch Recommendations (only if profile is complete)
  const {
    data: recommendationsData,
    isLoading: isJobsLoading,
    isFetching: isJobsFetching,
    refetch: refetchJobs
  } = useQuery({
    queryKey: ['recommendations', page],
    queryFn: () => getRecommendations({ page, limit: 20 }),
    enabled: isProfileComplete && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to generate recommendations
  const generateMutation = useMutation({
    mutationFn: generateRecommendations,
    onSuccess: () => {
      toast.success('Đã cập nhật gợi ý việc làm');
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      refetchJobs();
    },
    onError: () => {
      toast.error('Không thể tạo gợi ý việc làm');
    }
  });

  const jobs = recommendationsData?.data?.map(rec => ({
    ...rec.jobId,
    recommendationScore: rec.score,
    recommendationReasons: rec.reasons,
    recommendedAt: rec.generatedAt
  })).filter(job => job?._id) || []; // Filter out invalid jobs

  const pagination = recommendationsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  };

  // Auto-generate if empty on first page
  useEffect(() => {
    if (isProfileComplete && !isJobsLoading && !isJobsFetching && jobs.length === 0 && page === 1 && !generateMutation.isPending) {
      // Check if we should auto-generate
      // We use a small timeout to avoid immediate flash or loops, although enabled flag helps
      const timer = setTimeout(() => {
        generateMutation.mutate({ limit: 20 });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isProfileComplete, isJobsLoading, isJobsFetching, jobs.length, page, generateMutation.isPending]);

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderReasonBadges = (reasons) => {
    if (!reasons || reasons.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {reasons.slice(0, 3).map((reason, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
          >
            {reason.value}
          </Badge>
        ))}
      </div>
    );
  };

  // Loading State (Initial)
  if (isStatusLoading) {
    return (
      <div className="min-h-screen bg-background container py-12 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Header Component
  const PageHeader = () => (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
      <div className="container">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-4 pl-0 hover:pl-2 transition-all"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Về trang chủ
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              Việc làm dành riêng cho bạn
            </h1>
            <p className="text-lg text-white/90">
              {isProfileComplete
                ? `${jobs.length} công việc phù hợp với kỹ năng và mong muốn của bạn`
                : 'Hãy hoàn thiện hồ sơ để nhận gợi ý việc làm tốt nhất'}
            </p>
          </div>
          {isProfileComplete && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => generateMutation.mutate({ limit: 20 })}
                disabled={generateMutation.isPending || isJobsLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                {generateMutation.isPending ? 'Đang cập nhật...' : 'Làm mới gợi ý'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Incomplete Profile View
  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader />
        <div className="container py-12">
          <Card className="max-w-3xl mx-auto border-dashed border-2 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-muted">
              <div
                className="h-full bg-amber-500 transition-all duration-1000"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Hồ sơ chưa đủ điều kiện nhận gợi ý
                </h2>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Hồ sơ của bạn mới hoàn thiện <span className="font-bold text-amber-600 dark:text-amber-400">{completeness}%</span>.
                  Chúng tôi cần tối thiểu <span className="font-bold">60%</span> để AI có thể phân tích và gợi ý công việc phù hợp nhất.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4 bg-muted/50 p-6 rounded-xl text-left">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Các thông tin cần bổ sung:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground pl-1">
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusData?.data?.profileCompleteness?.missingFields?.includes('skills') ? 'bg-red-400' : 'bg-green-400'}`} />
                    Kỹ năng chuyên môn (ít nhất 3)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusData?.data?.profileCompleteness?.missingFields?.includes('expectedSalary') ? 'bg-red-400' : 'bg-green-400'}`} />
                    Mức lương mong muốn
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusData?.data?.profileCompleteness?.missingFields?.includes('preferredLocations') ? 'bg-red-400' : 'bg-green-400'}`} />
                    Địa điểm làm việc
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  onClick={() => navigate('/profile')}
                >
                  Hoàn thiện hồ sơ ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />

      <div className="container py-8">
        {/* Jobs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isJobsLoading || generateMutation.isPending) ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <Skeleton className="w-20 h-6 rounded-full" />
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
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job._id}
                className="group relative overflow-hidden border shadow-sm hover:shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                onClick={() => handleJobClick(job._id)}
              >
                {/* Score badge */}
                {job.recommendationScore && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold border-0 shadow-md">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {job.recommendationScore}% phù hợp
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white shadow-sm rounded-xl">
                      <AvatarImage
                        src={job.recruiterProfileId?.company?.logo || ''}
                        alt={job.recruiterProfileId?.company?.name || 'Logo'}
                        className="object-contain bg-white"
                      />
                      <AvatarFallback className="rounded-xl">
                        {(job.recruiterProfileId?.company?.name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 mb-1 text-lg group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.recruiterProfileId?.company?.name || 'Không rõ công ty'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.location?.district}, {job.location?.province}
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
                  </div>

                  {renderReasonBadges(job.recommendationReasons)}
                </CardContent>

                <CardFooter className="border-t pt-3 text-sm text-muted-foreground bg-muted/30">
                  <Calendar className="w-4 h-4 mr-1" />
                  Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed py-12">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có gợi ý phù hợp</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      AI chưa tìm thấy công việc nào phù hợp với hồ sơ hiện tại của bạn. Hãy thử cập nhật thêm thông tin hoặc quay lại sau.
                    </p>
                  </div>
                  <Button onClick={() => navigate('/profile')}>
                    Cập nhật hồ sơ
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Pagination */}
        {jobs.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Trang {page} / {pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              disabled={page === pagination.totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobsPage;
