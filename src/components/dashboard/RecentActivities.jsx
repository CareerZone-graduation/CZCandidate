import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  FileText, 
  Eye, 
  Heart, 
  Clock,
  ArrowRight,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hourglass,
  Building
} from 'lucide-react';
import { getMyApplications } from '../../services/jobService';
import { getViewHistory } from '../../services/viewHistoryService';
import { getSavedJobs } from '../../services/savedJobService';

/**
 * Component hiển thị hoạt động gần đây của ứng viên
 * Bao gồm: ứng tuyển, xem việc làm, lưu việc làm
 */
const RecentActivities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data sources in parallel
        const [applicationsRes, viewHistoryRes, savedJobsRes] = await Promise.allSettled([
          getMyApplications({ page: 1, limit: 5 }),
          getViewHistory({ page: 1, limit: 5 }),
          getSavedJobs({ page: 1, limit: 5 })
        ]);

        const allActivities = [];

        // Process applications
        if (applicationsRes.status === 'fulfilled' && applicationsRes.value?.data) {
          const apps = applicationsRes.value.data;
          apps.forEach(app => {
            allActivities.push({
              id: app._id,
              type: 'application',
              title: app.jobSnapshot?.title || 'Công việc không xác định',
              company: app.jobSnapshot?.company || 'Công ty không xác định',
              status: app.status,
              timestamp: new Date(app.appliedAt),
              jobId: app.job,
              applicationId: app._id
            });
          });
        }

        // Process view history
        if (viewHistoryRes.status === 'fulfilled' && viewHistoryRes.value?.data) {
          const views = viewHistoryRes.value.data;
          views.forEach(view => {
            allActivities.push({
              id: view._id,
              type: 'view',
              title: view.job?.title || 'Công việc không xác định',
              company: view.job?.company?.name || 'Công ty không xác định',
              timestamp: new Date(view.viewedAt || view.createdAt),
              jobId: view.job?._id
            });
          });
        }

        // Process saved jobs
        if (savedJobsRes.status === 'fulfilled' && savedJobsRes.value?.data) {
          const saved = savedJobsRes.value.data;
          saved.forEach(item => {
            allActivities.push({
              id: item._id,
              type: 'saved',
              title: item.job?.title || item.title || 'Công việc không xác định',
              company: item.job?.company?.name || item.company?.name || 'Công ty không xác định',
              timestamp: new Date(item.savedAt || item.createdAt),
              jobId: item.job?._id || item._id
            });
          });
        }

        // Sort by timestamp (most recent first) and take top 10
        allActivities.sort((a, b) => b.timestamp - a.timestamp);
        setActivities(allActivities.slice(0, 10));

      } catch (err) {
        console.error('Lỗi khi lấy hoạt động gần đây:', err);
        setError('Không thể tải hoạt động gần đây');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Get status info for applications
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': {
        label: 'Đang chờ',
        icon: <Hourglass className="h-3 w-3" />,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      },
      'REVIEWING': {
        label: 'Đang xem xét',
        icon: <Eye className="h-3 w-3" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      'INTERVIEW': {
        label: 'Phỏng vấn',
        icon: <AlertCircle className="h-3 w-3" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      'ACCEPTED': {
        label: 'Đã chấp nhận',
        icon: <CheckCircle className="h-3 w-3" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      'REJECTED': {
        label: 'Đã từ chối',
        icon: <XCircle className="h-3 w-3" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  // Get activity type info
  const getActivityTypeInfo = (type) => {
    const typeMap = {
      'application': {
        label: 'Đã ứng tuyển',
        icon: <FileText className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      'view': {
        label: 'Đã xem',
        icon: <Eye className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      'saved': {
        label: 'Đã lưu',
        icon: <Heart className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      }
    };
    return typeMap[type] || typeMap['view'];
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle activity click
  const handleActivityClick = (activity) => {
    if (activity.type === 'application' && activity.applicationId) {
      navigate(`/dashboard/applications/${activity.applicationId}`);
    } else if (activity.jobId) {
      navigate(`/jobs/${activity.jobId}`);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-red-500" />
              <p className="font-medium mb-2">Không thể tải hoạt động</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">Chưa có hoạt động nào</p>
              <p className="text-sm mb-4">Bắt đầu tìm kiếm và ứng tuyển việc làm để xem hoạt động ở đây</p>
              <Link to="/jobs">
                <Button variant="outline" size="sm">
                  Tìm việc làm
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
          <Link to="/dashboard/applications">
            <Button variant="link" size="sm" className="text-primary">
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.map((activity) => {
          const activityType = getActivityTypeInfo(activity.type);
          const statusInfo = activity.status ? getStatusInfo(activity.status) : null;

          return (
            <div
              key={`${activity.type}-${activity.id}`}
              onClick={() => handleActivityClick(activity)}
              className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 cursor-pointer"
            >
              {/* Activity Type Icon */}
              <div className={`p-2 rounded-full ${activityType.bgColor} flex-shrink-0`}>
                <span className={activityType.color}>{activityType.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Building className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{activity.company}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                    {statusInfo && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0 ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}`}
                      >
                        <span className="mr-0.5">{statusInfo.icon}</span>
                        {statusInfo.label}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Activity type label */}
                <div className="mt-1.5">
                  <span className={`text-xs font-medium ${activityType.color}`}>
                    {activityType.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
