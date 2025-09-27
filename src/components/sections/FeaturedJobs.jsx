import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, Heart } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { SectionHeader } from '../common/SectionHeader';
import { getAllJobs } from '../../services/jobService';

const FeaturedJobs = () => {
  const navigate = useNavigate();

  // State dữ liệu
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);          // số job mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getAllJobs({
          page,
          limit,
          sortBy: 'newest',
        });

        if (response.data && response.data.success) {
          setJobs(response.data.data || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
        } else {
          throw new Error(response.data?.message || 'Không thể tải danh sách việc làm');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách việc làm');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [page, limit]);

  // ====== Format dữ liệu =======
  const formatCurrency = (value) => {
    if (!value) return '';
    if (typeof value === 'object' && value.$numberDecimal) value = value.$numberDecimal;
    const num = Number(value);
    return isNaN(num) ? '' : new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatSalary = (job) => {
    if (job.salaryType === 'NEGOTIABLE' || (!job.minSalary && !job.maxSalary)) return 'Thỏa thuận';
    if (job.minSalary && job.maxSalary)
      return `${formatCurrency(job.minSalary)} - ${formatCurrency(job.maxSalary)} VND`;
    if (job.minSalary) return `Từ ${formatCurrency(job.minSalary)} VND`;
    if (job.maxSalary) return `Lên đến ${formatCurrency(job.maxSalary)} VND`;
    return 'Thỏa thuận';
  };

  const formatLocation = (location) => {
    if (!location) return 'Chưa xác định';
    if (typeof location === 'string') return location;
    const province = location.province?.name || location.province;
    const district = location.district?.name || location.district;
    if (province && district) return `${district}, ${province}`;
    return province || district || 'Chưa xác định';
  };

  const formatWorkType = (type) => {
    const map = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      FREELANCE: 'Tự do',
      INTERNSHIP: 'Thực tập',
    };
    return map[type] || type || 'Linh hoạt';
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return 'Hôm qua';
    if (diff < 7) return `${diff} ngày trước`;
    if (diff < 30) return `${Math.floor(diff / 7)} tuần trước`;
    return `${Math.floor(diff / 30)} tháng trước`;
  };

  // ====== Handler ======
  const handleJobClick = (id) => navigate(`/jobs/${id}`);
  const handleViewAll = () => navigate('/jobs');
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <section className="py-20 bg-green-50/50">
      <div className="container">
        <SectionHeader
          badgeText="⭐ Việc làm nổi bật"
          title={
            <>Cơ hội nghề nghiệp <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">hàng đầu</span></>
          }
          description="Khám phá những vị trí chất lượng từ các công ty uy tín, với mức lương hấp dẫn và môi trường chuyên nghiệp."
        />

        {error && <p className="text-red-600 text-center mb-6">{error}</p>}

        {/* Job list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="h-80 shadow-lg">
                <CardContent className="p-6 space-y-4">
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
                </CardContent>
              </Card>
            ))
          ) : (
            jobs.slice(0, 6).map((job) => (
              <Card
                key={job._id || job.id}
                className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-background cursor-pointer"
                onClick={() => handleJobClick(job._id || job.id)}
              >
                <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-4">
                  <Avatar className="h-14 w-14 rounded-xl border-2 border-green-200">
                    <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                    <AvatarFallback className="bg-linear-to-br from-green-100 to-green-200 text-green-700 text-lg font-bold rounded-xl">
                      {job.company?.name?.charAt(0) || job.title?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-green-700 transition-colors line-clamp-2">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground font-medium">
                      {job.company?.name || 'Công ty chưa xác định'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle save/unsave logic here if needed
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                      <span className="font-medium truncate">{formatLocation(job.location)}</span>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4 mr-2 text-success shrink-0" />
                      <span className="truncate">{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                      <span>{timeAgo(job.createdAt || job.postedAt)}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2 text-green-600 shrink-0" />
                      <span className="font-medium truncate">{formatWorkType(job.workType)}</span>
                    </div>
                  </div>
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
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

