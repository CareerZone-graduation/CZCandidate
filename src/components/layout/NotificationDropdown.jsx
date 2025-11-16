import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentNotifications, fetchUnreadCount } from '@/redux/notificationSlice';
import { Link } from 'react-router-dom';
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


const NotificationDropdownItem = ({ notification }) => (
  <DropdownMenuItem asChild>
    <Link to={`/notifications`} className="flex items-start gap-3 p-2.5">
       <div className="shrink-0 mt-1">
         <BellRing size={16} className="text-primary"/>
       </div>
       <div className="grow">
        <p className="font-semibold text-sm leading-tight">{notification.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
           {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
        </p>
       </div>
    </Link>
  </DropdownMenuItem>
);


const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const { recentNotifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);

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
                <Skeleton className="h-2 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!hasUnread) {
      return <p className="p-4 text-center text-sm text-muted-foreground">Bạn không có thông báo mới.</p>;
    }

    return recentNotifications.map(n => <NotificationDropdownItem key={n._id} notification={n} />);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
            <span>Thông báo mới</span>
            {hasUnread && unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">({unreadCount} chưa đọc)</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
            {renderContent()}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link to="/notifications" className="flex items-center justify-center py-2">
                Xem tất cả thông báo
            </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;