import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from '@/components/ui/avatar';
import {
    Badge
} from '@/components/ui/badge';
import {
    Button
} from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Separator
} from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    formatSalary
} from '@/utils/formatters';
import {
    ChevronLeft,
    ChevronRight,
    MapPin
} from 'lucide-react';
import {
    useNavigate
} from 'react-router-dom';

const JobDetailSidebar = ({
    relatedJobs,
    isLoadingRelated,
    currentJobs,
    totalPages,
    relatedJobsPage,
    handlePrevPage,
    handleNextPage
}) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Việc làm liên quan</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingRelated ? (
                        <div className="grid gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                    <div className="flex gap-3">
                                        <Skeleton className="w-10 h-10 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
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
                                        className="p-3 border rounded-lg"
                                        onClick={() => navigate(`/jobs/${relatedJob._id}`)}
                                    >
                                        <div className="flex gap-3 mb-2">
                                            <Avatar className="w-10 h-10 border">
                                                <AvatarImage src={relatedJob.company?.logo} alt={relatedJob.company?.name} />
                                                <AvatarFallback className="text-xs">
                                                    {relatedJob.company?.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-foreground truncate">
                                                    {relatedJob.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {relatedJob.company?.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Badge variant="secondary" className="text-xs px-2 py-0 w-fit">
                                                {formatSalary(relatedJob.minSalary, relatedJob.maxSalary)}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                                                    {relatedJob.location?.province}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrevPage}
                                        disabled={relatedJobsPage === 1}
                                        className="flex items-center gap-1 text-xs"
                                    >
                                        <ChevronLeft className="w-3 h-3" />
                                        Trước
                                    </Button>

                                    <span className="text-xs text-muted-foreground">
                                        {relatedJobsPage} / {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={relatedJobsPage === totalPages}
                                        className="flex items-center gap-1 text-xs"
                                    >
                                        Sau
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Không có việc làm liên quan</p>
                            <p className="text-sm">Chúng tôi sẽ cập nhật thêm cơ hội việc làm từ công ty này</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default JobDetailSidebar;