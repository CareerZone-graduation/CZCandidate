// Template Helper Functions

/**
 * Kiểm tra xem template có phải là layout 2 cột không
 */
export const isTwoColumnTemplate = (templateId) => {
  return templateId === 'two-column-sidebar' || templateId === 'creative-split';
};

/**
 * Lấy cấu hình layout cho template 2 cột
 */
export const getTwoColumnLayout = (templateId) => {
  const layouts = {
    'two-column-sidebar': {
      sidebar: ['skills', 'education'],
      main: ['summary', 'experience', 'projects', 'certificates']
    },
    'creative-split': {
      sidebar: ['skills', 'education', 'certificates'],
      main: ['summary', 'experience', 'projects']
    }
  };
  
  return layouts[templateId] || null;
};

/**
 * Phân chia sections thành sidebar và main dựa trên template
 */
export const splitSectionsByColumn = (sectionOrder, templateId) => {
  if (!isTwoColumnTemplate(templateId)) {
    return { sidebar: [], main: sectionOrder };
  }
  
  const layout = getTwoColumnLayout(templateId);
  if (!layout) {
    return { sidebar: [], main: sectionOrder };
  }
  
  const sidebar = sectionOrder.filter(s => layout.sidebar.includes(s));
  const main = sectionOrder.filter(s => layout.main.includes(s));
  
  return { sidebar, main };
};

/**
 * Kiểm tra section có thuộc sidebar không
 */
export const isSidebarSection = (sectionId, templateId) => {
  const layout = getTwoColumnLayout(templateId);
  return layout ? layout.sidebar.includes(sectionId) : false;
};

/**
 * Validate section order cho template cụ thể
 */
export const validateSectionOrder = (sectionOrder, templateId) => {
  const validSections = ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'];
  
  // Kiểm tra tất cả sections có hợp lệ không
  const allValid = sectionOrder.every(s => validSections.includes(s));
  if (!allValid) return false;
  
  // Nếu là template 2 cột, kiểm tra sections có đúng vị trí không
  if (isTwoColumnTemplate(templateId)) {
    const layout = getTwoColumnLayout(templateId);
    const { sidebar, main } = splitSectionsByColumn(sectionOrder, templateId);
    
    // Kiểm tra không có section nào bị thiếu hoặc thừa
    const allSidebarValid = sidebar.every(s => layout.sidebar.includes(s));
    const allMainValid = main.every(s => layout.main.includes(s));
    
    return allSidebarValid && allMainValid;
  }
  
  return true;
};

/**
 * Lấy default section order cho template
 */
export const getDefaultSectionOrder = (templateId) => {
  if (isTwoColumnTemplate(templateId)) {
    const layout = getTwoColumnLayout(templateId);
    return [...layout.main, ...layout.sidebar];
  }
  
  return ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'];
};

/**
 * Di chuyển section trong cùng column (cho template 2 cột)
 */
export const moveSectionInColumn = (sectionOrder, templateId, sectionId, direction) => {
  if (!isTwoColumnTemplate(templateId)) {
    // Template thường: di chuyển trong toàn bộ array
    const currentIndex = sectionOrder.indexOf(sectionId);
    if (currentIndex === -1) return sectionOrder;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return sectionOrder;
    
    const newOrder = [...sectionOrder];
    [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
    return newOrder;
  }
  
  // Template 2 cột: di chuyển trong column của nó
  const { sidebar, main } = splitSectionsByColumn(sectionOrder, templateId);
  const isInSidebar = sidebar.includes(sectionId);
  const columnSections = isInSidebar ? sidebar : main;
  
  const currentIndex = columnSections.indexOf(sectionId);
  if (currentIndex === -1) return sectionOrder;
  
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= columnSections.length) return sectionOrder;
  
  const newColumnSections = [...columnSections];
  [newColumnSections[currentIndex], newColumnSections[targetIndex]] = 
    [newColumnSections[targetIndex], newColumnSections[currentIndex]];
  
  // Ghép lại với column còn lại
  if (isInSidebar) {
    return [...main, ...newColumnSections];
  } else {
    return [...newColumnSections, ...sidebar];
  }
};

/**
 * Lấy thông tin metadata của section
 */
export const getSectionMetadata = (sectionId) => {
  const metadata = {
    summary: {
      id: 'summary',
      name: 'Professional Summary',
      icon: 'FileText',
      description: 'Brief overview of your professional background',
      required: true
    },
    experience: {
      id: 'experience',
      name: 'Work Experience',
      icon: 'Briefcase',
      description: 'Your work history and achievements',
      required: true
    },
    education: {
      id: 'education',
      name: 'Education',
      icon: 'GraduationCap',
      description: 'Your educational background',
      required: true
    },
    skills: {
      id: 'skills',
      name: 'Skills',
      icon: 'Award',
      description: 'Technical and soft skills',
      required: false
    },
    projects: {
      id: 'projects',
      name: 'Projects',
      icon: 'FolderOpen',
      description: 'Personal and professional projects',
      required: false
    },
    certificates: {
      id: 'certificates',
      name: 'Certificates',
      icon: 'Certificate',
      description: 'Professional certifications and achievements',
      required: false
    }
  };
  
  return metadata[sectionId] || null;
};
