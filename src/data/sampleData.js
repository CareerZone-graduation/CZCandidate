export const sampleCVData = {
  id: 'sample-cv-001',
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
    {
      id: 'skill-1',
      name: 'JavaScript',
      level: 'Expert',
      category: 'Technical'
    },
    {
      id: 'skill-2',
      name: 'React',
      level: 'Expert',
      category: 'Technical'
    },
    {
      id: 'skill-3',
      name: 'Node.js',
      level: 'Advanced',
      category: 'Technical'
    },
    {
      id: 'skill-4',
      name: 'TypeScript',
      level: 'Advanced',
      category: 'Technical'
    },
    {
      id: 'skill-5',
      name: 'Python',
      level: 'Intermediate',
      category: 'Technical'
    },
    {
      id: 'skill-9',
      name: 'Leadership',
      level: 'Advanced',
      category: 'Soft Skills'
    },
    {
      id: 'skill-10',
      name: 'Communication',
      level: 'Expert',
      category: 'Soft Skills'
    },
    {
      id: 'skill-11',
      name: 'Problem Solving',
      level: 'Expert',
      category: 'Soft Skills'
    },
    {
      id: 'skill-13',
      name: 'Vietnamese',
      level: 'Expert',
      category: 'Language'
    },
    {
      id: 'skill-14',
      name: 'English',
      level: 'Advanced',
      category: 'Language'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'E-commerce Platform',
      description: 'Nền tảng thương mại điện tử full-stack với React, Node.js và MongoDB. Hỗ trợ thanh toán online, quản lý kho, và analytics dashboard.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe', 'AWS S3', 'Redis'],
      startDate: '2023-01',
      endDate: '2023-06',
      url: 'https://ecommerce-demo.nguyenvanan.dev',
      github: 'https://github.com/nguyenvanan/ecommerce-platform'
    },
    {
      id: 'proj-2',
      name: 'Task Management App',
      description: 'Ứng dụng quản lý công việc theo mô hình Kanban với real-time collaboration. Sử dụng Socket.io cho tính năng real-time và JWT cho authentication.',
      technologies: ['Vue.js', 'Node.js', 'PostgreSQL', 'Socket.io', 'JWT', 'Docker'],
      startDate: '2022-08',
      endDate: '2022-12',
      url: 'https://taskmanager.nguyenvanan.dev',
      github: 'https://github.com/nguyenvanan/task-manager'
    },
    // {
    //   id: 'proj-3',
    //   name: 'Weather Forecast PWA',
    //   description: 'Progressive Web App dự báo thời tiết với offline support và push notifications. Tích hợp với OpenWeatherMap API và sử dụng service workers.',
    //   technologies: ['React', 'PWA', 'Service Workers', 'OpenWeatherMap API', 'Chart.js'],
    //   startDate: '2022-03',
    //   endDate: '2022-05',
    //   url: 'https://weather.nguyenvanan.dev',
    //   github: 'https://github.com/nguyenvanan/weather-pwa'
    // },
    // {
    //   id: 'proj-4',
    //   name: 'AI Chatbot Platform',
    //   description: 'Nền tảng chatbot AI sử dụng OpenAI GPT API. Cho phép tạo và deploy chatbot tùy chỉnh cho website với dashboard quản lý conversations.',
    //   technologies: ['Next.js', 'OpenAI API', 'Prisma', 'PostgreSQL', 'Tailwind CSS', 'Vercel'],
    //   startDate: '2023-07',
    //   endDate: '2023-11',
    //   url: 'https://chatbot.nguyenvanan.dev',
    //   github: 'https://github.com/nguyenvanan/ai-chatbot'
    // }
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect - Associate',
      issuer: 'Amazon Web Services',
      issueDate: '2023-03',
      expiryDate: '2026-03',
      credentialId: 'AWS-SAA-123456789',
      url: 'https://aws.amazon.com/verification'
    },
    {
      id: 'cert-2',
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      issueDate: '2022-11',
      expiryDate: '2024-11',
      credentialId: 'GCP-PCA-987654321',
      url: 'https://cloud.google.com/certification'
    },
    // {
    //   id: 'cert-3',
    //   name: 'Certified Kubernetes Administrator (CKA)',
    //   issuer: 'Cloud Native Computing Foundation',
    //   issueDate: '2022-08',
    //   expiryDate: '2025-08',
    //   credentialId: 'CKA-456789123',
    //   url: 'https://training.linuxfoundation.org/certification'
    // },
    // {
    //   id: 'cert-4',
    //   name: 'MongoDB Certified Developer',
    //   issuer: 'MongoDB University',
    //   issueDate: '2021-12',
    //   expiryDate: '',
    //   credentialId: 'MONGO-DEV-789123456',
    //   url: 'https://university.mongodb.com/certification'
    // }
  ],
  template: 'modern-blue',
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z'
};

// Alternative sample data for different scenarios
export const creativeSampleData = {
  ...sampleCVData,
  id: 'creative-sample-001',
  personalInfo: {
    ...sampleCVData.personalInfo,
    fullName: 'Trần Thị Minh',
    email: 'tranthiminh@email.com',
    profileImage: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
  },
  template: 'creative-gradient',
  sectionOrder: ['summary', 'projects', 'skills', 'experience', 'education', 'certificates']
};

export const minimalSampleData = {
  ...sampleCVData,
  id: 'minimal-sample-001',
  personalInfo: {
    ...sampleCVData.personalInfo,
    fullName: 'Lê Văn Đức',
    email: 'levanduc@email.com',
    profileImage: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=1'
  },
  template: 'minimal-gray',
  sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certificates']
};