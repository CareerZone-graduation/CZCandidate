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

// Ứng tuyển lại việc làm
export const reapplyJob = async (jobId, applicationData) => {
  const response = await apiClient.post(`/jobs/${jobId}/reapply`, applicationData);
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
    if (params.query !== undefined && params.query !== null) {
      queryParams.append('query', params.query); // Include even if empty string
    }
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

    // Location distance filter parameters
    if (params.latitude !== undefined && params.latitude !== null) queryParams.append('latitude', params.latitude);
    if (params.longitude !== undefined && params.longitude !== null) queryParams.append('longitude', params.longitude);
    if (params.distance) queryParams.append('distance', params.distance);

    const url = `/jobs/search/hybrid${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Final URL:', url);
    console.log('Query params string:', queryParams.toString());
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error performing hybrid search:', error);
    throw error;
  }
};

// Lấy danh sách các lĩnh vực công việc
export const getJobCategories = async () => {
  try {
    const response = await apiClient.get('/jobs/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching job categories:', error);
    // Return static data as fallback
    return {
      success: true,
      data: [
        { value: 'TECHNOLOGY', label: 'Công nghệ thông tin', count: 0 },
        { value: 'MARKETING', label: 'Marketing & PR', count: 0 },
        { value: 'FINANCE', label: 'Tài chính & Kế toán', count: 0 },
        { value: 'SALES', label: 'Kinh doanh & Bán hàng', count: 0 },
        { value: 'DESIGN', label: 'Thiết kế', count: 0 },
        { value: 'HUMAN_RESOURCES', label: 'Nhân sự', count: 0 },
        { value: 'EDUCATION', label: 'Giáo dục & Đào tạo', count: 0 },
        { value: 'HEALTHCARE', label: 'Y tế & Sức khỏe', count: 0 },
        { value: 'OTHER', label: 'Khác', count: 0 }
      ]
    };
  }
};

// Lấy danh sách loại hình công việc
export const getJobTypes = async () => {
  try {
    const response = await apiClient.get('/jobs/types');
    return response.data;
  } catch (error) {
    console.error('Error fetching job types:', error);
    // Return static data as fallback
    return {
      success: true,
      data: [
        { value: 'FULL_TIME', label: 'Toàn thời gian', count: 0 },
        { value: 'PART_TIME', label: 'Bán thời gian', count: 0 },
        { value: 'CONTRACT', label: 'Hợp đồng', count: 0 },
        { value: 'TEMPORARY', label: 'Tạm thời', count: 0 },
        { value: 'INTERNSHIP', label: 'Thực tập', count: 0 },
        { value: 'FREELANCE', label: 'Tự do', count: 0 }
      ]
    };
  }
};

// Lấy danh sách hình thức làm việc
export const getWorkTypes = async () => {
  try {
    const response = await apiClient.get('/jobs/work-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching work types:', error);
    // Return static data as fallback
    return {
      success: true,
      data: [
        { value: 'ON_SITE', label: 'Tại văn phòng', count: 0 },
        { value: 'REMOTE', label: 'Làm việc từ xa', count: 0 },
        { value: 'HYBRID', label: 'Kết hợp', count: 0 }
      ]
    };
  }
};

// Lấy danh sách mức kinh nghiệm
export const getExperienceLevels = async () => {
  try {
    const response = await apiClient.get('/jobs/experience-levels');
    return response.data;
  } catch (error) {
    console.error('Error fetching experience levels:', error);
    // Return static data as fallback
    return {
      success: true,
      data: [
        { value: 'FRESH', label: 'Sinh viên mới tốt nghiệp', count: 0 },
        { value: 'JUNIOR', label: 'Dưới 1 năm', count: 0 },
        { value: 'MID_LEVEL', label: '1-3 năm', count: 0 },
        { value: 'SENIOR', label: '3-5 năm', count: 0 },
        { value: 'EXPERT', label: 'Trên 5 năm', count: 0 },
        { value: 'MANAGER', label: 'Quản lý', count: 0 },
        { value: 'DIRECTOR', label: 'Giám đốc', count: 0 }
      ]
    };
  }
};

// Lấy thống kê tìm kiếm
export const getSearchStats = async (query) => {
  try {
    const queryParams = new URLSearchParams();
    if (query) queryParams.append('query', query);

    const url = `/search/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching search stats:', error);
    return {
      success: false,
      data: {
        totalJobs: 0,
        totalCompanies: 0,
        averageSalary: 0,
        topCategories: []
      }
    };
  }
};

// Helper function để format search parameters cho URL
export const formatSearchParams = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

// Helper function để parse search parameters từ URL
export const parseSearchParams = (searchString) => {
  const params = new URLSearchParams(searchString);
  const result = {};

  for (const [key, value] of params) {
    // Convert numeric parameters
    if (['page', 'size', 'minSalary', 'maxSalary'].includes(key)) {
      result[key] = parseInt(value) || undefined;
    } else {
      result[key] = value || undefined;
    }
  }

  return result;
};

