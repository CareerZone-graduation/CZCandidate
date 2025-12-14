import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    Clock,
    Video,
    MapPin,
    Building,
    ArrowLeft,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    Monitor,
    CalendarCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Skeleton } from '../../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ErrorState } from '../../components/common/ErrorState';

import {
    getInterviewById,
    checkCanJoinInterview,
    formatInterviewTime
} from '../../services/interviewService';
import { toast } from 'sonner';

/**
 * InterviewDetail Page
 * Displays detailed information about a specific interview
 */
const InterviewDetail = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();

    const {
        data: interview,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['interview', interviewId],
        queryFn: () => getInterviewById(interviewId),
        retry: 1,
        select: (response) => response.data
    });

    const handleJoinInterview = () => {
        if (!interview) return;

        const { canJoin, reason } = checkCanJoinInterview(interview.scheduledTime);

        if (!canJoin) {
            toast.error('Không thể tham gia phỏng vấn', {
                description: reason
            });
            return;
        }

        // Go to device test first
        navigate(`/interviews/${interview.id}/device-test`); // Use interview.id or interview._id check data
    };

    const handleDeviceTest = () => {
        navigate(`/interviews/${interviewId}/device-test`);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" className="mb-6" disabled>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
                <ErrorState
                    message={error?.response?.data?.message || 'Không thể tải thông tin phỏng vấn'}
                    onRetry={refetch}
                />
            </div>
        );
    }

    // Determine status config
    const getStatusConfig = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return { label: 'Đã lên lịch', className: 'bg-blue-600', icon: CalendarCheck };
            case 'RESCHEDULED':
                return { label: 'Đã dời lịch', className: 'bg-amber-600', icon: Clock };
            case 'COMPLETED':
                return { label: 'Đã hoàn thành', className: 'bg-green-600', icon: CheckCircle };
            case 'CANCELLED':
                return { label: 'Đã hủy', className: 'bg-red-600', icon: XCircle };
            default:
                return { label: status, className: 'bg-gray-600', icon: AlertCircle };
        }
    };

    const statusConfig = getStatusConfig(interview.status);
    const StatusIcon = statusConfig.icon;

    const { date, time, isNow, isPast } = formatInterviewTime(interview.scheduledTime);
    const { canJoin, reason } = checkCanJoinInterview(interview.scheduledTime);

    // Extract data handling inconsistency between 'application' and 'applicationId'
    const application = interview.application || interview.applicationId || {};
    const jobSnapshot = application.jobSnapshot || {};

    // Extract company details
    // Check if company is string or object (based on different historical data structures)
    const companyName = typeof jobSnapshot.company === 'string'
        ? jobSnapshot.company
        : jobSnapshot.company?.name || 'Công ty ẩn danh';

    const companyLogo = jobSnapshot.logo || (typeof jobSnapshot.company === 'object' ? jobSnapshot.company?.logo : null);

    // Extract interviewer details
    // Backend returns recruiterId object with email, no separate interviewer field in some cases
    const recruiter = interview.recruiterId || {};
    const interviewerName = recruiter.fullName || recruiter.name || recruiter.email || 'Nhà tuyển dụng';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card className="overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 pb-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <Badge variant="secondary" className={`${statusConfig.className} text-white hover:${statusConfig.className} mb-4`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>
                                    <CardTitle className="text-2xl font-bold">{jobSnapshot.title || interview.roomName || 'Phỏng vấn'}</CardTitle>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 font-medium">
                                        <Building className="w-4 h-4 mr-2" />
                                        {companyName}
                                    </div>
                                </div>
                                {companyLogo && (
                                    <Avatar className="h-16 w-16 border bg-white">
                                        <AvatarImage src={companyLogo} alt={companyName} />
                                        <AvatarFallback>{companyName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="-mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-950 p-4 rounded-lg border shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Ngày</p>
                                        <p className="font-medium">{date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian</p>
                                        <p className="font-medium">{time} ({interview.duration || 60} phút)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Hình thức</p>
                                        <p className="font-medium">Trực tuyến {interview.meetingProvider ? `(${interview.meetingProvider})` : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Người phỏng vấn</p>
                                        <p className="font-medium truncate max-w-[150px]" title={interviewerName}>
                                            {interviewerName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Details / Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chi tiết phỏng vấn</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {interview.message ? (
                                <div>
                                    <h4 className="font-medium mb-1">Lời nhắn từ nhà tuyển dụng:</h4>
                                    <p className="text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border text-sm italic">
                                        "{interview.message}"
                                    </p>
                                </div>
                            ) : null}

                            <div>
                                <h4 className="font-medium mb-2">Lưu ý quan trọng:</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                                    <li>Vui lòng tham gia đúng giờ. Bạn có thể vào phòng phỏng vấn trước 15 phút.</li>
                                    <li>Đảm bảo đường truyền internet ổn định và không gian yên tĩnh.</li>
                                    <li>Kiểm tra camera và microphone trước khi bắt đầu.</li>
                                    <li>Chuẩn bị trang phục lịch sự như phỏng vấn trực tiếp.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    {/* Action Card */}
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Thao tác</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isNow && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm font-medium flex items-center animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                    Buổi phỏng vấn đang diễn ra
                                </div>
                            )}

                            {!isPast && (
                                <>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 font-semibold h-11"
                                        onClick={handleJoinInterview}
                                        disabled={!canJoin && !isNow} // Allow if isNow is true (just to be safe, though canJoin handles logic)
                                    >
                                        <Video className="w-4 h-4 mr-2" />
                                        Tham gia ngay
                                    </Button>

                                    {!canJoin && !isPast && (
                                        <p className="text-xs text-center text-gray-500">
                                            {reason}
                                        </p>
                                    )}

                                    <Separator />

                                    <Button variant="outline" className="w-full" onClick={handleDeviceTest}>
                                        <Monitor className="w-4 h-4 mr-2" />
                                        Kiểm tra thiết bị
                                    </Button>
                                </>
                            )}

                            {isPast && (
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <p className="text-gray-500 font-medium">Buổi phỏng vấn đã kết thúc</p>
                                </div>
                            )}



                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetail;
