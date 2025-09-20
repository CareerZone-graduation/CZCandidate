import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { getJobApplicantCount, getJobById } from '../../services/jobService';
import { saveJob, unsaveJob } from '../../services/savedJobService';
import { toast } from 'sonner';
import { ApplyJobDialog } from './components/ApplyJobDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';

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

  // Fetch job details using React Query
  const { data: job, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobDetail', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    select: (data) => data.data.data,
  });

  // Format functions
  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary.toLocaleString()}-${maxSalary.toLocaleString()} USD`;
    }
    if (minSalary) return `Từ ${minSalary.toLocaleString()} USD`;
    if (maxSalary) return `Đến ${maxSalary.toLocaleString()} USD`;
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          <Card className="mb-6 overflow-hidden">
            <div className="bg-linear-to-r from-emerald-600 to-blue-600 p-6 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-emerald-100">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {job.company?.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location?.province}
                    </div>
                  </div>
                </div>
                <Avatar className="w-16 h-16 border-2 border-background">
                  <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                  <AvatarFallback className="bg-background text-primary text-lg font-semibold">
                    {job.company?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-semibold text-green-600">
                    {formatSalary(job.minSalary, job.maxSalary)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span>{formatWorkType(job.type)}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                  <span>{formatExperience(job.experience)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                </div>
                
                {isAuthenticated && (
                  <div className="flex items-center text-muted-foreground">
                    <UserCheck className="w-4 h-4 mr-2 text-primary" />
                    {hasViewedApplicants && applicantCount !== null ? (
                      <span className="font-semibold text-primary">
                        {applicantCount} ứng viên đã ứng tuyển
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewApplicants}
                        disabled={isLoadingApplicants}
                        className="h-7 text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Xem số ứng viên (50 xu)
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {job.isApplied ? (
                    <Badge variant="secondary" size="lg" className="bg-green-100 text-green-700 border-green-200 px-8 py-2.5">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã ứng tuyển
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleApply}
                      className="bg-gradient-primary  text-white px-8"
                      disabled={job?.status !== 'ACTIVE'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {job.status === 'ACTIVE' ? 'Ứng tuyển ngay' : 'Việc làm đã đóng'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    className={job.isSaved ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" : ""}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${job.isSaved ? "fill-current" : ""}`} />
                    {job.isSaved ? "Đã lưu" : "Lưu việc làm"}
                  </Button>
                </div>

                <Button variant="ghost" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>

              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Yêu cầu công việc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}

              {job.benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Quyền lợi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: job.benefits?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin công ty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {job.company?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{job.company?.name}</h3>
                      <p className="text-sm text-muted-foreground">{job.company?.industry || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground mt-1 shrink-0" />
                      <span>{job.address || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin tuyển dụng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cấp bậc:</span>
                    <span className="font-medium">{formatExperience(job.experience)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hình thức:</span>
                    <span className="font-medium">{formatWorkType(job.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge className="bg-gradient-primary" variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                    </Badge>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Số ứng viên:</span>
                      {hasViewedApplicants && applicantCount !== null ? (
                        <span className="font-medium text-primary">
                          {applicantCount} người
                        </span>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={handleViewApplicants}
                          disabled={isLoadingApplicants}
                          className="h-6 p-1 text-xs text-primary"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Xem (50 xu)
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
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