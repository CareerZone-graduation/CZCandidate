import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
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
  ArrowLeft,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { getSavedJobs, unsaveJob } from '../../services/jobService';
import { toast } from 'sonner';

const SavedJobs = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // States
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [deletingJobs, setDeletingJobs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const limit = 5; // Hiển thị 5 jobs per page theo layout dọc

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSavedJobs();
  }, [isAuthenticated, navigate, currentPage, sortBy]);

  /**
   * Fetch saved jobs
   */
  const fetchSavedJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy
      };
      
      const response = await getSavedJobs(params);
      
      if (response?.success) {
        const jobs = response.data || [];
        const meta = response.meta || {};
        
        setSavedJobs(jobs);
        setTotalPages(meta.totalPages || Math.ceil((meta.totalItems || 0) / limit));
        setTotalItems(meta.totalItems || 0);
      } else {
        throw new Error(response?.message || 'Không thể tải danh sách công việc đã lưu');
      }
      
    } catch (err) {
      console.error('Lỗi khi tải việc làm đã lưu:', err);
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
    
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1) + ' triệu';
      }
      return new Intl.NumberFormat('vi-VN').format(num);
    };
    
    if (minSalary && maxSalary) {
      return `${formatNumber(minSalary)} - ${formatNumber(maxSalary)} VNĐ`;
    }
    if (minSalary) return `Từ ${formatNumber(minSalary)} VNĐ`;
    if (maxSalary) return `Đến ${formatNumber(maxSalary)} VNĐ`;
  };

  /**
   * Handle sort change
   */
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi sắp xếp
  };

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
      if (savedJobs.length === 1 && currentPage > 1) {
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

  // Loading skeleton - 5 items vertical
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-6 w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-card rounded-lg p-6 shadow-sm border">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-muted rounded mb-2 w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="w-24 h-8 bg-muted rounded"></div>
                    </div>
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Không thể tải danh sách việc làm đã lưu
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  {errorMessage}
                </p>
                <Button 
                  onClick={handleRetry}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/jobs')}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Việc làm đã lưu
                </h1>
                <p className="text-muted-foreground mt-1">
                  Quản lý danh sách việc làm yêu thích của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Bookmark className="h-5 w-5" />
              <span className="font-semibold">{totalItems} việc làm</span>
            </div>
          </div>

          {/* Sort */}
          <Card className="mb-8 shadow-sm border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Danh sách công việc đã lưu</h2>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-48 h-10">
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt:desc">Mới nhất</SelectItem>
                      <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
                      <SelectItem value="deadline:asc">Hạn nộp gần nhất</SelectItem>
                      <SelectItem value="deadline:desc">Hạn nộp xa nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Hiển thị <strong className="text-primary">{savedJobs.length}</strong> kết quả trên trang <strong>{currentPage}</strong>
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Trang {currentPage} / {totalPages}</span>
            </div>
          </div>

          {/* Job List - Vertical Layout */}
          {savedJobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  <Bookmark className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Chưa có việc làm nào được lưu
                </h3>
                <p className="text-muted-foreground mb-4">
                  Hãy bắt đầu lưu những công việc bạn quan tâm
                </p>
                <Button 
                  onClick={() => navigate('/jobs')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Khám phá việc làm
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Vertical Job List */}
              <div className="space-y-4 mb-8">
                {savedJobs.map((job, index) => {
                  const isDeleting = deletingJobs.has(job._id);
                  
                  return (
                    <Card 
                      key={job._id} 
                      className="hover:shadow-md transition-all duration-300 cursor-pointer group border-l-4 border-l-primary"
                      onClick={() => handleViewJob(job.jobId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Company Logo */}
                          <Avatar className="h-16 w-16 flex-shrink-0">
                            <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                              {job.company?.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Job Info */}
                          <div className="flex-1 min-w-0">
                            {/* Job Title */}
                            <h3 className="font-bold text-foreground mb-2 text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {job.title}
                            </h3>

                            {/* Company Name */}
                            <div className="flex items-center mb-3">
                              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground font-medium">
                                {job.company?.name}
                              </span>
                            </div>

                            {/* Job Details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {/* Salary */}
                              <div className="flex items-center text-primary">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="font-semibold">
                                  {formatSalary(job.minSalary, job.maxSalary)}
                                </span>
                              </div>

                              {/* Deadline */}
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatDeadline(job.deadline)}</span>
                              </div>

                              {/* Saved Date */}
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Lưu ngày {new Date(job.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {/* Saved Badge */}
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              <Heart className="h-3 w-3 mr-1 fill-current" />
                              Đã lưu
                            </Badge>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleRemoveJob(job._id, job.jobId, e)}
                              disabled={isDeleting}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              {isDeleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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