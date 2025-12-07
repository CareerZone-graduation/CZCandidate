import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/redux/notificationSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BellRing, CheckCheck, BellPlus, BellOff } from 'lucide-react';
import useFirebaseMessaging from '@/hooks/useFirebaseMessaging';
import NotificationPermissionGuide from '@/components/common/NotificationPermissionGuide';
import NotificationPermissionAlert from '@/components/common/NotificationPermissionAlert';

import { useNavigate } from 'react-router-dom';

const getNotificationLink = (notification) => {
  const { type, entity, metadata } = notification;

  switch (type) {
    case 'application':
      return `/dashboard/applications/${entity?.id || metadata?.applicationId}`;
    case 'interview':
      return '/interviews';
    case 'recommendation':
      return '/jobs/recommended';
    case 'profile_view':
      return '/profile';
    case 'job_alert':
      // Navigate to job alert jobs page with jobIds from metadata
      if (metadata?.jobIds && metadata.jobIds.length > 0) {
        // Get keyword from notification title for display
        const keywordMatch = notification.title?.match(/"([^"]+)"/);
        const keyword = keywordMatch ? keywordMatch[1] : '';
        const jobIdsParam = metadata.jobIds.join(',');
        return `/jobs/alert?jobIds=${jobIdsParam}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
      }
      // Fallback to job subscription settings if no job ids
      return `/dashboard/settings/job-alerts`;
    case 'support_request':
      return `/support/${entity?.id || metadata?.supportRequestId}`;
    default:
      return null;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.isRead && "bg-green-50"
      )}
      onClick={handleClick}
    >
      <div className="shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          !notification.isRead ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <BellRing size={20} />
        </div>
      </div>
      <div className="grow">
        <p className="font-semibold">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0 self-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
        </div>
      )}
    </div>
  );
};

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const dispatch = useDispatch();
  const { notifications, pagination, loading, error } = useSelector((state) => state.notifications);
  const {
    requestPermission,
    permissionDenied,
    isPushEnabled,
    disableNotifications,
    isLoading: isPushLoading
  } = useFirebaseMessaging({
    onPermissionDenied: () => {
      setShowPermissionGuide(true);
    }
  });

  // Load notifications khi component mount hoặc page thay đổi
  useEffect(() => {
    dispatch(fetchNotifications({ page, limit }));
  }, [dispatch, page, limit]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();
      toast.success("Đã đánh dấu tất cả là đã đọc.");
    } catch (error) {
      toast.error("Đã có lỗi xảy ra.");
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      toast.error("Không thể đánh dấu đã đọc.");
    }
  };

  const refetch = () => {
    dispatch(fetchNotifications({ page, limit }));
  };

  const renderPagination = () => {
    if (!notifications || pagination.pages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
              disabled={page === 1}
            />
          </PaginationItem>
          {[...Array(pagination.pages).keys()].map(p => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p + 1); }}
                isActive={page === p + 1}
              >
                {p + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); setPage(p => Math.min(pagination.pages, p + 1)); }}
              disabled={page === pagination.pages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="grow space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorState onRetry={refetch} message={error} />;
    }

    if (!notifications || notifications.length === 0) {
      return <EmptyState message="Bạn không có thông báo nào." />;
    }

    return (
      <div>
        {notifications.map(notification => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Thông báo của bạn</CardTitle>
          <div className="flex items-center gap-2">
            {isPushEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={disableNotifications}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                disabled={isPushLoading}
              >
                {isPushLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : (
                  <BellOff className="mr-2 h-4 w-4" />
                )}
                Tắt thông báo đẩy
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={requestPermission}
                disabled={isPushLoading}
              >
                {isPushLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <BellPlus className="mr-2 h-4 w-4" />
                )}
                Bật thông báo đẩy
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={loading || (notifications && !notifications.some(n => !n.isRead))}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </CardHeader>

        {/* Permission Denied Alert */}
        {permissionDenied && (
          <div className="px-6 pb-4">
            <NotificationPermissionAlert
              onShowGuide={() => setShowPermissionGuide(true)}
            />
          </div>
        )}

        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
      {renderPagination()}

      {/* Permission Guide Modal */}
      <NotificationPermissionGuide
        isOpen={showPermissionGuide}
        onClose={() => setShowPermissionGuide(false)}
        onRetry={requestPermission}
      />
    </div>
  );
};

export default NotificationsPage;
