import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Briefcase, 
  Heart, 
  FileText, 
  TrendingUp, 
  Users, 
  Eye,
  Clock,
  ArrowRight,
  Home,
  AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getSavedJobs } from '../../services/savedJobService';
import { getViewHistoryStats } from '../../services/viewHistoryService';
import { getProfileCompleteness } from '../../services/profileService';
import { ProfileCompletionBanner } from '../../components/profile/ProfileCompletionBanner';
import { getOnboardingStatus } from '../../services/onboardingService';
import { getRecommendations } from '../../services/recommendationService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    appliedJobs: 12,
    savedJobs: 0, // Sẽ được cập nhật từ API
    viewHistory: 0, // Lịch sử xem
    profileViews: 156,
    suggestedJobs: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState(null);
  const [isLoadingCompleteness, setIsLoadingCompleteness] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        // Lấy số lượng công việc đã lưu từ API
        const savedJobsResponse = await getSavedJobs({ page: 1, limit: 1 });
        
        if (savedJobsResponse.data.success) {
          const meta = savedJobsResponse.data.meta;
          const totalSavedJobs = meta.totalItems || 0; // Lấy từ meta.totalItems
          
          setStats(prev => ({
            ...prev,
            savedJobs: totalSavedJobs
          }));
        }

        // Lấy thống kê lịch sử xem
        try {
          const viewHistoryResponse = await getViewHistoryStats();
          if (viewHistoryResponse.data) {
            setStats(prev => ({
              ...prev,
              viewHistory: viewHistoryResponse.data.totalViews || 0
            }));
          }
        } catch (err) {
          console.error('Lỗi khi lấy thống kê lịch sử xem:', err);
          // Không quan trọng nếu API này fail
        }
      } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
        // Giữ nguyên giá trị mặc định nếu có lỗi
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchProfileCompleteness = async () => {
      try {
        setIsLoadingCompleteness(true);
        const response = await getProfileCompleteness(false);
        if (response.success && response.data) {
          setProfileCompleteness(response.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin độ hoàn thiện hồ sơ:', err);
        // Không hiển thị banner nếu có lỗi
      } finally {
        setIsLoadingCompleteness(false);
      }
    };

    fetchProfileCompleteness();
  }, []);

  // Check onboarding status on dashboard load
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        setIsLoadingOnboarding(true);
        const response = await getOnboardingStatus();
        if (response.success && response.data) {
          setOnboardingStatus(response.data);
          
          // ✅ FIX: Check needsOnboarding field
          const needsOnboarding = response.data.needsOnboarding;
          
          // If onboarding is not completed, redirect to onboarding page
          if (needsOnboarding) {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (err) {
        console.error('Lỗi khi lấy trạng thái onboarding:', err);
        // Don't block dashboard if onboarding check fails
      } finally {
        setIsLoadingOnboarding(false);
      }
    };

    fetchOnboardingStatus();
  }, [navigate]);

  // Fetch recommended jobs based on profile completeness
  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only fetch if profile completeness is >= 60%
      if (!profileCompleteness || profileCompleteness.percentage < 60) {
        setIsLoadingRecommendations(false);
        return;
      }

      try {
        setIsLoadingRecommendations(true);
        const response = await getRecommendations({ page: 1, limit: 6 });
        if (response.success && response.data) {
          setRecommendedJobs(response.data.jobs || []);
          setStats(prev => ({
            ...prev,
            suggestedJobs: response.data.meta?.totalItems || response.data.jobs?.length || 0
          }));
        }
      } catch (err) {
        console.error('Lỗi khi lấy gợi ý việc làm:', err);
        // Don't show error, just keep empty recommendations
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    if (!isLoadingCompleteness) {
      fetchRecommendations();
    }
  }, [profileCompleteness, isLoadingCompleteness]);

  const quickActions = [
    {
      title: 'Gợi ý việc làm',
      description: 'Khám phá những cơ hội phù hợp với bạn',
      href: '/dashboard/job-suggestions',
      icon: <Briefcase className="h-6 w-6" />,
      color: 'bg-blue-500',
      count: stats.suggestedJobs
    },
    {
      title: 'Việc làm đã lưu',
      description: 'Xem lại những vị trí bạn quan tâm',
      href: '/dashboard/saved-jobs',
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-red-500',
      count: stats.savedJobs
    },
    {
      title: 'Lịch sử xem',
      description: 'Tin tuyển dụng bạn đã xem gần đây',
      href: '/dashboard/view-history',
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-purple-500',
      count: stats.viewHistory
    },
    {
      title: 'Đơn ứng tuyển',
      description: 'Theo dõi trạng thái ứng tuyển',
      href: '/dashboard/applications',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-green-500',
      count: stats.appliedJobs
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng trở lại, {profile?.fullname}! 👋
        </h1>
        <p className="text-primary-foreground/90">
          Hãy khám phá những cơ hội nghề nghiệp mới dành cho bạn
        </p>
      </div>

      {/* Profile Completion Banner */}
      {!isLoadingCompleteness && profileCompleteness && profileCompleteness.percentage < 100 && (
        <ProfileCompletionBanner 
          profileCompleteness={profileCompleteness} 
          profile={profile}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn ứng tuyển</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appliedJobs}</div>
            <p className="text-xs text-muted-foreground">+2 trong tuần này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Việc làm đã lưu</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
              ) : (
                stats.savedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.savedJobs > 0 ? 'Cập nhật từ API' : 'Chưa có việc làm nào'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem hồ sơ</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profileViews}</div>
            <p className="text-xs text-muted-foreground">+12% so với tháng trước</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gợi ý mới</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suggestedJobs}</div>
            <p className="text-xs text-muted-foreground">Cập nhật hôm nay</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50">
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {(action.title === 'Việc làm đã lưu' || action.title === 'Lịch sử xem') && isLoadingStats ? (
                        <div className="animate-pulse bg-gray-200 h-6 w-6 rounded"></div>
                      ) : (
                        action.count
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Jobs Section */}
      {profileCompleteness && profileCompleteness.percentage >= 60 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Việc làm được gợi ý cho bạn</h2>
            {recommendedJobs.length > 0 && (
              <Link to="/dashboard/job-suggestions">
                <Button variant="link" className="text-primary">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
          
          {isLoadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recommendedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedJobs.slice(0, 6).map((job) => (
                <Link key={job._id} to={`/jobs/${job._id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{job.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{job.company?.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <span>📍 {job.location?.province || job.location?.city}</span>
                      </div>
                      <div className="text-primary font-semibold">
                        {job.minSalary && job.maxSalary 
                          ? `${job.minSalary} - ${job.maxSalary} triệu`
                          : 'Thỏa thuận'}
                      </div>
                      {job.matchReason && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Phù hợp:</span> {job.matchReason}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">Chưa có gợi ý việc làm</p>
                    <p className="text-sm">Hệ thống đang tìm kiếm những công việc phù hợp với bạn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Low Profile Completeness Warning */}
      {profileCompleteness && profileCompleteness.percentage < 60 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Hoàn thiện hồ sơ để nhận gợi ý việc làm
                </h3>
                <p className="text-sm text-orange-800 mb-4">
                  Hồ sơ của bạn đang ở mức {profileCompleteness.percentage}%. 
                  Hoàn thiện tối thiểu 60% để nhận được gợi ý việc làm phù hợp.
                </p>
                <Link to="/profile">
                  <Button variant="default" size="sm">
                    Hoàn thiện hồ sơ ngay
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Hoạt động gần đây</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có hoạt động nào gần đây</p>
                <p className="text-sm">Bắt đầu tìm kiếm việc làm để xem hoạt động ở đây</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;