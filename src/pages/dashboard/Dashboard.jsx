import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    appliedJobs: 12,
    savedJobs: 8,
    profileViews: 156,
    suggestedJobs: 24
  });

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
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng trở lại, {user?.fullname || user?.username}! 👋
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
            <div className="text-2xl font-bold">{stats.savedJobs}</div>
            <p className="text-xs text-muted-foreground">+1 hôm qua</p>
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
        <h2 className="text-xl font-semibold mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`${action.color} p-3 rounded-lg text-white`}>
                    {action.icon}
                  </div>
                  <Badge variant="secondary">{action.count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {action.description}
                </p>
                <Button asChild className="w-full">
                  <Link to={action.href}>
                    Xem chi tiết
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;