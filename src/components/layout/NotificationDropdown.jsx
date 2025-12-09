import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentNotifications, fetchUnreadCount, markNotificationAsRead } from '@/redux/notificationSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellRing } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const getNotificationLink = (notification) => {
  const { type, entity, metadata } = notification;

  switch (type) {
    case 'application':
      return `/dashboard/applications/${entity?.id || metadata?.applicationId}`;
    case 'interview':
      // Candidate chỉ có trang danh sách phỏng vấn, không có trang chi tiết
      return '/interviews';
    case 'recommendation':
      return '/jobs/recommended';
    case 'profile_view':
      return '/profile';
    case 'job_alert':
      // Navigate to job alert jobs page with jobIds from metadata
      if (metadata?.jobIds && Array.isArray(metadata.jobIds) && metadata.jobIds.length > 0) {
        // Get keyword from notification title for display
        const keywordMatch = notification.title?.match(/"([^"]+)"/);
        const keyword = keywordMatch ? keywordMatch[1] : '';

        // Ensure jobIds is a list of strings even if objects are passed
        const ids = metadata.jobIds.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item._id || item.id;
          }
          return item;
        }).filter(Boolean);

        const jobIdsParam = ids.join(',');
        return `/jobs/alert?jobIds=${jobIdsParam}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ''}`;
      }
      // Fallback to job alerts settings if no job ids
      return `/dashboard/settings/job-alerts`;
    case 'support_request':
      return `/support/${entity?.id || metadata?.supportRequestId}`;
    default:
      return '/notifications';
  }
};

const NotificationDropdownItem = ({ notification, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const link = getNotificationLink(notification);

  const handleClick = () => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }
    onClose();
    navigate(link);
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="cursor-pointer flex items-start gap-3 p-2.5"
    >
      <div className="shrink-0 mt-1">
        <BellRing size={16} className="text-primary" />
      </div>
      <div className="grow">
        <p className={`text-sm leading-tight ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0 self-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </DropdownMenuItem>
  );
};


const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const { recentNotifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Load notifications lần đầu khi component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRecentNotifications());
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isAuthenticated]);

  const hasUnread = !loading && recentNotifications && recentNotifications.length > 0;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-2.5 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="grow space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!recentNotifications || recentNotifications.length === 0) {
      return <p className="p-4 text-center text-sm text-muted-foreground">Bạn không có thông báo mới.</p>;
    }

    return recentNotifications.map(n => (
      <NotificationDropdownItem
        key={n._id}
        notification={n}
        onClose={() => setOpen(false)}
      />
    ));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full shadow-sm border-2 border-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96" align="end">
        <DropdownMenuLabel className="flex justify-between items-center py-3">
          <span className="font-bold">Thông báo</span>
          {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{unreadCount} chưa đọc</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {renderContent()}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/notifications"
            className="flex items-center justify-center py-3 text-sm font-medium text-primary hover:text-primary/80 cursor-pointer w-full"
            onClick={() => setOpen(false)}
          >
            Xem tất cả thông báo
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;