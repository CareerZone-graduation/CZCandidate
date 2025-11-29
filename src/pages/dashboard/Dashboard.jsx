import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Briefcase, 
  Heart, 
  FileText, 
  TrendingUp, 
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getSavedJobs } from '../../services/savedJobService';
import { getViewHistoryStats } from '../../services/viewHistoryService';
import { getProfileCompleteness } from '../../services/profileService';
import { ProfileCompletionBanner } from '../../components/profile/ProfileCompletionBanner';
import { getRecommendations } from '../../services/recommendationService';
import { useOnboardingStatus } from '../../hooks/useOnboardingStatus';
import { getMyApplications } from '../../services/jobService';
import RecentActivities from '../../components/dashboard/RecentActivities';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    appliedJobs: 0, // Sẽ được cập nhật từ API
    savedJobs: 0, // Sẽ được cập nhật từ API
    viewHistory: 0, // Lịch sử xem
    suggestedJobs: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState(null);
  const [isLoadingCompleteness, setIsLoadingCompleteness] = useState(true);
  
  // Use Redux hook for onboarding status (cached, no API call needed)
  const { needsOnboarding, profileCompleteness: onboardingProfileCompleteness } = useOnboardingStatus();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Fetch all stats in parallel
        const [savedJobsResponse, viewHistoryResponse, applicationsResponse, recommendationsResponse] = await Promise.allSettled([
          getSavedJobs({ page: 1, limit: 1 }),
          getViewHistoryStats(),
          getMyApplications({ page: 1, limit: 1 }),
          getRecommendations({ page: 1, limit: 1 })
        ]);

        // Process saved jobs
        if (savedJobsResponse.status === 'fulfilled' && savedJobsResponse.value?.data?.success !== false) {
          const meta = savedJobsResponse.value?.data?.meta || savedJobsResponse.value?.meta;
          const totalSavedJobs = meta?.totalItems || 0;
          setStats(prev => ({
            ...prev,
            savedJobs: totalSavedJobs
          }));
        }

        // Process view history
        if (viewHistoryResponse.status === 'fulfilled' && viewHistoryResponse.value?.data) {
          setStats(prev => ({
            ...prev,
            viewHistory: viewHistoryResponse.value.data.totalViews || 0
          }));
        }

        // Process applications
        if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value) {
          const meta = applicationsResponse.value.meta;
          const totalApplications = meta?.totalItems || 0;
          setStats(prev => ({
            ...prev,
            appliedJobs: totalApplications
          }));
        }

        // Process recommendations
        if (recommendationsResponse.status === 'fulfilled' && recommendationsResponse.value?.success && recommendationsResponse.value?.data) {
          const totalRecommendations = recommendationsResponse.value.data.meta?.totalItems || recommendationsResponse.value.data.jobs?.length || 0;
          setStats(prev => ({
            ...prev,
            suggestedJobs: totalRecommendations
          }));
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

  // Redirect to onboarding if needed (handled by GlobalOnboardingChecker in AppRouter)
  // No need to check here anymore, Redux already has the status

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
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-7 w-10 rounded"></div>
              ) : (
                stats.appliedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.appliedJobs > 0 ? 'Đơn đã gửi' : 'Chưa có đơn nào'}
            </p>
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
                <div className="animate-pulse bg-gray-200 h-7 w-10 rounded"></div>
              ) : (
                stats.savedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.savedJobs > 0 ? 'Việc làm quan tâm' : 'Chưa có việc làm nào'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lịch sử xem</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-7 w-10 rounded"></div>
              ) : (
                stats.viewHistory
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.viewHistory > 0 ? 'Tin đã xem' : 'Chưa xem tin nào'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gợi ý mới</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="animate-pulse bg-gray-200 h-7 w-10 rounded"></div>
              ) : (
                stats.suggestedJobs
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.suggestedJobs > 0 ? 'Việc làm phù hợp' : 'Hoàn thiện hồ sơ để nhận gợi ý'}
            </p>
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
                      {isLoadingStats ? (
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

      {/* Recent Activity */}
      <RecentActivities />
    </div>
  );
};

export default Dashboard;