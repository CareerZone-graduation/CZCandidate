import React from 'react';
import { Briefcase, Calendar, CheckCircle, XCircle, AlertCircle, Hourglass, Eye } from 'lucide-react';
import { useCopilot } from '@/contexts/CopilotContext';

const statusConfig = {
    PENDING: {
        label: 'Đang chờ',
        icon: Hourglass,
        color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    },
    SUITABLE: {
        label: 'Đang xem xét',
        icon: Eye,
        color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    SCHEDULED_INTERVIEW: {
        label: 'Phỏng vấn',
        icon: AlertCircle,
        color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    OFFER_SENT: {
        label: 'Đã nhận lời mời',
        icon: CheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
    },
    ACCEPTED: {
        label: 'Đã chấp nhận',
        icon: CheckCircle,
        color: 'bg-green-50 text-green-600 border-green-200'
    },
    REJECTED: {
        label: 'Đã từ chối',
        icon: XCircle,
        color: 'bg-red-50 text-red-600 border-red-200'
    },
    OFFER_DECLINED: {
        label: 'Đã từ chối lời mời',
        icon: XCircle,
        color: 'bg-gray-50 text-gray-600 border-gray-200'
    },
    INTERVIEW_FAILED: {
        label: 'Phỏng vấn không đạt',
        icon: XCircle,
        color: 'bg-gray-50 text-gray-600 border-gray-200'
    },
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

export function ApplicationCardList({ applications }) {
    const { navigate } = useCopilot();

    if (!applications || applications.length === 0) {
        return (
            <div className="text-sm text-gray-400 italic px-3 py-2.5 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                Không có đơn ứng tuyển nào.
            </div>
        );
    }

    const handleApplicationClick = (applicationId) => {
        navigate(`/dashboard/applications/${applicationId}`);
    };

    return (
        <div className="space-y-2 w-full">
            {applications.map((app, index) => {
                const status = statusConfig[app.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                const jobTitle = app.jobId?.title || 'Không rõ vị trí';
                const companyName = app.jobId?.company || '';

                return (
                    <div
                        key={app._id}
                        className="group p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow hover:border-indigo-200 transition-all duration-200 cursor-pointer animate-copilot-card-fadein"
                        style={{
                            animationDelay: `${index * 60}ms`,
                        }}
                        onClick={() => handleApplicationClick(app._id)}
                    >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-sm text-gray-800 truncate group-hover:text-indigo-600 transition-colors" title={jobTitle}>
                                        {jobTitle}
                                    </h4>
                                    {companyName && (
                                        <p className="text-xs text-gray-500 truncate">{companyName}</p>
                                    )}
                                </div>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap border flex items-center gap-1 ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </span>
                        </div>

                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-500" />
                            <span>Nộp ngày: {formatDate(app.appliedAt)}</span>
                        </div>
                    </div>
                );
            })}

            <style>{`
                @keyframes copilot-card-fadein {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-copilot-card-fadein {
                    animation: copilot-card-fadein 0.4s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
