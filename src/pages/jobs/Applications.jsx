import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import {
  FileText,
  Calendar,
  Building,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Hourglass,
  ExternalLink,
  ArrowLeft,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  History,
} from 'lucide-react';
import { getMyApplications } from '../../services/jobService';
import { ErrorState } from '../../components/common/ErrorState';
import { cn } from '../../lib/utils';

/**
 * Component hiển thị danh sách đơn ứng tuyển của người dùng
 */
const Applications = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const limit = 10; // Increased limit for list view

  // Query để lấy danh sách đơn ứng tuyển
  const {
    data: applicationsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['myApplications', currentPage, selectedStatus],
    queryFn: () => getMyApplications({
      page: currentPage,
      limit,
      status: selectedStatus === 'all' ? undefined : selectedStatus
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  });

  const applications = applicationsData?.data || [];
  const meta = applicationsData?.meta || {};
  const stats = applicationsData?.stats || {};
  const totalPages = meta.totalPages || 1;
  const totalItems = meta.totalItems || 0;

  // Calculate global total from stats
  const globalTotal = Object.values(stats).reduce((acc, curr) => acc + curr, 0);

  // Helper functions
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': {
        label: 'Đang chờ',
        icon: <Hourglass className="h-3.5 w-3.5" />,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      },
      'SUITABLE': {
        label: 'Đang xem xét',
        icon: <Eye className="h-3.5 w-3.5" />,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800'
      },
      'SCHEDULED_INTERVIEW': {
        label: 'Phỏng vấn',
        icon: <AlertCircle className="h-3.5 w-3.5" />,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-700 dark:text-purple-400',
        borderColor: 'border-purple-200 dark:border-purple-800'
      },
      'OFFER_SENT': {
        label: 'Đã nhận lời mời',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800'
      },
      'ACCEPTED': {
        label: 'Đã chấp nhận',
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800'
      },
      'REJECTED': {
        label: 'Đã từ chối',
        icon: <XCircle className="h-3.5 w-3.5" />,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800'
      },
      'OFFER_DECLINED': {
        label: 'Đã từ chối lời mời',
        icon: <XCircle className="h-3.5 w-3.5" />,
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-700'
      }
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDownloadCV = (cvUrl) => {
    window.open(cvUrl, '_blank');
  };

  const handleViewDetail = (application) => {
    navigate(`/dashboard/applications/${application._id}`, { state: { application } });
  };

  // Component Skeleton
  const ApplicationSkeleton = () => (
    <Card className="mb-4 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ApplicationSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    const errorMessage = error.response?.data?.message || error.message;
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <ErrorState onRetry={refetch} message={errorMessage} />
        </div>
      </div>
    );
  }

  // Render empty state
  if (!applications.length && selectedStatus === 'all') {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border dark:border-border shadow-sm">
            <div className="bg-gray-50 dark:bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-400 dark:text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">
              Chưa có đơn ứng tuyển nào
            </h3>
            <p className="text-gray-500 dark:text-muted-foreground mb-8 max-w-md mx-auto">
              Bạn chưa ứng tuyển vào công việc nào. Hãy khám phá các cơ hội nghề nghiệp phù hợp với bạn ngay hôm nay!
            </p>
            <Button onClick={() => navigate('/jobs')} size="lg" className="bg-primary hover:bg-primary/90">
              <ExternalLink className="h-4 w-4 mr-2" />
              Tìm việc làm ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">Đơn ứng tuyển của tôi</h1>
            <p className="text-gray-500 dark:text-muted-foreground mt-1">
              Quản lý và theo dõi trạng thái {globalTotal} đơn ứng tuyển
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="w-fit bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-accent dark:text-foreground dark:border-border"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Tổng số đơn', value: 'all', count: globalTotal, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            {
              label: 'Đang chờ',
              value: 'PENDING',
              count: stats.PENDING || 0,
              icon: Hourglass,
              color: 'text-yellow-600 dark:text-yellow-400',
              bg: 'bg-yellow-50 dark:bg-yellow-900/20'
            },
            {
              label: 'Phù hợp',
              value: 'SUITABLE',
              count: stats.SUITABLE || 0,
              icon: Eye,
              color: 'text-purple-600 dark:text-purple-400',
              bg: 'bg-purple-50 dark:bg-purple-900/20'
            },
            {
              label: 'Phỏng vấn',
              value: 'SCHEDULED_INTERVIEW',
              count: stats.SCHEDULED_INTERVIEW || 0,
              icon: AlertCircle,
              color: 'text-indigo-600 dark:text-indigo-400',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20'
            },
            {
              label: 'Đã chấp nhận offer',
              value: 'ACCEPTED',
              count: stats.ACCEPTED || 0,
              icon: CheckCircle,
              color: 'text-green-600 dark:text-green-400',
              bg: 'bg-green-50 dark:bg-green-900/20'
            },
            {
              label: 'Không phù hợp (Bị từ chối)',
              value: 'REJECTED',
              count: stats.REJECTED || 0,
              icon: XCircle,
              color: 'text-red-600 dark:text-red-400',
              bg: 'bg-red-50 dark:bg-red-900/20'
            }
          ].map((stat, index) => (
            <Card
              key={index}
              className={cn(
                "border transition-all cursor-pointer hover:shadow-md dark:bg-card dark:border-border",
                selectedStatus === stat.value
                  ? "ring-2 ring-primary border-transparent shadow-sm"
                  : "border-gray-200 bg-white dark:bg-card dark:border-border"
              )}
              onClick={() => setSelectedStatus(stat.value)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  {selectedStatus === stat.value && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-foreground">{stat.count}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-muted-foreground truncate">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length > 0 ? (
            applications.map((application) => {
              const statusInfo = getStatusInfo(application.status);

              return (
                <Card
                  key={application._id}
                  className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-border cursor-pointer overflow-hidden dark:bg-card"
                  onClick={() => handleViewDetail(application)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Company Logo */}
                      <Avatar className="h-16 w-16 rounded-xl border dark:border-border bg-white dark:bg-muted shadow-sm shrink-0">
                        <AvatarImage
                          src={application.jobSnapshot?.logo}
                          alt={application.jobSnapshot?.company}
                          className="object-contain p-1"
                        />
                        <AvatarFallback className="rounded-xl text-lg bg-gray-100 dark:bg-muted font-bold text-gray-500 dark:text-muted-foreground">
                          {application.jobSnapshot?.company?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {application.jobSnapshot?.title}
                              </h3>
                              {application.isReapplied && (
                                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 text-xs px-2 py-0.5">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Ứng tuyển lại
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-muted-foreground font-medium">
                              <Building className="h-4 w-4 mr-1.5 shrink-0" />
                              <span className="truncate">{application.jobSnapshot?.company}</span>
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              "w-fit px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-medium transition-colors",
                              statusInfo.bgColor,
                              statusInfo.textColor,
                              statusInfo.borderColor
                            )}
                          >
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </Badge>
                        </div>

                        {/* Meta Info */}
                        {/* Meta Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-500 dark:text-muted-foreground mt-4 bg-gray-50/50 dark:bg-muted/30 p-3 rounded-lg border border-gray-100 dark:border-border">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400 dark:text-muted-foreground" />
                            <span>Ngày ứng tuyển: <span className="font-medium text-gray-900 dark:text-foreground">{formatDate(application.appliedAt)}</span></span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-muted-foreground" />
                            <span>Cập nhật: <span className="font-medium text-gray-900 dark:text-foreground">{formatDate(application.lastStatusUpdateAt)}</span></span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-border">
                          {/* Previous Application Link */}
                          <div>
                            {application.previousApplicationId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/dashboard/applications/${application.previousApplicationId}`);
                                }}
                              >
                                <History className="h-4 w-4 mr-2" />
                                Xem đơn trước
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {application.submittedCV && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 dark:text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadCV(application.submittedCV.path);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Tải CV
                              </Button>
                            )}

                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary hover:bg-primary/90 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(application)
                              }}
                            >
                              Xem chi tiết
                              <Eye className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-dashed dark:border-border">
              <div className="bg-gray-50 dark:bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-1">
                Không tìm thấy đơn ứng tuyển
              </h3>
              <p className="text-gray-500 dark:text-muted-foreground">
                Không có đơn ứng tuyển nào phù hợp với bộ lọc hiện tại
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent dark:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, arr) => {
                const prevPage = arr[index - 1];
                const showDots = prevPage && page - prevPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showDots && <span className="px-2 text-gray-400">...</span>}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-9 h-9 p-0 font-medium transition-all",
                        currentPage === page
                          ? "bg-primary hover:bg-primary/90 shadow-sm"
                          : "border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent text-gray-600 dark:text-muted-foreground"
                      )}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent dark:text-foreground"
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
