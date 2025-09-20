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
  const response = await apiClient.get(url);
  return response;
};

// THÊM MỚI: Tạo job alert mới
export const createJobAlert = async (alertData) => {
  console.log('🆕 Creating job alert:', alertData);
  const response = await apiClient.post('/job-alerts', alertData);
  return response; // Giờ đây apiClient tự trả về response.data
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

// CHỈNH SỬA: Lấy danh sách options cho form để khớp với backend ứng viên
export const getJobAlertOptions = () => {
  return {
    frequencies: [
      { value: 'daily', label: 'Hàng ngày' },
      { value: 'weekly', label: 'Hàng tuần' },
    ],
    salaryRanges: [
      { value: 'ALL', label: 'Tất cả mức lương' },
      { value: 'UNDER_10M', label: 'Dưới 10 triệu' },
      { value: '10M_20M', label: '10-20 triệu' }, // Thay đổi giá trị cho khớp backend
      { value: '20M_30M', label: '20-30 triệu' }, // Thay đổi giá trị cho khớp backend
      { value: 'OVER_30M', label: 'Trên 30 triệu' }, // Thay đổi giá trị cho khớp backend
    ],
    jobTypes: [
      { value: 'ALL', label: 'Tất cả loại hình' },
      { value: 'FULL_TIME', label: 'Toàn thời gian' },
      { value: 'PART_TIME', label: 'Bán thời gian' },
      { value: 'INTERNSHIP', label: 'Thực tập' },
      // ... thêm các loại khác từ schema
    ],
    workTypes: [
      { value: 'ALL', label: 'Tất cả hình thức' },
      { value: 'ON_SITE', label: 'Tại văn phòng' },
      { value: 'REMOTE', label: 'Làm việc từ xa' },
      { value: 'HYBRID', label: 'Hybrid' },
    ],
    experiences: [
      { value: 'ALL', label: 'Tất cả cấp độ' },
      { value: 'NO_EXPERIENCE', label: 'Không yêu cầu kinh nghiệm' },
      { value: 'INTERN', label: 'Thực tập sinh' },
      { value: 'FRESHER', label: 'Fresher' },
      { value: 'ENTRY_LEVEL', label: 'Entry Level' },
      { value: 'MID_LEVEL', label: 'Mid Level' },
      { value: 'SENIOR_LEVEL', label: 'Senior Level' },
      { value: 'EXECUTIVE', label: 'Executive' },
    ],
    categories: [
      { value: 'ALL', label: 'Tất cả ngành nghề' },
      { value: 'SOFTWARE_DEVELOPMENT', label: 'Phát triển phần mềm' },
      { value: 'WEB_DEVELOPMENT', label: 'Phát triển web' },
      { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
      // ... thêm các ngành nghề khác từ schema
    ],
  };
};

export default {
  getJobAlerts,
  updateJobAlert,
  deleteJobAlert,
  toggleJobAlertStatus,
  createJobAlert, // Thêm export
  getJobAlertOptions,
};