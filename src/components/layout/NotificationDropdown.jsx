import { useQuery } from '@tanstack/react-query';
import { getRecentNotifications } from '@/services/notificationService';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
           {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: vi })}
        </p>
       </div>
    </Link>
  </DropdownMenuItem>
);


const NotificationDropdown = () => {
  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: getRecentNotifications,
  });

  const hasUnread = !isLoading && !isError && notifications && notifications.length > 0;

  const renderContent = () => {
    if (isLoading) {
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
    
    if (isError) {
        return <p className="p-4 text-center text-sm text-destructive">Không thể tải thông báo.</p>;
    }

    if (!hasUnread) {
      return <p className="p-4 text-center text-sm text-muted-foreground">Bạn không có thông báo mới.</p>;
    }

    return notifications.map(n => <NotificationDropdownItem key={n.id} notification={n} />);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-white border shadow-lg" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
            <span>Thông báo mới</span>
            {hasUnread && <span className="text-xs font-normal text-muted-foreground">({notifications.length})</span>}
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