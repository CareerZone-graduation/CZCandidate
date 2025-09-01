import apiClient from './apiClient';

/**
 * Service để quản lý đăng ký thông báo việc làm theo từ khóa
 * API Endpoints: /job-alerts
 */

// Lấy danh sách job alerts
export const getJobAlerts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.active !== undefined) queryParams.append('active', params.active);
  if (params.keyword) queryParams.append('keyword', params.keyword);
  
  const url = `/job-alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  console.log('🔍 Fetching job alerts:', url);
  
  const response = await apiClient.get(url);
  return response;
};

// Tạo job alert mới
export const createJobAlert = async (alertData) => {
  console.log('🆕 Creating job alert:', alertData);
  const response = await apiClient.post('/job-alerts', alertData);
  return response;
};

// Cập nhật job alert
export const updateJobAlert = async (id, alertData) => {
  console.log('📝 Updating job alert:', id, alertData);
  const response = await apiClient.put(`/job-alerts/${id}`, alertData);
  return response;
};

// Xóa job alert
export const deleteJobAlert = async (id) => {
  console.log('🗑️ Deleting job alert:', id);
  const response = await apiClient.delete(`/job-alerts/${id}`);
  return response;
};

// Bật/tắt trạng thái active của job alert
export const toggleJobAlertStatus = async (id, active) => {
  console.log('🔄 Toggling job alert status:', id, active);
  const response = await apiClient.patch(`/job-alerts/${id}`, { active });
  return response;
};

// Lấy danh sách options cho form
export const getJobAlertOptions = () => {
  return {
    provinces: [
      { value: '', label: 'Tất cả địa điểm' },
      { value: 'Hà Nội', label: 'Hà Nội' },
      { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
      { value: 'Đà Nẵng', label: 'Đà Nẵng' },
      { value: 'Cần Thơ', label: 'Cần Thơ' },
      { value: 'Hải Phòng', label: 'Hải Phòng' },
      { value: 'Bình Dương', label: 'Bình Dương' },
      { value: 'Đồng Nai', label: 'Đồng Nai' },
      { value: 'Khánh Hòa', label: 'Khánh Hòa' },
      { value: 'Lâm Đồng', label: 'Lâm Đồng' },
      { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' }
    ],
    frequencies: [
      { value: 'daily', label: 'Hàng ngày' },
      { value: 'weekly', label: 'Hàng tuần' },
      { value: 'monthly', label: 'Hàng tháng' }
    ],
    salaryRanges: [
      { value: '', label: 'Tất cả mức lương' },
      { value: 'UNDER_10M', label: 'Dưới 10 triệu' },
      { value: '10M_15M', label: '10-15 triệu' },
      { value: '15M_20M', label: '15-20 triệu' },
      { value: '20M_30M', label: '20-30 triệu' },
      { value: '30M_50M', label: '30-50 triệu' },
      { value: 'ABOVE_50M', label: 'Trên 50 triệu' },
      { value: 'NEGOTIABLE', label: 'Thỏa thuận' }
    ],
    jobTypes: [
      { value: '', label: 'Tất cả loại hình' },
      { value: 'FULL_TIME', label: 'Toàn thời gian' },
      { value: 'PART_TIME', label: 'Bán thời gian' },
      { value: 'INTERNSHIP', label: 'Thực tập' },
      { value: 'CONTRACT', label: 'Hợp đồng' }
    ],
    workTypes: [
      { value: '', label: 'Tất cả hình thức' },
      { value: 'ON_SITE', label: 'Tại văn phòng' },
      { value: 'REMOTE', label: 'Làm việc từ xa' },
      { value: 'HYBRID', label: 'Hybrid' }
    ],
    experiences: [
      { value: '', label: 'Tất cả cấp độ' },
      { value: 'INTERNSHIP', label: 'Thực tập sinh' },
      { value: 'FRESHER', label: 'Fresher' },
      { value: 'JUNIOR_LEVEL', label: 'Junior' },
      { value: 'MIDDLE_LEVEL', label: 'Middle' },
      { value: 'SENIOR_LEVEL', label: 'Senior' },
      { value: 'LEAD_LEVEL', label: 'Lead' },
      { value: 'MANAGER_LEVEL', label: 'Manager' }
    ],
    categories: [
      { value: '', label: 'Tất cả ngành nghề' },
      { value: 'SOFTWARE_DEVELOPMENT', label: 'Phát triển phần mềm' },
      { value: 'WEB_DEVELOPMENT', label: 'Phát triển web' },
      { value: 'MOBILE_DEVELOPMENT', label: 'Phát triển mobile' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      { value: 'DEVOPS', label: 'DevOps' },
      { value: 'UI_UX_DESIGN', label: 'Thiết kế UI/UX' },
      { value: 'PRODUCT_MANAGEMENT', label: 'Quản lý sản phẩm' },
      { value: 'MARKETING', label: 'Marketing' },
      { value: 'SALES', label: 'Kinh doanh' },
      { value: 'HR', label: 'Nhân sự' }
    ]
  };
};

export default {
  getJobAlerts,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  toggleJobAlertStatus,
  getJobAlertOptions
};