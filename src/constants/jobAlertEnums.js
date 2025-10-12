// Job Alert Enums matching backend

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
];

export const SALARY_RANGE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả mức lương' },
  { value: 'UNDER_10M', label: 'Dưới 10 triệu' },
  { value: '10M_20M', label: '10 - 20 triệu' },
  { value: '20M_30M', label: '20 - 30 triệu' },
  { value: 'OVER_30M', label: 'Trên 30 triệu' },
];

export const JOB_TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả loại hình' },
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'CONTRACT', label: 'Hợp đồng' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
  { value: 'TEMPORARY', label: 'Tạm thời' },
  { value: 'VOLUNTEER', label: 'Tình nguyện' },
  { value: 'FREELANCE', label: 'Freelance' },
];

export const WORK_TYPE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả hình thức' },
  { value: 'ON_SITE', label: 'Tại văn phòng' },
  { value: 'REMOTE', label: 'Từ xa' },
  { value: 'HYBRID', label: 'Kết hợp' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'ALL', label: 'Tất cả kinh nghiệm' },
  { value: 'NO_EXPERIENCE', label: 'Không yêu cầu' },
  { value: 'INTERN', label: 'Thực tập sinh' },
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'ENTRY_LEVEL', label: 'Junior' },
  { value: 'MID_LEVEL', label: 'Middle' },
  { value: 'SENIOR_LEVEL', label: 'Senior' },
  { value: 'EXECUTIVE', label: 'Quản lý' },
];

export const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Tất cả ngành nghề' },
  { value: 'IT', label: 'Công nghệ thông tin' },
  { value: 'SOFTWARE_DEVELOPMENT', label: 'Phát triển phần mềm' },
  { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu' },
  { value: 'MACHINE_LEARNING', label: 'Machine Learning' },
  { value: 'WEB_DEVELOPMENT', label: 'Phát triển Web' },
  { value: 'SALES', label: 'Kinh doanh' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'ACCOUNTING', label: 'Kế toán' },
  { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa' },
  { value: 'CONTENT_WRITING', label: 'Viết nội dung' },
  { value: 'MEDICAL', label: 'Y tế' },
  { value: 'TEACHING', label: 'Giáo dục' },
  { value: 'ENGINEERING', label: 'Kỹ thuật' },
  { value: 'PRODUCTION', label: 'Sản xuất' },
  { value: 'LOGISTICS', label: 'Logistics' },
  { value: 'HOSPITALITY', label: 'Khách sạn - Nhà hàng' },
  { value: 'REAL_ESTATE', label: 'Bất động sản' },
  { value: 'LAW', label: 'Luật' },
  { value: 'FINANCE', label: 'Tài chính' },
  { value: 'HUMAN_RESOURCES', label: 'Nhân sự' },
  { value: 'CUSTOMER_SERVICE', label: 'Dịch vụ khách hàng' },
  { value: 'ADMINISTRATION', label: 'Hành chính' },
  { value: 'MANAGEMENT', label: 'Quản lý' },
  { value: 'OTHER', label: 'Khác' },
];

export const NOTIFICATION_METHOD_OPTIONS = [
  { value: 'APPLICATION', label: 'Trong ứng dụng' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'BOTH', label: 'Cả hai' },
];

// Helper functions to get label from value
export const getFrequencyLabel = (value) => {
  return FREQUENCY_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getSalaryRangeLabel = (value) => {
  return SALARY_RANGE_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getJobTypeLabel = (value) => {
  return JOB_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getWorkTypeLabel = (value) => {
  return WORK_TYPE_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getExperienceLabel = (value) => {
  return EXPERIENCE_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getCategoryLabel = (value) => {
  return CATEGORY_OPTIONS.find(opt => opt.value === value)?.label || value;
};

export const getNotificationMethodLabel = (value) => {
  return NOTIFICATION_METHOD_OPTIONS.find(opt => opt.value === value)?.label || value;
};
