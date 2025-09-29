import apiClient from './apiClient';

// Cache để lưu trữ danh sách job IDs đã lưu
let savedJobsCache = {
  data: new Set(),
  lastFetch: 0,
  ttl: 30000 // 30 seconds cache
};

/**
 * Xóa cache khi có thay đổi (save/unsave)
 */
export const clearSavedJobsCache = () => {
  savedJobsCache.data.clear();
  savedJobsCache.lastFetch = 0;
};

/**
 * Lưu một công việc
 * @param {string} jobId - ID của công việc cần lưu
 */
export const saveJob = async (jobId) => {
  try {
    const response = await apiClient.post(`/jobs/${jobId}/save`);
    // Xóa cache khi có thay đổi
    clearSavedJobsCache();
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
    clearSavedJobsCache();
    return response;
  } catch (error) {
    console.error('Lỗi khi bỏ lưu công việc:', error);
    throw error;
  }
};

/**
 * Lấy danh sách công việc đã lưu (API gốc)
 * @param {Object} params - Tham số query
 */
const getSavedJobsRaw = async (params = {}) => {
  try {
    const defaultParams = {
      sortBy: 'createdAt:desc',
      page: 1,
      limit: 10, // Backend force về 10
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
 * Lấy danh sách công việc đã lưu với virtual pagination (12 items/page)
 * @param {Object} params - Tham số query
 * @param {number} params.page - Trang hiện tại (virtual page)
 * @param {number} params.limit - Số lượng items mong muốn (12)
 * @param {string} params.sortBy - Sắp xếp theo
 */
export const getSavedJobs = async (params = {}) => {
  try {
    const virtualPage = params.page || 1;
    const virtualLimit = params.limit || 12;
    const backendLimit = 10; // Backend giới hạn cố định
    
    console.log('Virtual pagination request:', { virtualPage, virtualLimit });
    
    // Tính toán backend pages cần lấy để có đủ virtualLimit items
    const startIndex = (virtualPage - 1) * virtualLimit; // Index bắt đầu (0-based)
    const endIndex = startIndex + virtualLimit - 1; // Index kết thúc
    
    const startBackendPage = Math.floor(startIndex / backendLimit) + 1;
    const endBackendPage = Math.floor(endIndex / backendLimit) + 1;
    
    console.log('Backend pages needed:', { startBackendPage, endBackendPage, startIndex, endIndex });
    
    // Lấy dữ liệu từ nhiều backend pages
    const allJobs = [];
    let totalItems = 0;
    let totalPages = 0;
    
    for (let backendPage = startBackendPage; backendPage <= endBackendPage; backendPage++) {
      const response = await getSavedJobsRaw({
        page: backendPage,
        limit: backendLimit,
        sortBy: params.sortBy || 'createdAt:desc'
      });
      
      if (response.data.success) {
        const jobs = response.data.data || [];
        allJobs.push(...jobs);
        
        // Lấy meta từ response đầu tiên
        if (backendPage === startBackendPage) {
          totalItems = response.data.meta?.totalItems || 0;
          // Tính virtual totalPages
          totalPages = Math.ceil(totalItems / virtualLimit);
        }
      }
    }
    
    // Cắt dữ liệu theo virtual pagination
    const startSlice = startIndex % (startBackendPage * backendLimit - backendLimit);
    const virtualJobs = allJobs.slice(startSlice, startSlice + virtualLimit);
    
    console.log(`Virtual page ${virtualPage}: Got ${virtualJobs.length}/${virtualLimit} jobs from ${allJobs.length} total fetched`);
    
    // Tạo virtual response
    const virtualResponse = {
      data: {
        success: true,
        message: 'Lấy danh sách công việc thành công.',
        meta: {
          currentPage: virtualPage,
          totalPages: totalPages,
          totalItems: totalItems,
          limit: virtualLimit,
          actualItemsInPage: virtualJobs.length
        },
        data: virtualJobs
      }
    };
    
    return virtualResponse;
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công việc đã lưu (virtual):', error);
    throw error;
  }
};
