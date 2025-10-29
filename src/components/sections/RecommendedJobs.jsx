import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Heart, Building, Calendar, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { SectionHeader } from '../common/SectionHeader';
import { getRecommendations, generateRecommendations } from '../../services/recommendationService';
import { getOnboardingStatus } from '../../services/onboardingService';
import { getAllJobs } from '../../services/jobService';
import { formatSalaryVND, formatWorkType, formatExperience } from '../../utils/formatters';

const RecommendedJobs = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecommendationsMode, setIsRecommendationsMode] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [isAuthenticated]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Nếu user chưa đăng nhập, hiển thị featured jobs
      if (!isAuthenticated) {
        await fetchFeaturedJobs();
        return;
      }

      // Check profile completeness
      const statusResponse = await getOnboardingStatus();
      const completeness = statusResponse?.data?.profileCompleteness?.percentage || 0;
      setProfileCompleteness(completeness);

      console.log('📊 Profile completeness:', completeness);

      // Nếu profile >= 60%, thử lấy recommendations
      if (completeness >= 60) {
        try {
          console.log('🎯 Fetching recommendations...');
          const recResponse = await getRecommendations({ page: 1, limit: 6 });
          
          console.log('✅ Recommendations response:', recResponse);

          // Nếu có recommendations
          if (recResponse?.data?.length > 0) {
            const recommendedJobs = recResponse.data
              .filter(rec => rec.jobId) // Lọc những recommendation có job
              .map(rec => ({
                ...rec.jobId,
                recommendationScore: rec.score,
                recommendationReasons: rec.reasons
              }));

            if (recommendedJobs.length > 0) {
              console.log('✅ Using recommendations:', recommendedJobs.length);
              setJobs(recommendedJobs);
              setIsRecommendationsMode(true);
              return;
            }
          }

          // Nếu chưa có recommendations, tự động generate
          console.log('🔄 No recommendations found, auto-generating...');
          await autoGenerateRecommendations();
          
        } catch (err) {
          console.warn('⚠️ Failed to fetch recommendations, falling back to featured jobs:', err);
          await fetchFeaturedJobs();
        }
      } else {
        // Profile chưa đủ 60%, hiển thị featured jobs
        console.log('📝 Profile not complete enough (<60%), showing featured jobs');
        await fetchFeaturedJobs();
      }

    } catch (err) {
      console.error('❌ Error in fetchJobs:', err);
      setError('Không thể tải danh sách việc làm');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const autoGenerateRecommendations = async () => {
    try {
      setIsGenerating(true);
      console.log('🚀 Generating recommendations...');
      
      const genResponse = await generateRecommendations({ limit: 20 });
      
      if (genResponse?.data?.recommendations?.length > 0) {
        const recommendedJobs = genResponse.data.recommendations
          .slice(0, 6)
          .map(rec => ({
            ...rec.job,
            recommendationScore: rec.score,
            recommendationReasons: rec.reasons
          }));

        console.log('✅ Generated and loaded recommendations:', recommendedJobs.length);
        setJobs(recommendedJobs);
        setIsRecommendationsMode(true);
      } else {
        console.log('⚠️ No recommendations generated, showing featured jobs');
        await fetchFeaturedJobs();
      }
    } catch (err) {
      console.error('❌ Error generating recommendations:', err);
      await fetchFeaturedJobs();
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      console.log('🔄 Fetching featured jobs...');
      const response = await getAllJobs({ page: 1, limit: 6, sortBy: 'newest' });

      if (response.data && response.data.success) {
        const jobsData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('✅ Featured jobs loaded:', jobsData.length);
        setJobs(jobsData);
        setIsRecommendationsMode(false);
      }
    } catch (err) {
      console.error('❌ Error fetching featured jobs:', err);
      throw err;
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setIsGenerating(true);
      await autoGenerateRecommendations();
    } catch (err) {
      console.error('❌ Error refreshing:', err);
    }
  };

  const handleViewAll = () => {
    navigate(isRecommendationsMode ? '/jobs/recommended' : '/jobs/search');
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
          badgeText={isRecommendationsMode ? '✨ Dành riêng cho bạn' : '⭐ Việc làm nổi bật'}
          title={
            isRecommendationsMode ? (
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
            isRecommendationsMode
              ? 'Những công việc được gợi ý dựa trên kỹ năng, kinh nghiệm và mong muốn của bạn.'
              : 'Khám phá những vị trí chất lượng từ các công ty uy tín, với mức lương hấp dẫn và môi trường chuyên nghiệp.'
          }
        />

        {/* Alert for profile completeness if not recommendations mode */}
        {isAuthenticated && !isRecommendationsMode && profileCompleteness < 60 && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Hoàn thiện hồ sơ đến {profileCompleteness}%. Cần tối thiểu 60% để nhận gợi ý việc làm phù hợp với bạn.{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-amber-700 font-semibold"
                onClick={() => navigate('/profile')}
              >
                Hoàn thiện ngay →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh button for recommendations */}
        {isRecommendationsMode && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRecommendations}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Đang cập nhật...' : 'Làm mới gợi ý'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 shadow-lg">
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
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job._id || job.id}
                className="group relative overflow-hidden border shadow-lg hover:shadow-2xl bg-card cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                onClick={() => handleJobClick(job._id || job.id)}
              >
                {/* Recommendation score badge */}
                {isRecommendationsMode && job.recommendationScore && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {job.recommendationScore}% phù hợp
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarImage
                        src={job.recruiterProfileId?.company?.logo || job.company?.logo || ''}
                        alt={job.recruiterProfileId?.company?.name || job.company?.name || 'Logo'}
                      />
                      <AvatarFallback>
                        {(job.recruiterProfileId?.company?.name || job.company?.name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 mb-1">{job.title || 'Không có tiêu đề'}</CardTitle>
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
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatSalaryVND(job.minSalary, job.maxSalary)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatWorkType(job.workType)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {formatExperience(job.experience)}
                    </Badge>
                    {job.deadline && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.deadline).toLocaleDateString('vi-VN')}
                      </Badge>
                    )}
                  </div>

                  {/* Recommendation reasons */}
                  {isRecommendationsMode && renderReasonBadges(job.recommendationReasons)}
                </CardContent>

                <CardFooter className="border-t pt-3 flex justify-end items-center bg-transparent">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-semibold text-green-700 group-hover:translate-x-1 transition-all duration-300 hover:text-green-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id || job.id);
                    }}
                  >
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
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
            className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl font-semibold"
            onClick={handleViewAll}
          >
            {isRecommendationsMode ? 'Xem tất cả gợi ý' : 'Xem tất cả việc làm'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedJobs;
