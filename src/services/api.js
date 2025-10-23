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
 * Tạo một CV mới với template được chỉ định.
 * Backend sẽ tự tạo một CV trống với template được chỉ định.
 * @param {string} templateId - ID của template để tạo CV mới (e.g., 'modern-blue').
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
 * Tạo một CV mới từ một template có sẵn, gửi kèm dữ liệu ban đầu.
 * 
 * NAMING CONVENTION:
 * - Backend uses 'title' field in database
 * - Frontend uses 'name' for display (mapped via virtual field)
 * - When sending to backend, use 'title' in request body
 * - When receiving from backend, use 'name' from response (virtual field)
 * 
 * @param {Object} data - Dữ liệu để tạo CV.
 * @param {string} data.templateId - ID của template.
 * @param {Object} data.cvData - Dữ liệu CV ban đầu.
 * @param {string} data.title - Tên/tiêu đề của CV (backend field).
 * @returns {Promise<Object>} Dữ liệu CV vừa được tạo (includes 'name' virtual field).
 */
export const createCvFromTemplate = async (data) => {
  try {
    const response = await apiClient.post('/cvs/from-template', data);
    return response.data;
  } catch (error) {
    console.error('Error creating CV from template:', error);
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
    const response = await apiClient.get(`/cvs/${cvId}/export-pdf`, {
      responseType: 'blob', // Quan trọng: nhận về dữ liệu dạng file
      timeout: 30000, // 30 seconds timeout for PDF generation
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    console.log('Error details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Lấy URL để xem CV dạng PDF
 * @param {string} cvId - ID của CV
 * @returns {string} URL để xem PDF
 */
export const getCvPdfUrl = (cvId) => {
  const token = localStorage.getItem('token');
  return `${import.meta.env.VITE_API_URL}/cvs/${cvId}/export-pdf?token=${token}`;
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

/**
 * Duplicates a CV.
 * 
 * NAMING CONVENTION:
 * - Sends 'name' to backend
 * - Backend controller saves it as 'title' field
 * - Response includes 'name' virtual field for frontend use
 * 
 * @param {string} cvId - The ID of the CV to duplicate.
 * @param {string} name - The name for the new duplicated CV (will be saved as 'title' in DB).
 * @returns {Promise<Object>} The data of the newly created CV (includes 'name' virtual field).
 */
export const duplicateCv = async (cvId, name) => {
  try {
    const response = await apiClient.post(`/cvs/${cvId}/duplicate`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error duplicating CV with ID ${cvId}:`, error);
    throw error;
  }
};

/**
 * Renames a CV.
 * 
 * NAMING CONVENTION:
 * - Sends 'name' to backend PATCH endpoint
 * - Backend controller maps 'name' to 'title' field
 * - Response includes 'name' virtual field for frontend use
 * 
 * @param {string} cvId - The ID of the CV to rename.
 * @param {string} name - The new name for the CV (will be saved as 'title' in DB).
 * @returns {Promise<Object>} The updated CV data (includes 'name' virtual field).
 */
export const renameCv = async (cvId, name) => {
  try {
    const response = await apiClient.patch(`/cvs/${cvId}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error renaming CV with ID ${cvId}:`, error);
    throw error;
  }
};
