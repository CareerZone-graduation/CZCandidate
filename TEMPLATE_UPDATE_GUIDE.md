# Hướng Dẫn Cập Nhật Templates Cho Pagination

## 🎯 Mục Đích

Document này hướng dẫn cách cập nhật các template hiện có để hỗ trợ cơ chế phân trang tự động.

## ✅ Checklist Cập Nhật Template

### 1. Cập nhật Component Props

```jsx
// ❌ TRƯỚC
const TemplateComponent = ({ cvData }) => {

// ✅ SAU
const TemplateComponent = ({ 
  cvData, 
  showHeader = true, 
  measureMode = false, 
  pageNumber = 1 
}) => {
```

### 2. Thêm `data-section` Attribute

Mỗi section PHẢI có `data-section` attribute để có thể được đo chiều cao:

```jsx
// ❌ TRƯỚC
const renderSummary = () => (
  <section className="mb-8">
    <h2>Professional Summary</h2>
    <p>{professionalSummary}</p>
  </section>
);

// ✅ SAU
const renderSummary = () => (
  <section data-section="summary" className="mb-8 break-inside-avoid">
    <h2 className="break-after-avoid">Professional Summary</h2>
    <p>{professionalSummary}</p>
  </section>
);
```

### 3. Thêm CSS Break Classes

```jsx
// Cho section không muốn bị cắt ngang
<section data-section="skills" className="mb-8 break-inside-avoid">

// Cho header của section (không cho ngắt trang ngay sau header)
<h2 className="text-2xl font-bold break-after-avoid">

// Cho items trong section
<div className="break-inside-avoid mb-4">
```

### 4. Conditional Header Rendering

```jsx
// ❌ TRƯỚC
return (
  <div className="cv-template">
    <header className="header">
      {/* Header content */}
    </header>
    <main>
      {/* Sections */}
    </main>
  </div>
);

// ✅ SAU
return (
  <div className="w-full bg-white">
    {/* Only show header on first page */}
    {showHeader && (
      <div className="header">
        {/* Header content */}
      </div>
    )}
    
    <div className="p-8">
      {sectionOrder.map((sectionId) => {
        const renderFn = sectionComponents[sectionId];
        return renderFn ? renderFn() : null;
      })}
    </div>
  </div>
);
```

## 📋 Template Update Pattern

### Complete Example

```jsx
import React from 'react';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

const MyTemplate = ({ 
  cvData, 
  showHeader = true, 
  measureMode = false, 
  pageNumber = 1 
}) => {
  const { 
    personalInfo, 
    professionalSummary, 
    workExperience, 
    education, 
    skills, 
    projects, 
    certificates, 
    sectionOrder 
  } = cvData;

  // Section renderers with data-section and break classes
  const renderSummary = () => {
    if (!professionalSummary) return null;
    return (
      <section data-section="summary" className="mb-8 break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 break-after-avoid">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
      </section>
    );
  };

  const renderExperience = () => {
    if (!workExperience || workExperience.length === 0) return null;
    return (
      <section data-section="experience" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 break-after-avoid">
          Work Experience
        </h2>
        <div className="space-y-6">
          {workExperience.map((job) => (
            <div key={job.id} className="break-inside-avoid mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold">{job.position}</h3>
                  <p className="text-blue-600">{job.company}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {job.startDate} - {job.isCurrentJob ? 'Present' : job.endDate}
                </div>
              </div>
              <p className="text-gray-700 mb-2">{job.description}</p>
              {job.achievements && job.achievements.length > 0 && (
                <ul className="list-disc list-inside space-y-1">
                  {job.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return null;
    return (
      <section data-section="education" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 break-after-avoid">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="break-inside-avoid mb-4">
              <h3 className="text-lg font-semibold">{edu.degree}</h3>
              <p className="text-blue-600">{edu.institution}</p>
              <p className="text-gray-600">{edu.fieldOfStudy}</p>
              <div className="text-sm text-gray-500">
                {edu.startDate} - {edu.endDate}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (!skills || skills.length === 0) return null;
    return (
      <section data-section="skills" className="mb-8 break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2">
          Skills
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {['Technical', 'Soft Skills', 'Language'].map((category) => {
            const categorySkills = skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="font-semibold mb-2">{category}</h3>
                <div className="space-y-2">
                  {categorySkills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between text-sm">
                        <span>{skill.name}</span>
                        <span className="text-blue-600">{skill.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return null;
    return (
      <section data-section="projects" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 break-after-avoid">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="break-inside-avoid mb-4">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <p className="text-gray-700 mb-2">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies && project.technologies.map((tech, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertificates = () => {
    if (!certificates || certificates.length === 0) return null;
    return (
      <section data-section="certificates" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 break-after-avoid">
          Certifications
        </h2>
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="break-inside-avoid mb-3">
              <h3 className="font-semibold">{cert.name}</h3>
              <p className="text-blue-600">{cert.issuer}</p>
              <p className="text-sm text-gray-500">
                {cert.issueDate}{cert.expiryDate && ` - ${cert.expiryDate}`}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Section mapping
  const sectionComponents = {
    summary: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
    projects: renderProjects,
    certificates: renderCertificates
  };

  return (
    <div className="w-full bg-white">
      {/* Conditional header */}
      {showHeader && (
        <div className="bg-gray-800 text-white p-8">
          <h1 className="text-4xl font-bold mb-2">{personalInfo.fullName}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            {personalInfo.email && (
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {personalInfo.address}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dynamic sections */}
      <div className="p-8">
        {sectionOrder && sectionOrder.map((sectionId) => {
          const renderFn = sectionComponents[sectionId];
          return renderFn ? renderFn() : null;
        })}
      </div>
    </div>
  );
};

export default MyTemplate;
```

