import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Eye, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  Trash2, 
  ExternalLink,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { getViewHistory, deleteViewHistory, clearAllViewHistory } from '@/services/viewHistoryService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ViewHistoryPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const limit = 10;

  // Fetch view history
  const { data, isLoading, isError } = useQuery({
    queryKey: ['viewHistory', page],
    queryFn: () => getViewHistory({ page, limit }),
    keepPreviousData: true,
  });

  const viewHistory = data?.data || [];
  const pagination = data?.pagination || {};

  // Delete single history item
  const deleteMutation = useMutation({
    mutationFn: deleteViewHistory,
    onSuccess: () => {
      toast.success('Đã xóa lịch sử xem');
      queryClient.invalidateQueries(['viewHistory']);
      setDeleteItemId(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa lịch sử');
    },
  });

  // Clear all history
  const clearAllMutation = useMutation({
    mutationFn: clearAllViewHistory,
    onSuccess: () => {
      toast.success('Đã xóa toàn bộ lịch sử xem');
      queryClient.invalidateQueries(['viewHistory']);
      setShowClearDialog(false);
      setPage(1);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Không thể xóa lịch sử');
    },
  });

  const formatSalary = (min, max, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';
    const formatNumber = (num) => {
      if (currency === 'VND') {
        return num >= 1000000 ? `${num / 1000000}tr` : `${num / 1000}k`;
      }
      return num;
    };
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    }
    if (min) return `Từ ${formatNumber(min)} ${currency}`;
    if (max) return `Lên đến ${formatNumber(max)} ${currency}`;
  };

  const formatWorkType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'FREELANCE': 'Tự do',
      'INTERNSHIP': 'Thực tập'
    };
    return typeMap[type] || type;
  };

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

  const formatLocation = (location) => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    // location is object: { province, district, commune, coordinates }
    const parts = [location.province, location.district, location.commune].filter(Boolean);
    return parts.join(', ') || '';
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleDeleteClick = (itemId) => {
    setDeleteItemId(itemId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không thể tải lịch sử xem</h3>
              <p className="text-muted-foreground">Vui lòng thử lại sau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6" />
              <CardTitle>Lịch sử xem tin tuyển dụng</CardTitle>
            </div>
            {viewHistory.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearDialog(true)}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {viewHistory.length === 0 ? (
            <div className="py-12 text-center">
              <Eye className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử xem</h3>
              <p className="text-muted-foreground mb-6">
                Các tin tuyển dụng bạn đã xem sẽ được hiển thị tại đây
              </p>
              <Button onClick={() => navigate('/jobs')}>
                Khám phá việc làm
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {viewHistory.map((item) => (
                <Card 
                  key={item._id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewJob(item.job._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {item.job.company?.logo ? (
                            <img 
                              src={item.job.company.logo} 
                              alt={item.job.company.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold mb-1 hover:text-primary truncate">
                              {item.job.title}
                            </h3>
                            <p className="text-muted-foreground flex items-center gap-2 mb-2">
                              <Building className="h-4 w-4" />
                              {item.job.company?.name || 'Công ty'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
                          {item.job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {formatLocation(item.job.location)}
                            </span>
                          )}
                          {item.job.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(
                                item.job.salary.min,
                                item.job.salary.max,
                                item.job.salary.currency
                              )}
                            </span>
                          )}
                          {item.job.workType && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatWorkType(item.job.workType)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Xem {formatViewTime(item.viewedAt)}
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            Xem chi tiết
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Single Item Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lịch sử xem?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa mục này khỏi lịch sử xem không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteItemId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa toàn bộ lịch sử?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa toàn bộ lịch sử xem tin tuyển dụng của bạn. 
              Bạn không thể hoàn tác sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearAllMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewHistoryPage;
