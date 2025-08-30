import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Building, 
  Calendar,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  Globe,
  Phone,
  Mail,
  Briefcase
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
        if (!response.ok) {
          throw new Error('Không thể tải thông tin công việc');
        }
        const result = await response.json();
        
        if (result.success) {
          setJob(result.data);
        } else {
          throw new Error(result.message || 'Có lỗi xảy ra');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  // Format functions
  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary}-${maxSalary} USD`;
    }
    if (minSalary) return `Từ ${minSalary} USD`;
    if (maxSalary) return `Đến ${maxSalary} USD`;
  };

  const formatWorkType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'FREELANCE': 'Freelance',
      'HYBRID': 'Hybrid',
      'REMOTE': 'Remote',
      'ONSITE': 'Tại văn phòng'
    };
    return typeMap[type] || type;
  };

  const formatExperience = (level) => {
    const levelMap = {
      'INTERN': 'Thực tập sinh',
      'ENTRY_LEVEL': 'Mới tốt nghiệp',
      'JUNIOR_LEVEL': 'Junior (1-2 năm)',
      'MID_LEVEL': 'Mid-level (2-5 năm)',
      'SENIOR_LEVEL': 'Senior (5+ năm)',
      'LEAD_LEVEL': 'Team Lead',
      'MANAGER_LEVEL': 'Manager'
    };
    return levelMap[level] || level;
  };

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsApplying(true);
      // TODO: Call API to apply for job
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/dashboard', { 
        state: { 
          message: 'Ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.' 
        }
      });
    } catch (err) {
      console.error('Lỗi khi ứng tuyển:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Call API to save/unsave job
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Xem công việc tuyệt vời này tại ${job?.company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
                <Button onClick={() => navigate(-1)} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy công việc</h3>
                <p className="text-gray-600 mb-4">Công việc bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
                <Button onClick={() => navigate('/jobs')} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Về danh sách việc làm
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>

          {/* Job Header */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4 text-emerald-100">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {job.company?.name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location.province}
                      {job.location.ward && `, ${job.location.ward}`}
                    </div>
                  </div>
                </div>
                <Avatar className="w-16 h-16 border-2 border-white">
                  <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                  <AvatarFallback className="bg-white text-emerald-600 text-lg font-semibold">
                    {job.company?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                  <span className="font-semibold">{formatSalary(job.minSalary, job.maxSalary)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span>{formatWorkType(job.type)}</span>
                  {job.workType && job.workType !== job.type && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{formatWorkType(job.workType)}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  <span>{formatExperience(job.experience)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                  <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleApply}
                    disabled={isApplying}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                  >
                    {isApplying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang ứng tuyển...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ứng tuyển ngay
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSave}
                    className={isSaved ? "bg-yellow-50 border-yellow-300 text-yellow-700" : ""}
                  >
                    <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Đã lưu" : "Lưu việc làm"}
                  </Button>
                </div>

                <Button variant="ghost" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Mô tả công việc</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Yêu cầu ứng viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Quyền lợi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.benefits}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin công ty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={job.company?.logo} alt={job.company?.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600">
                        {job.company?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{job.company?.name}</h3>
                      <p className="text-sm text-gray-600">Công ty công nghệ</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{job.address || `${job.location.province}, ${job.location.ward}`}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin tuyển dụng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cấp bậc:</span>
                    <span className="font-medium">{formatExperience(job.experience)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hình thức:</span>
                    <span className="font-medium">{formatWorkType(job.type)}</span>
                  </div>
                  {job.workType && job.workType !== job.type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Làm việc:</span>
                      <span className="font-medium">{formatWorkType(job.workType)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;