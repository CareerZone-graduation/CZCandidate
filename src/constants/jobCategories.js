/**
 * Job Categories Constants
 * Danh sách các ngành nghề và labels tiếng Việt
 */

export const JOB_CATEGORIES = [
  { value: 'IT', label: 'Công nghệ thông tin', icon: '💻' },
  { value: 'SOFTWARE_DEVELOPMENT', label: 'Phát triển phần mềm', icon: '⚙️' },
  { value: 'DATA_SCIENCE', label: 'Khoa học dữ liệu', icon: '📊' },
  { value: 'MACHINE_LEARNING', label: 'Machine Learning/AI', icon: '🤖' },
  { value: 'WEB_DEVELOPMENT', label: 'Phát triển Web', icon: '🌐' },
  { value: 'SALES', label: 'Kinh doanh/Bán hàng', icon: '💼' },
  { value: 'MARKETING', label: 'Marketing', icon: '📣' },
  { value: 'ACCOUNTING', label: 'Kế toán', icon: '💰' },
  { value: 'GRAPHIC_DESIGN', label: 'Thiết kế đồ họa', icon: '🎨' },
  { value: 'CONTENT_WRITING', label: 'Biên tập nội dung', icon: '✍️' },
  { value: 'MEDICAL', label: 'Y tế/Chăm sóc sức khỏe', icon: '⚕️' },
  { value: 'TEACHING', label: 'Giáo dục/Đào tạo', icon: '👨‍🏫' },
  { value: 'ENGINEERING', label: 'Kỹ thuật/Công nghệ', icon: '🔧' },
  { value: 'PRODUCTION', label: 'Sản xuất', icon: '🏭' },
  { value: 'LOGISTICS', label: 'Logistics/Vận chuyển', icon: '🚚' },
  { value: 'HOSPITALITY', label: 'Khách sạn/Du lịch', icon: '🏨' },
  { value: 'REAL_ESTATE', label: 'Bất động sản', icon: '🏢' },
  { value: 'LAW', label: 'Luật/Pháp lý', icon: '⚖️' },
  { value: 'FINANCE', label: 'Tài chính/Ngân hàng', icon: '🏦' },
  { value: 'HUMAN_RESOURCES', label: 'Nhân sự', icon: '👥' },
  { value: 'CUSTOMER_SERVICE', label: 'Dịch vụ khách hàng', icon: '📞' },
  { value: 'ADMINISTRATION', label: 'Hành chính/Văn phòng', icon: '📋' },
  { value: 'MANAGEMENT', label: 'Quản lý', icon: '👔' },
  { value: 'OTHER', label: 'Khác', icon: '📂' }
];

// Helper function to get label by value
export const getCategoryLabel = (value) => {
  const category = JOB_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value;
};

// Helper function to get icon by value
export const getCategoryIcon = (value) => {
  const category = JOB_CATEGORIES.find(cat => cat.value === value);
  return category ? category.icon : '📂';
};

// Group categories by type for better UI organization
export const CATEGORY_GROUPS = {
  'Công nghệ': [
    'IT',
    'SOFTWARE_DEVELOPMENT',
    'DATA_SCIENCE',
    'MACHINE_LEARNING',
    'WEB_DEVELOPMENT'
  ],
  'Kinh doanh': [
    'SALES',
    'MARKETING',
    'ACCOUNTING',
    'FINANCE'
  ],
  'Sáng tạo': [
    'GRAPHIC_DESIGN',
    'CONTENT_WRITING'
  ],
  'Y tế & Giáo dục': [
    'MEDICAL',
    'TEACHING'
  ],
  'Kỹ thuật & Sản xuất': [
    'ENGINEERING',
    'PRODUCTION',
    'LOGISTICS'
  ],
  'Dịch vụ': [
    'HOSPITALITY',
    'CUSTOMER_SERVICE'
  ],
  'Chuyên môn': [
    'LAW',
    'REAL_ESTATE',
    'HUMAN_RESOURCES',
    'ADMINISTRATION',
    'MANAGEMENT'
  ],
  'Khác': [
    'OTHER'
  ]
};

// Popular categories (for quick selection)
export const POPULAR_CATEGORIES = [
  'IT',
  'SOFTWARE_DEVELOPMENT',
  'SALES',
  'MARKETING',
  'ACCOUNTING',
  'CUSTOMER_SERVICE'
];

export default JOB_CATEGORIES;
