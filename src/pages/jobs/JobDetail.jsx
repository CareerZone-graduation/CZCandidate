import { useState, useEffect } from 'react';
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
  Users, 
  Building, 
  Calendar,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  Globe,
  Phone,
  Mail,
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

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicantCount, setApplicantCount] = useState(null);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [hasViewedApplicants, setHasViewedApplicants] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch job details using React Query
  const { data: jobData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobDetail', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    select: (data) => data.data.data,
  });
  
  const job = jobData;

  // Format functions
  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary}-${maxSalary} USD`;
    }
    if (minSalary) return `Từ ${minSalary} USD`;
    if (maxSalary) return `Đến ${maxSalary} USD`;
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
      navigate('/login');
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
        
        // Hiển thị thông báo từ API về việc trừ xu
        if (response.data.message) {
          toast.success(response.data.message);
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy số lượng ứng viên:', err);
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
      navigate('/login');
      return;
    }
    setShowApplyDialog(true);
  };

  const handleApplySuccess = () => {
    toast.success("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.");
    queryClient.invalidateQueries(['jobDetail', id]);
  };
  
  const { mutate: toggleSaveJob, isPending: isSaving } = useMutation({
    mutationFn: () => {
      return job?.isSaved ? unsaveJob(id) : saveJob(id);
    },
    onSuccess: () => {
      const message = job?.isSaved ? 'Đã bỏ lưu công việc' : 'Đã lưu công việc thành công';
      toast.success(message);
      queryClient.invalidateQueries(['jobDetail', id]);
    },
    onError: (err) => {
      console.error('Lỗi khi lưu/bỏ lưu công việc:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    },
  });

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login');
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
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết vào clipboard');
    }
  };

  // Component hiển thị dialog xác nhận
  const ConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-4">
              <Coins className="w-6 h-6 text-warning" />
            </div>
            <CardTitle className="text-xl">Xem số người đã ứng tuyển</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Để xem số lượng ứng viên đã ứng tuyển vào vị trí này, bạn cần tiêu phí:
              </p>
              <div className="flex items-center justify-center space-x-2 text-lg font-semibold text-warning">
                <Coins className="w-5 h-5" />
                <span>50 xu</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Xu sẽ được trừ từ tài khoản của bạn ngay lập tức.
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
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
                className="flex-1 bg-gradient-primary hover:opacity-90"
                disabled={isLoadingApplicants}
              >
                {isLoadingApplicants ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-600 mb-4">{error.message}</p>
                <Button onClick={() => refetch()} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy công việc</h3>
                <p className="text-gray-600 mb-4">Công việc bạn đang tìm có thể đã bị xóa hoặc không tồn tại.</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Job Header */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
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
                      {job.location.province}
                      {job.location.ward && `, ${job.location.ward}`}
                    </div>
                  </div>
                </div>
                <Avatar className="w-16 h-16 border-2 border-white">
                  <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                  <AvatarFallback className="bg-white text-emerald-600 text-lg font-semibold">
                    {job.company?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
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
                
                {/* Hiển thị số lượng ứng viên hoặc nút xem */}
                {isAuthenticated && (
                  <div className="flex items-center text-gray-600">
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
                  {job?.isApplied ? (
                    <Badge variant="secondary" size="lg" className="bg-green-100 text-green-700 border border-green-200 px-8 py-2.5">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Đã ứng tuyển
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleApply}
                      className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-8"
                      disabled={job?.status !== 'ACTIVE'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {job?.status === 'ACTIVE' ? 'Ứng tuyển ngay' : 'Việc làm đã đóng'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={job?.isSaved ? "bg-yellow-50 border-yellow-300 text-yellow-700" : ""}
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                      <Bookmark className={`w-4 h-4 mr-2 ${job?.isSaved ? "fill-current" : ""}`} />
                    )}
                    {job?.isSaved ? "Đã lưu" : "Lưu việc làm"}
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
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.description?.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {job.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Yêu cầu công việc</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {job.requirements.split('\n').map((requirement, index) => (
                        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                          {requirement}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Quyền lợi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {job.benefits.split('\n').map((benefit, index) => (
                        <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                          {benefit}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
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
                      <p className="text-sm text-gray-600">{job.company?.industry || 'Công nghệ thông tin'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{job.address || `${job.location.province}, ${job.location.ward}`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin tuyển dụng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cấp bậc:</span>
                    <span className="font-medium">{formatExperience(job.experience)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hình thức:</span>
                    <span className="font-medium">{formatWorkType(job.type)}</span>
                  </div>
                  {job.workType && job.workType !== job.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Làm việc:</span>
                      <span className="font-medium">{formatWorkType(job.workType)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                    </Badge>
                  </div>
                  
                  {/* Hiển thị số ứng viên trong sidebar */}
                  {isAuthenticated && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số ứng viên:</span>
                      {hasViewedApplicants && applicantCount !== null ? (
                        <span className="font-medium text-primary">
                          {applicantCount} người
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewApplicants}
                          disabled={isLoadingApplicants}
                          className="h-6 p-1 text-xs text-primary hover:text-primary-foreground hover:bg-primary"
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

      {/* Confirm Dialog */}
      <ConfirmDialog />

      {/* Apply Dialog */}
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