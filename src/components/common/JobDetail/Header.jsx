import {
    Bookmark,
    CheckCircle,
    DollarSign,
    UserCheck,
    Eye,
    MessageCircle,
    RefreshCw
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    formatSalary
} from '@/utils/formatters';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Separator
} from '@/components/ui/separator';
import {
    MapPin
} from 'lucide-react';
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
    handleMessage
}) => {
    const navigate = useNavigate();
    return (
        <div className="mb-8">
            <div className="bg-card rounded-xl shadow-sm border p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{job.title}</h1>
                                <p className="text-lg text-muted-foreground">{job.company?.name}</p>
                                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary/80" />
                                    <span className="text-sm">{[job.address, job.location?.commune, job.location?.district, job.location?.province].filter(p => p && p !== 'OTHER').join(', ') || 'Địa điểm chưa được cập nhật'}</span>
                                </div>
                            </div>
                        </div>

                        {(isAuthenticated || job.minSalary || job.maxSalary) && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                    <DollarSign className="w-5 h-5" />
                                    <span>{formatSalary(job.minSalary, job.maxSalary)}</span>
                                </div>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <UserCheck className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium text-gray-900">Thông tin ứng viên</h3>
                                                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">MỚI</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {hasViewedApplicants && applicantCount !== null
                                                    ? `${applicantCount} người đã ứng tuyển`
                                                    : 'Xem số lượng ứng viên đã ứng tuyển'}
                                            </p>
                                        </div>
                                    </div>

                                    {hasViewedApplicants && applicantCount !== null ? (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 font-semibold">
                                            {applicantCount} người
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleViewApplicants}
                                            disabled={isLoadingApplicants}
                                            className="border-orange-300 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-medium"
                                        >
                                            {isLoadingApplicants ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem (10 xu)
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            {job.isApplied ? (
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium justify-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Đã ứng tuyển
                                    </Badge>
                                    {job.status === 'ACTIVE' && (
                                        <Button
                                            onClick={handleApply}
                                            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 font-medium"
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Ứng tuyển lại
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleMessage}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-medium"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Nhắn tin
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleApply}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 font-medium"
                                    disabled={job?.status !== 'ACTIVE'}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {job.status === 'ACTIVE' ? 'Ứng tuyển ngay' : 'Việc làm đã đóng'}
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleSave}
                                className={`px-6 py-2.5 font-medium transition-all duration-200 ${job.isSaved
                                    ? "bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                                    : "hover:bg-muted"
                                    }`}
                            >
                                <Bookmark className={`w-4 h-4 mr-2 ${job.isSaved ? "fill-current" : ""}`} />
                                {job.isSaved ? "Đã lưu" : "Lưu việc làm"}
                            </Button>

                            {/* Share Button with Dropdown - truyền jobId để tạo preview URL */}
                            <ShareButtons jobId={job?._id} jobTitle={job?.title} />
                        </div>
                    </div>

                    {/* Right Column (1/3 width) */}
                    <div className="lg:col-span-1">
                        <Card className="h-full border-0 shadow-none bg-muted/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Thông tin công ty</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-14 h-14 border-2 border-border">
                                        <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                                        <AvatarFallback className="bg-muted text-foreground text-base font-bold">
                                            {job.company?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-md text-foreground">{job.company?.name}</h3>
                                        <p className="text-sm text-muted-foreground">{job.company?.industry || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => navigate(`/company/${job.company?._id}`)}
                                    >
                                        Xem chi tiết công ty
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDetailHeader;