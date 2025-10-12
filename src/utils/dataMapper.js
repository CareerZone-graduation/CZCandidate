// src/utils/dataMapper.js

/**
 * Ánh xạ dữ liệu CV từ state của frontend sang cấu trúc mà backend mong đợi.
 * @param {Object} frontendCv - Dữ liệu CV từ state của frontend.
 * @returns {Object} - Dữ liệu CV đã được định dạng cho backend.
 */
export const mapToBackend = (frontendCv) => {
  const {
    personalInfo,
    professionalSummary,
    workExperience,
    education,
    skills,
    projects,
    certificates,
    sectionOrder,
    hiddenSections, // Thêm hiddenSections
    template // Thêm template
  } = frontendCv;

  return {
    // Backend mong muốn một 'title', 'templateId' và một object 'cvData'
    title: personalInfo?.fullName || 'Untitled CV',
    templateId: template,
    cvData: {
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      projects,
      certificates,
      sectionOrder,
      hiddenSections: hiddenSections || [], // Đảm bảo luôn có array
      template,
    },
  };
};

/**
 * Ánh xạ dữ liệu CV từ API của backend sang cấu trúc state của frontend.
 * @param {Object} backendCv - Dữ liệu CV từ API.
 * @returns {Object} - Dữ liệu CV đã được định dạng cho state frontend.
 */
export const mapToFrontend = (backendCv) => {
  const { _id, templateId, cvData, createdAt, updatedAt } = backendCv;

  // Dữ liệu mặc định để tránh lỗi khi các trường không tồn tại
  const defaults = {
    personalInfo: {},
    professionalSummary: '',
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
    hiddenSections: [], // Thêm hiddenSections mặc định
  };
  
  return {
    id: _id, // Chuyển _id thành id
    ...defaults,
    ...cvData, // Giải nén các trường từ object cvData lồng nhau
    // Ưu tiên template từ cvData, nếu không có thì dùng templateId ở cấp cao nhất
    // để đảm bảo tương thích ngược và xử lý đúng khi tạo CV mới.
    template: cvData.template || templateId,
    // Đảm bảo hiddenSections luôn là array
    hiddenSections: cvData.hiddenSections || [],
    createdAt,
    updatedAt,
  };
};