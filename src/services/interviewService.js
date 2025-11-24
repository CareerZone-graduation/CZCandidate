import apiClient from './apiClient';

/**
 * Interview Service for Candidate
 * Handles API calls for candidate interview operations
 */

/**
 * Get all interviews for the logged-in candidate
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status: 'SCHEDULED', 'STARTED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of results per page
 * @returns {Promise<Object>} Interview list with pagination
 */
export const getMyInterviews = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const url = `/interviews/my-scheduled-interviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get interview details by ID
 * @param {string} interviewId - Interview ID
 * @returns {Promise<Object>} Interview details
 */
export const getInterviewById = async (interviewId) => {
  const response = await apiClient.get(`/interviews/${interviewId}`);
  return response.data;
};

/**
 * Accept an interview invitation
 * @param {string} interviewId - Interview ID to accept
 * @returns {Promise<Object>} Updated interview
 */
export const acceptInterview = async (interviewId) => {
  const response = await apiClient.patch(`/candidate/interviews/${interviewId}/accept`);
  return response.data;
};

/**
 * Decline an interview invitation
 * @param {string} interviewId - Interview ID to decline
 * @param {Object} data - Decline reason
 * @param {string} data.reason - Reason for declining
 * @returns {Promise<Object>} Updated interview
 */
export const declineInterview = async (interviewId, data = {}) => {
  const response = await apiClient.patch(`/candidate/interviews/${interviewId}/decline`, data);
  return response.data;
};

/**
 * Check if candidate can join interview (30 min before to 30 min after)
 * @param {string} scheduledTime - ISO string of interview scheduled time
 * @returns {Object} { canJoin: boolean, reason: string, minutesUntilStart: number }
 */
export const checkCanJoinInterview = (scheduledTime) => {
  const now = new Date();
  const interviewTime = new Date(scheduledTime);
  const diffMinutes = Math.floor((interviewTime - now) / 1000 / 60);

  if (diffMinutes > 15) {
    return {
      canJoin: false,
      reason: 'Buổi phỏng vấn chưa bắt đầu. Bạn có thể tham gia trước 15 phút.',
      minutesUntilStart: diffMinutes
    };
  }

  if (diffMinutes < -30) {
    return {
      canJoin: false,
      reason: 'Thời gian phỏng vấn đã kết thúc. Bạn chỉ có thể tham gia trong vòng 30 phút sau khi bắt đầu.',
      minutesUntilStart: diffMinutes
    };
  }

  return {
    canJoin: true,
    reason: 'Bạn có thể tham gia phỏng vấn ngay bây giờ.',
    minutesUntilStart: diffMinutes
  };
};

/**
 * Generate Google Calendar link for interview
 * @param {Object} interview - Interview object
 * @returns {string} Google Calendar URL
 */
export const generateGoogleCalendarLink = (interview) => {
  const { scheduledTime, job, duration = 60 } = interview;

  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Interview for ${job?.title || 'Position'}`,
    dates: `${formatDate(startTime)}/${formatDate(endTime)}`,
    details: `Online interview for ${job?.title || 'Position'} position at ${job?.company?.name || 'Company'}.\n\nJoin link: ${window.location.origin}/interviews/${interview._id}/room`,
    location: 'Online Video Interview'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate .ics file content for downloading
 * @param {Object} interview - Interview object
 * @returns {string} iCalendar format content
 */
export const generateICSFile = (interview) => {
  const { scheduledTime, job, duration = 60, _id } = interview;

  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Job Portal//Interview Calendar//EN',
    'BEGIN:VEVENT',
    `UID:interview-${_id}@jobportal.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:Interview for ${job?.title || 'Position'}`,
    `DESCRIPTION:Online interview for ${job?.title || 'Position'} position at ${job?.company?.name || 'Company'}.\\n\\nJoin link: ${window.location.origin}/interviews/${_id}/room`,
    'LOCATION:Online Video Interview',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

/**
 * Download .ics file
 * @param {Object} interview - Interview object
 */
export const downloadICSFile = (interview) => {
  const icsContent = generateICSFile(interview);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `interview-${interview.job?.title || 'schedule'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Format interview time for display
 * @param {string} scheduledTime - ISO string
 * @returns {Object} Formatted time parts
 */
export const formatInterviewTime = (scheduledTime) => {
  const date = new Date(scheduledTime);
  const now = new Date();

  const dateString = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeString = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate relative time
  const diffMinutes = Math.floor((date - now) / 1000 / 60);
  let relativeTime = '';

  if (diffMinutes > 0) {
    if (diffMinutes < 60) {
      relativeTime = `in ${diffMinutes} minutes`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      relativeTime = `in ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      relativeTime = `in ${days} day${days > 1 ? 's' : ''}`;
    }
  } else if (diffMinutes > -30) {
    relativeTime = 'happening now';
  } else {
    relativeTime = 'completed';
  }

  return {
    date: dateString,
    time: timeString,
    relative: relativeTime,
    isPast: diffMinutes < -30,
    isNow: diffMinutes >= -30 && diffMinutes <= 30
  };
};

export default {
  getMyInterviews,
  getInterviewById,
  acceptInterview,
  declineInterview,
  checkCanJoinInterview,
  generateGoogleCalendarLink,
  generateICSFile,
  downloadICSFile,
  formatInterviewTime
};
