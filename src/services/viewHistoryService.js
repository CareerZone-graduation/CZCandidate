import apiClient from './apiClient';

/**
 * Service quản lý lịch sử xem tin tuyển dụng
 */

/**
 * Lấy lịch sử xem tin tuyển dụng của người dùng
 * @param {object} params - Tham số query
 * @param {number} params.limit - Số lượng items mỗi trang (default: 10, max: 50)
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @returns {Promise} Response với data và pagination
 */
export const getViewHistory = async ({ limit = 10, page = 1 } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', Math.min(limit, 50));
    if (page) queryParams.append('page', page);

    const url = `/job-view-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử xem tin tuyển dụng:', error);
    throw error;
  }
};

/**
 * Lưu lịch sử xem tin tuyển dụng
 * @param {string} jobId - ID của tin tuyển dụng
 * @returns {Promise} Response với entry đã lưu
 */
export const saveViewHistory = async (jobId) => {
  try {
    const response = await apiClient.post('/job-view-history', { jobId });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử xem tin tuyển dụng:', error);
    throw error;
  }
};

/**
 * Xóa một mục lịch sử xem
 * @param {string} entryId - ID của mục lịch sử cần xóa
 * @returns {Promise} Response xác nhận xóa thành công
 */
export const deleteViewHistory = async (entryId) => {
  try {
    const response = await apiClient.delete(`/job-view-history/${entryId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử xem:', error);
    throw error;
  }
};

/**
 * Xóa toàn bộ lịch sử xem của người dùng
 * @returns {Promise} Response xác nhận xóa thành công
 */
export const clearAllViewHistory = async () => {
  try {
    const response = await apiClient.delete('/job-view-history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ lịch sử xem:', error);
    throw error;
  }
};

/**
 * Lấy thống kê lịch sử xem
 * @returns {Promise} Response với thống kê
 */
export const getViewHistoryStats = async () => {
  try {
    const response = await apiClient.get('/job-view-history/stats');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy thống kê lịch sử xem:', error);
    throw error;
  }
};

// Export default object chứa tất cả các methods
const viewHistoryService = {
  getViewHistory,
  saveViewHistory,
  deleteViewHistory,
  clearAllViewHistory,
  getViewHistoryStats
};

export default viewHistoryService;
