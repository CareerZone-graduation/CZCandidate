import apiClient from './apiClient';

/**
 * Lấy lịch sử tìm kiếm của người dùng
 * @param {object} params - Tham số query
 * @param {number} params.limit - Số lượng items mỗi trang (default: 10, max: 50)
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @returns {Promise} Response với data và pagination
 */
export const getUserHistory = async ({ limit = 10, page = 1 } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', Math.min(limit, 50)); // Giới hạn tối đa 50
    if (page) queryParams.append('page', page);

    const url = `/search-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử tìm kiếm:', error);
    throw error;
  }
};



/**
 * Lưu lịch sử tìm kiếm
 * @param {object} searchData - Dữ liệu tìm kiếm
 * @param {string} searchData.query - Từ khóa tìm kiếm
 * @returns {Promise} Response với entry đã lưu
 */
export const saveHistory = async (searchData) => {
  try {
    const response = await apiClient.post('/search-history', searchData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử tìm kiếm:', error);
    throw error;
  }
};

/**
 * Xóa một mục lịch sử tìm kiếm
 * @param {string} entryId - ID của mục lịch sử cần xóa
 * @returns {Promise} Response xác nhận xóa thành công
 */
export const deleteHistory = async (entryId) => {
  try {
    const response = await apiClient.delete(`/search-history/${entryId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa lịch sử tìm kiếm:', error);
    throw error;
  }
};

/**
 * Xóa toàn bộ lịch sử tìm kiếm của người dùng
 * @returns {Promise} Response xác nhận xóa thành công
 */
export const clearAllHistory = async () => {
  try {
    const response = await apiClient.delete('/search-history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ lịch sử tìm kiếm:', error);
    throw error;
  }
};

// Export default object chứa tất cả các methods
const searchHistoryService = {
  getUserHistory,
  saveHistory,
  deleteHistory,
  clearAllHistory
};

export default searchHistoryService;
