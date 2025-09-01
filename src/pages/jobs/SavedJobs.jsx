import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building,
  Heart,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Bookmark,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { unsaveJob } from '../../services/savedJobService';
import apiClient from '../../services/apiClient';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // States
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingJobs, setDeletingJobs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const limit = 8; // 🎯 Hiển thị 8 jobs per page (4 cột x 2 hàng)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
  }, [isAuthenticated, navigate, currentPage]);

  /**
   * Fetch saved jobs - Gọi trực tiếp API backend
   */
  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching saved jobs (8 per page) with params:', {
        page: currentPage,
        limit: limit,
        sortBy: 'createdAt:desc'
      });
      
      // 🚀 Gọi trực tiếp API backend với limit = 8
      const response = await apiClient.get('/jobs/saved/list', {
        params: {
          page: currentPage,
          limit: limit,
          sortBy: 'createdAt:desc'
        }
      });
      
      console.log('📡 Direct API Response (8 items):', {
        success: response?.data?.success,
        dataLength: response?.data?.data?.length,
        meta: response?.data?.meta,
        fullResponse: response?.data
      });
      
      if (response?.data?.success) {
        const jobs = response.data.data || [];
        const meta = response.data.meta || {};
        
        console.log('✅ Setting jobs (8 per page):', {
          jobsCount: jobs.length,
          totalItems: meta.totalItems,
          totalPages: meta.totalPages,
          currentPage: meta.currentPage || currentPage
        });
        
        setSavedJobs(jobs);
        setTotalPages(meta.totalPages || Math.ceil((meta.totalItems || 0) / limit));
        setTotalItems(meta.totalItems || 0);
        
      } else {
        throw new Error(response?.data?.message || 'API trả về success: false');
      }
      
    } catch (err) {
      console.error('❌ Lỗi khi tải việc làm đã lưu:', err);
      setError(err);
      setSavedJobs([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format salary display
   */
  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary} - ${maxSalary} USD`;
    }
    if (minSalary) return `Từ ${minSalary} USD`;
    if (maxSalary) return `Đến ${maxSalary} USD`;
  };

  /**
   * Filter jobs based on search term
   */
  const filteredJobs = savedJobs.filter(job => {
    if (!searchTerm) return true;
    return job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  /**
   * Handle view job details
   */
  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  /**
   * Handle remove job from saved list
   */
  const handleRemoveJob = async (savedJobId, jobId, e) => {
    e.stopPropagation();
    
    if (deletingJobs.has(savedJobId)) return;

    try {
      setDeletingJobs(prev => new Set([...prev, savedJobId]));
      
      await unsaveJob(jobId);
      
      setSavedJobs(prev => prev.filter(job => job._id !== savedJobId));
      setTotalItems(prev => prev - 1);
      
      toast.success('Đã bỏ công việc khỏi danh sách đã lưu');
      
      // Nếu trang hiện tại không còn items và không phải trang đầu, chuyển về trang trước
      if (filteredJobs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('Lỗi khi bỏ lưu công việc:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi bỏ lưu công việc';
      toast.error(errorMessage);
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(savedJobId);
        return newSet;
      });
    }
  };

  /**
   * Handle page navigation
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    fetchSavedJobs();
  };

  /**
   * Format deadline
   */
  const formatDeadline = (deadline) => {
    if (!deadline) return 'Không xác định';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Đã hết hạn';
    if (diffDays === 0) return 'Hết hạn hôm nay';
    if (diffDays === 1) return 'Hết hạn ngày mai';
    return `Còn ${diffDays} ngày`;
  };

  // Loading skeleton - 8 items (4x2)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
              {/* 8 skeleton items in 4x2 grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải dữ liệu';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Không thể tải danh sách việc làm đã lưu
                </h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  {errorMessage}
                </p>
                <Button 
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Thử lại
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/jobs')}
                className="mr-4 p-2 hover:bg-emerald-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Việc làm đã lưu
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý danh sách việc làm yêu thích của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <Bookmark className="h-5 w-5" />
              <span className="font-semibold">{totalItems} việc làm</span>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Tìm kiếm trong việc làm đã lưu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị <strong className="text-emerald-600">{filteredJobs.length}</strong> kết quả trên trang <strong>{currentPage}</strong>
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Trang {currentPage} / {totalPages}</span>
            </div>
          </div>

          {/* Job Grid */}
          {filteredJobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <Bookmark className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {savedJobs.length === 0 ? 'Chưa có việc làm nào được lưu' : 'Không tìm thấy việc làm'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {savedJobs.length === 0 
                    ? 'Hãy bắt đầu lưu những công việc bạn quan tâm'
                    : 'Thử thay đổi từ khóa tìm kiếm'}
                </p>
                {savedJobs.length === 0 && (
                  <Button 
                    onClick={() => navigate('/jobs')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Khám phá việc làm
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 🎯 Grid layout 4 cột x 2 hàng = 8 items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 min-h-[500px]">
                {filteredJobs.map((job, index) => {
                  const isDeleting = deletingJobs.has(job._id);
                  
                  return (
                    <Card 
                      key={job._id} 
                      className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white border-l-4 border-l-emerald-500 h-fit"
                      onClick={() => handleViewJob(job.jobId)}
                    >
                      <CardContent className="p-6">
                        {/* Header với actions */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-3">
                              <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                {job.company?.name?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{job.company?.name}</p>
                              <p className="text-xs text-gray-500">#{(currentPage - 1) * limit + index + 1}</p>
                            </div>
                          </div>
                          
                          {/* Remove button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRemoveJob(job._id, job.jobId, e)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Job title */}
                        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors text-sm leading-tight">
                          {job.title}
                        </h3>

                        {/* Salary */}
                        <div className="flex items-center mb-3">
                          <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-600">
                            {formatSalary(job.minSalary, job.maxSalary)}
                          </span>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-xs">
                              {formatDeadline(job.deadline)}
                            </span>
                          </div>
                          
                          {/* Saved badge */}
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                            <Heart className="h-3 w-3 mr-1 fill-current" />
                            Đã lưu
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 h-12 border-emerald-200 bg-white/80 hover:bg-emerald-50 rounded-xl font-semibold"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Trước
                  </Button>
                  
                  <div className="flex space-x-2">
                    <span className="px-6 py-3 text-sm text-emerald-700 bg-emerald-100 border-2 border-emerald-200 rounded-xl font-bold">
                      {currentPage} / {totalPages}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 h-12 border-emerald-200 bg-white/80 hover:bg-emerald-50 rounded-xl font-semibold"
                  >
                    Sau
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;