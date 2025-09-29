import apiClient from './apiClient';

/**
 * Lấy danh sách tất cả các CV từ backend.
 * @returns {Promise<Array>} Danh sách các CV.
 */
export const getCvs = async () => {
  try {
    const response = await apiClient.get('/cvs');
    return response.data;
  } catch (error) {
    console.error('Error fetching all CVs:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một CV bằng ID.
 * @param {string} cvId - ID của CV.
 * @returns {Promise<Object>} Dữ liệu chi tiết của CV.
 */
export const getCvById = async (cvId) => {
  try {
    const response = await apiClient.get(`/cvs/${cvId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching CV with ID ${cvId}:`, error);
    throw error;
  }
};

/**
 * Tạo một CV mới trên backend.
 * Backend sẽ tự tạo một CV trống với template được chỉ định.
 * @param {string} templateId - ID của template để tạo CV mới.
 * @returns {Promise<Object>} Dữ liệu CV vừa được tạo.
 */
export const createCv = async (templateId) => {
  try {
    const response = await apiClient.post('/cvs', { templateId });
    return response.data;
  } catch (error) {
    console.error('Error creating new CV:', error);
    throw error;
  }
};

/**
 * Cập nhật một CV đã có.
 * @param {string} cvId - ID của CV cần cập nhật.
 * @param {Object} cvData - Dữ liệu CV cần cập nhật (chỉ bao gồm title và cvData).
 * @returns {Promise<Object>} Dữ liệu CV sau khi đã cập nhật.
 */
export const updateCv = async (cvId, cvData) => {
  try {
    const response = await apiClient.put(`/cvs/${cvId}`, cvData);
    return response.data;
  } catch (error) {
    console.error(`Error updating CV with ID ${cvId}:`, error);
    throw error;
  }
};

/**
 * Gọi API để export CV dưới dạng PDF.
 * @param {string} cvId - ID của CV cần export.
 * @returns {Promise<Blob>} - Dữ liệu PDF dưới dạng Blob.
 */
export const exportPdf = async (cvId) => {
  try {
    const response = await apiClient.post(`/cvs/${cvId}/export-pdf`, {}, {
      responseType: 'blob', // Rất quan trọng để xử lý file tải về
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

/**
 * Xóa một CV dựa trên ID.
 * @param {string} cvId - ID của CV cần xóa.
 * @returns {Promise<Object>} - Tin nhắn xác nhận từ backend.
 */
export const deleteCv = async (cvId) => {
  try {
    const response = await apiClient.delete(`/cvs/${cvId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting CV with ID ${cvId}:`, error);
    throw error;
  }
};
