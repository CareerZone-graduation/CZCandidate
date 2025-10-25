import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, ArrowRight, Building } from 'lucide-react';
import { getViewHistory } from '@/services/viewHistoryService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Component hiển thị widget lịch sử xem nhỏ gọn
 * Có thể dùng trong Dashboard hoặc Profile sidebar
 */
const ViewHistoryWidget = ({ limit = 5 }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['viewHistory', 1],
    queryFn: () => getViewHistory({ page: 1, limit }),
  });

  const viewHistory = data?.data || [];

  const formatViewTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch (error) {
      return 'Vừa xong';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <CardTitle className="text-lg">Đã xem gần đây</CardTitle>
          </div>
          {viewHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/view-history')}
              className="text-primary hover:text-primary/80"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {viewHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có lịch sử xem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {viewHistory.map((item) => (
              <div
                key={item._id}
                className="flex gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/jobs/${item.job._id}`)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    {item.job.company?.logo ? (
                      <img 
                        src={item.job.company.logo} 
                        alt={item.job.company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate hover:text-primary">
                    {item.job.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.job.company?.name || 'Công ty'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatViewTime(item.viewedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ViewHistoryWidget;
