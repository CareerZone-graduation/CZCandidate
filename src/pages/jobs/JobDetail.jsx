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
import { parseCurrencyValue } from '../../utils/formatters';

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

  // Format functions
  const formatSalary = (minSalary, maxSalary) => {
    const min = parseCurrencyValue(minSalary);
    const max = parseCurrencyValue(maxSalary);

    if (!min && !max) return 'Thỏa thuận';

    const formatNumber = (num) => {
      return new Intl.NumberFormat('vi-VN').format(num);
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
    }
    if (min) return `Từ ${formatNumber(min)} VNĐ`;
    if (max) return `Đến ${formatNumber(max)} VNĐ`;
    return 'Thỏa thuận';
  };

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
    <div className="bg-background min-h-screen">
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

          {/* Header Section */}
          <div className="mb-8">
            <div className="relative bg-gradient-to-r from-green-100 via-green-200 to-blue-200
                   h-[45vh] w-full
                   flex flex-col justify-between
                   rounded-xl shadow-lg p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-border">
                      <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                      <AvatarFallback className="bg-muted text-foreground text-lg font-bold">
                        {job.company?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{job.title}</h1>
                      <p className="text-lg text-muted-foreground">{job.company?.name}</p>
                    </div>
                  </div>

                  {/* Salary - Only show if authenticated or has salary */}
                  {(isAuthenticated || job.minSalary || job.maxSalary) && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                        <DollarSign className="w-5 h-5" />
                        <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                      </div>
                    </div>
                  )}

                  {/* View Applicants Section */}
                  {isAuthenticated && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">Thông tin ứng viên</h3>
                            <p className="text-xs text-muted-foreground">
                              {hasViewedApplicants && applicantCount !== null
                                ? `${applicantCount} người đã ứng tuyển`
                                : 'Xem số lượng ứng viên đã ứng tuyển'}
                            </p>
                          </div>
                        </div>

                        {hasViewedApplicants && applicantCount !== null ? (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 font-semibold">
                            {applicantCount} người
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewApplicants}
                            disabled={isLoadingApplicants}
                            className="border-orange-300 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-medium"
                          >
                            {isLoadingApplicants ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Xem (50 xu)
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {job.isApplied ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-6 py-2 text-sm font-medium justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Đã ứng tuyển
                      </Badge>
                    ) : (
                      <Button
                        onClick={handleApply}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 font-medium"
                        disabled={job?.status !== 'ACTIVE'}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {job.status === 'ACTIVE' ? 'Ứng tuyển ngay' : 'Việc làm đã đóng'}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={handleSave}
                      className={`px-6 py-2.5 font-medium transition-all duration-200 ${
                        job.isSaved
                          ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${job.isSaved ? "fill-current" : ""}`} />
                      {job.isSaved ? "Đã lưu" : "Lưu việc làm"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={handleShare}
                      className="hover:bg-muted px-4 py-2.5 transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Overview + Company Info (Left) and Related Jobs (Right) */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Job Overview and Company Info - Left Column */}
            <div className="space-y-8">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Tổng quan công việc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Địa điểm làm việc</p>
                        <p className="text-foreground">{job.location?.province}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hình thức làm việc</p>
                        <p className="text-foreground">{formatWorkType(job.type)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ngày đăng</p>
                        <p className="text-foreground">{new Date(job.createdAt || job.deadline).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Kinh nghiệm</p>
                        <p className="text-foreground">{formatExperience(job.experience)}</p>
                      </div>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Kỹ năng yêu cầu</p>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Thông tin công ty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-border">
                      <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                      <AvatarFallback className="bg-muted text-foreground text-lg font-bold">
                        {job.company?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{job.company?.name}</h3>
                      <p className="text-sm text-muted-foreground">{job.company?.industry || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Địa chỉ</p>
                        <p className="text-sm text-muted-foreground">{job.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Related Jobs - Right Column */}
            <div className="space-y-8">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Việc làm liên quan</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRelated ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex gap-3">
                            <Skeleton className="w-12 h-12 rounded" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-3 w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : relatedJobs && relatedJobs.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                        {currentJobs.map((relatedJob) => (
                          <div
                            key={relatedJob._id}
                            className="p-4 border rounded-lg card-yellow-hover"
                            onClick={() => navigate(`/jobs/${relatedJob._id}`)}
                          >
                            <div className="flex gap-3 mb-3">
                              <Avatar className="w-12 h-12 border">
                                <AvatarImage src={relatedJob.company?.logo} alt={relatedJob.company?.name} />
                                <AvatarFallback className="text-sm">
                                  {relatedJob.company?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-foreground truncate">
                                  {relatedJob.title}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {relatedJob.company?.name}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Badge variant="secondary" className="text-xs px-2 py-0 w-fit">
                                {formatSalary(relatedJob.minSalary, relatedJob.maxSalary)}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {relatedJob.location?.province}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={relatedJobsPage === 1}
                            className="flex items-center gap-2"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Trước
                          </Button>

                          <span className="text-sm text-muted-foreground">
                            Trang {relatedJobsPage} / {totalPages}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={relatedJobsPage === totalPages}
                            className="flex items-center gap-2"
                          >
                            Sau
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Không có việc làm liên quan</p>
                      <p className="text-sm">Chúng tôi sẽ cập nhật thêm cơ hội việc làm từ công ty này</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>


          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>

              {/* Your skills and experience */}
              {job.requirements && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Kỹ năng và kinh nghiệm của bạn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}

              {/* Why you'll love working here */}
              {job.benefits && (
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Tại sao bạn sẽ yêu thích làm việc tại đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.benefits?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              {/* Location Map */}
              <JobLocationMap
                location={job.location}
                address={job.address}
                companyName={job.company?.name}
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

