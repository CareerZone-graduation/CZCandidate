import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Users } from 'lucide-react';
import { getAlsoLikedJobs } from '@/services/jobService';
import { formatSalary } from '@/utils/formatters';

const AlsoLikedJobs = ({ jobId }) => {
    const navigate = useNavigate();

    const { data: alsoLikedJobs, isLoading } = useQuery({
        queryKey: ['alsoLikedJobs', jobId],
        queryFn: () => getAlsoLikedJobs(jobId, { limit: 6 }),
        enabled: !!jobId,
        select: (data) => data?.data || [],
        staleTime: 5 * 60 * 1000, // Cache 5 minutes
    });

    // Don't render if no results and not loading
    if (!isLoading && (!alsoLikedJobs || alsoLikedJobs.length === 0)) {
        return null;
    }

    return (
        <Card className="border-0 shadow-sm mt-6">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Người khác cũng quan tâm
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-3 border rounded-lg">
                                <div className="flex gap-3">
                                    <Skeleton className="w-10 h-10 rounded" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {alsoLikedJobs.map((job) => (
                            <div
                                key={job._id}
                                className="p-3 border rounded-lg hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer"
                                onClick={() => navigate(`/jobs/${job._id}`)}
                            >
                                <div className="flex gap-3 mb-2">
                                    <Avatar className="w-10 h-10 border">
                                        <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                                        <AvatarFallback className="text-xs">
                                            {job.company?.name?.charAt(0) || 'C'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm text-foreground truncate">
                                            {job.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {job.company?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Badge variant="secondary" className="text-xs px-2 py-0 w-fit">
                                        {formatSalary(job.minSalary, job.maxSalary)}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {job.location?.province}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AlsoLikedJobs;
