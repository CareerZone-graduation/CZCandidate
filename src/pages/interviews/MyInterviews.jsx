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
import { InterviewInvitation } from '../../components/interviews/InterviewInvitation';
import { 
  getMyInterviews, 
  checkCanJoinInterview,
  formatInterviewTime 
} from '../../services/interviewService';
import { toast } from 'sonner';

/**
 * MyInterviews Page
 * Displays candidate's interviews with tabs for pending invitations, upcoming, and past interviews
 */
const MyInterviews = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');

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
  const pendingInvitations = interviews.filter(
    (interview) => interview.status === 'SCHEDULED' && !interview.acceptedByCandidate
  );

  const upcomingInterviews = interviews.filter((interview) => {
    // SCHEDULED or RESCHEDULED interviews that haven't passed yet
    if (interview.status !== 'SCHEDULED' && interview.status !== 'RESCHEDULED') return false;
    const { isPast } = formatInterviewTime(interview.scheduledTime);
    return !isPast;
  });

  const pastInterviews = interviews.filter((interview) => {
    if (interview.status === 'CANCELLED') return true;
    if (interview.status === 'COMPLETED') return true;
    if (interview.status === 'SCHEDULED' || interview.status === 'RESCHEDULED') {
      const { isPast } = formatInterviewTime(interview.scheduledTime);
      return isPast;
    }
    return false;
  });

  // Filter interviews based on search term
  const filterInterviews = (interviewList) => {
    if (!searchTerm) return interviewList;
    
    const lowerSearch = searchTerm.toLowerCase();
    return interviewList.filter((interview) => {
      const jobSnapshot = interview.application?.jobSnapshot || {};
      return (
        jobSnapshot.title?.toLowerCase().includes(lowerSearch) ||
        jobSnapshot.company?.toLowerCase().includes(lowerSearch) ||
        interview.roomName?.toLowerCase().includes(lowerSearch)
      );
    });
  };

  const filteredPending = filterInterviews(pendingInvitations);
  const filteredUpcoming = filterInterviews(upcomingInterviews);
  const filteredPast = filterInterviews(pastInterviews);

  const handleJoinInterview = (interviewId, scheduledTime) => {
    const { canJoin, reason } = checkCanJoinInterview(scheduledTime);
    
    if (!canJoin) {
      toast.error('Cannot join interview', {
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

  const handleInvitationStatusChange = () => {
    refetch();
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
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Interviews
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your interview invitations and scheduled interviews
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleDeviceTest}>
              <Video className="w-4 h-4 mr-2" />
              Test Device
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending Invitations
            {filteredPending.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 min-w-[20px] h-5">
                {filteredPending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {filteredUpcoming.length > 0 && (
              <Badge variant="default" className="ml-2 px-1.5 min-w-[20px] h-5">
                {filteredUpcoming.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {/* Pending Invitations Tab */}
        <TabsContent value="pending" className="space-y-4">
          {filteredPending.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No pending invitations"
              description="You don't have any pending interview invitations at the moment."
            />
          ) : (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                  Please review and respond to your interview invitations below.
                </AlertDescription>
              </Alert>
              <div className="grid gap-6">
                {filteredPending.map((interview) => (
                  <InterviewInvitation
                    key={interview.id}
                    interview={interview}
                    onStatusChange={handleInvitationStatusChange}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Upcoming Interviews Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcoming.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No upcoming interviews"
              description="Your accepted interviews will appear here."
            />
          ) : (
            <>
              {/* Interview Preparation Tips */}
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">
                  Interview Preparation Tips
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Test your camera and microphone 15 minutes before the interview</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Prepare your resume and job description for reference</li>
                    <li>Find a quiet, well-lit space for the interview</li>
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
              title="No past interviews"
              description="Your completed or cancelled interviews will appear here."
            />
          ) : (
            <div className="grid gap-6">
              {filteredPast.map((interview) => (
                <PastInterviewCard key={interview.id} interview={interview} />
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
const InterviewCard = ({ interview, onJoin, onDeviceTest }) => {
  const jobSnapshot = interview.application?.jobSnapshot || {};
  const { date, time, relative, isNow } = formatInterviewTime(interview.scheduledTime);
  const { canJoin, reason, minutesUntilStart } = checkCanJoinInterview(interview.scheduledTime);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className={interview.status === 'RESCHEDULED' ? 'bg-amber-600' : 'bg-green-600'}>
                {interview.status === 'RESCHEDULED' ? 'Rescheduled' : 'Scheduled'}
              </Badge>
              {isNow && (
                <Badge variant="default" className="bg-red-600 animate-pulse">
                  Happening Now
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{jobSnapshot.title || 'Interview'}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobSnapshot.company || 'Company'}
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
            onClick={onDeviceTest}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            Test Device
          </Button>
          <Button
            variant="default"
            onClick={() => onJoin(interview.id, interview.scheduledTime)}
            disabled={!canJoin}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Interview
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
const PastInterviewCard = ({ interview }) => {
  const jobSnapshot = interview.application?.jobSnapshot || {};
  const { date, time } = formatInterviewTime(interview.scheduledTime);

  const statusConfig = {
    COMPLETED: {
      badge: { variant: 'default', className: 'bg-blue-600', text: 'Completed' },
      icon: CheckCircle,
      iconColor: 'text-blue-600'
    },
    CANCELLED: {
      badge: { variant: 'destructive', text: 'Cancelled' },
      icon: XCircle,
      iconColor: 'text-red-600'
    },
    RESCHEDULED: {
      badge: { variant: 'default', className: 'bg-amber-600', text: 'Rescheduled (Past)' },
      icon: Clock,
      iconColor: 'text-amber-600'
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
            <CardTitle className="text-xl">{jobSnapshot.title || 'Interview'}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {jobSnapshot.company || 'Company'}
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
      </CardContent>
    </Card>
  );
};

export default MyInterviews;
