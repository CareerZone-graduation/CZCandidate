import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
import { formatSalaryVND, formatWorkType, formatExperience } from '@/utils/formatters';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Removed local format functions - now using utils/formatters.js

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
        return { ...oldData, isSaved: !oldData.isSaved };
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
    return <ErrorState onRetry={refetch} message={error?.response?.data?.message || error?.message || 'Có lỗi xảy ra'} />;
  }

  if (!job) {
    return <EmptyState title="Không tìm thấy công việc" description="Công việc bạn tìm không tồn tại." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button variant="ghost" className="mb-4 flex items-center gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Button>

        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                <AvatarFallback>{job.company?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{job.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span>{job.company?.name}</span>
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
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
                {formatExperience(job.experienceLevel)}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(job.postedAt).toLocaleDateString('vi-VN')}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Mô tả công việc</h3>
              <p>{job.description}</p>

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold">Kỹ năng yêu cầu:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {job.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
                  </ul>
                </div>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold">Yêu cầu công việc:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {job.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
                  </ul>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold">Quyền lợi:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {job.benefits.map((benefit, idx) => <li key={idx}>{benefit}</li>)}
                  </ul>
                </div>
              )}

              {job.latitude && job.longitude && (
                <JobLocationMap latitude={job.latitude} longitude={job.longitude} />
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleApply}>Ứng tuyển</Button>
              <Button variant="outline" onClick={handleSave}>
                {job.isSaved ? 'Bỏ lưu' : 'Lưu công việc'}
              </Button>
              <Button variant="outline" onClick={handleShare}>Chia sẻ</Button>
              <Button variant="secondary" onClick={handleViewApplicants} disabled={hasViewedApplicants}>
                {hasViewedApplicants ? `Đã xem (${applicantCount ?? '-'})` : 'Xem số ứng viên'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog />
      <ApplyJobDialog 
        open={showApplyDialog} 
        onClose={() => setShowApplyDialog(false)} 
        jobId={id} 
        onSuccess={handleApplySuccess} 
      />
    </div>
  );
};

export default JobDetail;