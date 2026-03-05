import {
    Bookmark,
    CheckCircle,
    DollarSign,
    UserCheck,
    Eye,
    MessageCircle,
    RefreshCw,
    MapPin,
    Briefcase,
    Building,
    Calendar,
    Zap,
    Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatSalary } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import ShareButtons from '@/components/common/ShareButtons';

const JobDetailHeader = ({
    job,
    isAuthenticated,
    handleApply,
    handleSave,
    applicantCount,
    hasViewedApplicants,
    isLoadingApplicants,
    handleViewApplicants,
    handleMessage,
    handleSummarize
}) => {
    // Helper to format work type
    const formatWorkType = (type) => {
        const typeMap = {
            'FULL_TIME': 'Toàn thời gian',
            'PART_TIME': 'Bán thời gian',
            'CONTRACT': 'Hợp đồng',
            'FREELANCE': 'Tự do',
            'INTERNSHIP': 'Thực tập',
            'TEMPORARY': 'Tạm thời'
        };
        return typeMap[type] || type;
    };

    const isJobActive = job?.status === 'ACTIVE';
    const isApplied = job?.isApplied;

    return (
        <div className="mb-8 relative z-20 rounded-2xl border bg-card/60 shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-xl">
            {/* Decorative background elements wrapped to contain overflow */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl backdrop-blur-xl pointer-events-none">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-info/10 blur-3xl" />
            </div>

            <div className="relative p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">

                    {/* Main Info */}
                    <div className="flex-1 space-y-4">
                        {/* Tags / Badges row */}
                        <div className="flex flex-wrap items-center gap-2">
                            {job?.isUrgent && (
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200/50 hover:bg-red-500/20 backdrop-blur-sm animate-pulse">
                                    <Zap className="w-3 h-3 mr-1 fill-current" /> Tuyển gấp
                                </Badge>
                            )}
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-sm">
                                {formatWorkType(job?.type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                                <Calendar className="w-3.5 h-3.5" />
                                Cập nhật: {new Date(job?.updatedAt || job?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                                {job?.title}
                            </h1>
                            <p className="text-lg lg:text-xl text-muted-foreground font-medium flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                {job?.company?.name || 'Công ty ẩn danh'}
                            </p>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4 lg:gap-8 pt-2">
                            {(isAuthenticated || job?.minSalary || job?.maxSalary) && (
                                <div className="flex items-center gap-3 bg-green-50/50 dark:bg-green-950/20 p-3 justify-center lg:justify-start rounded-xl border border-green-200/50 dark:border-green-800/30">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mức lương</p>
                                        <p className="text-lg font-bold text-green-700 dark:text-green-400">
                                            {formatSalary(job?.minSalary, job?.maxSalary)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border/50">
                                <div className="p-2 bg-background rounded-lg shadow-sm">
                                    <MapPin className="w-5 h-5 text-primary/80" />
                                </div>
                                <div className="max-w-[200px]">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Khu vực</p>
                                    <p className="text-sm font-semibold truncate" title={[job?.location?.district, job?.location?.province].filter(p => p && p !== 'OTHER').join(', ')}>
                                        {[job?.location?.district, job?.location?.province].filter(p => p && p !== 'OTHER').join(', ') || 'Chưa cập nhật'}
                                    </p>
                                </div>
                            </div>

                            {isAuthenticated && (
                                <div className="flex items-center gap-3 bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-200/50 dark:border-orange-800/30 flex-1 lg:max-w-xs">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                                        <UserCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Lượt ứng tuyển</p>
                                        {hasViewedApplicants && applicantCount !== null ? (
                                            <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                                {applicantCount} <span className="font-medium text-orange-600/80">người</span>
                                            </p>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleViewApplicants}
                                                disabled={isLoadingApplicants}
                                                className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50 -ml-2"
                                            >
                                                {isLoadingApplicants ? "Đang tải..." : "Xem ngay (10 xu)"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Cards (Desktop right, Mobile bottom) */}
                    <div className="w-full lg:w-auto flex flex-col gap-3 lg:shrink-0 lg:min-w-[280px]">
                        <div className="p-5 bg-card/80 backdrop-blur-md rounded-2xl border border-border/60 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-medium text-muted-foreground">Thao tác ứng viên</h3>
                                <button
                                    onClick={handleSummarize}
                                    className="copilot-glow-btn flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-transparent px-2.5 py-1 rounded-full transition-all duration-300 border-none hover:scale-105 active:scale-95 shadow-sm group"
                                >
                                    <Sparkles className="w-3 h-3 group-hover:animate-pulse text-indigo-500" />
                                    Tóm tắt AI
                                </button>
                            </div>

                            {isApplied ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-xl border border-green-200 dark:border-green-800/30 font-semibold">
                                        <CheckCircle className="w-5 h-5" />
                                        Bạn đã ứng tuyển
                                    </div>
                                    <div className="flex gap-2">
                                        {isJobActive && (
                                            <Button
                                                onClick={handleApply}
                                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Cập nhật CV
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleMessage}
                                            variant="secondary"
                                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Nhắn tin
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    size="lg"
                                    className="w-full btn-gradient text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base py-6 rounded-xl"
                                    disabled={!isJobActive}
                                >
                                    {isJobActive ? (
                                        <>
                                            <Zap className="w-5 h-5 mr-2 fill-current" />
                                            Ứng tuyển ngay
                                        </>
                                    ) : (
                                        'Việc làm đã hệt hạn'
                                    )}
                                </Button>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleSave}
                                    className={`flex-1 rounded-xl transition-colors ${job?.isSaved
                                        ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-700/50 dark:text-yellow-400"
                                        : "hover:bg-muted"
                                        }`}
                                >
                                    <Bookmark className={`w-4 h-4 mr-2 ${job?.isSaved ? "fill-current" : ""}`} />
                                    {job?.isSaved ? "Đã lưu" : "Lưu tin"}
                                </Button>

                                <div className="flex-shrink-0">
                                    <ShareButtons jobId={job?._id} jobTitle={job?.title} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default JobDetailHeader;