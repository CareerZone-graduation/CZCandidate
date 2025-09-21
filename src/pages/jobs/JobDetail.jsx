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
import JobLocationMap from '@/components/common/JobLocationMap';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-white/80 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Hero Header Card */}
          <Card className="mb-8 overflow-hidden shadow-xl border-0 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600">
            <div className="relative p-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/20 rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {formatWorkType(job.type)}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {formatExperience(job.experience)}
                    </Badge>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-emerald-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{job.company?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span>{job.location?.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white">
                        {formatSalary(job.minSalary, job.maxSalary)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-4">
                  <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
                    <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                    <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                      {job.company?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center lg:text-right">
                    <p className="text-emerald-100 text-sm">Hạn nộp</p>
                    <p className="font-semibold">{new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Section */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mức lương</p>
                    <span className="font-semibold text-green-600">
                      {formatSalary(job.minSalary, job.maxSalary)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hình thức</p>
                    <span className="font-medium">{formatWorkType(job.type)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
                    <span className="font-medium">{formatExperience(job.experience)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hạn nộp</p>
                    <span className="font-medium">{new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ứng viên</p>
                      {hasViewedApplicants && applicantCount !== null ? (
                        <span className="font-semibold text-primary">
                          {applicantCount} người
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
                          Xem (50 xu)
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {job.isApplied ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-6 py-2 text-sm font-medium justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã ứng tuyển
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleApply}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
                        ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 shadow-md"
                        : "hover:bg-slate-50 hover:shadow-md"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${job.isSaved ? "fill-current" : ""}`} />
                    {job.isSaved ? "Đã lưu" : "Lưu việc làm"}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="hover:bg-slate-100 px-4 py-2.5 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Job Description */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    Mô tả công việc
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>

              {/* Job Requirements */}
              {job.requirements && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-orange-600" />
                      </div>
                      Yêu cầu công việc
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}

              {/* Job Benefits */}
              {job.benefits && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-green-600" />
                      </div>
                      Quyền lợi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.benefits?.replace(/\n/g, '<br />') }} />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              {/* Company Information */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    Thông tin công ty
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-indigo-100">
                      <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-lg font-bold">
                        {job.company?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{job.company?.name}</h3>
                      <p className="text-sm text-muted-foreground">{job.company?.industry || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Địa chỉ</p>
                        <p className="text-sm text-gray-600">{job.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Map */}
              <JobLocationMap
                location={job.location}
                address={job.address}
                companyName={job.company?.name}
              />

              {/* Job Details Summary */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    Tóm tắt công việc
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Cấp bậc</span>
                      </div>
                      <span className="font-semibold text-blue-700">{formatExperience(job.experience)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Hình thức</span>
                      </div>
                      <span className="font-semibold text-green-700">{formatWorkType(job.type)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Trạng thái</span>
                      </div>
                      <Badge className={`font-medium ${
                        job.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                      </Badge>
                    </div>

                    {isAuthenticated && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Eye className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">Ứng viên</span>
                        </div>
                        {hasViewedApplicants && applicantCount !== null ? (
                          <span className="font-semibold text-purple-700">
                            {applicantCount} người
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewApplicants}
                            disabled={isLoadingApplicants}
                            className="border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Xem (50 xu)
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
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