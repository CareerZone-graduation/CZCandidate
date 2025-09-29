import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Star, Heart, Building, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { SectionHeader } from '../common/SectionHeader';
import { getAllJobs } from '../../services/jobService';
import { formatSalary, formatSalaryVND, formatLocation, formatWorkType, formatTimeAgo, formatExperience } from '../../utils/formatters';

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch jobs if user is authenticated

    const fetchFeaturedJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Fetching featured jobs...');

        const response = await getAllJobs({
          page: 1,
          limit: 6,
          sortBy: 'newest'
        });

        console.log('✅ Featured jobs API response:', response);

        // Check if the API response indicates success
        if (response.data && response.data.success) {
          // Extract jobs data from the response
          let jobsData = [];
          if (Array.isArray(response.data.data)) {
            jobsData = response.data.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            jobsData = response.data.data;
          } else {
            jobsData = [];
          }

          console.log('📋 Jobs data extracted:', jobsData);
          setJobs(jobsData);
        } else {
          throw new Error(response.data?.message || 'Không thể tải danh sách việc làm nổi bật');
        }
      } catch (err) {
        console.error('❌ Error fetching featured jobs:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });

        // For network errors or auth issues, show a user-friendly message
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
        } else if (err.response?.status >= 500) {
          setError('Máy chủ đang gặp sự cố. Vui lòng thử lại sau');
        } else {
          setError(err.response?.data?.message || err.message || 'Không thể tải danh sách việc làm');
        }

        // Set empty array instead of leaving it undefined
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);
// ====== Format dữ liệu =======
  // Removed local format functions - now using utils/formatters.js

  const handleViewAll = () => {
    navigate('/jobs/search');
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <section className="py-20 bg-green-50/50">
      <div className="container">
        <SectionHeader
          badgeText="⭐ Việc làm nổi bật"
          title={<>Cơ hội nghề nghiệp <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">hàng đầu</span></>}
          description="Khám phá những vị trí chất lượng từ các công ty uy tín, với mức lương hấp dẫn và môi trường chuyên nghiệp."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 shadow-lg">
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
          ) : (
            jobs.slice(0, 6).map((job) => (
              <Card
                key={job._id || job.id}
                className="group relative overflow-hidden border-0 shadow-md bg-background cursor-pointer"
                onClick={() => handleJobClick(job._id || job.id)}
              >
               <CardHeader>
  <div className="flex items-center space-x-4">
    <Avatar className="w-16 h-16">
      <AvatarImage src={job.company?.logo || ''} alt={job.company?.name || 'Logo'} />
      <AvatarFallback>{job.company?.name?.[0] || 'C'}</AvatarFallback>
    </Avatar>
    <div>
      <CardTitle>{job.title || 'Không có tiêu đề'}</CardTitle>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Building className="w-4 h-4" />
        <span>{job.company?.name || 'Không rõ công ty'}</span>
        <MapPin className="w-4 h-4" />
        <span>{
          job.location?.province 
            ? `${job.location.district ? job.location.district + ', ' : ''}${job.location.province}`
            : 'Không rõ địa điểm'
        }</span>
      </div>
    </div>
  </div>
</CardHeader>

                <CardContent className="pt-2">
                 <div className="flex flex-wrap gap-4">
  <Badge variant="secondary" className="flex items-center gap-1">
    <DollarSign className="w-3 h-3" />
    {formatSalaryVND(job.minSalary, job.maxSalary)}
  </Badge>
  <Badge variant="secondary" className="flex items-center gap-1">
    <Clock className="w-3 h-3" />
    {formatWorkType(job.workType)}
  </Badge>
  <Badge variant="secondary" className="flex items-center gap-1">
    <Briefcase className="w-3 h-3" />
    {formatExperience(job.experience)}
  </Badge>
  <Badge variant="secondary" className="flex items-center gap-1">
    <Calendar className="w-3 h-3" />
    {job.deadline ? `Hạn: ${new Date(job.deadline).toLocaleDateString('vi-VN')}` : 'N/A'}
  </Badge>
</div>
              
                </CardContent>

                <CardFooter className="border-t pt-3 flex justify-end items-center bg-transparent">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-semibold text-green-700 group-hover:translate-x-1 transition-all duration-300 hover:text-green-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id || job.id);
                    }}
                  >
                    Xem chi tiết <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
            onClick={handleViewAll}
          >
            Xem tất cả việc làm
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
