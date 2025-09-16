import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { getJobAlerts } from '@/services/jobNotificationService';
import { Bell, Briefcase, Clock, ExternalLink, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    _id: '1',
    name: 'Frontend Developer (ReactJS)',
    keyword: 'ReactJS',
    location: { province: 'Hồ Chí Minh' },
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Backend Developer (NodeJS)',
    keyword: 'NodeJS',
    location: { province: 'Hà Nội' },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
    {
    _id: '3',
    name: 'Fullstack Developer (PHP)',
    keyword: 'PHP',
    location: { province: 'Đà Nẵng' },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
];

const NotificationList = () => {
  const navigate = useNavigate();
  const [readNotifications, setReadNotifications] = useState(new Set());

  // Mock data usage
  const isLoading = false;
  const isError = false;
  const error = null;
  const notifications = mockNotifications;
  const refetch = () => {};

  // const { data: notifications, isLoading, isError, error, refetch } = useQuery({
  //   queryKey: ['notifications'],
  //   queryFn: getJobAlerts,
  // });

  const handleNotificationClick = (notification) => {
    setReadNotifications(prev => new Set(prev.add(notification._id)));
    
    const searchParams = new URLSearchParams();
    if (notification.keyword) searchParams.set('keyword', notification.keyword);
    if (notification.location?.province) searchParams.set('location', notification.location.province);
    
    navigate(`/jobs?${searchParams.toString()}`);
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={refetch} message={error.message} />;
  }

  if (!notifications || notifications.length === 0) {
    return <EmptyState message="Bạn không có thông báo nào." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Thông báo của bạn</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard/settings/job-alerts')}>
            Quản lý đăng ký
          </Button>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                !readNotifications.has(notification._id) && 'bg-emerald-50/50 border-emerald-200'
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "font-semibold text-lg",
                        !readNotifications.has(notification._id) ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.name || `Thông báo việc làm: ${notification.keyword}`}
                      </p>
                      <span className="text-sm text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      Có các công việc mới phù hợp với tiêu chí của bạn.
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {notification.keyword && <Badge variant="secondary">{notification.keyword}</Badge>}
                        {notification.location?.province && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {notification.location.province}</div>}
                    </div>
                  </div>
                   {!readNotifications.has(notification._id) && (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full self-center"></div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;