 import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllAsRead } from '@/services/notificationService';
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
import { BellRing, CheckCheck, BellPlus } from 'lucide-react';
import useFirebaseMessaging from '@/hooks/useFirebaseMessaging';

const NotificationItem = ({ notification }) => (
  <div className={cn(
    "flex items-start gap-4 p-4 border-b last:border-b-0",
    !notification.read && "bg-green-50"
  )}>
    <div className="shrink-0">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center",
        !notification.read ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      )}>
        <BellRing size={20} />
      </div>
    </div>
    <div className="grow">
      <p className="font-semibold">{notification.title}</p>
      <p className="text-sm text-muted-foreground">{notification.description}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: vi })}
      </p>
    </div>
    {!notification.read && (
      <div className="shrink-0 self-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
      </div>
    )}
  </div>
);

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  const { requestPermission } = useFirebaseMessaging();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => getNotifications({ page, limit }),
    keepPreviousData: true,
  });

  const mutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      toast.success("Đã đánh dấu tất cả là đã đọc.");
      queryClient.invalidateQueries(['notifications']);
       queryClient.invalidateQueries(['recentNotifications']);
    },
    onError: () => {
      toast.error("Đã có lỗi xảy ra.");
    }
  });

  const handleMarkAllRead = () => {
    mutation.mutate();
  };

  const renderPagination = () => {
    if (!data || data.pages <= 1) return null;

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
          {[...Array(data.pages).keys()].map(p => (
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
              onClick={(e) => { e.preventDefault(); setPage(p => Math.min(data.pages, p + 1)); }}
              disabled={page === data.pages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderContent = () => {
    if (isLoading) {
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

    if (isError) {
      const errorMessage = error.response?.data?.message || error.message;
      return <ErrorState onRetry={refetch} message={errorMessage} />;
    }

    if (!data || data.data.length === 0) {
      return <EmptyState message="Bạn không có thông báo nào." />;
    }

    return (
      <div>
        {data.data.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
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
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={requestPermission}
                  >
                      <BellPlus className="mr-2 h-4 w-4" />
                      Bật thông báo đẩy
                  </Button>
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                      disabled={mutation.isLoading || (data && !data.data.some(n => !n.read))}
                  >
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Đánh dấu tất cả đã đọc
                  </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {renderContent()}
            </CardContent>
        </Card>
        {renderPagination()}
    </div>
  );
};

export default NotificationsPage;
