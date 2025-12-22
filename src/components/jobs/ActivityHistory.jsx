import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { GitCommit, Star, FileText, UserCheck, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

const ACTION_MAP = {
    APPLICATION_SUBMITTED: {
        icon: UserCheck,
        color: 'text-green-500',
        label: 'Nộp đơn ứng tuyển',
    },
    SUITABLE: {
        icon: CheckCircle,
        color: 'text-green-500',
        label: 'Được đánh giá phù hợp',
    },
    SCHEDULED_INTERVIEW: {
        icon: CalendarIcon,
        color: 'text-cyan-500',
        label: 'Lên lịch phỏng vấn',
    },
    OFFER_SENT: {
        icon: Star,
        color: 'text-purple-500',
        label: 'Nhận được lời đề nghị',
    },
    OFFER_ACCEPTED: {
        icon: CheckCircle,
        color: 'text-green-600',
        label: 'Đã chấp nhận lời mời',
    },
    OFFER_DECLINED: {
        icon: XCircle,
        color: 'text-red-500',
        label: 'Đã từ chối lời mời',
    },
    REJECTED: {
        icon: XCircle,
        color: 'text-red-500',
        label: 'Hồ sơ bị từ chối',
    },
    INTERVIEW_FAILED: {
        icon: XCircle,
        color: 'text-gray-500',
        label: 'Phỏng vấn không đạt',
    },
    DEFAULT: {
        icon: GitCommit,
        color: 'text-gray-500',
        label: 'Hoạt động',
    }
};

const ActivityHistory = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Lịch sử hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
                </CardContent>
            </Card>
        );
    }

    // Sort history by timestamp descending (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Lịch sử hoạt động</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="relative pl-2">
                        {/* Vertical line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                        <div className="space-y-8">
                            {sortedHistory.map((item, index) => {
                                const actionConfig = ACTION_MAP[item.action] || ACTION_MAP.DEFAULT;
                                const Icon = actionConfig.icon;
                                return (
                                    <div key={index} className="relative flex gap-4">
                                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border">
                                            <Icon className={`h-5 w-5 ${actionConfig.color}`} />
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <p className="font-medium text-sm text-foreground">{actionConfig.label}</p>
                                                <time className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(item.timestamp), "HH:mm dd/MM/yyyy", { locale: vi })}
                                                </time>
                                            </div>
                                            {item.detail && (
                                                <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ActivityHistory;
