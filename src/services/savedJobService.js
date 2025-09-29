import apiClient from './apiClient';


/**
 * Lưu một công việc
 * @param {string} jobId - ID của công việc cần lưu
 */
export const saveJob = async (jobId) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/save`);
    return response;
  } catch (error) {
    console.error('Lỗi khi lưu công việc:', error);
    throw error;
  }
};

/**
 * Bỏ lưu một công việc
 * @param {string} jobId - ID của công việc cần bỏ lưu
 */
export const unsaveJob = async (jobId) => {
  try {
    const response = await apiClient.delete(`/jobs/${jobId}/save`);
    // Xóa cache khi có thay đổi
    return response;
  } catch (error) {
    console.error('Lỗi khi bỏ lưu công việc:', error);
    throw error;
  }
};

/**
 * Lấy danh sách công việc đã lưu
 * @param {object} params - Tham số query
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số lượng items mỗi trang
 * @param {string} params.sortBy - Sắp xếp theo
 * @param {string} params.search - Từ khóa tìm kiếm
 */
export const getSavedJobs = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || 'createdAt:desc',
      ...(params.search && { search: params.search }),
    };

    const response = await apiClient.get('/jobs/saved/list', {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công việc đã lưu:', error);
    throw error;
  }
};
