import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatSalary } from '@/utils/formatters';
import { Briefcase, ChevronLeft, ChevronRight, MapPin, ExternalLink, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobDetailSidebar = ({
    job,
    relatedJobs,
    isLoadingRelated,
    currentJobs,
    totalPages,
    relatedJobsPage,
    handlePrevPage,
    handleNextPage,
    handleApply,
    isApplied,
    isJobActive
}) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 sticky top-24 lg:pb-8">
            {/* Company Info Card */}
            <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-info hidden lg:block" />
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        Thông tin công ty
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-col items-center text-center gap-4">
                        <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                            <AvatarImage src={job?.company?.logo} alt={job?.company?.name} className="object-cover" />
                            <AvatarFallback className="bg-muted text-primary text-xl font-bold">
                                {job?.company?.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/company/${job?.company?._id}`)}>
                                {job?.company?.name || 'Công ty ẩn danh'}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">
                                {job?.company?.industry || 'Lĩnh vực chưa cập nhật'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium group"
                            onClick={() => navigate(`/company/${job?.company?._id}`)}
                        >
                            Xem trang công ty
                            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Related Jobs Card */}
            <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
                <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>Việc làm cùng công ty</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                            {relatedJobs?.length || 0}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {isLoadingRelated ? (
                        <div className="grid gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <Skeleton className="h-4 w-5/6" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : relatedJobs && relatedJobs.length > 0 ? (
                        <>
                            <div className="grid gap-3">
                                {currentJobs.map((relatedJob) => (
                                    <div
                                        key={relatedJob._id}
                                        className="group p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-muted/50 transition-all cursor-pointer hover:border-primary/30"
                                        onClick={() => navigate(`/jobs/${relatedJob._id}`)}
                                    >
                                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5 leading-snug">
                                            {relatedJob.title}
                                        </h4>
                                        <div className="flex flex-col gap-1.5">
                                            <Badge variant="secondary" className="text-[10px] px-2 py-0 w-fit bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                                                {formatSalary(relatedJob.minSalary, relatedJob.maxSalary)}
                                            </Badge>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">
                                                    {relatedJob.location?.province}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handlePrevPage}
                                        disabled={relatedJobsPage === 1}
                                        className="h-8 px-2 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Trước
                                    </Button>
                                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                        {relatedJobsPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={relatedJobsPage === totalPages}
                                        className="h-8 px-2 text-xs font-medium hover:bg-primary/10 hover:text-primary"
                                    >
                                        Sau
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                <Briefcase className="w-5 h-5 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Chưa có vị trí khác</p>
                            <p className="text-xs text-muted-foreground mt-1">Công ty này hiện chỉ đang tuyển dụng vị trí này.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default JobDetailSidebar;