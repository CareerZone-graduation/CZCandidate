import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building,
  Calendar,
  Bookmark,
  Trash2
} from 'lucide-react';
import { getSavedJobs, unsaveJob } from '../../services/savedJobService';
import { toast } from 'sonner';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [savedJobs, setSavedJobs] = useState([]); // Đảm bảo luôn là array
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingJobs, setDeletingJobs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
  }, [isAuthenticated, navigate, currentPage]);

  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getSavedJobs({
        page: currentPage,
        limit: limit,
        sortBy: 'createdAt:desc'
      });
      
      console.log('API Response:', response); // Debug log
      
      // Kiểm tra response structure và xử lý đúng cách
      if (response.data.success) {
        // Đảm bảo data luôn là array từ response.data.data (theo cấu trúc API)
        const jobsData = Array.isArray(response.data.data) ? response.data.data : [];
        setSavedJobs(jobsData);
        setTotalPages(response.data.meta?.totalPages || 1);
        setTotalItems(response.data.meta?.totalItems || 0);
      } else {
        throw new Error(response.data.message || 'Không thể lấy danh sách việc làm đã lưu');
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách việc làm đã lưu:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      setSavedJobs([]); // Set về array rỗng khi có lỗi
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary}-${maxSalary} USD`;
    }
    if (minSalary) return `Từ ${minSalary} USD`;
    if (maxSalary) return `Đến ${maxSalary} USD`;
  };

  // Đảm bảo savedJobs là array trước khi filter
  const filteredJobs = Array.isArray(savedJobs) 
    ? savedJobs.filter(job => {
        if (!searchTerm) return true;
        return job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleRemoveJob = async (savedJobId, jobId, e) => {
    e.stopPropagation();
    
    if (deletingJobs.has(savedJobId)) return;

    try {
      setDeletingJobs(prev => new Set([...prev, savedJobId]));
      
      await unsaveJob(jobId);
      
      setSavedJobs(prev => Array.isArray(prev) ? prev.filter(job => job._id !== savedJobId) : []);
      setTotalItems(prev => prev - 1);
      
      toast.success('Đã bỏ công việc khỏi danh sách đã lưu');
      
      // Nếu trang hiện tại không còn items và không phải trang đầu, chuyển về trang trước
      if (filteredJobs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error('Lỗi khi bỏ công việc đã lưu:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(savedJobId);
        return newSet;
      });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchSavedJobs} size="lg">
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Việc làm đã lưu
            </h1>
            <p className="text-gray-600">
              Bạn đã lưu {totalItems} công việc
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
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
              Hiển thị {filteredJobs.length} kết quả
            </p>
            <p className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredJobs.map((job) => {
                  const isDeleting = deletingJobs.has(job._id);
                  
                  return (
                    <Card 
                      key={job._id} 
                      className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                      onClick={() => handleViewJob(job.jobId)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-600">
                                {job.company?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                {job.title || 'Tiêu đề không có'}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {job.company?.name || 'Công ty không rõ'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            <span className="font-medium text-green-600">
                              {formatSalary(job.minSalary, job.maxSalary)}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                            <span>Hạn: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không rõ'}</span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Bookmark className="h-3 w-3 mr-1 fill-current" />
                              Đã lưu
                            </Badge>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button 
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewJob(job.jobId);
                              }}
                            >
                              Xem chi tiết
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={(e) => handleRemoveJob(job._id, job.jobId, e)}
                              disabled={isDeleting}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {isDeleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Bỏ lưu
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  
                  <div className="flex space-x-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = index + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = index + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + index;
                      } else {
                        pageNumber = currentPage - 2 + index;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNumber)}
                          className="w-10"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
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