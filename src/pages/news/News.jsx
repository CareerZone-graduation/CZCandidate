import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Calendar,
  Clock,
  Eye,
  User,
  TrendingUp,
  Newspaper,
  Star,
  BookOpen,
  GraduationCap,
  Award,
  Target,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Calculator,
  CheckCircle,
  ArrowRight,
  Sparkles,
  DollarSign,
  LogIn
} from 'lucide-react';
import { cn } from '../../lib/utils';

const News = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // States
  const [news, setNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [careerGuides, setCareerGuides] = useState([]);
  const [featuredGuides, setFeaturedGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'news');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Tin tức nghề nghiệp - Bài báo thực tế với URL chính xác
  const mockNews = [
    {
      id: 1,
      title: 'Xu hướng tuyển dụng và thị trường lao động Việt Nam 2024',
      excerpt: 'Báo cáo chi tiết về xu hướng tuyển dụng, các ngành nghề có nhu cầu cao và dự báo thị trường lao động năm 2024...',
      coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
      category: 'Thị trường',
      categorySlug: 'technology',
      url: 'https://www.topcv.vn/bao-cao-thi-truong-tuyen-dung',
      author: { name: 'TopCV', avatar: '', role: 'Nền tảng tuyển dụng' },
      publishedAt: '2024-12-20T10:00:00Z',
      readTime: '8 phút đọc',
      views: 45200,
      isFeatured: true,
      tags: ['Thị trường lao động', 'Tuyển dụng', '2024']
    },
    {
      id: 2,
      title: 'Cách viết CV xin việc chuẩn - Hướng dẫn chi tiết từ A-Z',
      excerpt: 'Hướng dẫn từng bước viết CV xin việc chuyên nghiệp, thu hút nhà tuyển dụng với các mẫu CV đẹp...',
      coverImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
      category: 'Nghề nghiệp',
      categorySlug: 'career',
      url: 'https://www.topcv.vn/cach-viet-cv-xin-viec',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-18T14:30:00Z',
      readTime: '10 phút đọc',
      views: 128500,
      isFeatured: true,
      tags: ['CV', 'Xin việc', 'Hướng dẫn']
    },
    {
      id: 3,
      title: 'Khảo sát lương IT Việt Nam 2024 - Báo cáo chi tiết',
      excerpt: 'Báo cáo khảo sát lương ngành IT với hơn 2000 người tham gia, phân tích theo vị trí, kinh nghiệm và công ty...',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      category: 'Lương thưởng',
      categorySlug: 'salary',
      url: 'https://itviec.com/blog/khao-sat-luong-it/',
      author: { name: 'ITviec', avatar: '', role: 'IT Jobs Platform' },
      publishedAt: '2024-12-15T09:15:00Z',
      readTime: '12 phút đọc',
      views: 85000,
      isFeatured: false,
      tags: ['IT', 'Lương', 'Khảo sát']
    },
    {
      id: 4,
      title: 'Bí quyết phỏng vấn xin việc thành công - 20 câu hỏi thường gặp',
      excerpt: 'Tổng hợp 20 câu hỏi phỏng vấn phổ biến nhất và cách trả lời ấn tượng để chinh phục nhà tuyển dụng...',
      coverImage: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
      category: 'Nghề nghiệp',
      categorySlug: 'career',
      url: 'https://www.topcv.vn/cau-hoi-phong-van',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-10T16:20:00Z',
      readTime: '15 phút đọc',
      views: 92100,
      isFeatured: false,
      tags: ['Phỏng vấn', 'Kỹ năng', 'Xin việc']
    },
    {
      id: 5,
      title: 'Top 10 ngành nghề hot nhất 2024 - Cơ hội việc làm',
      excerpt: 'Điểm danh 10 ngành nghề có nhu cầu tuyển dụng cao nhất năm 2024: IT, Marketing, Logistics, Y tế...',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      category: 'Thị trường',
      categorySlug: 'technology',
      url: 'https://www.topcv.vn/nganh-nghe-hot',
      author: { name: 'TopCV', avatar: '', role: 'Career Platform' },
      publishedAt: '2024-12-08T11:00:00Z',
      readTime: '8 phút đọc',
      views: 68000,
      isFeatured: true,
      tags: ['Xu hướng', 'Tuyển dụng', 'Ngành nghề']
    },
    {
      id: 6,
      title: 'Cách đàm phán lương khi nhận offer - Bí quyết tăng lương',
      excerpt: 'Hướng dẫn chi tiết kỹ năng đàm phán lương hiệu quả, cách trả lời câu hỏi về mức lương mong muốn...',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      category: 'Lương thưởng',
      categorySlug: 'salary',
      url: 'https://www.topcv.vn/cach-dam-phan-luong',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-05T09:30:00Z',
      readTime: '7 phút đọc',
      views: 55600,
      isFeatured: false,
      tags: ['Đàm phán', 'Lương', 'Offer']
    },
    {
      id: 7,
      title: 'Làm việc từ xa (Remote) - Xu hướng và cơ hội 2024',
      excerpt: 'Tìm hiểu về xu hướng làm việc từ xa, các công việc remote phổ biến và cách tìm việc làm online...',
      coverImage: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=400',
      category: 'Thị trường',
      categorySlug: 'technology',
      url: 'https://www.topcv.vn/viec-lam-remote',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-01T14:00:00Z',
      readTime: '6 phút đọc',
      views: 39800,
      isFeatured: false,
      tags: ['Remote Work', 'Việc làm online', 'Xu hướng']
    },
    {
      id: 8,
      title: '10 lỗi sai khi viết CV khiến bạn mất cơ hội việc làm',
      excerpt: 'Những sai lầm phổ biến nhất khi viết CV và cách khắc phục để tăng cơ hội được gọi phỏng vấn...',
      coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      category: 'Nghề nghiệp',
      categorySlug: 'career',
      url: 'https://www.topcv.vn/loi-sai-khi-viet-cv',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-11-28T10:15:00Z',
      readTime: '6 phút đọc',
      views: 72300,
      isFeatured: false,
      tags: ['CV', 'Sai lầm', 'Hướng dẫn']
    }
  ];

  // Kiến thức chuyên ngành - Bài báo thực tế với URL chính xác
  const mockCareerGuides = [
    {
      id: 1,
      title: 'Nhân viên kinh doanh là gì? Mô tả công việc chi tiết',
      excerpt: 'Tìm hiểu nghề nhân viên kinh doanh: công việc hàng ngày, kỹ năng cần có, mức lương và cơ hội thăng tiến...',
      coverImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      category: 'Bán hàng',
      categorySlug: 'sales',
      difficulty: 'Cơ bản',
      url: 'https://www.topcv.vn/nhan-vien-kinh-doanh-la-gi',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-20T10:00:00Z',
      readTime: '8 phút đọc',
      views: 58500,
      isFeatured: true,
      tags: ['Kinh doanh', 'Sales', 'Nghề nghiệp'],
      rating: 4.8
    },
    {
      id: 2,
      title: 'Digital Marketing là gì? Tổng quan ngành Marketing số',
      excerpt: 'Khám phá Digital Marketing: các kênh marketing online, vị trí công việc và lộ trình phát triển sự nghiệp...',
      coverImage: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400',
      category: 'Marketing',
      categorySlug: 'telesales',
      difficulty: 'Trung bình',
      url: 'https://www.topcv.vn/digital-marketing-la-gi',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-18T14:30:00Z',
      readTime: '10 phút đọc',
      views: 75600,
      isFeatured: true,
      tags: ['Digital Marketing', 'Marketing', 'Nghề nghiệp'],
      rating: 4.7
    },
    {
      id: 3,
      title: 'Lập trình viên (Developer) là gì? Hướng dẫn nghề nghiệp',
      excerpt: 'Tổng quan về nghề lập trình viên: các ngôn ngữ lập trình, mức lương và lộ trình từ Junior đến Senior...',
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
      category: 'Công nghệ',
      categorySlug: 'management',
      difficulty: 'Nâng cao',
      url: 'https://itviec.com/blog/lap-trinh-vien-la-gi/',
      author: { name: 'ITviec', avatar: '', role: 'IT Career Expert' },
      publishedAt: '2024-12-15T09:15:00Z',
      readTime: '12 phút đọc',
      views: 92000,
      isFeatured: false,
      tags: ['IT', 'Lập trình', 'Developer'],
      rating: 4.9
    },
    {
      id: 4,
      title: 'Logistics là gì? Tìm hiểu ngành Logistics và chuỗi cung ứng',
      excerpt: 'Khám phá ngành Logistics: các vị trí việc làm, kỹ năng cần thiết và triển vọng nghề nghiệp tại Việt Nam...',
      coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
      category: 'Logistics',
      categorySlug: 'logistics',
      difficulty: 'Trung bình',
      url: 'https://www.topcv.vn/logistics-la-gi',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-12T16:20:00Z',
      readTime: '9 phút đọc',
      views: 49800,
      isFeatured: false,
      tags: ['Logistics', 'Supply Chain', 'Vận chuyển'],
      rating: 4.6
    },
    {
      id: 5,
      title: 'Kế toán là gì? Hướng dẫn nghề kế toán từ A-Z',
      excerpt: 'Tất cả về nghề kế toán: công việc, chứng chỉ cần có, mức lương và lộ trình phát triển sự nghiệp...',
      coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      category: 'Tài chính',
      categorySlug: 'language',
      difficulty: 'Trung bình',
      url: 'https://www.topcv.vn/ke-toan-la-gi',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-10T11:00:00Z',
      readTime: '11 phút đọc',
      views: 81200,
      isFeatured: true,
      tags: ['Kế toán', 'Tài chính', 'Nghề nghiệp'],
      rating: 4.8
    },
    {
      id: 6,
      title: 'Data Analyst là gì? Lộ trình trở thành chuyên gia phân tích dữ liệu',
      excerpt: 'Hướng dẫn chi tiết về nghề Data Analyst: công cụ cần học, kỹ năng và mức lương tại Việt Nam...',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      category: 'Công nghệ',
      categorySlug: 'management',
      difficulty: 'Nâng cao',
      url: 'https://itviec.com/blog/data-analyst-la-gi/',
      author: { name: 'ITviec', avatar: '', role: 'IT Career Expert' },
      publishedAt: '2024-12-08T09:00:00Z',
      readTime: '15 phút đọc',
      views: 65600,
      isFeatured: true,
      tags: ['Data Analyst', 'Data Science', 'Phân tích dữ liệu'],
      rating: 4.9
    },
    {
      id: 7,
      title: 'Nhân sự (HR) là gì? Tổng quan về ngành nhân sự',
      excerpt: 'Tìm hiểu ngành nhân sự: các vị trí từ HR Admin đến HR Manager, kỹ năng và cơ hội nghề nghiệp...',
      coverImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400',
      category: 'Nhân sự',
      categorySlug: 'sales',
      difficulty: 'Cơ bản',
      url: 'https://www.topcv.vn/nhan-su-la-gi',
      author: { name: 'TopCV', avatar: '', role: 'Career Expert' },
      publishedAt: '2024-12-05T14:30:00Z',
      readTime: '10 phút đọc',
      views: 52400,
      isFeatured: false,
      tags: ['HR', 'Nhân sự', 'Tuyển dụng'],
      rating: 4.7
    },
    {
      id: 8,
      title: 'Tester là gì? Hướng dẫn nghề kiểm thử phần mềm',
      excerpt: 'Tổng quan về nghề Tester/QA: công việc, kỹ năng cần có, mức lương và lộ trình phát triển...',
      coverImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      category: 'Công nghệ',
      categorySlug: 'management',
      difficulty: 'Trung bình',
      url: 'https://itviec.com/blog/tester-la-gi/',
      author: { name: 'ITviec', avatar: '', role: 'IT Career Expert' },
      publishedAt: '2024-12-01T10:00:00Z',
      readTime: '12 phút đọc',
      views: 48900,
      isFeatured: false,
      tags: ['Tester', 'QA', 'Kiểm thử phần mềm'],
      rating: 4.8
    }
  ];

  // Categories cho cả News và Career Guides
  const newsCategories = [
    { id: 'all', name: 'Tất cả', count: 8, color: 'bg-green-600' },
    { id: 'technology', name: 'Thị trường', count: 3, color: 'bg-blue-500' },
    { id: 'career', name: 'Nghề nghiệp', count: 3, color: 'bg-green-500' },
    { id: 'salary', name: 'Lương thưởng', count: 2, color: 'bg-purple-500' },
    { id: 'interview', name: 'Phỏng vấn', count: 1, color: 'bg-orange-500' }
  ];

  const guideCategories = [
    { id: 'all', name: 'Tất cả', count: 8, color: 'bg-green-600', icon: BookOpen },
    { id: 'sales', name: 'Bán hàng & HR', count: 2, color: 'bg-blue-500', icon: TrendingUp },
    { id: 'telesales', name: 'Marketing', count: 1, color: 'bg-purple-500', icon: Users },
    { id: 'management', name: 'Công nghệ', count: 3, color: 'bg-orange-500', icon: Target },
    { id: 'logistics', name: 'Logistics', count: 1, color: 'bg-green-500', icon: Briefcase },
    { id: 'language', name: 'Tài chính', count: 1, color: 'bg-pink-500', icon: GraduationCap }
  ];

  const difficultyColors = {
    'Cơ bản': 'bg-green-100 text-green-700 border-green-200',
    'Trung bình': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Nâng cao': 'bg-red-100 text-red-700 border-red-200'
  };

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return formatDate(dateString);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        className={cn(
          "h-3 w-3",
          index < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  // Effects
  useEffect(() => {
    fetchContent();
    setCategories(activeTab === 'news' ? newsCategories : guideCategories);
  }, [selectedCategory, searchTerm, currentPage, activeTab]);

  const fetchContent = async () => {
    setIsLoading(true);
    
  // Simulate API call
    const isNewsTab = activeTab === 'news';
    const sourceData = isNewsTab ? mockNews : mockCareerGuides;
    let filteredData = sourceData;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filteredData = filteredData.filter(item => item.categorySlug === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (isNewsTab) {
      setNews(filteredData);
      setFeaturedNews(filteredData.filter(item => item.isFeatured));
    } else {
      setCareerGuides(filteredData);
      setFeaturedGuides(filteredData.filter(item => item.isFeatured));
    }
    
    setTotalPages(Math.ceil(filteredData.length / 6));
    setIsLoading(false);

  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleReadArticle = (article) => {
    // Nếu có URL bên ngoài, mở trong tab mới
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: navigate đến trang chi tiết nội bộ
      const route = activeTab === 'news' ? `/news/${article.id}` : `/career-guide/${article.id}`;
      navigate(route);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            
            {/* Tabs Skeleton */}
            <div className="flex justify-center">
              <Skeleton className="h-12 w-80" />
            </div>
            
            {/* Search Skeleton */}
            <Skeleton className="h-12 w-full max-w-md mx-auto" />
            
            {/* Categories Skeleton */}
            <div className="flex flex-wrap justify-center gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24" />
              ))}
            </div>
            
            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isNewsTab = activeTab === 'news';
  const currentData = isNewsTab ? news : careerGuides;
  const currentFeatured = isNewsTab ? featuredNews : featuredGuides;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={cn(
                "p-3 rounded-full",
                isNewsTab ? "bg-green-600/10" : "bg-emerald-500/10"
              )}>
                {isNewsTab ? (
                  <Newspaper className="h-8 w-8 text-green-600" />
                ) : (
                  <GraduationCap className="h-8 w-8 text-emerald-600" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-black">
                {isNewsTab ? 'Tin tức nghề nghiệp' : 'Kiến thức chuyên ngành'}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isNewsTab 
                ? 'Cập nhật những tin tức mới nhất về thị trường việc làm, xu hướng tuyển dụng và các mẹo phát triển sự nghiệp của bạn.'
                : 'Khám phá các hướng dẫn chuyên sâu về nghề nghiệp, kỹ năng và kiến thức cần thiết để phát triển sự nghiệp của bạn trong mọi lĩnh vực.'
              }
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="bg-muted/50 p-1 rounded-lg">
              <Button
                variant={isNewsTab ? "default" : "ghost"}
                onClick={() => handleTabChange('news')}
                className={cn(
                  "px-6 py-2 rounded-md transition-all duration-300",
                  isNewsTab && "bg-green-600 text-white shadow-md"
                )}
              >
                <Newspaper className="h-4 w-4 mr-2" />
                Tin tức
              </Button>
              <Button
                variant={!isNewsTab ? "default" : "ghost"}
                onClick={() => handleTabChange('career-guide')}
                className={cn(
                  "px-6 py-2 rounded-md transition-all duration-300",
                  !isNewsTab && "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                )}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Kiến thức chuyên ngành
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder={isNewsTab ? "Tìm kiếm tin tức..." : "Tìm kiếm hướng dẫn..."}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={cn(
                  "pl-10 h-12 bg-white/80",
                  isNewsTab 
                    ? "border-green-600/20 focus:border-green-600" 
                    : "border-emerald-200 focus:border-emerald-500"
                )}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "rounded-full h-10 px-6 transition-all duration-300",
                    selectedCategory === category.id 
                      ? `${category.color} text-white hover:opacity-90` 
                      : isNewsTab
                        ? "bg-white/80 border-green-600/20 hover:bg-green-600/10"
                        : "bg-white/80 border-emerald-200 hover:bg-emerald-50"
                  )}
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                  {category.name}
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-current">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Featured Content */}
          {currentFeatured.length > 0 && selectedCategory === 'all' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                {isNewsTab ? (
                  <Star className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Award className="h-5 w-5 text-yellow-500" />
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {isNewsTab ? 'Tin nổi bật' : 'Hướng dẫn nổi bật'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentFeatured.slice(0, 2).map((item) => (
                  <Card 
                    key={item.id}
                    className={cn(
                      "group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                      !isNewsTab && "border-emerald-200"
                    )}
                    onClick={() => handleReadArticle(item)}
                  >
                    <div className="relative">
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-white">
                          {isNewsTab ? (
                            <>
                              <Star className="h-3 w-3 mr-1" />
                              Nổi bật
                            </>
                          ) : (
                            <>
                              <Award className="h-3 w-3 mr-1" />
                              Nổi bật
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 space-y-2">
                        <Badge variant="secondary" className="bg-white/90 text-foreground block">
                          {item.category}
                        </Badge>
                        {!isNewsTab && item.difficulty && (
                          <Badge className={cn("block", difficultyColors[item.difficulty])}>
                            {item.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className={cn(
                        "text-xl font-bold text-foreground mb-3 transition-colors line-clamp-2",
                        isNewsTab ? "group-hover:text-green-600" : "group-hover:text-emerald-600"
                      )}>
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {item.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={item.author.avatar} alt={item.author.name} />
                            <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{item.author.name}</p>
                            <p className="text-muted-foreground">{item.author.role}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>{timeAgo(item.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.readTime}</span>
                          </div>
                          {!isNewsTab && item.rating && (
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                              <span className="ml-1">{item.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isNewsTab ? (
                  <BookOpen className="h-5 w-5 text-green-600" />
                ) : (
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedCategory === 'all' 
                    ? (isNewsTab ? 'Tất cả tin tức' : 'Tất cả hướng dẫn')
                    : `${isNewsTab ? 'Tin tức' : 'Hướng dẫn'} ${categories.find(c => c.id === selectedCategory)?.name}`
                  }
                </h2>
              </div>
              
              {currentData.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Tìm thấy {currentData.length} {isNewsTab ? 'bài viết' : 'hướng dẫn'}
                </div>
              )}
            </div>

            {currentData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentData.map((item) => (
                  <Card 
                    key={item.id}
                    className={cn(
                      "group overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                      !isNewsTab && "border-emerald-200"
                    )}
                    onClick={() => handleReadArticle(item)}
                  >
                    <div className="relative">
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 space-y-2">
                        <Badge variant="secondary" className="bg-white/90 text-foreground block">
                          {item.category}
                        </Badge>
                        {!isNewsTab && item.difficulty && (
                          <Badge className={cn("block", difficultyColors[item.difficulty])}>
                            {item.difficulty}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className={cn(
                        "text-lg font-bold text-foreground mb-2 transition-colors line-clamp-2",
                        isNewsTab ? "group-hover:text-green-600" : "group-hover:text-emerald-600"
                      )}>
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {item.excerpt}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={item.author.avatar} alt={item.author.name} />
                            <AvatarFallback className="text-xs">{item.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{item.author.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{timeAgo(item.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{item.readTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{item.views}</span>
                            </div>
                          </div>
                        </div>
                        
                        {!isNewsTab && item.rating && (
                          <div className="flex items-center gap-1">
                            {renderStars(item.rating)}
                            <span className="text-xs text-muted-foreground ml-1">{item.rating}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isNewsTab ? (
                    <Newspaper className="h-12 w-12 text-muted-foreground/50" />
                  ) : (
                    <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {isNewsTab ? 'Không tìm thấy tin tức' : 'Không tìm thấy hướng dẫn'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isNewsTab 
                    ? 'Không có bài viết nào phù hợp với tiêu chí tìm kiếm của bạn.'
                    : 'Không có hướng dẫn nào phù hợp với tiêu chí tìm kiếm của bạn.'
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSearchParams({ tab: activeTab });
                  }}
                  className={cn(
                    isNewsTab 
                      ? "border-green-600/20 hover:bg-green-600/10"
                      : "border-emerald-200 hover:bg-emerald-50"
                  )}
                >
                  {isNewsTab ? 'Xem tất cả tin tức' : 'Xem tất cả hướng dẫn'}
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={cn(
                  isNewsTab 
                    ? "border-green-600/20 hover:bg-green-600/10"
                    : "border-emerald-200 hover:bg-emerald-50"
                )}
              >
                Trước
              </Button>
              
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10",
                      currentPage === i + 1 
                        ? (isNewsTab ? "bg-green-600 hover:bg-green-600/90" : "bg-emerald-500 hover:bg-emerald-600")
                        : (isNewsTab ? "border-green-600/20 hover:bg-green-600/10" : "border-emerald-200 hover:bg-emerald-50")
                    )}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={cn(
                  isNewsTab 
                    ? "border-green-600/20 hover:bg-green-600/10"
                    : "border-emerald-200 hover:bg-emerald-50"
                )}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>

{/* Newsletter Subscription */}
<section className="py-16 bg-linear-to-br from-emerald-500 to-green-600 relative overflow-hidden">
  <div className="absolute inset-0 bg-black/10"></div>
  <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
        <BookOpen className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Nhận thông báo bài viết mới
      </h2>
      <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
        Đăng ký để nhận những bài viết chất lượng cao về phát triển sự nghiệp 
        và kiến thức chuyên ngành được gửi thẳng đến email của bạn.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Nhập email của bạn..."
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 h-12"
        />
        <Button 
          size="lg" 
          className="bg-white text-emerald-600 hover:bg-white/90 font-semibold h-12 px-8"
        >
          Đăng ký ngay
        </Button>
      </div>
      
      <p className="text-sm text-white/80 mt-4">
        💡 Hoàn toàn miễn phí • 📧 Không spam • 🔒 Bảo mật thông tin
      </p>
    </div>
  </div>
</section>

<div className="container mx-auto px-4">
  <div className="max-w-6xl mx-auto space-y-8">
    {/* Popular Tags */}
    <section className="py-16 bg-background">
  <div className="max-w-6xl mx-auto px-4">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        <span className="text-emerald-600">Chủ đề</span> phổ biến
      </h2>
      <p className="text-lg text-muted-foreground">
        Khám phá các chủ đề được quan tâm nhất trong cộng đồng
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[
        { name: 'Phát triển sự nghiệp', count: 156, icon: TrendingUp, color: 'bg-blue-500' },
        { name: 'Kỹ năng mềm', count: 134, icon: Users, color: 'bg-purple-500' },
        { name: 'Phỏng vấn', count: 98, icon: Award, color: 'bg-orange-500' },
        { name: 'Lương bổng', count: 87, icon: DollarSign, color: 'bg-green-500' },
        { name: 'Work-life balance', count: 76, icon: Target, color: 'bg-pink-500' },
        { name: 'Chuyển đổi nghề nghiệp', count: 65, icon: Briefcase, color: 'bg-indigo-500' },
        { name: 'Khởi nghiệp', count: 54, icon: Sparkles, color: 'bg-yellow-500' },
        { name: 'Công nghệ mới', count: 43, icon: GraduationCap, color: 'bg-red-500' }
      ].map((tag, index) => (
        <Card 
          key={index}
          className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background border-0 shadow-md"
          onClick={() => handleSearch(tag.name)}
        >
          <CardContent className="p-6 text-center">
            <div className={`w-12 h-12 ${tag.color}/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <tag.icon className={`h-6 w-6 ${tag.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-emerald-600 transition-colors">
              {tag.name}
            </h3>
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-100">
              {tag.count} bài viết
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Popular Tags Cloud */}
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-6 text-foreground">Tags phổ biến khác</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          'React', 'JavaScript', 'UI/UX Design', 'Data Science', 'Product Management',
          'Agile', 'Scrum', 'Digital Marketing', 'SEO', 'Content Writing',
          'Leadership', 'Team Management', 'Remote Work', 'Freelancing', 'Networking'
        ].map((tag, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="cursor-pointer hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 px-4 py-2 text-sm"
            onClick={() => handleSearch(tag)}
          >
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  </div>
</section>

{/* Career Resources */}
<section className="py-16 bg-linear-to-br from-emerald-50/50 to-blue-50/50">
  <div className="max-w-6xl mx-auto px-4">
    <div className="text-center mb-12">
      <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-emerald-600 border-emerald-300 bg-background mb-4">
        🎯 Tài nguyên nghề nghiệp
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        Công cụ <span className="text-emerald-600">hỗ trợ</span> sự nghiệp
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Khám phá các công cụ và tài nguyên miễn phí giúp bạn phát triển sự nghiệp hiệu quả
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        {
          icon: FileText,
          title: 'Mẫu CV chuyên nghiệp',
          description: 'Hơn 50 mẫu CV đẹp, hiện đại cho mọi ngành nghề',
          features: ['Dễ chỉnh sửa', 'Định dạng ATS-friendly', 'Hoàn toàn miễn phí'],
          buttonText: 'Tạo CV ngay',
          color: 'bg-blue-500',
          url: '/my-cvs/builder',
          isInternal: true,
          requiresAuth: true
        },
        {
          icon: MessageSquare,
          title: 'Câu hỏi phỏng vấn',
          description: 'Bộ sưu tập 500+ câu hỏi phỏng vấn phổ biến nhất',
          features: ['Có đáp án gợi ý', 'Phân loại theo ngành', 'Cập nhật thường xuyên'],
          buttonText: 'Xem ngay',
          color: 'bg-purple-500',
          url: '/tools/interview-questions',
          isInternal: true
        },
        {
          icon: Calculator,
          title: 'Tính lương thực lãnh',
          description: 'Công cụ tính toán lương gross/net chính xác',
          features: ['Áp dụng luật mới nhất', 'Tính bảo hiểm', 'Xuất báo cáo'],
          buttonText: 'Sử dụng ngay',
          color: 'bg-green-500',
          url: '/tools/salary-calculator',
          isInternal: true
        },
        {
          icon: Target,
          title: 'Định hướng nghề nghiệp',
          description: 'Bài test tính cách MBTI và định hướng nghề nghiệp',
          features: ['Dựa trên khoa học', 'Kết quả chi tiết', '16 nhóm tính cách'],
          buttonText: 'Làm bài test',
          color: 'bg-orange-500',
          url: '/tools/mbti-test',
          isInternal: true
        },
        {
          icon: BookOpen,
          title: 'Khóa học miễn phí',
          description: 'Học kỹ năng mới với các khóa học chất lượng cao',
          features: ['Video HD', 'Có chứng chỉ', 'Học theo lộ trình'],
          buttonText: 'Khám phá',
          color: 'bg-pink-500',
          url: 'https://www.topcv.vn/khoa-hoc'
        },
        {
          icon: Users,
          title: 'Cộng đồng nghề nghiệp',
          description: 'Kết nối và chia sẻ kinh nghiệm với cộng đồng',
          features: ['10K+ thành viên', 'Thảo luận sôi nổi', 'Sự kiện định kỳ'],
          buttonText: 'Tham gia',
          color: 'bg-indigo-500',
          url: 'https://www.facebook.com/groups/topcv.community'
        }
      ].map((resource, index) => (
        <Card
          key={index}
          className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-lg overflow-hidden cursor-pointer"
          onClick={() => {
            // Kiểm tra nếu cần đăng nhập
            if (resource.requiresAuth && !isAuthenticated) {
              toast.info('Vui lòng đăng nhập để sử dụng tính năng này', {
                description: 'Bạn cần đăng nhập để tạo CV chuyên nghiệp',
                action: {
                  label: 'Đăng nhập',
                  onClick: () => navigate('/login')
                }
              });
              return;
            }
            if (resource.isInternal) {
              navigate(resource.url);
            } else {
              window.open(resource.url, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          <CardContent className="p-6">
            <div className={`w-16 h-16 ${resource.color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <resource.icon className={`h-8 w-8 ${resource.color.replace('bg-', 'text-')}`} />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors">
              {resource.title}
            </h3>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {resource.description}
            </p>
            
            <ul className="space-y-2 mb-6">
              {resource.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Button className="w-full bg-linear-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold">
              {resource.buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>

{/* Statistics Section */}
<section className="py-16 bg-background">
  <div className="max-w-6xl mx-auto px-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { icon: BookOpen, value: '500+', label: 'Bài viết chuyên sâu', color: 'text-blue-600' },
        { icon: Users, value: '50K+', label: 'Người đọc hàng tháng', color: 'text-purple-600' },
        { icon: Award, value: '95%', label: 'Độ hài lòng của người dùng', color: 'text-green-600' },
        { icon: TrendingUp, value: '10M+', label: 'Lượt xem tổng cộng', color: 'text-orange-600' }
      ].map((stat, index) => (
        <div key={index} className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-emerald-100 to-green-100 rounded-full mb-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
          <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
          <div className="text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* Call to Action */}
<section className="py-20 bg-linear-to-br from-emerald-600 via-green-600 to-blue-600 relative overflow-hidden">
  <div className="absolute inset-0 bg-black/20"></div>
  <div className="absolute inset-0 bg-linear-to-r from-emerald-600/20 to-transparent"></div>
  
  <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
      <Sparkles className="h-10 w-10 text-white" />
    </div>
    
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
      Sẵn sàng để <span className="text-yellow-300">thành công</span>?
    </h2>
    
    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
      Bắt đầu hành trình phát triển sự nghiệp của bạn ngay hôm nay. 
      Tìm việc làm phù hợp và xây dựng tương lai mơ ước.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        size="lg" 
        className="bg-white text-emerald-600 hover:bg-white/90 font-semibold px-8 py-4 text-lg"
        onClick={() => navigate('/jobs')}
      >
        <Search className="mr-2 h-5 w-5" />
        Tìm việc làm ngay
      </Button>
      
      <Button 
        size="lg" 
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg backdrop-blur-sm"
        onClick={() => navigate('/profile')}
      >
        <User className="mr-2 h-5 w-5" />
        Tạo hồ sơ
      </Button>
    </div>
    
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/80">
      <div className="flex items-center justify-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-300" />
        <span>Hoàn toàn miễn phí</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-300" />
        <span>Cập nhật liên tục</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-300" />
        <span>Hỗ trợ 24/7</span>
      </div>
    </div>
  </div>
</section>
        </div>
      </div>
    </div>
    
  );
};

export default News;
