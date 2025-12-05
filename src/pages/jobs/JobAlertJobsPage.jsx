import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building,
  Calendar,
  Bell,
  ChevronLeft,
  Search,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getJobsByIds } from '@/services/jobService';
import { formatSalaryVND, formatWorkType, formatExperience } from '@/utils/formatters';
import { format } from 'date-fns';

const JobAlertJobsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get params from URL query (passed from notification)
  const keyword = searchParams.get('keyword') || '';
  const jobIdsParam = searchParams.get('jobIds') || '';
  const jobIds = jobIdsParam ? jobIdsParam.split(',').filter(Boolean) : [];

  const { data: jobs = [], isLoading, isError, error } = useQuery({
    queryKey: ['jobAlertJobs', jobIds],
    queryFn: () => getJobsByIds(jobIds),
    enabled: jobIds.length > 0,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const displayKeyword = keyword || 'tìm kiếm của bạn';

  if (jobIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={handleGoBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Không có việc làm</AlertTitle>
            <AlertDescription>
              Không tìm thấy danh sách việc làm trong thông báo này.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="container">
            <Skeleton className="h-10 w-32 bg-white/20 mb-4" />
            <Skeleton className="h-10 w-96 bg-white/20 mb-2" />
            <Skeleton className="h-6 w-64 bg-white/20" />
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(Math.min(jobIds.length, 6))].map((_, i) => (
              <Card key={i} className="h-72">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={handleGoBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error?.response?.data?.message || 'Không thể tải danh sách việc làm. Vui lòng thử lại sau.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 mb-4"
            onClick={handleGoBack}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <Bell className="h-8 w-8" />
                Việc làm mới cho "{displayKeyword}"
              </h1>
              <p className="text-lg text-white/90">
                {jobs.length > 0
                  ? `${jobs.length} việc làm phù hợp với từ khóa của bạn`
                  : 'Không có việc làm nào trong thông báo này'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Jobs info */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-2">Không có việc làm nào</p>
            <p className="text-muted-foreground mb-4">
              Các việc làm trong thông báo này có thể đã hết hạn hoặc không còn tồn tại
            </p>
            <Button onClick={() => navigate('/jobs/search')}>
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm việc làm mới
            </Button>
          </div>
        ) : (
          <>
            {/* Quick info */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Search className="w-4 h-4" />
                  Từ khóa: <span className="font-medium text-foreground">"{displayKeyword}"</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Số lượng: <span className="font-medium text-foreground">{jobs.length} việc làm</span>
                </span>
              </div>
            </div>

            {/* Jobs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card
                  key={job._id}
                  className="group relative overflow-hidden border shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                  onClick={() => handleJobClick(job._id)}
                >
                  {/* Status indicator */}
                  {job.status === 'EXPIRED' && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="destructive">Đã hết hạn</Badge>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-14 h-14 flex-shrink-0 rounded-xl">
                        <AvatarImage
                          src={job.company?.logo || ''}
                          alt={job.company?.name || 'Logo'}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
                          {(job.company?.name || 'C')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 mb-1 text-base group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {job.company?.name || 'Không rõ công ty'}
                            </span>
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {job.location.district}, {job.location.province}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {(job.minSalary || job.maxSalary) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatSalaryVND(job.minSalary, job.maxSalary)}
                        </Badge>
                      )}
                      {job.workType && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatWorkType(job.workType)}
                        </Badge>
                      )}
                      {job.experience && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {formatExperience(job.experience)}
                        </Badge>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t pt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {job.deadline ? (
                        <>Hạn: {format(new Date(job.deadline), 'dd/MM/yyyy')}</>
                      ) : (
                        'Không có hạn nộp'
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Explore more */}
        {jobs.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Muốn tìm thêm việc làm tương tự?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate(`/jobs/search?query=${encodeURIComponent(displayKeyword)}`)}
            >
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm thêm "{displayKeyword}"
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAlertJobsPage;
