import apiClient from './apiClient';

/**
 * Lấy danh sách tất cả công ty với filter và pagination
 * @param {Object} params - Query parameters
 * @returns {Promise} Response data
 */
export const getAllCompanies = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.industry) queryParams.append('industry', params.industry);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const url = `/companies${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response;
};

/**
 * Lấy chi tiết một công ty theo ID
 * @param {string} companyId - ID của công ty
 * @returns {Promise} Response data
 */
export const getCompanyById = async (companyId) => {
  const response = await apiClient.get(`/companies/${companyId}`);
  return response;
};

/**
 * Lấy danh sách việc làm của một công ty
 * @param {string} companyId - ID của công ty
 * @param {Object} params - Query parameters (page, limit, province, sortBy)
 * @returns {Promise} Response data
 */
export const getCompanyJobs = async (companyId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.province) queryParams.append('province', params.province);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.search) queryParams.append('search', params.search);

  const url = `/companies/${companyId}/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response;
};

/**
 * Lấy thông tin công ty của recruiter đang đăng nhập
 * @returns {Promise} Response data
 */
export const getMyCompany = async () => {
  const response = await apiClient.get('/companies/my-company');
  return response;
};

/**
 * Tạo công ty mới (cho recruiter)
 * @param {FormData} formData - Form data chứa thông tin công ty
 * @returns {Promise} Response data
 */
export const createCompany = async (formData) => {
  const response = await apiClient.post('/companies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

/**
 * Cập nhật thông tin công ty (cho recruiter)
 * @param {FormData} formData - Form data chứa thông tin cập nhật
 * @returns {Promise} Response data
 */
export const updateMyCompany = async (formData) => {
  const response = await apiClient.patch('/companies/my-company', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};

/**
 * Cập nhật logo công ty (cho recruiter)
 * @param {FormData} formData - Form data chứa file logo
 * @returns {Promise} Response data
 */
export const updateCompanyLogo = async (formData) => {
  const response = await apiClient.post('/companies/my-company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response;
};
