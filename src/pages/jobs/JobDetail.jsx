import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Calendar,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  UserCheck,
  Coins,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { getJobApplicantCount, getJobById, getAllJobs } from '../../services/jobService';
import { saveJob, unsaveJob } from '../../services/savedJobService';
import { toast } from 'sonner';
import { ApplyJobDialog } from './components/ApplyJobDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import JobLocationMap from '@/components/common/JobLocationMap';
import JobDetailHeader from '@/components/common/JobDetail/Header';
import JobDetailSidebar from '@/components/common/JobDetail/Sidebar';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicantCount, setApplicantCount] = useState(null);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [hasViewedApplicants, setHasViewedApplicants] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [relatedJobsPage, setRelatedJobsPage] = useState(1);
  const jobsPerPage = 6;

  // Fetch job details using React Query
  const { data: job, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobDetail', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    select: (data) => data.data.data,
  });

  // Fetch related jobs
  const { data: relatedJobs, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['relatedJobs', job?.company?._id, job?.skills],
    queryFn: () => getAllJobs({
      limit: 20,
      companyId: job?.company?._id,
      excludeId: id
    }),
    enabled: !!job?.company?._id,
    select: (data) => data.data.data?.filter(j => j._id !== id) || [],
  });

  const formatWorkType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'FREELANCE': 'Tự do',
      'INTERNSHIP': 'Thực tập'
    };
    return typeMap[type] || type;
  };

  const formatExperience = (level) => {
    const levelMap = {
      'INTERN': 'Thực tập sinh',
      'FRESHER': 'Fresher',
      'JUNIOR_LEVEL': 'Junior',
      'MID_LEVEL': 'Middle',
      'SENIOR_LEVEL': 'Senior',
      'MANAGER_LEVEL': 'Quản lý',
      'DIRECTOR_LEVEL': 'Giám đốc'
    };
    return levelMap[level] || level;
  };

  // Pagination logic for related jobs
  const totalRelatedJobs = relatedJobs?.length || 0;
  const totalPages = Math.ceil(totalRelatedJobs / jobsPerPage);
  const startIndex = (relatedJobsPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = relatedJobs?.slice(startIndex, endIndex) || [];

  const handlePrevPage = () => {
    setRelatedJobsPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setRelatedJobsPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleViewApplicants = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng này.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmViewApplicants = async () => {
    try {
      setIsLoadingApplicants(true);
      setShowConfirmDialog(false);
      
      const response = await getJobApplicantCount(id);
      
      if (response.data.success) {
        setApplicantCount(response.data.data.applicantCount);
        setHasViewedApplicants(true);
        if (response.data.message) {
          toast.success(response.data.message);
        }
        queryClient.invalidateQueries(['userProfile']);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin ứng viên';
      toast.error(errorMessage);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleCancelViewApplicants = () => {
    setShowConfirmDialog(false);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ứng tuyển.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setShowApplyDialog(true);
  };

  const handleApplySuccess = () => {
    toast.success("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.");
    queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
    queryClient.invalidateQueries({ queryKey: ['appliedJobs'] });
  };
  
  const { mutate: toggleSaveJob } = useMutation({
    mutationFn: () => {
      return job?.isSaved ? unsaveJob(id) : saveJob(id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['jobDetail', id] });
      const previousJobData = queryClient.getQueryData(['jobDetail', id]);
      queryClient.setQueryData(['jobDetail', id], (oldData) => {
        if (!oldData) return undefined;
        return {
          ...oldData,
          isSaved: !oldData.isSaved,
        };
      });
      return { previousJobData };
    },
    onSuccess: (data) => {
      const message = data.data.message || (job?.isSaved ? 'Đã bỏ lưu công việc' : 'Đã lưu công việc thành công');
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (err, _newVariables, context) => {
      if (context?.previousJobData) {
        queryClient.setQueryData(['jobDetail', id], context.previousJobData);
      }
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
    }
  });

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu việc làm.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    toggleSaveJob();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Xem công việc tuyệt vời này tại ${job?.company?.name}`,
        url: window.location.href,
      }).catch(() => toast.info("Chia sẻ đã bị hủy"));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vào clipboard');
    }
  };

  

  const ConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md mx-auto bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Xem số người đã ứng tuyển</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Để xem số lượng ứng viên đã ứng tuyển vào vị trí này, bạn cần tiêu phí:
              </p>
              <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-orange-600">
                <Coins className="w-5 h-5" />
                <span>50 xu</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Xu sẽ được trừ từ tài khoản của bạn ngay lập tức.
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Thông tin này chỉ hiển thị một lần. Sau khi xem, bạn không thể hoàn tiền.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancelViewApplicants}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleConfirmViewApplicants}
                className="flex-1 btn-gradient text-primary-foreground"
                disabled={isLoadingApplicants}
              >
                {isLoadingApplicants ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Đồng ý tiêu 50 xu
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Card className="mb-6 overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message={error.response?.data?.message || error.message} />;
  }

  if (!job) {
    return <EmptyState message="Công việc bạn đang tìm có thể đã bị xóa hoặc không tồn tại." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-muted transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <JobDetailHeader
            job={job}
            isAuthenticated={isAuthenticated}
            handleApply={handleApply}
            handleSave={handleSave}
            handleShare={handleShare}
            applicantCount={applicantCount}
            hasViewedApplicants={hasViewedApplicants}
            isLoadingApplicants={isLoadingApplicants}
            handleViewApplicants={handleViewApplicants}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job Overview */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Tổng quan công việc</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Địa điểm</p>
                      <p className="text-foreground font-semibold">{job.location?.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hình thức</p>
                      <p className="text-foreground font-semibold">{formatWorkType(job.type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ngày đăng</p>
                      <p className="text-foreground font-semibold">{new Date(job.createdAt || job.deadline).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Kinh nghiệm</p>
                      <p className="text-foreground font-semibold">{formatExperience(job.experience)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Yêu cầu ứng viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Quyền lợi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.benefits?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Kỹ năng yêu cầu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Địa điểm làm việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobLocationMap
                    location={job.location}
                    address={job.address}
                    companyName={job.recruiterProfileId?.company?.name}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1">
              <JobDetailSidebar
                relatedJobs={relatedJobs}
                isLoadingRelated={isLoadingRelated}
                currentJobs={currentJobs}
                totalPages={totalPages}
                relatedJobsPage={relatedJobsPage}
                handlePrevPage={handlePrevPage}
                handleNextPage={handleNextPage}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog />

      {job && (
        <ApplyJobDialog
          jobId={job._id}
          jobTitle={job.title}
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default JobDetail;


