// src/services/notificationService.js
import { mockNotifications } from '@/data/notifications';

// Simulate API latency
const API_LATENCY = 500;

let notifications = [...mockNotifications];

/**
 * Lấy danh sách thông báo có phân trang.
 * @param {object} params
 * @param {number} params.page - Số trang (bắt đầu từ 1)
 * @param {number} params.limit - Số lượng mục trên mỗi trang
 * @returns {Promise<{data: Notification[], total: number, pages: number}>}
 */
export const getNotifications = ({ page = 1, limit = 10 }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = notifications.slice(start, end);
      resolve({
        data: paginatedData,
        total: notifications.length,
        pages: Math.ceil(notifications.length / limit),
      });
    }, API_LATENCY);
  });
};

/**
 * Lấy 4 thông báo gần nhất chưa đọc.
 * @returns {Promise<Notification[]>}
 */
export const getRecentNotifications = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const unread = notifications.filter(n => !n.read);
      const sorted = unread.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(sorted.slice(0, 4));
    }, API_LATENCY);
  });
};

/**
 * Đánh dấu tất cả thông báo là đã đọc.
 * @returns {Promise<{success: boolean}>}
 */
export const markAllAsRead = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      notifications = notifications.map(n => ({ ...n, read: true }));
      resolve({ success: true });
    }, API_LATENCY);
  });
};