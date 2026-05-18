import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const TestImprovedCV = () => {
  const navigate = useNavigate();

  const handleTest = () => {
    // Sample CV data
    const sampleCVData = {
      personalInfo: {
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "+84 123 456 789",
        address: "Hà Nội, Việt Nam",
        linkedin: "linkedin.com/in/nguyenvana",
        github: "github.com/nguyenvana"
      },
      professionalSummary: "Lập trình viên Full-stack với 3 năm kinh nghiệm phát triển ứng dụng web sử dụng React, Node.js và MongoDB. Đam mê công nghệ và luôn học hỏi những kỹ thuật mới.",
      workExperience: [
        {
          id: "1",
          position: "Senior Frontend Developer",
          company: "Tech Company",
          location: "Hà Nội",
          startDate: "2022-01",
          endDate: "2024-12",
          isCurrentJob: true,
          description: "Phát triển và maintain các ứng dụng web sử dụng React",
          achievements: [
            "Phát triển 15+ tính năng mới, tăng 30% người dùng (10K→13K)",
            "Tối ưu performance, giảm 40% thời gian load trang",
            "Lead team 5 developers trong dự án lớn"
          ]
        }
      ],
      education: [
        {
          id: "1",
          degree: "Cử nhân Công nghệ Thông tin",
          institution: "Đại học Bách Khoa Hà Nội",
          fieldOfStudy: "Khoa học Máy tính",
          location: "Hà Nội",
          startDate: "2018",
          endDate: "2022",
          gpa: "3.5/4.0",
          honors: "Sinh viên xuất sắc"
        }
      ],
      skills: [
        { id: "1", name: "React", level: "Expert", category: "Technical" },
        { id: "2", name: "Node.js", level: "Advanced", category: "Technical" },
        { id: "3", name: "TypeScript", level: "Advanced", category: "Technical" },
        { id: "4", name: "Communication", level: "Advanced", category: "Soft Skills" }
      ],
      projects: [
        {
          id: "1",
          name: "E-commerce Platform",
          description: "Xây dựng nền tảng thương mại điện tử với React và Node.js, phục vụ 50K+ users",
          technologies: ["React", "Node.js", "MongoDB", "Redis"],
          startDate: "2023-01",
          endDate: "2023-12"
        }
      ],
      certificates: [
        {
          id: "1",
          name: "AWS Certified Developer",
          issuer: "Amazon Web Services",
          issueDate: "2023-06"
        }
      ]
    };

    // Save to sessionStorage
    const cvKey = `test-cv-${Date.now()}`;
    sessionStorage.setItem(cvKey, JSON.stringify({
      cvData: sampleCVData,
      templateId: 'modern-blue'
    }));

    // Navigate to preview
    window.open(`/cv/preview?key=${cvKey}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Improved CV Preview</h1>
        <Button onClick={handleTest} className="bg-purple-600 hover:bg-purple-700">
          Test Preview Page
        </Button>
      </div>
    </div>
  );
};

export default TestImprovedCV;
