import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Building } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionHeader } from '@/components/common/SectionHeader';
import { getAllJobs } from '@/services/jobService';
import { formatSalaryVND, formatWorkType, formatExperience } from '@/utils/formatters';

const FeaturedJobs = () => {
  const navigate = useNavigate();

  const {
    data: jobsResponse,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['jobs', 'featured-home'],
    queryFn: () => getAllJobs({ page: 1, limit: 6, sortBy: 'createdAt:desc' }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const jobs = Array.isArray(jobsResponse?.data?.data) ? jobsResponse.data.data : [];

  const handleViewAll = () => {
    navigate('/jobs/search');
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <SectionHeader
          badgeText="⭐ Mới nhất"
          title={
            <>
              Việc làm <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">mới nhất</span>
            </>
          }
          description="Cập nhật những cơ hội nghề nghiệp mới nhất từ các doanh nghiệp hàng đầu, giúp bạn bắt kịp xu hướng thị trường."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 shadow-md border-muted">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <Skeleton className="w-12 h-12 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : isError ? (
            <div className="col-span-full text-center py-12">
              <p className="text-destructive">Đã xảy ra lỗi: {error.message}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job._id || job.id}
                className="group relative overflow-hidden border border-muted shadow-md hover:shadow-xl bg-card cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl"
                onClick={() => handleJobClick(job._id || job.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16 flex-shrink-0 border-2 border-white shadow-sm rounded-xl text-primary font-bold">
                      <AvatarImage
                        src={job.recruiterProfileId?.company?.logo || job.company?.logo || ''}
                        alt={job.recruiterProfileId?.company?.name || job.company?.name || 'Logo'}
                        className="object-contain bg-white"
                      />
                      <AvatarFallback className="rounded-xl">
                        {(job.recruiterProfileId?.company?.name || job.company?.name || 'C')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 mb-1 text-lg group-hover:text-primary transition-colors font-bold">
                        {job.title || 'Không có tiêu đề'}
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 font-medium">
                          <Building className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.recruiterProfileId?.company?.name || job.company?.name || 'Không rõ công ty'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {job.location?.province
                              ? `${job.location.district ? job.location.district + ', ' : ''}${job.location.province}`
                              : 'Không rõ địa điểm'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                      <DollarSign className="w-3 h-3" />
                      {formatSalaryVND(job.minSalary, job.maxSalary)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                      <Clock className="w-3 h-3" />
                      {formatWorkType(job.workType)}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1 font-normal bg-secondary/50">
                      <Briefcase className="w-3 h-3" />
                      {formatExperience(job.experience)}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-3 flex justify-between items-center bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    {job.deadline ? `Hạn nộp: ${new Date(job.deadline).toLocaleDateString('vi-VN')}` : ''}
                  </div>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-bold text-primary hover:text-primary/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id || job.id);
                    }}
                  >
                    Chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Hiện chưa có việc làm mới</p>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl font-bold"
            onClick={handleViewAll}
          >
            Khám phá thêm việc làm
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;

