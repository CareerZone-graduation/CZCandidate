import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Bell,
  BellOff,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Laptop,
  GraduationCap,
  Mail,
  Smartphone,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getMyJobAlerts, deleteJobAlert, updateJobAlert } from '@/services/jobAlertService';
import {
  getFrequencyLabel,
  getSalaryRangeLabel,
  getWorkTypeLabel,
  getExperienceLabel,
  getCategoryLabel,
  getNotificationMethodLabel,
} from '@/constants/jobAlertEnums';
import JobAlertDialog from '@/components/jobs/JobAlertDialog';
import { cn } from '@/lib/utils';

const JobAlertSettings = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch job alerts
  const { data: alerts, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['jobAlerts'],
    queryFn: getMyJobAlerts,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteJobAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobAlerts'] });
      toast.success('Đã xóa thông báo việc làm');
      setDeleteDialogOpen(false);
      setSelectedAlert(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa thông báo');
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, alertData }) => updateJobAlert(id, alertData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobAlerts'] });
      toast.success(variables.alertData.active ? 'Đã bật thông báo' : 'Đã tắt thông báo');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông báo');
    },
  });

  const handleDelete = (alert) => {
    setSelectedAlert(alert);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (alert) => {
    setSelectedAlert(alert);
    setEditDialogOpen(true);
  };

  const handleToggleActive = (alert) => {
    // Send full alert data with only active field changed
    const alertData = {
      keyword: alert.keyword,
      location: alert.location,
      frequency: alert.frequency,
      salaryRange: alert.salaryRange,
      type: alert.type,
      workType: alert.workType,
      experience: alert.experience,
      category: alert.category,
      notificationMethod: alert.notificationMethod,
      active: !alert.active,
    };
    toggleActiveMutation.mutate({ id: alert._id, alertData });
  };

  const confirmDelete = () => {
    if (selectedAlert) {
      deleteMutation.mutate(selectedAlert._id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2 shadow-sm">
              <CardHeader className="pb-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <div className="flex items-center gap-2 pl-0.5">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pl-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                <Skeleton className="h-11 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error.response?.data?.message || error.message;
    return <ErrorState onRetry={refetch} message={errorMessage} />;
  }

  const canAddMore = !alerts || alerts.length < 3;

  const getNotificationIcon = (method) => {
    switch (method) {
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5" />;
      case 'APPLICATION':
        return <Smartphone className="h-3.5 w-3.5" />;
      case 'BOTH':
        return <Mail className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Quản lý thông báo việc làm
          </h1>
          <p className="text-muted-foreground mt-2">
            Nhận thông báo khi có việc làm phù hợp với tiêu chí của bạn. Tối đa 3 thông báo.
          </p>
        </div>
        <JobAlertDialog
          trigger={
            <Button disabled={!canAddMore} className="btn-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Thêm thông báo
            </Button>
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['jobAlerts'] });
          }} message="Bạn chưa có thông báo việc làm nào. Tạo thông báo để nhận cơ hội việc làm phù hợp!"
        />
      </div>

      {/* Limit Warning */}
      {!canAddMore && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Bell className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Đã đạt giới hạn thông báo
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Bạn đã tạo tối đa 3 thông báo. Xóa thông báo cũ để thêm mới.
            </p>
          </div>
        </div>
      )}

      {/* Alerts Grid */}
      {!alerts || alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <EmptyState
              message="Bạn chưa có thông báo việc làm nào. Tạo thông báo để nhận cơ hội việc làm phù hợp!"
              actionText="Tạo thông báo đầu tiên"
              onAction={() => setEditDialogOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {alerts.map((alert) => (
            <Card
              key={alert._id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 group",
                "bg-card border-2 shadow-sm hover:shadow-xl",
                alert.active
                  ? "border-emerald-200 hover:border-emerald-300"
                  : "border-border opacity-80 hover:opacity-100"
              )}
            >
              {/* Status Indicator - Left Border */}
              <div
                className={cn(
                  "absolute top-0 left-0 bottom-0 w-1.5",
                  alert.active
                    ? "bg-gradient-to-b from-emerald-500 via-green-500 to-emerald-600"
                    : "bg-gray-300"
                )}
              />

              <CardHeader className="pb-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Keyword with Icon */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        alert.active 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-lg truncate text-foreground">
                        {alert.keyword || 'Tất cả công việc'}
                      </h3>
                    </div>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pl-0.5">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {alert.location?.province || 'Toàn quốc'}
                        {alert.location?.district && alert.location.district !== 'ALL' && (
                          <span className="text-xs font-normal"> • {alert.location.district}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleToggleActive(alert)}>
                        {alert.active ? (
                          <>
                            <BellOff className="h-4 w-4 mr-2" />
                            Tạm dừng
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            Kích hoạt
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(alert)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(alert)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pl-5">
                {/* Filters Section */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Bộ lọc
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alert.category !== 'ALL' && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium border-primary/30 bg-primary/5 text-primary"
                      >
                        {getCategoryLabel(alert.category)}
                      </Badge>
                    )}
                    {alert.experience !== 'ALL' && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium border-blue-300 bg-blue-50 text-blue-700 flex items-center gap-1"
                      >
                        <GraduationCap className="h-3 w-3" />
                        {getExperienceLabel(alert.experience)}
                      </Badge>
                    )}
                    {alert.salaryRange !== 'ALL' && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium border-amber-300 bg-amber-50 text-amber-700 flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        {getSalaryRangeLabel(alert.salaryRange)}
                      </Badge>
                    )}
                    {alert.workType !== 'ALL' && (
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium border-purple-300 bg-purple-50 text-purple-700 flex items-center gap-1"
                      >
                        <Laptop className="h-3 w-3" />
                        {getWorkTypeLabel(alert.workType)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 rounded-md bg-muted">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tần suất</p>
                      <p className="font-medium text-foreground">{getFrequencyLabel(alert.frequency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 rounded-md bg-muted">
                      {getNotificationIcon(alert.notificationMethod)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phương thức</p>
                      <p className="font-medium text-foreground truncate">
                        {getNotificationMethodLabel(alert.notificationMethod)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-3">
                  {alert.active ? (
                    <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <Bell className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">
                        Đang hoạt động
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-50 border border-gray-200">
                      <BellOff className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-600">
                        Tạm dừng
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo việc làm "{selectedAlert?.keyword || 'này'}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <JobAlertDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          alert={selectedAlert}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['jobAlerts'] });
            setEditDialogOpen(false);
            setSelectedAlert(null);
          }}
        />
      )}
    </div>
  );
};

export default JobAlertSettings;
