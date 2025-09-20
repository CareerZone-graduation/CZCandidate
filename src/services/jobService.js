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