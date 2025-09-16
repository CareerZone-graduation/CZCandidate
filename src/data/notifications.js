// src/data/notifications.js

/**
 * @typedef {object} Notification
 * @property {string} id
 * @property {string} type - 'new_job', 'application_status', 'interview_reminder', 'system'
 * @property {string} title
 * @property {string} description
 * @property {string} timestamp - ISO 8601 date string
 * @property {boolean} read
 * @property {object} [metadata]
 * @property {string} [metadata.jobId]
 * @property {string} [metadata.companyName]
 */

/** @type {Notification[]} */
export const mockNotifications = [
  {
    id: '1',
    type: 'new_job',
    title: 'Gợi ý công việc mới: React Developer',
    description: 'FPT Software đang tuyển dụng vị trí Senior React Developer phù hợp với kỹ năng của bạn.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
    metadata: {
      jobId: 'job-123',
      companyName: 'FPT Software',
    },
  },
  {
    id: '2',
    type: 'application_status',
    title: 'Hồ sơ của bạn đã được xem',
    description: 'Nhà tuyển dụng tại VNG đã xem hồ sơ ứng tuyển của bạn cho vị trí "Frontend Developer".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    metadata: {
      jobId: 'job-456',
      companyName: 'VNG Corporation',
    },
  },
  {
    id: '3',
    type: 'interview_reminder',
    title: 'Nhắc nhở phỏng vấn ngày mai',
    description: 'Bạn có lịch phỏng vấn với Tiki vào 9:00 AM ngày mai cho vị trí "UI/UX Designer".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), // 23 hours ago
    read: true,
    metadata: {
      jobId: 'job-789',
      companyName: 'Tiki',
    },
  },
  {
    id: '4',
    type: 'system',
    title: 'Chào mừng đến với CareerZone!',
    description: 'Hãy bắt đầu bằng cách hoàn thiện hồ sơ của bạn để nhận được những gợi ý công việc tốt nhất.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true,
  },
  {
    id: '5',
    type: 'application_status',
    title: 'Hồ sơ của bạn đã bị từ chối',
    description: 'Rất tiếc, nhà tuyển dụng tại Grab đã từ chối hồ sơ của bạn cho vị trí "Data Analyst".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    read: true,
    metadata: {
      jobId: 'job-abc',
      companyName: 'Grab',
    },
  },
    {
    id: '6',
    type: 'new_job',
    title: 'Công việc mới có thể bạn quan tâm: Fullstack Engineer',
    description: 'NashTech vừa đăng tuyển vị trí Fullstack Engineer với mức lương hấp dẫn.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    read: true,
    metadata: {
      jobId: 'job-def',
      companyName: 'NashTech',
    },
  },
  {
    id: '7',
    type: 'system',
    title: 'Hồ sơ của bạn đã được cập nhật',
    description: 'Thông tin kinh nghiệm làm việc của bạn đã được cập nhật thành công.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    read: true,
  },
];