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
 * Lấy danh sách templates từ backend.
 * @returns {Promise<Array>} Danh sách các template.
 */
export const getTemplates = async () => {
  try {
    console.log('🔄 Fetching templates...');
    const response = await apiClient.get('/templates');
    console.log('✅ Templates fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    throw error;
  }
};

/**
 * Tạo một CV mới từ template.
 * @param {Object} templateData - Dữ liệu template và thông tin CV.
 * @param {string} templateData.templateId - ID của template.
 * @param {string} templateData.title - Tên của CV mới.
 * @returns {Promise<Object>} Dữ liệu CV vừa được tạo.
 */
export const createCvFromTemplate = async (templateData) => {
  try {
    console.log('🔄 Creating CV from template:', templateData);
    
    if (!templateData.templateId || !templateData.title) {
      throw new Error('Missing required fields: templateId and title');
    }
    
    const response = await apiClient.post('/cvs/from-template', templateData);
    console.log('✅ CV created from template:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating CV from template:', error);
    
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      
      // Log the exact error message from backend
      if (error.response.data && error.response.data.message) {
        console.error('Backend error message:', error.response.data.message);
      }
      
      // Try to understand what backend expects
      if (error.response.data && error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
    
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
    console.log('🔄 Exporting PDF for CV ID:', cvId);
    
    const response = await apiClient.post(`/cvs/${cvId}/export-pdf`, {}, {
      responseType: 'blob', // Rất quan trọng để xử lý file tải về
      timeout: 30000, // 30 seconds timeout
    });
    
    console.log('✅ PDF export successful');
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting PDF:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Gọi API để export CV dưới dạng Excel.
 * @param {string} cvId - ID của CV cần export.
 * @returns {Promise<Blob>} - Dữ liệu Excel dưới dạng Blob.
 */
export const exportExcel = async (cvId) => {
  try {
    console.log('🔄 Exporting Excel for CV ID:', cvId);
    
    const response = await apiClient.post(`/cvs/${cvId}/export-excel`, {}, {
      responseType: 'blob',
      timeout: 30000, // 30 seconds timeout
    });
    
    console.log('✅ Excel export successful');
    return response.data;
  } catch (error) {
    console.error('❌ Error exporting Excel:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
    
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
