import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Calendar,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getRecommendations, generateRecommendations } from '../services/recommendationService';
import { getOnboardingStatus } from '../services/onboardingService';
import { formatSalaryVND, formatWorkType, formatExperience } from '../utils/formatters';

const RecommendedJobsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    checkProfileAndFetchJobs();
  }, [isAuthenticated]);

  const checkProfileAndFetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check profile completeness
      const statusResponse = await getOnboardingStatus();
      const completeness = statusResponse?.data?.profileCompleteness?.percentage || 0;
      setProfileCompleteness(completeness);

      if (completeness < 60) {
        setError('profile_incomplete');
        setIsLoading(false);
        return;
      }

      // Fetch recommendations
      await fetchRecommendations(1);
    } catch (err) {
      console.error('❌ Error:', err);
      setError('fetch_error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await getRecommendations({ page, limit: 20 });
      console.log('📥 Recommendations response:', response);
      
      if (response?.data?.length > 0) {
        
        // Filter out invalid recommendations and map to job format
        const recommendedJobs = response.data
          .filter(rec => {
            if (!rec.jobId) {
              console.warn('⚠️ Recommendation missing jobId:', rec);
              return false;
            }
            if (!rec.jobId._id) {
              console.warn('⚠️ Job missing _id:', rec.jobId);
              return false;
            }
            return true;
          })
          .map(rec => ({
            ...rec.jobId,
            recommendationScore: rec.score,
            recommendationReasons: rec.reasons,
            recommendedAt: rec.generatedAt
          }));
        
        console.log('✅ Valid recommended jobs:', recommendedJobs.length);
        
        if (recommendedJobs.length === 0 && page === 1) {
          // All recommendations were invalid, regenerate
          console.log('🔄 All recommendations invalid, regenerating...');
          await handleGenerateRecommendations();
        } else {
          setJobs(recommendedJobs);
          setPagination(response.pagination || pagination);
        }
      } else if (page === 1) {
        // No recommendations found, auto-generate
        console.log('🔄 No recommendations found, generating...');
        await handleGenerateRecommendations();
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching recommendations:', err);
      if (page === 1) {
        console.log('🔄 Error occurred, trying to generate...');
        await handleGenerateRecommendations();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      setIsGenerating(true);
      const genResponse = await generateRecommendations({ limit: 20 });
      console.log('Generate recommendations response:', genResponse);

      if (genResponse?.data?.recommendations?.length > 0) {
        const recommendedJobs = genResponse.data.recommendations.map(rec => ({
          ...rec.job,
          recommendationScore: rec.score,
          recommendationReasons: rec.reasons
        }));

        setJobs(recommendedJobs);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: recommendedJobs.length,
          itemsPerPage: 20
        });
      } else {
        setError('no_recommendations');
      }
    } catch (err) {
      console.error('❌ Error generating:', err);
      setError('generate_error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handlePageChange = (newPage) => {
    fetchRecommendations(newPage);
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
            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            {reason.value}
          </Badge>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Về trang chủ
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8" />
                Việc làm dành riêng cho bạn
              </h1>
              <p className="text-lg text-white/90">
                {jobs.length > 0
                  ? `${jobs.length} công việc phù hợp với kỹ năng và mong muốn của bạn`
                  : 'Đang tìm kiếm công việc phù hợp...'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleGenerateRecommendations}
                disabled={isGenerating || isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Đang cập nhật...' : 'Làm mới gợi ý'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Profile incomplete alert */}
        {error === 'profile_incomplete' && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Hồ sơ của bạn đã hoàn thiện {profileCompleteness}%. Cần tối thiểu 60% để nhận gợi ý việc làm phù hợp.{' '}
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

        {/* Error alerts */}
        {error === 'no_recommendations' && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Không tìm thấy việc làm phù hợp. Hãy thử cập nhật thông tin hồ sơ hoặc mở rộng tiêu chí tìm kiếm.
            </AlertDescription>
          </Alert>
        )}

        {/* Jobs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(9)].map((_, i) => (
              <Card key={i} className="h-80">
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
                className="group relative overflow-hidden border shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                onClick={() => handleJobClick(job._id)}
              >
                {/* Score badge */}
                {job.recommendationScore && (
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
                        src={job.recruiterProfileId?.company?.logo || ''}
                        alt={job.recruiterProfileId?.company?.name || 'Logo'}
                      />
                      <AvatarFallback>
                        {(job.recruiterProfileId?.company?.name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 mb-1">{job.title}</CardTitle>
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
                  </div>

                  {renderReasonBadges(job.recommendationReasons)}
                </CardContent>

                <CardFooter className="border-t pt-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">Chưa có gợi ý việc làm</p>
              <p className="text-muted-foreground mb-4">
                Hãy hoàn thiện hồ sơ để nhận được gợi ý phù hợp hơn
              </p>
              <Button onClick={() => navigate('/profile')}>Cập nhật hồ sơ</Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {jobs.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
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