## 🔑 Key Points

### data-section Values
```javascript
'summary'       // Professional Summary
'experience'    // Work Experience
'education'     // Education
'skills'        // Skills
'projects'      // Projects
'certificates'  // Certificates/Certifications
```

### Break Classes Reference
```css
break-inside-avoid  /* Không cắt ngang phần tử này */
break-after-avoid   /* Không ngắt trang sau phần tử này */
break-before-auto   /* Cho phép ngắt trang trước phần tử */
```

### Recommended Structure
```
Section
├── data-section="..." (REQUIRED)
├── className="mb-8 [break-inside-avoid]"
├── Header
│   └── className="... break-after-avoid"
└── Content
    └── Items with break-inside-avoid
```

## 🎨 Styling Tips

1. **Section spacing**: Dùng `mb-8` cho margin bottom (32px)
2. **Item spacing**: Dùng `mb-4` hoặc `mb-6` cho items trong section
3. **Header underline**: Dùng `border-b-2` với `pb-2` cho khoảng cách
4. **Break classes**: Luôn thêm cho sections và items quan trọng

## ⚠️ Common Mistakes

### ❌ Quên data-section
```jsx
<section className="mb-8">  // Section sẽ KHÔNG được đo
```

### ❌ Hardcode header
```jsx
<div className="header">  // Header sẽ xuất hiện ở MỌI trang
```

### ❌ Không dùng break classes
```jsx
<div className="work-item">  // Item có thể bị cắt ngang
```

### ✅ Đúng cách
```jsx
<section data-section="experience" className="mb-8">
  {showHeader && <div className="header">...</div>}
  <div className="work-item break-inside-avoid">...</div>
</section>
```

## 📝 Templates Cần Cập Nhật

- [x] ModernBlueTemplate.jsx ✅
- [ ] ClassicWhiteTemplate.jsx
- [ ] CreativeGradientTemplate.jsx
- [ ] MinimalGrayTemplate.jsx
- [ ] TwoColumnSidebarTemplate.jsx
- [ ] ElegantSerifTemplate.jsx
- [ ] ModernSansTemplate.jsx
- [ ] CompactDenseTemplate.jsx
- [ ] CreativeSplitTemplate.jsx
- [ ] ExecutiveFormalTemplate.jsx

## 🧪 Testing Checklist

Sau khi cập nhật template, test:

1. ✅ Header chỉ hiện ở trang đầu
2. ✅ Sections không bị cắt ngang
3. ✅ Khi xóa section, các section sau dồn lên
4. ✅ Tất cả sections được đo chiều cao (check DevTools)
5. ✅ PDF export hoạt động tốt
6. ✅ Print preview đúng

## 📚 Resources

- [Main Guide](./CV_PAGINATION_GUIDE.md)
- [CSS Fragmentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fragmentation)
- [ModernBlueTemplate.jsx](./src/components/CVPreview/templates/ModernBlueTemplate.jsx) - Reference implementation
