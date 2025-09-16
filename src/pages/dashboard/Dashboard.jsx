import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight,
  Home 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getSavedJobs } from '../../services/savedJobService';

const Dashboard = () => {
  const { profile } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    appliedJobs: 12,
    savedJobs: 0, // Sẽ được cập nhật từ API
    profileViews: 156,
    suggestedJobs: 24
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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
      } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
        // Giữ nguyên giá trị mặc định nếu có lỗi
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {action.title === 'Việc làm đã lưu' && isLoadingStats ? (
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