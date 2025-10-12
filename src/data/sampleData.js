export const sampleCVData = {
  personalInfo: {
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '+84 123 456 789',
    address: 'Hà Nội, Việt Nam',
    website: 'https://nguyenvanan.dev',
    linkedin: 'https://linkedin.com/in/nguyenvanan',
    github: 'https://github.com/nguyenvanan',
    profileImage: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
  },
  professionalSummary: 'Kỹ sư phần mềm với 5+ năm kinh nghiệm phát triển ứng dụng web và mobile. Chuyên sâu về React, Node.js và cloud technologies. Đam mê tạo ra những sản phẩm có tác động tích cực đến người dùng và có kinh nghiệm dẫn dắt team phát triển.',
  workExperience: [
    {
      id: 'exp-1',
      company: 'TechViet Solutions',
      position: 'Senior Full-Stack Developer',
      startDate: '2022-01',
      endDate: '',
      isCurrentJob: true,
      description: 'Phát triển và duy trì các ứng dụng web quy mô lớn phục vụ hơn 100,000 người dùng. Dẫn dắt team 5 developers và chịu trách nhiệm về kiến trúc hệ thống.',
      achievements: [
        'Tăng hiệu suất ứng dụng lên 40% thông qua tối ưu hóa database và caching',
        'Xây dựng CI/CD pipeline giảm thời gian deploy từ 2 giờ xuống 15 phút',
        'Mentor 3 junior developers và giúp họ thăng tiến lên mid-level'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Đại học Bách Khoa Hà Nội',
      degree: 'Cử nhân Khoa học Máy tính',
      fieldOfStudy: 'Công nghệ Phần mềm',
      startDate: '2015-09',
      endDate: '2019-06',
      gpa: '3.7/4.0',
      honors: 'Tốt nghiệp Loại Giỏi, Học bổng Khuyến học'
    }
  ],
  skills: [
    { id: 'skill-1', name: 'JavaScript', level: 'Expert', category: 'Technical' },
    { id: 'skill-2', name: 'React', level: 'Expert', category: 'Technical' },
    { id: 'skill-3', name: 'Node.js', level: 'Advanced', category: 'Technical' },
    { id: 'skill-9', name: 'Leadership', level: 'Advanced', category: 'Soft Skills' },
    { id: 'skill-10', name: 'Communication', level: 'Expert', category: 'Soft Skills' },
    { id: 'skill-14', name: 'English', level: 'Advanced', category: 'Language' }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'E-commerce Platform',
      description: 'Nền tảng thương mại điện tử full-stack với React, Node.js và MongoDB.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      startDate: '2023-01',
      endDate: '2023-06',
    }
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-03',
    }
  ],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
};

export const creativeSampleData = {
  ...sampleCVData,
  personalInfo: {
    ...sampleCVData.personalInfo,
    fullName: 'Trần Thị Minh',
    email: 'tranthiminh@email.com',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
  },
  professionalSummary: 'Nhà thiết kế UI/UX với đam mê tạo ra các giao diện đẹp mắt và thân thiện với người dùng. Có kinh nghiệm làm việc với Figma, Sketch và Adobe Creative Suite.',
  template: 'creative-gradient',
  sectionOrder: ['summary', 'projects', 'skills', 'experience', 'education', 'certificates']
};

export const minimalSampleData = {
  ...sampleCVData,
  personalInfo: {
    ...sampleCVData.personalInfo,
    fullName: 'Lê Văn Đức',
    email: 'levanduc@email.com',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
  },
  professionalSummary: 'Chuyên gia Marketing với tư duy phân tích và khả năng xây dựng chiến lược hiệu quả. Tập trung vào việc tối ưu hóa ROI và tăng trưởng người dùng.',
  template: 'minimal-gray',
  sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certificates']
};