// Tìm kiếm công việc theo bounding box trên bản đồ (dùng khi zoom >= 12)
export const searchJobsOnMap = async (bounds) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('sw_lat', bounds.sw_lat);
    queryParams.append('sw_lng', bounds.sw_lng);
    queryParams.append('ne_lat', bounds.ne_lat);
    queryParams.append('ne_lng', bounds.ne_lng);

    // Luôn tuân thủ giới hạn của backend (max 50)
    if (bounds.limit && bounds.limit <= 50) {
      queryParams.append('limit', bounds.limit);
    } else {
      queryParams.append('limit', '50'); // Default safe limit
    }

    // Thêm các filters bổ sung
    if (bounds.query) queryParams.append('query', bounds.query);
    if (bounds.category) queryParams.append('category', bounds.category);
    if (bounds.experience) queryParams.append('experience', bounds.experience);
    if (bounds.type) queryParams.append('type', bounds.type);
    if (bounds.workType) queryParams.append('workType', bounds.workType);
    if (bounds.province) queryParams.append('province', bounds.province);
    if (bounds.district) queryParams.append('district', bounds.district);
    if (bounds.minSalary) queryParams.append('minSalary', bounds.minSalary);
    if (bounds.maxSalary) queryParams.append('maxSalary', bounds.maxSalary);

    const url = `/jobs/map-search?${queryParams.toString()}`;
    const response = await apiClient.get(url);

    // Response structure: { success: true, data: [...], meta: {...} }
    return response.data;
  } catch (error) {
    console.error('Error searching jobs on map:', error);
    throw error;
  }
};

// Lấy cụm công việc cho bản đồ (clustering) - dùng khi zoom < 12
// Backend trả về mảng phẳng: [{ type: 'cluster', ... }, { type: 'single', ... }]
export const getJobClusters = async (bounds, zoom) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('sw_lat', bounds.sw_lat);
    queryParams.append('sw_lng', bounds.sw_lng);
    queryParams.append('ne_lat', bounds.ne_lat);
    queryParams.append('ne_lng', bounds.ne_lng);
    queryParams.append('zoom', zoom);

    // Thêm các filters bổ sung
    if (bounds.query) queryParams.append('query', bounds.query);
    if (bounds.category) queryParams.append('category', bounds.category);
    if (bounds.experience) queryParams.append('experience', bounds.experience);
    if (bounds.type) queryParams.append('type', bounds.type);
    if (bounds.workType) queryParams.append('workType', bounds.workType);
    if (bounds.province) queryParams.append('province', bounds.province);
    if (bounds.district) queryParams.append('district', bounds.district);
    if (bounds.minSalary) queryParams.append('minSalary', bounds.minSalary);
    if (bounds.maxSalary) queryParams.append('maxSalary', bounds.maxSalary);

    const url = `/jobs/map-clusters?${queryParams.toString()}`;
    const response = await apiClient.get(url);

    // Response structure: { success: true, data: [...] }
    // data là mảng phẳng chứa cả clusters và single jobs
    return response.data.data;
  } catch (error) {
    console.error('Error fetching job clusters:', error);
    throw error;
  }
};


// Lấy các cụm công việc trên bản đồ
export const getMapClusters = async (bounds) => {
  const { sw_lat, sw_lng, ne_lat, ne_lng, zoom, ...filters } = bounds;
  const queryParams = new URLSearchParams({
    sw_lat: sw_lat.toString(),
    sw_lng: sw_lng.toString(),
    ne_lat: ne_lat.toString(),
    ne_lng: ne_lng.toString(),
    zoom: zoom.toString(),
  });

  // Thêm các filters bổ sung nếu có
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.workType) queryParams.append('workType', filters.workType);
  if (filters.experience) queryParams.append('experience', filters.experience);
  if (filters.province) queryParams.append('province', filters.province);
  if (filters.district) queryParams.append('district', filters.district);

  const response = await apiClient.get(`/jobs/map-clusters?${queryParams.toString()}`);
  return response.data;
};

// Lấy danh sách công việc cùng công ty
export const getJobsByCompany = async (companyId, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.excludeId) queryParams.append('excludeId', params.excludeId);

    const url = `/companies/${companyId}/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs by company:', error);
    throw error;
  }
};


// Phản hồi lời đề nghị (Accept/Decline)
export const respondToOffer = async (applicationId, status) => {
  const response = await apiClient.patch(`/candidate/my-applications/${applicationId}/respond`, { status });
  return response.data;
};

// Get multiple jobs by their IDs (for job alert notifications)
export const getJobsByIds = async (ids) => {
  const response = await apiClient.post('/jobs/by-ids', { ids });
  return response.data.data;
};
