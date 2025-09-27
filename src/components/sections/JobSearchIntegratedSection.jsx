import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search, Building, MapPin, DollarSign, Clock, Users, TrendingUp, Star,
  Heart, ChevronRight, Sparkles, Briefcase, Building2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAllJobs } from '../../services/jobService';
import { saveJob, unsaveJob } from '../../services/jobService';
import { formatSalary, formatTimeAgo } from '../../utils/formatters';

const JobSearchSection = () => {
  const navigate = useNavigate();
  
  // State for featured jobs
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter options
  const locations = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Biên Hòa', 'Nha Trang', 'Huế', 'Buôn Ma Thuột', 'Vũng Tàu'
  ];

  const categories = [
    'Công nghệ thông tin', 'Marketing', 'Kinh doanh', 'Tài chính - Ngân hàng',
    'Nhân sự', 'Kế toán', 'Thiết kế', 'Giáo dục', 'Y tế', 'Xây dựng'
  ];

  // Fetch featured jobs
  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setIsLoading(true);
        const response = await getAllJobs({ 
          page: 1, 
          limit: 6,
          featured: true 
        });
        setFeaturedJobs(response.data || []);
      } catch (err) {
        console.error('Error fetching featured jobs:', err);
        setError('Không thể tải danh sách việc làm nổi bật');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  // Handle search
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('query', searchTerm);
    if (selectedLocation) params.set('province', selectedLocation);
    if (selectedCategory) params.set('category', selectedCategory);

    navigate(`/jobs/search?${params.toString()}`);
  };

  // Handle save/unsave job
  const handleSaveJob = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await unsaveJob(jobId);
        toast.success('Đã bỏ lưu công việc');
      } else {
        await saveJob(jobId);
        toast.success('Đã lưu công việc');
      }
      
      // Update the job in state
      setFeaturedJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, isSaved: !isSaved } : job
        )
      );
    } catch (err) {
      console.error('Error saving job:', err);
      toast.error('Có lỗi xảy ra khi lưu công việc');
    }
  };

  // Removed local format functions - now using utils/formatters.js

  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Tìm kiếm công việc
            <br />
            <span className="text-primary">định hình tương lai của bạn</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Khám phá cơ hội nghề nghiệp tuyệt vời từ các công ty hàng đầu và bắt đầu hành trình sự nghiệp của bạn ngay hôm nay
          </p>
        </div>

        {/* Search Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm công việc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 border-border focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12 border-border">
                    <SelectValue placeholder="Địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả địa điểm</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 border-border">
                    <SelectValue placeholder="Lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả lĩnh vực</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleSearch}
                  className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Tìm kiếm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Jobs */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Việc làm nổi bật</h3>
              <p className="text-muted-foreground">Những cơ hội nghề nghiệp tốt nhất dành cho bạn</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/jobs/search')}
              className="hidden sm:flex items-center gap-2"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Có lỗi xảy ra</h3>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:shadow-primary/10"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={job.company?.logo} 
                            alt={job.company?.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {job.company?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {job.company?.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-red-50 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveJob(job.id, job.isSaved);
                        }}
                      >
                        <Heart 
                          className={`h-5 w-5 ${job.isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                    </div>

                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {job.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(job.createdAt)}
                      </div>
                      {job.applicants && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.applicants} ứng viên
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}`);
                      }}
                    >
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View All Button for Mobile */}
        <div className="text-center sm:hidden">
          <Button
            onClick={() => navigate('/jobs/search')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Xem tất cả việc làm
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JobSearchSection;