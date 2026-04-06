import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useCopilot } from '@/contexts/CopilotContext';
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Calendar,
  Bookmark,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  UserCheck,
  Coins,
  Eye,
  AlertTriangle,
  Tag,
  Send
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getJobApplicantCount, getJobById, getJobsByCompany } from '../../services/jobService';
import { saveJob, unsaveJob } from '../../services/savedJobService';
import { saveViewHistory } from '../../services/viewHistoryService';
import { interactionService } from '../../services/interactionService';
import { toast } from 'sonner';
import { ApplyJobDialog } from './components/ApplyJobDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import JobLocationMap from '@/components/common/JobLocationMap';
import JobDetailHeader from '@/components/common/JobDetail/Header';
import JobDetailSidebar from '@/components/common/JobDetail/Sidebar';
import JobDetailSkeleton from './JobDetailSkeleton';
import SimilarJobs from '@/components/jobs/SimilarJobs';
import AlsoLikedJobs from '@/components/jobs/AlsoLikedJobs';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isFromInvitation = location.state?.fromNotification?.type === 'talent_pool_invitation';
  const queryClient = useQueryClient();
  const { openChat } = useChat();
  const { openCopilot } = useCopilot();
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

  // Fetch jobs from the same company
  const { data: relatedJobs, isLoading: isLoadingRelated } = useQuery({
    queryKey: ['companyJobs', job?.company?._id, id],
    queryFn: () => getJobsByCompany(job?.company?._id, {
      limit: 20,
      excludeId: id
    }),
    enabled: !!job?.company?._id,
    select: (data) => data.data?.filter(j => j._id !== id) || [],
  });

  // Ref để đảm bảo chỉ track VIEW 1 lần cho mỗi jobId
  const trackedViewRef = useRef(null);

  // Tự động lưu lịch sử xem khi vào trang chi tiết job
  useEffect(() => {
    if (job && id && isAuthenticated && trackedViewRef.current !== id) {
      trackedViewRef.current = id; // Đánh dấu đã track cho jobId này

      // Lưu lịch sử xem (hệ thống cũ)
      saveViewHistory(id).catch((error) => {
        console.error('Failed to save view history:', error);
      });

      // Tracking tương tác (hệ thống AI Recommendation)
      interactionService.trackJobView(id, { sourcePage: 'job_detail' })
        .catch(err => console.error('Error tracking VIEW interaction:', err));
    }
  }, [id, job, isAuthenticated]);

  const formatWorkType = (type) => {
    const typeMap = {
      'FULL_TIME': 'FULL_TIME - Toàn thời gian',
      'PART_TIME': 'PART_TIME - Bán thời gian',
      'CONTRACT': 'CONTRACT - Hợp đồng',
      'FREELANCE': 'FREELANCE - Tự do',
      'INTERNSHIP': 'INTERNSHIP - Thực tập',
      'TEMPORARY': 'TEMPORARY - Tạm thời',
      'VOLUNTEER': 'VOLUNTEER - Tình nguyện'
    };
    return typeMap[type] || type;
  };

  const formatExperience = (level) => {
    const levelMap = {
      'INTERN': 'INTERN - Thực tập sinh',
      'FRESHER': 'FRESHER - Mới tốt nghiệp',
      'ENTRY_LEVEL': 'ENTRY_LEVEL - Nhân viên mới',
      'MID_LEVEL': 'MID_LEVEL - Trung cấp',
      'SENIOR_LEVEL': 'SENIOR_LEVEL - Cao cấp',
      'EXECUTIVE': 'EXECUTIVE - Điều hành',
      'NO_EXPERIENCE': 'NO_EXPERIENCE - Không yêu cầu kinh nghiệm'
    };
    return levelMap[level] || level;
  };

  const formatWorkMode = (mode) => {
    const modeMap = {
      'ON_SITE': 'ON_SITE - Tại văn phòng',
      'REMOTE': 'REMOTE - Làm việc từ xa',
      'HYBRID': 'HYBRID - Linh hoạt'
    };
    return modeMap[mode] || mode;
  };

  const formatCategory = (category) => {
    const categoryMap = {
      'IT': 'IT - Công nghệ thông tin',
      'SOFTWARE_DEVELOPMENT': 'SOFTWARE_DEVELOPMENT - Phát triển phần mềm',
      'DATA_SCIENCE': 'DATA_SCIENCE - Khoa học dữ liệu',
      'MACHINE_LEARNING': 'MACHINE_LEARNING - Machine Learning',
      'WEB_DEVELOPMENT': 'WEB_DEVELOPMENT - Phát triển Web',
      'SALES': 'SALES - Kinh doanh / Bán hàng',
      'MARKETING': 'MARKETING - Marketing',
      'ACCOUNTING': 'ACCOUNTING - Kế toán / Kiểm toán',
      'GRAPHIC_DESIGN': 'GRAPHIC_DESIGN - Thiết kế đồ họa',
      'CONTENT_WRITING': 'CONTENT_WRITING - Viết nội dung',
      'MEDICAL': 'MEDICAL - Y tế / Dược',
      'TEACHING': 'TEACHING - Giáo dục / Đào tạo',
      'ENGINEERING': 'ENGINEERING - Kỹ thuật',
      'PRODUCTION': 'PRODUCTION - Sản xuất',
      'LOGISTICS': 'LOGISTICS - Vận chuyển / Logistics',
      'HOSPITALITY': 'HOSPITALITY - Nhà hàng / Khách sạn',
      'REAL_ESTATE': 'REAL_ESTATE - Bất động sản',
      'LAW': 'LAW - Pháp lý',
      'FINANCE': 'FINANCE - Tài chính / Ngân hàng',
      'HUMAN_RESOURCES': 'HUMAN_RESOURCES - Nhân sự',
      'CUSTOMER_SERVICE': 'CUSTOMER_SERVICE - Chăm sóc khách hàng',
      'ADMINISTRATION': 'ADMINISTRATION - Hành chính / Văn phòng',
      'MANAGEMENT': 'MANAGEMENT - Quản lý điều hành',
      'OTHER': 'OTHER - Khác'
    };
    return categoryMap[category] || category;
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

    // Tracking tương tác ứng tuyển (APPLY)
    interactionService.trackJobApply(id, { sourcePage: 'job_detail' })
      .catch(err => console.error('Error tracking APPLY interaction:', err));
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
      const isNowSaved = !job?.isSaved;
      const message = data.data.message || (isNowSaved ? 'Đã lưu công việc thành công' : 'Đã bỏ lưu công việc');
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });

      // Nếu là lưu công việc (SAVE) thì tracking
      if (isNowSaved) {
        interactionService.trackJobSave(id, { sourcePage: 'job_detail' })
          .catch(err => console.error('Error tracking SAVE interaction:', err));
      }
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

  const handleMessage = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để nhắn tin.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    // Open chat with recruiter
    openChat({
      recipientId: job.recruiterProfileId?.userId || job.recruiterProfileId,
      jobId: job._id,
      companyName: job.companyId?.name
    });
  };

  // Hàm handleShare đã được thay thế bằng ShareButtons component



  const ConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md mx-auto bg-card ">
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
                <span>10 xu</span>
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
                    Đồng ý tiêu 10 xu
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
    return <JobDetailSkeleton />;
  }


  if (isError) {
    return <ErrorState onRetry={refetch} message={error.response?.data?.message || error.message} />;
  }

  if (!job) {
    return <EmptyState message="Công việc bạn đang tìm có thể đã bị xóa hoặc không tồn tại." />;
  }

  // Lấy URL hiện tại và thông tin cho Open Graph
  const currentUrl = window.location.href;
  const companyLogo = job?.company?.logo || job?.recruiterProfileId?.company?.logo || '/default-job-image.png';
  const jobDescription = job?.description?.replace(/<[^>]*>/g, '').substring(0, 200) || `Cơ hội việc làm tại ${job?.company?.name || 'công ty'}`;

  return (
    <HelmetProvider>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{job?.title} - {job?.company?.name || 'CareerZone'}</title>
        <meta name="description" content={jobDescription} />

        {/* Open Graph Tags cho Facebook */}
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${job?.title} - ${job?.company?.name || 'CareerZone'}`} />
        <meta property="og:description" content={jobDescription} />
        <meta property="og:image" content={companyLogo} />

        {/* Twitter Card Tags (bonus) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job?.title} - ${job?.company?.name || 'CareerZone'}`} />
        <meta name="twitter:description" content={jobDescription} />
        <meta name="twitter:image" content={companyLogo} />
      </Helmet>

      <div className="min-h-screen">
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

            {isFromInvitation && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <Send className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-800 font-bold">Lời mời đặc biệt</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Bạn được mời ứng tuyển vào vị trí này từ Talent Pool. Chúc bạn may mắn!
                </AlertDescription>
              </Alert>
            )}

            <JobDetailHeader
              job={job}
              isAuthenticated={isAuthenticated}
              handleApply={handleApply}
              handleSave={handleSave}
              applicantCount={applicantCount}
              hasViewedApplicants={hasViewedApplicants}
              isLoadingApplicants={isLoadingApplicants}
              handleViewApplicants={handleViewApplicants}
              handleMessage={handleMessage}
              handleSummarize={() => openCopilot('summarize_job', { jobId: id })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Overview */}
                <Card className="border-border/50 shadow-sm overflow-hidden rounded-2xl">
                  <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-bold">Tổng quan công việc</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Địa điểm</p>
                        <p className="text-foreground font-semibold line-clamp-2">{job.location?.province || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600 shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Loại hình</p>
                        <p className="text-foreground font-semibold">{formatWorkType(job.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-600 shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Hình thức làm việc</p>
                        <p className="text-foreground font-semibold">{formatWorkMode(job.workType)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-green-500/10 rounded-xl text-green-600 shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Kinh nghiệm</p>
                        <p className="text-foreground font-semibold">{formatExperience(job.experience)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-600 shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Hạn nộp hồ sơ</p>
                        <p className="text-orange-600 font-bold">{new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600 shrink-0">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-0.5">Ngành nghề chính</p>
                        <p className="text-foreground font-semibold line-clamp-2">{formatCategory(job.category)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Description */}
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">Mô tả công việc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>

                {/* Requirements */}
                {job.requirements && (
                  <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold">Yêu cầu ứng viên</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g, '<br />') }} />
                    </CardContent>
                  </Card>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-bold">Quyền lợi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm sm:prose-base max-w-none text-foreground/90 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: job.benefits?.replace(/\n/g, '<br />') }} />
                    </CardContent>
                  </Card>
                )}

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <Card className="border-border/50 shadow-sm rounded-2xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <CardTitle className="text-lg font-bold">Kỹ năng chuyên môn</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="flex flex-wrap gap-2.5">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 hover:-translate-y-0.5 transition-transform px-3 py-1.5 text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Location Map */}
                <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" /> Địa điểm làm việc
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <JobLocationMap
                      location={job.location}
                      address={job.address}
                      companyName={job.recruiterProfileId?.company?.name}
                    />
                  </CardContent>
                </Card>

                {/* Similar Jobs */}
                <div className="pt-4">
                  <SimilarJobs jobId={id} />
                </div>

                {/* Also Liked Jobs (CF Recommendations) */}
                <div className="pt-2">
                  <AlsoLikedJobs jobId={id} />
                </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="lg:col-span-1">
                <JobDetailSidebar
                  job={job}
                  relatedJobs={relatedJobs}
                  isLoadingRelated={isLoadingRelated}
                  currentJobs={currentJobs}
                  totalPages={totalPages}
                  relatedJobsPage={relatedJobsPage}
                  handlePrevPage={handlePrevPage}
                  handleNextPage={handleNextPage}
                  handleApply={handleApply}
                  isApplied={job.isApplied}
                  isJobActive={job.status === 'ACTIVE'}
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
            isReapply={job.isApplied}
            source={isFromInvitation ? 'TALENT_POOL_INVITATION' : 'DIRECT_APPLY'}
          />
        )}
      </div>
    </HelmetProvider>
  );
};

export default JobDetail;
