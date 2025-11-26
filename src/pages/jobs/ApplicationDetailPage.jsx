import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getApplicationById, respondToOffer } from '../../services/jobService';
import ActivityHistory from '../../components/jobs/ActivityHistory';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { cn } from '../../lib/utils';
import {
  FileText,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Download,
  ExternalLink,
  ArrowLeft,
  Building,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hourglass,
  FileIcon,
  Star,
} from 'lucide-react';

const getStatusInfo = (status) => {
  const statusMap = {
    PENDING: {
      label: 'Đang chờ',
      icon: <Hourglass className="h-4 w-4" />,
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
    },
    SUITABLE: {
      label: 'Phù hợp',
      icon: <CheckCircle className="h-4 w-4" />,
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
    },
    SCHEDULED_INTERVIEW: {
      label: 'Đã xếp lịch phỏng vấn',
      icon: <Calendar className="h-4 w-4" />,
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      bgColor: 'bg-cyan-50',
    },
    OFFER_SENT: {
      label: 'Đã gửi đề nghị',
      icon: <Star className="h-4 w-4" />,
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50',
    },
    ACCEPTED: {
      label: 'Đã chấp nhận',
      icon: <CheckCircle className="h-4 w-4" />,
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
    },
    REJECTED: {
      label: 'Đã từ chối',
      icon: <XCircle className="h-4 w-4" />,
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
    },
  };
  return statusMap[status] || statusMap['PENDING'];
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DetailSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <Skeleton className="h-10 w-40 mb-4" /> {/* Back button */}

    <div className="bg-white rounded-2xl p-6 md:p-8 mt-4 border shadow-sm">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="my-6 border-t border-gray-200" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6 border-t">
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </div>
  </div>
);

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.application;
  const [isResponding, setIsResponding] = React.useState(false);

  const {
    data: application,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id),
    initialData: initialData,
  });

  if (isLoading && !initialData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <DetailSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState
          message={error.response?.data?.message || 'Không thể tải chi tiết đơn ứng tuyển.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-6">
        <ErrorState message="Không tìm thấy đơn ứng tuyển." />
      </div>
    );
  }

  const handleRespond = async (status) => {
    if (!window.confirm(status === 'ACCEPTED'
      ? 'Bạn có chắc chắn muốn chấp nhận lời mời làm việc này?'
      : 'Bạn có chắc chắn muốn từ chối lời mời làm việc này?')) {
      return;
    }

    setIsResponding(true);
    try {
      await respondToOffer(id, status);
      toast.success(status === 'ACCEPTED' ? 'Đã chấp nhận lời mời!' : 'Đã từ chối lời mời.');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phản hồi.');
    } finally {
      setIsResponding(false);
    }
  };

  const statusInfo = getStatusInfo(application.status);
  const jobSnapshot = application.jobSnapshot || {};

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/applications')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        <div className="bg-white rounded-2xl p-6 md:p-8 mt-4 border shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={jobSnapshot.logo} alt={jobSnapshot.company} />
              <AvatarFallback className="text-xl">
                {jobSnapshot.company?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{jobSnapshot.title}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                {jobSnapshot.company}
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Body */}
          <div className="space-y-6">
            {/* Status and Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex items-center gap-2 w-fit px-4 py-2 text-sm',
                        statusInfo.textColor,
                        statusInfo.borderColor,
                        statusInfo.bgColor,
                      )}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>

                  </div>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Ứng tuyển: {formatDateTime(application.appliedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Cập nhật: {formatDateTime(application.lastStatusUpdateAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Offer Response Section */}
              {(() => {
                // Check if the latest relevant activity is OFFER_SENT or a response
                // Sort history by timestamp descending (newest first)
                const sortedHistory = [...(application.activityHistory || [])].sort((a, b) =>
                  new Date(b.timestamp) - new Date(a.timestamp)
                );

                // Find the latest offer-related action
                const latestAction = sortedHistory.find(item =>
                  ['OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_DECLINED'].includes(item.action)
                );

                // Only show if the LATEST action is OFFER_SENT (meaning no response yet)
                // AND the status is OFFER_SENT (double check)
                const shouldShowResponse = application.status === 'OFFER_SENT' && latestAction?.action === 'OFFER_SENT';

                if (!shouldShowResponse) return null;

                return (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="text-base text-purple-900 flex items-center gap-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        Phản hồi lời đề nghị
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-purple-800 mb-4">
                        Chúc mừng! Bạn đã nhận được lời mời làm việc từ <strong>{jobSnapshot.company}</strong>.
                        Vui lòng phản hồi lời đề nghị này.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          onClick={() => handleRespond('ACCEPTED')}
                          disabled={isResponding}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Chấp nhận
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleRespond('OFFER_DECLINED')}
                          disabled={isResponding}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin của bạn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{application.candidateName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{application.candidateEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{application.candidatePhone}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thư giới thiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {application.coverLetter}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submitted CV */}
            {application.submittedCV && (
              <Dialog>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileIcon className="h-5 w-5" />
                      CV đã nộp
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{application.submittedCV.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Nguồn: {application.submittedCV.source === 'UPLOADED' ? 'Tải lên' : 'Từ hồ sơ'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={application.submittedCV.path} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Tải xuống
                          </a>
                        </Button>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-gradient-primary">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem CV
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
                  <DialogHeader className="p-4 border-b shrink-0">
                    <DialogTitle>{application.submittedCV.name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(application.submittedCV.path)}&embedded=true`}
                      className="w-full h-full"
                      title={application.submittedCV.name}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Activity History */}
            <ActivityHistory history={application.activityHistory} />

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t">
              <Button asChild>
                <Link to={`/jobs/${application.jobId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Xem tin tuyển dụng gốc
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;
