import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

import {
  getMyInterviews,
  checkCanJoinInterview,
  formatInterviewTime
} from '../../services/interviewService';
import { toast } from 'sonner';

/**
 * MyInterviews Page
 * Displays candidate's interviews with tabs for upcoming and past interviews
 */
const MyInterviews = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  // State lưu trữ các điều kiện lọc thực tế (chỉ cập nhật khi nhấn tìm kiếm)
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    start: '',
    end: ''
  });

  // Fetch all interviews
  const {
    data: interviewsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['myInterviews'],
    queryFn: () => getMyInterviews(),
    refetchInterval: 60000, // Refetch every minute to update join buttons
  });
  const interviews = interviewsData?.data || [];

  // Categorize interviews - Backend uses uppercase status values
  const upcomingInterviews = interviews.filter((interview) => {
    // STARTED, SCHEDULED or RESCHEDULED interviews that haven't passed yet
    if (interview.status === 'STARTED') return true;
    if (interview.status !== 'SCHEDULED' && interview.status !== 'RESCHEDULED') return false;
    const { isPast } = formatInterviewTime(interview.scheduledTime);
    return !isPast;
  });

  const pastInterviews = interviews.filter((interview) => {
    if (interview.status === 'CANCELLED') return true;
    if (interview.status === 'COMPLETED') return true;
    if (interview.status === 'ENDED') return true;
    if (interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED') {
      const { isPast } = formatInterviewTime(interview.scheduledTime);
      return isPast;
    }
    return false;
  });

  // Filter interviews based on search term
  // Filter interviews based on search term and date range
  const filterInterviews = (interviewList) => {
    let filtered = interviewList;

    // Filter by search term
    if (activeFilters.search) {
      const lowerSearch = activeFilters.search.toLowerCase();
      filtered = filtered.filter((interview) => {
        const jobSnapshot = interview.application?.jobSnapshot || {};
        return (
          jobSnapshot.title?.toLowerCase().includes(lowerSearch) ||
          jobSnapshot.company?.toLowerCase().includes(lowerSearch) ||
          interview.roomName?.toLowerCase().includes(lowerSearch)
        );
      });
    }

    // Filter by date range
    if (activeFilters.start || activeFilters.end) {
      filtered = filtered.filter((interview) => {
        const interviewDate = new Date(interview.scheduledTime);
        interviewDate.setHours(0, 0, 0, 0);

        if (activeFilters.start) {
          const start = new Date(activeFilters.start);
          start.setHours(0, 0, 0, 0);
          if (interviewDate < start) return false;
        }

        if (activeFilters.end) {
          const end = new Date(activeFilters.end);
          end.setHours(0, 0, 0, 0);
          if (interviewDate > end) return false;
        }
        return true;
      });
    }

    return filtered;
  };

  const filteredUpcoming = filterInterviews(upcomingInterviews);
  const filteredPast = filterInterviews(pastInterviews);

  const handleJoinInterview = (interviewId, scheduledTime, status) => {
    const { canJoin, reason } = checkCanJoinInterview(scheduledTime, status);

    if (!canJoin) {
      toast.error('Không thể tham gia phỏng vấn', {
        description: reason
      });
      return;
    }

    // Go to device test first
    navigate(`/interviews/${interviewId}/device-test`);
  };

  const handleDeviceTest = () => {
    navigate('/interviews/device-test');
  };

  const handleViewDetail = (interviewId) => {
    navigate(`/interviews/${interviewId}`);
  };

  const handleSearch = () => {
    setActiveFilters({
      search: searchInput,
      start: startDateInput,
      end: endDateInput
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setStartDateInput('');
    setEndDateInput('');
    setActiveFilters({
      search: '',
      start: '',
      end: ''
    });
  };



  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <ErrorState
          message={error?.response?.data?.message || 'Failed to load interviews'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Phỏng vấn của tôi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Quản lý lịch phỏng vấn và thư mời phỏng vấn
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm theo công việc, công ty..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Tìm kiếm
              </Button>
              <Button variant="outline" onClick={handleDeviceTest}>
                <Video className="w-4 h-4 mr-2" />
                Kiểm tra thiết bị
              </Button>

            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium whitespace-nowrap">Từ ngày:</span>
                <Input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full md:w-[150px]"
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-sm font-medium whitespace-nowrap">Đến ngày:</span>
                <Input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => setEndDateInput(e.target.value)}
                  className="w-full md:w-[150px]"
                />
              </div>
              {(searchInput || startDateInput || endDateInput || activeFilters.search || activeFilters.start || activeFilters.end) && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="ml-auto md:ml-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="relative">
            Sắp tới
            {filteredUpcoming.length > 0 && (
              <Badge variant="default" className="ml-2 px-1.5 min-w-[20px] h-5">
                {filteredUpcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Lịch sử</TabsTrigger>
        </TabsList>

        {/* Upcoming Interviews Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcoming.length === 0 ? (
            <EmptyState
              icon={Video}
              title="Không có phỏng vấn sắp tới"
              description="Các buổi phỏng vấn đã được xác nhận sẽ hiển thị ở đây."
            />
          ) : (
            <>
              {/* Mẹo chuẩn bị phỏng vấn */}
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">
                  Mẹo chuẩn bị phỏng vấn
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Kiểm tra camera và microphone 15 phút trước khi phỏng vấn</li>
                    <li>Đảm bảo bạn có kết nối internet ổn định</li>
                    <li>Chuẩn bị sẵn CV và mô tả công việc để tham khảo</li>
                    <li>Tìm một không gian yên tĩnh, đủ ánh sáng cho buổi phỏng vấn</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid gap-6">
                {filteredUpcoming.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onJoin={handleJoinInterview}
                    onDeviceTest={handleDeviceTest}
                    onDetail={handleViewDetail}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Past Interviews Tab */}
        <TabsContent value="past" className="space-y-4">
          {filteredPast.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="Không có lịch sử phỏng vấn"
              description="Các buổi phỏng vấn đã hoàn thành hoặc bị hủy sẽ hiển thị ở đây."
            />
          ) : (
            <div className="grid gap-6">
              {filteredPast.map((interview) => (
                <PastInterviewCard
                  key={interview.id}
                  interview={interview}
                  onDetail={handleViewDetail}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * InterviewCard Component
 * Displays upcoming interview details with join button
 */
const InterviewCard = ({ interview, onJoin, onDeviceTest, onDetail }) => {
  const jobSnapshot = interview.application?.jobSnapshot || {};
  const { date, time, relative, isNow } = formatInterviewTime(interview.scheduledTime);
  const { canJoin, reason, minutesUntilStart } = checkCanJoinInterview(interview.scheduledTime, interview.status, interview.duration);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {interview.status === 'STARTED' ? (
                <Badge variant="default" className="bg-green-600 animate-pulse">
                  Đang diễn ra
                </Badge>
              ) : (
                <Badge variant="default" className={interview.status === 'RESCHEDULED' ? 'bg-amber-600' : 'bg-green-600'}>
                  {interview.status === 'RESCHEDULED' ? 'Đã dời lịch' : 'Đã lên lịch'}
                </Badge>
              )}
              {isNow && (
                <Badge variant="default" className="bg-red-600 animate-pulse">
                  Đang diễn ra
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              {interview.application?.id ? (
                <a
                  href={`/dashboard/applications/${interview.application.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {jobSnapshot.title || 'Phỏng vấn'}
                </a>
              ) : (
                jobSnapshot.title || 'Phỏng vấn'
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobSnapshot.company || 'Công ty'}
            </p>
          </div>
          <Video className="w-8 h-8 text-green-600" />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium">{date}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{relative}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>{time}</span>
          </div>
        </div>

        {!canJoin && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{reason}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onDetail(interview._id || interview.id)}
            className="flex-1"
          >
            Xem chi tiết
          </Button>
          <Button
            variant="default"
            onClick={() => onJoin(interview.id, interview.scheduledTime, interview.status)}
            disabled={!canJoin}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Video className="w-4 h-4 mr-2" />
            Tham gia
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * PastInterviewCard Component
 * Displays completed or cancelled interview details
 */
const PastInterviewCard = ({ interview, onDetail }) => {
  const jobSnapshot = interview.application?.jobSnapshot || {};
  const { date, time } = formatInterviewTime(interview.scheduledTime);

  const statusConfig = {
    COMPLETED: {
      badge: { variant: 'default', className: 'bg-blue-600', text: 'Đã hoàn thành' },
      icon: CheckCircle,
      iconColor: 'text-blue-600'
    },
    CANCELLED: {
      badge: { variant: 'destructive', text: 'Đã hủy' },
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    RESCHEDULED: {
      badge: { variant: 'default', className: 'bg-amber-600', text: 'Đã dời lịch' },
      icon: Clock,
      iconColor: 'text-amber-600'
    },
    ENDED: {
      badge: { variant: 'default', className: 'bg-gray-500', text: 'Đã kết thúc' },
      icon: Clock,
      iconColor: 'text-gray-500'
    }
  };

  const config = statusConfig[interview.status] || statusConfig.COMPLETED;
  const StatusIcon = config.icon;

  return (
    <Card className="opacity-90">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2">
              <Badge {...config.badge}>{config.badge.text}</Badge>
            </div>
            <CardTitle className="text-xl">
              {interview.application?.id ? (
                <a
                  href={`/dashboard/applications/${interview.application.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {jobSnapshot.title || 'Phỏng vấn'}
                </a>
              ) : (
                jobSnapshot.title || 'Phỏng vấn'
              )}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobSnapshot.company || 'Công ty'}
            </p>
          </div>
          <StatusIcon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span>{time}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onDetail(interview._id || interview.id)}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );
};

export default MyInterviews;
