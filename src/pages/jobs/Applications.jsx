import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Separator } from '../../components/ui/separator';
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
  User,
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
  const limit = 9;

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
  });

  const applications = applicationsData?.data || [];
  const meta = applicationsData?.meta || {};
  const totalPages = meta.totalPages || 1;
  const totalItems = meta.totalItems || 0;

  // Helper functions
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': {
        label: 'Đang chờ',
        variant: 'secondary',
        icon: <Hourglass className="h-4 w-4" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
      },
      'REVIEWING': {
        label: 'Đang xem xét',
        variant: 'outline',
        icon: <Eye className="h-4 w-4" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      },
      'INTERVIEW': {
        label: 'Phỏng vấn',
        variant: 'default',
        icon: <AlertCircle className="h-4 w-4" />,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200'
      },
      'ACCEPTED': {
        label: 'Đã chấp nhận',
        variant: 'secondary',
        icon: <CheckCircle className="h-4 w-4" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      },
      'REJECTED': {
        label: 'Đã từ chối',
        variant: 'destructive',
        icon: <XCircle className="h-4 w-4" />,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
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
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );


  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <ApplicationSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    const errorMessage = error.response?.data?.message || error.message;
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <ErrorState onRetry={refetch} message={errorMessage} />
        </div>
      </div>
    );
  }

  // Render empty state
  if (!applications.length) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn ứng tuyển nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa ứng tuyển vào công việc nào. Hãy khám phá các cơ hội nghề nghiệp!
            </p>
            <Button onClick={() => navigate('/jobs')} className="bg-green-600 hover:bg-green-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Tìm việc làm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn ứng tuyển của tôi</h1>
            <p className="text-gray-600">
              Theo dõi trạng thái {totalItems} đơn ứng tuyển của bạn
            </p>
          </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="w-fit border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại Dashboard
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số đơn', value: 'all', count: totalItems, icon: FileText, color: 'text-blue-600' },
          {
            label: 'Đang chờ',
            value: 'PENDING',
            count: applications.filter(app => app.status === 'PENDING').length,
            icon: Hourglass,
            color: 'text-yellow-600'
          },
          {
            label: 'Đang xem xét',
            value: 'REVIEWING',
            count: applications.filter(app => app.status === 'REVIEWING').length,
            icon: Eye,
            color: 'text-purple-600'
          },
          {
            label: 'Đã chấp nhận',
            value: 'ACCEPTED',
            count: applications.filter(app => app.status === 'ACCEPTED').length,
            icon: CheckCircle,
            color: 'text-green-600'
          }
        ].map((stat, index) => (
          <Card
            key={index}
            className={cn(
              "bg-white border border-gray-200 transition-all cursor-pointer",
              selectedStatus === stat.value ? "ring-2 ring-green-500 shadow-lg" : "hover:shadow-md"
            )}
            onClick={() => setSelectedStatus(stat.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
                <stat.icon className={cn("h-8 w-8", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((application) => {
          const statusInfo = getStatusInfo(application.status);

          return (
            <Card 
              key={application._id} 
              className={cn(
                "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl cursor-pointer bg-white",
                statusInfo.bgColor,
                statusInfo.borderColor
              )}
              onClick={() => handleViewDetail(application)}
            >
              {/* Hiệu ứng highlight khi hover */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <CardContent className="relative p-6">
                <div className="flex items-start space-x-4">
                  {/* Logo công ty trong vòng tròn có shadow */}
                  <Avatar className="h-14 w-14 shadow-md ring-2 ring-gray-200">
                    <AvatarImage 
                      src={application.jobSnapshot?.logo} 
                      alt={application.jobSnapshot?.company} 
                    />
                    <AvatarFallback className="bg-green-100 text-green-600 font-bold">
                      {application.jobSnapshot?.company?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                          {application.jobSnapshot?.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {application.jobSnapshot?.company}
                        </p>
                      </div>

                      {/* Badge tròn đẹp hơn */}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full shadow-sm font-medium",
                          statusInfo.textColor,
                          statusInfo.borderColor,
                          "bg-white/70 backdrop-blur-sm"
                        )}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-green-600" />
                        <span className="truncate">{application.candidateName}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        <span>Ứng tuyển: {formatDate(application.appliedAt)}</span>
                      </div>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                      <div className="mb-4">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          <p className="text-sm text-gray-600 line-clamp-2 italic">
                            "{application.coverLetter}"
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator className="my-3" />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1 text-green-600" />
                        <span>{formatDate(application.lastStatusUpdateAt)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {application.submittedCV && (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadCV(application.submittedCV.path);
                            }}
                            className="text-xs rounded-full shadow-sm bg-gray-100 hover:bg-gray-200"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            CV
                          </Button>
                        )}

                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(application)
                          }}
                          className="rounded-full bg-green-600 hover:bg-green-700"
                        >
                          Chi tiết
                          <Eye className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="border-gray-300 hover:bg-gray-50"
          >
            Trước
          </Button>

          {/* Hiển thị tối đa 5 trang, có "..." nếu nhiều */}
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
                  {showDots && <span className="px-2">...</span>}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "w-8 h-8 p-0",
                      currentPage === page 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "border-gray-300 hover:bg-gray-50"
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
            className="border-gray-300 hover:bg-gray-50"
          >
            Sau
          </Button>
        </div>
      )}

      </div>
    </div>
  );
};

export default Applications;