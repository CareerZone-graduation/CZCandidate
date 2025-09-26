import apiClient from './apiClient';

// Lấy tất cả việc làm với filter và pagination
export const getAllJobs = async (params = {}) => {
  const queryParams = new URLSearchParams();  
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.location) queryParams.append('location', params.location);
  if (params.experience) queryParams.append('experience', params.experience);
  if (params.salary) queryParams.append('salary', params.salary);
  if (params.jobType) queryParams.append('jobType', params.jobType);
  if (params.workType) queryParams.append('workType', params.workType);
  if (params.featured) queryParams.append('featured', params.featured);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const url = `/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response;
};

// Lấy chi tiết một việc làm
export const getJobById = async (jobId) => {
  // The Authorization header is included by the apiClient interceptor
  const response = await apiClient.get(`/jobs/${jobId}`);
  return response;
};

// Lấy việc làm gợi ý cho người dùng
export const getJobSuggestions = async (params = {}) => {
  const response = await apiClient.get('/jobs/suggestions', { params });
  return response;
};

// Lưu việc làm
export const saveJob = async (jobId) => {
  const response = await apiClient.post(`/jobs/${jobId}/save`);
  return response;
};

// Bỏ lưu việc làm
export const unsaveJob = async (jobId) => {
  const response = await apiClient.delete(`/jobs/${jobId}/save`);
  return response;
};

// Ứng tuyển việc làm
export const applyJob = async (jobId, applicationData) => {
  const response = await apiClient.post(`/jobs/${jobId}/apply`, applicationData);
  return response;
};

// Lấy số lượng ứng viên đã apply vào công việc
export const getJobApplicantCount = async (jobId) => {
  const response = await apiClient.post(`/jobs/${jobId}/applicant-count`);
  return response;
};

// Lấy danh sách ID các job đã ứng tuyển
export const getAppliedJobIds = async () => {
  const response = await apiClient.get('/candidate/applied-jobs-ids');
  return response.data;
};

// Lấy danh sách đơn ứng tuyển chi tiết
export const getMyApplications = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  
  const url = `/candidate/my-applications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

// Lấy chi tiết một đơn ứng tuyển
export const getApplicationById = async (applicationId) => {
  const response = await apiClient.get(`/candidate/my-applications/${applicationId}`);
  return response.data.data;
};

// Lấy danh sách công việc đã lưu
export const getSavedJobs = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  
  const url = `/jobs/saved/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get(url);
  return response.data;
};

// Lấy gợi ý tự động cho tiêu đề công việc
export const getJobTitleSuggestions = async (query, limit = 10) => {
  try {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('query', query.trim());
    if (limit) queryParams.append('limit', Math.min(limit, 20)); // Giới hạn tối đa 20
    
    const url = `/jobs/autocomplete/titles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching job title suggestions:', error);
    // Trả về empty array để component có thể hoạt động bình thường
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Không thể tải gợi ý'
    };
  }
};

// Tìm kiếm hybrid với MongoDB Atlas Search
export const searchJobsHybrid = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    if (params.query) queryParams.append('query', params.query);
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    
    // Optional filter parameters
    if (params.category) queryParams.append('category', params.category);
    if (params.type) queryParams.append('type', params.type);
    if (params.workType) queryParams.append('workType', params.workType);
    if (params.experience) queryParams.append('experience', params.experience);
    if (params.province) queryParams.append('province', params.province);
    if (params.district) queryParams.append('district', params.district);
    if (params.minSalary) queryParams.append('minSalary', params.minSalary);
    if (params.maxSalary) queryParams.append('maxSalary', params.maxSalary);
    if (params.userLocation) queryParams.append('userLocation', params.userLocation);
    
    const url = `/search/hybrid${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error performing hybrid search:', error);
    throw error;
  }
};