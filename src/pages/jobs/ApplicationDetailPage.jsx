import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getApplicationById } from '../../services/jobService';
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
    REVIEWING: {
      label: 'Đang xem xét',
      icon: <Eye className="h-4 w-4" />,
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
    },
    SCHEDULED_INTERVIEW: {
      label: 'Đã xếp lịch phỏng vấn',
      icon: <Calendar className="h-4 w-4" />,
      textColor: 'text-cyan-700',
      borderColor: 'border-cyan-200',
      bgColor: 'bg-cyan-50',
    },
    INTERVIEW: {
      label: 'Phỏng vấn',
      icon: <AlertCircle className="h-4 w-4" />,
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

const getRatingInfo = (rating) => {
  if (!rating) return null;
  const ratingMap = {
    SUITABLE: {
      label: 'Phù hợp',
      icon: <Star className="h-4 w-4" />,
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
    },
    NOT_SUITABLE: {
      label: 'Không phù hợp',
      icon: <XCircle className="h-4 w-4" />,
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
    },
    CONSIDERING: {
      label: 'Đang cân nhắc',
      icon: <Eye className="h-4 w-4" />,
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
    },
  };
  return ratingMap[rating];
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
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24 mt-1" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.application;

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

  const statusInfo = getStatusInfo(application.status);
  const ratingInfo = getRatingInfo(application.candidateRating);
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
                    {ratingInfo && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-2 w-fit px-4 py-2 text-sm',
                          ratingInfo.textColor,
                          ratingInfo.borderColor,
                          ratingInfo.bgColor,
                        )}
                      >
                        {ratingInfo.icon}
                        {ratingInfo.label}
                      </Badge>
                    )}
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
