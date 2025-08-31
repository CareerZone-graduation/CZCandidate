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
    return response;
  } catch (error) {
    console.error('Lỗi khi bỏ lưu công việc:', error);
    throw error;
  }
};

/**
 * Lấy danh sách công việc đã lưu
 * @param {Object} params - Tham số query
 * @param {string} params.sortBy - Sắp xếp theo (mặc định: createdAt:asc)
 * @param {number} params.page - Trang hiện tại (mặc định: 1)
 * @param {number} params.limit - Số lượng items per page (mặc định: 5)
 */
export const getSavedJobs = async (params = {}) => {
  try {
    // Thiết lập tham số mặc định
    const defaultParams = {
      sortBy: 'createdAt:asc',
      page: 1,
      limit: 5,
      ...params
    };

    const response = await apiClient.get('/jobs/saved/list', { 
      params: defaultParams 
    });
    return response;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công việc đã lưu:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem một công việc đã được lưu chưa
 * @param {string} jobId - ID của công việc cần kiểm tra
 * @returns {boolean} - true nếu đã lưu, false nếu chưa lưu
 */
export const checkJobSaved = async (jobId) => {
  try {
    // Thử gọi API check trực tiếp trước (nếu backend có hỗ trợ)
    const response = await apiClient.get(`/jobs/${jobId}/saved-status`);
    return response.data.data?.isSaved || false;
  } catch (error) {
    // Nếu API check không có, sẽ kiểm tra từ danh sách saved jobs
    console.warn('API check saved status không có, sẽ kiểm tra từ danh sách:', error);
    
    try {
      const savedJobs = await getSavedJobs({ page: 1, limit: 100 }); // Lấy nhiều để check chính xác
      
      // Sử dụng cấu trúc dữ liệu mới: savedJobs.data.data là array trực tiếp
      const isSaved = savedJobs.data.data?.some(savedJob => {
        // Kiểm tra với jobId field (cấu trúc mới)
        return savedJob.jobId === jobId || savedJob.job?._id === jobId || savedJob._id === jobId;
      });
      
      return isSaved || false;
    } catch (listError) {
      console.error('Lỗi khi kiểm tra trạng thái lưu công việc:', listError);
      return false; // Nếu có lỗi, mặc định là chưa lưu
    }
  }
};