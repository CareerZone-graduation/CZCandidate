import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getApplicationById, respondToOffer } from '../../services/jobService';
import { useChat } from '@/contexts/ChatContext';
import ActivityHistory from '../../components/jobs/ActivityHistory';
import { toast } from 'sonner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Separator } from '../../components/ui/separator';
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
  Hourglass,
  FileIcon,
  Star,
  MessageCircle,
  Briefcase,
  Link as LinkIcon,
  Video,
  ClipboardList,

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
    OFFER_DECLINED: {
      label: 'Đã từ chối lời mời',
      icon: <XCircle className="h-4 w-4" />,
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      bgColor: 'bg-gray-50',
    },
    INTERVIEW_FAILED: {
      label: 'Phỏng vấn không đạt',
      icon: <XCircle className="h-4 w-4" />,
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      bgColor: 'bg-gray-100',
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

import ApplicationDetailSkeleton from './ApplicationDetailSkeleton';



const ApplicationDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.application;
  const [isResponding, setIsResponding] = React.useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { openChat } = useChat();
  const [showCVModal, setShowCVModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

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

  // Handler nhắn tin với nhà tuyển dụng
  const handleMessage = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để nhắn tin.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Mở chat với recruiter từ thông tin trong application
    openChat({
      recipientId: application?.recruiterId || application?.jobSnapshot?.recruiterId,
      jobId: application?.jobId,
      companyName: application?.jobSnapshot?.company
    });
  };

  const handleRespondClick = (status) => {
    setPendingStatus(status);
    setConfirmOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!pendingStatus) return;

    setIsResponding(true);
    try {
      await respondToOffer(id, pendingStatus);
      toast.success(pendingStatus === 'ACCEPTED' ? 'Đã chấp nhận lời mời!' : 'Đã từ chối lời mời.');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phản hồi.');
    } finally {
      setIsResponding(false);
      setConfirmOpen(false);
      setPendingStatus(null);
    }
  };

  // Tạo URL để xem CV template trên CareerZone
  const getTemplateCVViewUrl = () => {
    if (!application?.submittedCV) return null;

    const token = localStorage.getItem('accessToken');
    const baseUrl = window.location.origin;
    return `${baseUrl}/render-application.html?applicationId=${application._id}&token=${encodeURIComponent(token)}&role=candidate`;
  };

  if (isLoading && !initialData) {
    return <ApplicationDetailSkeleton />;
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
  const jobSnapshot = application.jobSnapshot || {};
  const isTemplateCv = application.submittedCV?.source === 'TEMPLATE';
  const isUploadedCv = application.submittedCV?.source === 'UPLOADED';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/applications')}
          className="mb-4 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        {/* Main Header Card */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Company Logo & Job Info */}
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={jobSnapshot.logo} alt={jobSnapshot.company} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                    {jobSnapshot.company?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {jobSnapshot.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{jobSnapshot.company}</span>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex items-center gap-2 w-fit px-4 py-2 text-sm font-medium',
                      statusInfo.textColor,
                      statusInfo.borderColor,
                      statusInfo.bgColor,
                    )}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nhắn tin nhà tuyển dụng
                </Button>
                {application.interview && (
                  <Button
                    className={cn(
                      "text-white border-0",
                      application.interview.isEnded
                        ? "bg-stone-600 hover:bg-stone-700"
                        : "bg-emerald-600 hover:bg-emerald-700 animate-pulse hover:animate-none"
                    )}
                    asChild
                  >
                    <Link to={`/interviews/${application.interview._id}`}>
                      <Video className="h-4 w-4 mr-2" />
                      {application.interview.isEnded ? 'Chi tiết phỏng vấn' : 'Vào phòng phỏng vấn'}
                    </Link>
                  </Button>
                )}
                {application.testAssignments && application.testAssignments.map(assignment => (
                  <Button
                    key={assignment._id}
                    className={cn(
                      "text-white border-0",
                      assignment.status === 'COMPLETED' ? "bg-stone-600 hover:bg-stone-700" : "bg-violet-600 hover:bg-violet-700"
                    )}
                    asChild
                  >
                    <Link to={`/tests/${assignment._id}/${assignment.status === 'COMPLETED' ? 'result' : 'take'}`}>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      {assignment.status === 'COMPLETED' ? 'Kết quả bài Test' : 'Làm bài Test'}
                    </Link>
                  </Button>
                ))}
                <Button variant="outline" asChild>
                  <Link to={`/jobs/${application.jobId}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem tin tuyển dụng
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Application Timeline */}
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Ứng tuyển: <span className="font-medium text-foreground">{formatDateTime(application.appliedAt)}</span></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Cập nhật: <span className="font-medium text-foreground">{formatDateTime(application.lastStatusUpdateAt)}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Response Alert - Full Width */}
        {(() => {
          const sortedHistory = [...(application.activityHistory || [])].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          const latestAction = sortedHistory.find(item =>
            ['OFFER_SENT', 'OFFER_ACCEPTED', 'OFFER_DECLINED'].includes(item.action)
          );
          const shouldShowResponse = application.status === 'OFFER_SENT' && latestAction?.action === 'OFFER_SENT';

          if (!shouldShowResponse) return null;

          return (
            <Card className="mb-6 border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100/50 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-full">
                    <Star className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-purple-900">
                      🎉 Chúc mừng! Bạn nhận được lời mời làm việc
                    </CardTitle>
                    <CardDescription className="text-purple-700">
                      <strong>{jobSnapshot.company}</strong> muốn mời bạn gia nhập đội ngũ của họ
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none px-8"
                    onClick={() => handleRespondClick('ACCEPTED')}
                    disabled={isResponding}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Chấp nhận lời mời
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 flex-1 sm:flex-none px-8"
                    onClick={() => handleRespondClick('OFFER_DECLINED')}
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

        {/* Interview Failed Alert */}
        {(() => {
          if (application.status !== 'INTERVIEW_FAILED') return null;

          const sortedHistory = [...(application.activityHistory || [])].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          const failedAction = sortedHistory.find(item => item.action === 'INTERVIEW_FAILED');

          return (
            <Card className="mb-6 border-gray-200 bg-gray-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <XCircle className="h-5 w-5" />
                  <CardTitle className="text-lg">Phỏng vấn không đạt</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  Rất tiếc, kết quả phỏng vấn của bạn chưa đáp ứng được yêu cầu của công việc này.
                </p>
                {failedAction?.detail && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-sm text-gray-800 shadow-sm">
                    <span className="font-semibold block mb-1 text-gray-900">Phản hồi từ nhà tuyển dụng:</span>
                    <p className="italic text-gray-600">"{failedAction.detail}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Offer Letter Section */}
        {(application.offerLetter || application.offerFile) && (
          <Card className="mb-6 border-purple-200 bg-purple-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900">Thư mời làm việc</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {application.offerLetter && (
                <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                    {application.offerLetter}
                  </p>
                </div>
              )}

              {application.offerFile && (
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-purple-200 hover:bg-purple-50 text-purple-700" asChild>
                    <a href={application.offerFile} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống file đính kèm
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CV Section */}
            {application.submittedCV && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">CV đã nộp</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {isTemplateCv ? 'CV CareerZone' : 'CV tải lên'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{application.submittedCV.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {isTemplateCv ? 'Được tạo từ mẫu CV trên CareerZone' : 'CV được tải lên từ máy tính'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isUploadedCv && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a href={application.submittedCV.path} target="_blank" rel="noopener noreferrer" download>
                              <Download className="h-4 w-4 mr-2" />
                              Tải xuống
                            </a>
                          </Button>
                          <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-primary hover:bg-primary/90">
                                <Eye className="h-4 w-4 mr-2" />
                                Xem CV
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
                              <DialogHeader className="p-4 border-b shrink-0">
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  {application.submittedCV.name}
                                </DialogTitle>
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
                        </>
                      )}

                      {isTemplateCv && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          asChild
                        >
                          <a
                            href={getTemplateCVViewUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Xem trên CareerZone
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Thư giới thiệu</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-5 rounded-xl border border-muted">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                      {application.coverLetter}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity History */}
            <ActivityHistory history={application.activityHistory} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                </div>
                <CardDescription>Thông tin bạn đã cung cấp khi ứng tuyển</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Họ và tên</p>
                    <p className="font-medium">{application.candidateName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{application.candidateEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{application.candidatePhone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Hành động nhanh</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleMessage}
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  Nhắn tin nhà tuyển dụng
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to={`/jobs/${application.jobId}`}>
                    <ExternalLink className="h-4 w-4 mr-3" />
                    Xem tin tuyển dụng gốc
                  </Link>
                </Button>

                <Separator />

                <p className="text-xs text-muted-foreground text-center">
                  Có thắc mắc? Hãy nhắn tin trực tiếp cho nhà tuyển dụng để được hỗ trợ.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={pendingStatus === 'ACCEPTED' ? 'Chấp nhận lời mời?' : 'Từ chối lời mời?'}
        description={pendingStatus === 'ACCEPTED'
          ? 'Bạn có chắc chắn muốn chấp nhận lời mời làm việc này? Nhà tuyển dụng sẽ được thông báo ngay lập tức.'
          : 'Bạn có chắc chắn muốn từ chối lời mời làm việc này? Hành động này không thể hoàn tác.'}
        onConfirm={handleConfirmResponse}
        confirmText={pendingStatus === 'ACCEPTED' ? 'Chấp nhận' : 'Từ chối'}
        cancelText="Hủy bỏ"
        variant={pendingStatus === 'ACCEPTED' ? 'default' : 'destructive'}
        isLoading={isResponding}
      />
    </div>
  );
};

export default ApplicationDetailPage;
