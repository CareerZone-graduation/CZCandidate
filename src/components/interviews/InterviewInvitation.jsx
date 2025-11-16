import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Briefcase, 
  Check, 
  X, 
  Download,
  ExternalLink,
  Video,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  acceptInterview, 
  declineInterview, 
  generateGoogleCalendarLink,
  downloadICSFile,
  formatInterviewTime
} from '../../services/interviewService';
import { toast } from 'sonner';

/**
 * InterviewInvitation Component
 * Displays interview invitation details with accept/decline actions
 * 
 * @param {Object} interview - Interview invitation object
 * @param {Function} onStatusChange - Callback when interview status changes
 */
export const InterviewInvitation = ({ interview, onStatusChange }) => {
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);

  const { date, time, relative, isPast } = formatInterviewTime(interview.scheduledTime);

  const handleAccept = async () => {
    setShowAcceptDialog(false);
    setIsAccepting(true);

    try {
      await acceptInterview(interview._id);
      toast.success('Interview invitation accepted!', {
        description: 'The interview has been added to your schedule.'
      });
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to accept interview:', error);
      toast.error('Failed to accept invitation', {
        description: error.response?.data?.message || 'Please try again later.'
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setShowDeclineDialog(false);
    setIsDeclining(true);

    try {
      await declineInterview(interview._id, {
        reason: 'Candidate declined the invitation'
      });
      toast.success('Interview invitation declined', {
        description: 'The recruiter has been notified.'
      });
      onStatusChange?.();
    } catch (error) {
      console.error('Failed to decline interview:', error);
      toast.error('Failed to decline invitation', {
        description: error.response?.data?.message || 'Please try again later.'
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const handleAddToGoogleCalendar = () => {
    const calendarLink = generateGoogleCalendarLink(interview);
    window.open(calendarLink, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    try {
      downloadICSFile(interview);
      toast.success('Calendar file downloaded', {
        description: 'You can import this file to your calendar app.'
      });
    } catch (error) {
      console.error('Failed to download ICS file:', error);
      toast.error('Failed to download calendar file');
    }
  };

  const handleDeviceTest = () => {
    navigate('/interviews/device-test');
  };

  const jobSnapshot = interview.application?.jobSnapshot || {};

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="bg-blue-600">
                  New Invitation
                </Badge>
                {isPast && (
                  <Badge variant="destructive">
                    Expired
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {jobSnapshot.title || 'Interview Invitation'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {jobSnapshot.company || 'Company Name'}
              </p>
            </div>
            <Video className="w-8 h-8 text-blue-600" />
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {/* Interview Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">{date}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{relative}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium">{time}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Duration: {interview.duration || 60} minutes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span>Online Video Interview</span>
            </div>
          </div>

          {/* Interview Notes */}
          {interview.notes && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Notes from recruiter:</strong> {interview.notes}
              </AlertDescription>
            </Alert>
          )}

          {/* Calendar Integration */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Add to your calendar:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToGoogleCalendar}
                className="flex-1 min-w-[150px]"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadICS}
                className="flex-1 min-w-[150px]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download .ics
              </Button>
            </div>
          </div>

          {/* Device Test Link */}
          <div className="border-t pt-4">
            <Button
              variant="link"
              onClick={handleDeviceTest}
              className="p-0 h-auto text-blue-600 hover:text-blue-700"
            >
              Test your camera and microphone before the interview →
            </Button>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-900/50 flex gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowDeclineDialog(true)}
            disabled={isAccepting || isDeclining || isPast}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowAcceptDialog(true)}
            disabled={isAccepting || isDeclining || isPast}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isAccepting ? (
              'Accepting...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Interview Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to accept the interview invitation for <strong>{jobSnapshot.title}</strong> at{' '}
              <strong>{jobSnapshot.company}</strong> scheduled on <strong>{date}</strong> at{' '}
              <strong>{time}</strong>.
              <br />
              <br />
              Please make sure you are available at this time. The recruiter will be notified of
              your acceptance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept} className="bg-blue-600 hover:bg-blue-700">
              Confirm Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Interview Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline the interview invitation for{' '}
              <strong>{jobSnapshot.title}</strong> at <strong>{jobSnapshot.company}</strong>?
              <br />
              <br />
              This action cannot be undone. The recruiter will be notified of your decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default InterviewInvitation;
