import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  Search, Building, MapPin, DollarSign, Clock, Users, TrendingUp, Star,
  Heart, ChevronLeft, ChevronRight, X, Sparkles, AlertCircle, Filter,
  Briefcase, Building2, BarChart, Eye, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getAllJobs } from '../../services/jobService';
import { saveJob, unsaveJob } from '../../services/jobService';
import { ApplyJobDialog } from './components/ApplyJobDialog';

const JobList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // State for main job list
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State for featured jobs
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);

  // State for Apply Job Dialog
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob] = useState(null);


  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedSalary, setSelectedSalary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filter options
  const locations = [
    { value: 'all', label: 'Tất cả địa điểm', icon: '📍' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Hải Phòng', label: 'Hải Phòng' },
    { value: 'Cần Thơ', label: 'Cần Thơ' },
    { value: 'Khác', label: 'Khác' }
  ];

  const experiences = [
    { value: 'all', label: 'Tất cả kinh nghiệm', icon: '💼' },
    { value: 'Không yêu cầu', label: 'Không yêu cầu kinh nghiệm' },
    { value: 'Dưới 1 năm', label: 'Dưới 1 năm' },
    { value: '1-2 năm', label: '1-2 năm' },
    { value: '2-5 năm', label: '2-5 năm' },
    { value: '5-10 năm', label: '5-10 năm' },
    { value: 'Trên 10 năm', label: 'Trên 10 năm' }
  ];

  const salaryRanges = [
    { value: 'all', label: 'Tất cả mức lương', icon: '💰' },
    { value: 'Dưới 10', label: 'Dưới 10 triệu' },
    { value: '10-15', label: '10-15 triệu' },
    { value: '15-20', label: '15-20 triệu' },
    { value: '20-30', label: '20-30 triệu' },
    { value: '30-50', label: '30-50 triệu' },
    { value: '50+', label: 'Trên 50 triệu' },
    { value: 'Thỏa thuận', label: 'Thỏa thuận' }
  ];

  const jobCategories = [
    { value: 'all', label: 'Tất cả ngành nghề', icon: Briefcase },
    { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin', icon: Briefcase },
    { value: 'Marketing', label: 'Marketing - PR', icon: BarChart },
    { value: 'Kinh doanh', label: 'Kinh doanh - Bán hàng', icon: Building2 },
    { value: 'Tài chính', label: 'Tài chính - Kế toán', icon: DollarSign },
    { value: 'Thiết kế', label: 'Thiết kế - Sáng tạo', icon: Sparkles },
    { value: 'Khác', label: 'Khác', icon: Building }
  ];

  // Top Categories Data  
  const topCategories = [
    {
      id: 1,
      name: 'Công nghệ thông tin',
      jobCount: '8.245 việc làm',
      icon: '💻',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      id: 2,
      name: 'Kinh doanh - Bán hàng',
      jobCount: '6.832 việc làm',
      icon: '💼',
      bgColor: 'bg-success/10',
      textColor: 'text-success'
    },
    {
      id: 3,
      name: 'Marketing - PR',
      jobCount: '3.456 việc làm',
      icon: '📊',
      bgColor: 'bg-info/10',
      textColor: 'text-info'
    },
    {
      id: 4,
      name: 'Thiết kế - Sáng tạo',
      jobCount: '2.189 việc làm',
      icon: '🎨',
      bgColor: 'bg-warning/10',
      textColor: 'text-warning'
    },
    {
      id: 5,
      name: 'Nhân sự - Tuyển dụng',
      jobCount: '1.874 việc làm',
      icon: '👥',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary'
    },
    {
      id: 6,
      name: 'Tài chính - Kế toán',
      jobCount: '5.303 việc làm',
      icon: '🏦',
      bgColor: 'bg-success/10',
      textColor: 'text-success'
    }
  ];

  // Top Companies Data
  const topCompanies = [
    {
      id: 1,
      name: 'MISA',
      logo: 'https://cdn-new.topcv.vn/unsafe/300x/https://static.topcv.vn/company_logos/YVVFSY05ZUhqjlVHtBl2kOD1a189WFj0_1652947920____d78c5dd2ab820dcbb9a367b40e712067.jpg',
      isTop: true,
      employees: '5,000+ nhân viên',
      jobs: '45 việc làm'
    },
    {
      id: 2,
      name: 'Concentrix',
      logo: 'https://cdn-new.topcv.vn/unsafe/300x/https://static.topcv.vn/company_logos/q9bYqtXdPBInb3ZdqSrW5WA3OFgk1Tzc_1732778674____8ed9b945bd229d402e816cce9aa9c046.png',
      isTop: true,
      employees: '3,000+ nhân viên', 
      jobs: '28 việc làm'
    },
    {
      id: 3,
      name: 'SPX Express',
      logo: 'https://cdn-new.topcv.vn/unsafe/300x/https://static.topcv.vn/company_logos/6830417b01e641747992955.png',
      isTop: false,
      employees: '2,500+ nhân viên',
      jobs: '22 việc làm'
    }
  ];

  // Helper functions
  const hasActiveFilters = useMemo(() => {
    return searchTerm || 
           (selectedLocation && selectedLocation !== 'all') || 
           (selectedExperience && selectedExperience !== 'all') || 
           (selectedSalary && selectedSalary !== 'all') || 
           (selectedCategory && selectedCategory !== 'all');
  }, [searchTerm, selectedLocation, selectedExperience, selectedSalary, selectedCategory]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLocation('all');
    setSelectedExperience('all');
    setSelectedSalary('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCompanyClick = (companyName) => {
    setSearchTerm(companyName);
    setCurrentPage(1);
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format functions
  const formatLocation = (location) => {
    if (!location) return 'Chưa xác định';
    if (typeof location === 'string') return location;
    // Updated to handle nested province/district objects
    if (typeof location === 'object') {
      const provinceName = location.province?.name || location.province;
      const districtName = location.district?.name || location.district;
      if (provinceName && districtName) return `${districtName}, ${provinceName}`;
      if (provinceName) return provinceName;
      if (districtName) return districtName;
    }
    return 'Chưa xác định';
  };

  const formatSalary = (job) => {
    if (job.salaryType === 'NEGOTIABLE' || (!job.minSalary && !job.maxSalary)) {
      return 'Thỏa thuận';
    }
    if (job.minSalary && job.maxSalary) {
      return `${job.minSalary} - ${job.maxSalary} triệu`;
    }
    if (job.minSalary) {
      return `Từ ${job.minSalary} triệu`;
    }
    if (job.maxSalary) {
      return `Lên đến ${job.maxSalary} triệu`;
    }
    return 'Thỏa thuận';
  };

  const formatWorkType = (type) => {
    const typeMap = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      FREELANCE: 'Tự do',
      INTERNSHIP: 'Thực tập',
    };
    return typeMap[type] || type || 'Linh hoạt';
  };

  const formatExperience = (level) => {
    const levelMap = {
      INTERN: 'Thực tập sinh',
      FRESHER: 'Mới tốt nghiệp',
      JUNIOR: 'Sơ cấp',
      MID_LEVEL: 'Trung cấp',
      SENIOR_LEVEL: 'Cao cấp',
      EXPERT: 'Chuyên gia',
      MANAGER: 'Quản lý',
      DIRECTOR: 'Giám đốc',
    };
    return levelMap[level] || level || 'Không yêu cầu';
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return `${Math.floor(diffInDays / 30)} tháng trước`;
  };

  // API Functions
  const fetchJobs = async (page = 1, reset = false) => {
    try {
      if (reset || page === 1) setIsLoading(true);
      
      const params = {
        page,
        limit: 12,
        keyword: searchTerm.trim(),
        location: selectedLocation === 'all' ? '' : selectedLocation,
        experience: selectedExperience === 'all' ? '' : selectedExperience, 
        salaryRange: selectedSalary === 'all' ? '' : selectedSalary,
        category: selectedCategory === 'all' ? '' : selectedCategory
      };

      const response = await getAllJobs(params);
      const responseData = response.data;
      
      if (responseData.success) {
        const jobsData = responseData.data?.jobs || responseData.data || [];
        const pagination = responseData.meta || responseData.data || responseData;
        
        setJobs(jobsData);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.totalItems || 0);
        setError(null);
      } else {
        throw new Error(responseData.message || 'Không thể tải danh sách việc làm');
      }
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      setError(err.response?.data?.message || err.message);
      setJobs([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedJobs = async () => {
    try {
      setIsLoadingFeatured(true);
      
      const response = await getAllJobs({
        page: 1,
        limit: 6,
        featured: true,
        sort: 'newest'
      });
      
      const responseData = response.data;
      
      if (responseData.success) {
        const jobsData = responseData.data?.jobs || responseData.data || [];
        setFeaturedJobs(jobsData);
      }
    } catch (err) {
      console.error('❌ Error fetching featured jobs:', err);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      navigate('/login');
      return;
    }

    try {
      const response = await saveJob(jobId);
      if (response.success) {
        toast.success('Đã lưu việc làm thành công!');
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, isSaved: true } : job
        ));
        setFeaturedJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, isSaved: true } : job
        ));
      }
    } catch {
      toast.error('Có lỗi xảy ra khi lưu việc làm');
    }
  };

  const handleUnsaveJob = async (jobId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để bỏ lưu việc làm');
      return;
    }

    try {
      const response = await unsaveJob(jobId);
      if (response.success) {
        toast.success('Đã bỏ lưu việc làm');
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, isSaved: false } : job
        ));
        setFeaturedJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, isSaved: false } : job
        ));
      }
    } catch {
      toast.error('Có lỗi xảy ra khi bỏ lưu việc làm');
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };


  const handleApplySuccess = () => {
    toast.success("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.");
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Effects
  useEffect(() => {
    if (!selectedLocation) setSelectedLocation('all');
    if (!selectedExperience) setSelectedExperience('all');
    if (!selectedSalary) setSelectedSalary('all');
    if (!selectedCategory) setSelectedCategory('all');
  }, []);

  useEffect(() => {
    fetchJobs(1, true);
  }, [searchTerm, selectedLocation, selectedExperience, selectedSalary, selectedCategory]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchJobs(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  // Job Card Component
  const JobCard = ({ job, onSave, onUnsave, onClick, isApplied, featured = false }) => (
    <Card
      onClick={() => onClick(job.id || job._id)}
      className={`group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-background cursor-pointer ${featured ? 'border-2 border-primary/20' : ''}`}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-primary text-white px-3 py-1 shadow-lg">
            <Star className="h-3 w-3 mr-1 fill-current" /> Nổi bật
          </Badge>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-start space-y-0 gap-4 pb-4">
        <Avatar className="h-14 w-14 rounded-xl border-2 border-primary/10">
          <AvatarImage
            src={job.company?.logo}
            alt={job.company?.name || 'Company Logo'}
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-lg font-bold rounded-xl">
            {job.company?.name?.charAt(0) || job.title?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {job.title}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            {job.company?.name || 'Công ty chưa xác định'}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              if (job.isSaved) {
                onUnsave(job.id || job._id);
              } else {
                onSave(job.id || job._id);
              }
            }}
          >
            <Heart className={`h-4 w-4 ${job.isSaved ? 'fill-current text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2 flex-grow">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{formatLocation(job.location)}</span>
          </div>
          <div className="flex items-center text-success font-semibold">
            <DollarSign className="h-4 w-4 mr-2 text-success flex-shrink-0" />
            <span className="truncate">{formatSalary(job)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-info flex-shrink-0" />
            <span className="truncate">{timeAgo(job.createdAt || job.postedAt)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{formatExperience(job.level)}</span>
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
      
      <CardFooter className="border-t pt-3 flex justify-between items-center bg-transparent">
        <Badge
          variant="secondary"
          className="px-3 py-1 font-medium"
        >
          <Briefcase className="h-3 w-3 mr-1.5" />
          {formatWorkType(job.workType)}
        </Badge>
        <div className="flex items-center gap-4">
          {isApplied && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Đã ứng tuyển
            </Badge>
          )}
          <Button
            variant="ghost"
            className="p-0 h-auto font-semibold text-primary group-hover:translate-x-1 transition-all duration-300 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick(job.id || job._id);
            }}
          >
            Chi tiết <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* 🎯 Hero Section - Similar to HomePage */}
     <section className="relative bg-gradient-to-primary min-h-[60vh] flex items-center pt-20 lg:pt-24 pb-20">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center mb-12">
           <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background/80 backdrop-blur-sm mb-6">
              🚀 Nền tảng việc làm hàng đầu tại Việt Nam
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-gradient-primary bg-clip-text text-transparent">Tìm kiếm công việc</span>
              <br />
              <span className="text-foreground">định hình tương lai của bạn</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu 
              phù hợp với kỹ năng và đam mê của bạn.
            </p>
          </div>

          {/* Search Box */}
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-md mb-16">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Vị trí, kỹ năng, từ khóa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-base border-border/50 focus:border-primary bg-background"
                  />
                </div>
                <div className="relative">
                  <Select value={selectedLocation || 'all'} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="h-14 border-border/50 focus:border-primary bg-background">
                      <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               <Button size="lg" className="h-14 w-full bg-gradient-primary hover:opacity-90 text-white transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
                  <Search className="mr-2 h-5 w-5" />
                  Tìm kiếm ngay
                </Button>
              </div>
              
              {/* Popular searches */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground mr-2">Tìm kiếm phổ biến:</span>
                {['Frontend Developer', 'Marketing', 'Data Science', 'Product Manager', 'UI/UX Designer'].map((term, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setSearchTerm(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Briefcase, value: '15,000+', label: 'Việc làm mới' },
              { icon: Building2, value: '2,500+', label: 'Công ty hàng đầu' },
              { icon: TrendingUp, value: '98%', label: 'Tỷ lệ thành công' },
            ].map((stat, index) => (
              <Card key={index} className="p-6 text-center border-0 shadow-md bg-background/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-primary rounded-xl shadow-lg">
                    <stat.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 Job Search Section - Similar to HomePage */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              <span className="text-gradient-primary bg-clip-text text-transparent">Tìm kiếm cơ hội nghề nghiệp</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Khám phá việc làm trong các lĩnh vực phổ biến hoặc tìm kiếm theo địa điểm và mức lương mong muốn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Search by Industry */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-background">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Tìm theo ngành nghề</h3>
                <p className="text-muted-foreground">
                  Khám phá cơ hội việc làm trong lĩnh vực chuyên môn của bạn
                </p>
                <div className="pt-2">
                  <Select value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngành nghề" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search by Location */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-background">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Tìm theo địa điểm</h3>
                <p className="text-muted-foreground">
                  Tìm việc làm gần nơi bạn sống hoặc nơi bạn muốn đến
                </p>
                <div className="pt-2">
                  <Select value={selectedLocation || 'all'} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search by Salary */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-background">
              <CardContent className="p-0 space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Tìm theo mức lương</h3>
                <p className="text-muted-foreground">
                  Lọc việc làm theo mức lương phù hợp với mong đợi của bạn
                </p>
                <div className="pt-2">
                  <Select value={selectedSalary || 'all'} onValueChange={setSelectedSalary}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mức lương" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Filter Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, name: 'Lập trình & IT', count: 1523 },
              { icon: Building2, name: 'Kinh doanh & Bán hàng', count: 876 },
              { icon: BarChart, name: 'Marketing & Digital', count: 654 },
              { icon: DollarSign, name: 'Tài chính & Kế toán', count: 321 },
            ].map((category, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md bg-background group"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 group-hover:bg-gradient-primary transition-all duration-300">
                      <category.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">{category.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="secondary">{category.count} việc làm</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 Featured Jobs Section - Similar to HomePage */}
      <section className="py-20 bg-card">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background mb-4">
              ⭐ Việc làm nổi bật
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              <span className="text-gradient-primary bg-clip-text text-transparent">Cơ hội nghề nghiệp</span> <span className="text-gradient-primary bg-clip-text text-transparent">hàng đầu</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Khám phá những vị trí việc làm chất lượng cao từ các công ty uy tín, 
              với mức lương hấp dẫn và môi trường làm việc chuyên nghiệp.
            </p>
          </div>

          {/* Featured Jobs Grid */}
          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
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
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredJobs.slice(0, 6).map((job) => (
                <JobCard
                  key={job.id || job._id}
                  job={job}
                  onSave={handleSaveJob}
                  onUnsave={handleUnsaveJob}
                  onClick={handleJobClick}
                  isApplied={job.isApplied}
                  featured={true}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-lg"
              onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Xem tất cả việc làm
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 🎯 Top Categories Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background mb-4">
              🏢 Khám phá lĩnh vực
            </Badge>
             <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                 Việc làm theo <span className="text-primary font-bold">danh mục</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tìm hiểu về các ngành nghề đang có nhu cầu tuyển dụng cao và khám phá cơ hội phát triển sự nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {topCategories.map((category) => (
              <Card 
                key={category.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-background border-0 overflow-hidden hover:-translate-y-1 transform"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className={`font-bold text-lg mb-3 group-hover:${category.textColor} transition-colors line-clamp-2`}>
                    {category.name}
                  </h3>
                  <p className={`${category.textColor} font-semibold text-sm mb-4`}>
                    {category.jobCount}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="group-hover:translate-x-2 transition-all duration-300 p-0 h-auto font-semibold text-primary"
                  >
                    Khám phá ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

     {selectedJob && (
       <ApplyJobDialog
         open={isApplyDialogOpen}
         onOpenChange={setIsApplyDialogOpen}
         jobId={selectedJob?._id}
         jobTitle={selectedJob?.title}
         onSuccess={handleApplySuccess}
       />
     )}
    </div>
  );
};

export default JobList;