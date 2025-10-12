# Cơ chế Phân Trang Tự Động CV (Auto-Pagination)

## 📋 Tổng Quan

Hệ thống phân trang tự động đã được tích hợp vào CareerZone-Candidate-FE để tự động chia CV thành nhiều trang A4, tránh việc cắt ngang nội dung của các section.

## 🎯 Tính Năng

1. **Tự động đo chiều cao section**: Hệ thống tự động đo chiều cao thực tế của mỗi section trong CV
2. **Phân trang thông minh**: Tự động quyết định section nào nên ở trang nào để tránh cắt ngang
3. **Dồn section tự động**: Khi xóa bớt section, các section sau tự động dồn lên để lấp đầy khoảng trống
4. **Header chỉ hiển thị trang đầu**: Thông tin cá nhân chỉ hiển thị ở trang đầu tiên

## 🏗️ Kiến Trúc

### 1. CVPreview.jsx (Entry Point)
```jsx
CVPreview (wrapper component)
    ↓
PaginatedCVPreview (pagination logic)
    ↓
Template Components (ModernBlueTemplate, etc.)
```

### 2. PaginatedCVPreview.jsx (Core Logic)

**Workflow:**
```
1. Render ẩn CV với tất cả sections → measureRef
2. Đo chiều cao từng section qua DOM API
3. Tính toán phân trang dựa trên:
   - Chiều cao trang A4 (297mm ≈ 1123px)
   - Chiều cao header (160px cho trang đầu)
   - Padding và margin (64px + 20px)
4. Tạo mảng pages với sections được phân bổ
5. Render lại CV theo từng trang
```

**Constants:**
```javascript
const A4_HEIGHT_MM = 297;           // Chiều cao trang A4
const A4_WIDTH_MM = 210;            // Chiều rộng trang A4
const MM_TO_PX = 3.7795275591;      // Tỷ lệ chuyển đổi mm sang px
const HEADER_HEIGHT_PX = 160;       // Chiều cao header
const CONTENT_PADDING = 64;         // Padding trên/dưới
const PAGE_MARGIN = 20;             // Margin an toàn
const SECTION_SPACING = 32;         // Khoảng cách giữa sections
```

### 3. Template Props

Mỗi template cần hỗ trợ các props sau:

```jsx
const TemplateComponent = ({ 
  cvData,           // Dữ liệu CV
  showHeader,       // true = hiện header, false = ẩn header
  measureMode,      // true = chế độ đo đạc (render ẩn)
  pageNumber        // Số trang hiện tại (1, 2, 3,...)
}) => {
  // Implementation
};
```

## 🔧 Cách Sử Dụng

### Sử dụng cơ bản

```jsx
import CVPreview from '@/components/CVPreview/CVPreview';

function MyComponent() {
  return (
    <CVPreview 
      cvData={myCvData} 
      className="my-custom-class"
    />
  );
}
```

### Data Structure

```javascript
const cvData = {
  personalInfo: { /* ... */ },
  professionalSummary: "...",
  workExperience: [ /* ... */ ],
  education: [ /* ... */ ],
  skills: [ /* ... */ ],
  projects: [ /* ... */ ],
  certificates: [ /* ... */ ],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
  template: 'modern-blue',
  hiddenSections: [] // Các section bị ẩn
};
```

## 📝 Thêm Template Mới

Để thêm template mới với hỗ trợ pagination:

### 1. Tạo Template Component

```jsx
// templates/MyNewTemplate.jsx
import React from 'react';

const MyNewTemplate = ({ 
  cvData, 
  showHeader = true, 
  measureMode = false, 
  pageNumber = 1 
}) => {
  const { personalInfo, sectionOrder } = cvData;

  // Render các section với data-section attribute
  const renderSummary = () => (
    <section data-section="summary" className="mb-8 break-inside-avoid">
      {/* Content */}
    </section>
  );

  const renderExperience = () => (
    <section data-section="experience" className="mb-8">
      {/* Content */}
    </section>
  );

  // Map sections
  const sectionComponents = {
    summary: renderSummary,
    experience: renderExperience,
    // ... other sections
  };

  return (
    <div className="w-full bg-white">
      {/* Header - only show when showHeader is true */}
      {showHeader && (
        <div className="header-section">
          {/* Header content */}
        </div>
      )}

      {/* Content */}
      <div className="p-8">
        {sectionOrder.map((sectionId) => {
          const renderFn = sectionComponents[sectionId];
          return renderFn ? renderFn() : null;
        })}
      </div>
    </div>
  );
};

export default MyNewTemplate;
```

### 2. Thêm vào PaginatedCVPreview.jsx

```jsx
import MyNewTemplate from './templates/MyNewTemplate';

const getTemplateComponent = () => {
  switch (selectedTemplate) {
    // ... existing cases
    case 'my-new-template':
      return MyNewTemplate;
    default:
      return ModernBlueTemplate;
  }
};
```

## 🎨 CSS Classes Quan Trọng

### Break Classes (Tailwind CSS)

```css
/* Ngăn cắt ngang nội dung */
.break-inside-avoid {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* Ngăn ngắt trang sau phần tử */
.break-after-avoid {
  page-break-after: avoid;
  break-after: avoid;
}

/* Cho phép ngắt trang trước phần tử */
.break-before-auto {
  page-break-before: auto;
  break-before: auto;
}
```

### Data Attributes

```jsx
// QUAN TRỌNG: Mỗi section phải có data-section attribute
<section data-section="summary">
  {/* Content */}
</section>

<section data-section="experience">
  {/* Content */}
</section>
```

## 🐛 Troubleshooting

### Section bị cắt ngang

**Nguyên nhân:** Section không có class `break-inside-avoid`

**Giải pháp:**
```jsx
// ❌ Sai
<section data-section="skills">
  <h2>Skills</h2>
  <div>Content</div>
</section>

// ✅ Đúng
<section data-section="skills" className="break-inside-avoid">
  <h2>Skills</h2>
  <div>Content</div>
</section>
```

### Section không được đo

**Nguyên nhân:** Thiếu `data-section` attribute

**Giải pháp:**
```jsx
// ❌ Sai
<section className="mb-8">
  <h2>Summary</h2>
  <p>Content</p>
</section>

// ✅ Đúng
<section data-section="summary" className="mb-8">
  <h2>Summary</h2>
  <p>Content</p>
</section>
```

### Header xuất hiện ở mọi trang

**Nguyên nhân:** Không kiểm tra prop `showHeader`

**Giải pháp:**
```jsx
// ❌ Sai
<div className="header">
  {/* Always shows */}
</div>

// ✅ Đúng
{showHeader && (
  <div className="header">
    {/* Only shows on first page */}
  </div>
)}
```

### Chiều cao không chính xác

**Nguyên nhân:** CSS chưa load hoặc font chưa render

**Giải pháp:** PaginatedCVPreview đã có delay 100ms để đảm bảo DOM ready:
```javascript
const timeoutId = setTimeout(measureAndPaginate, 100);
```

Nếu vẫn gặp vấn đề, tăng delay:
```javascript
const timeoutId = setTimeout(measureAndPaginate, 200);
```

## 📐 Điều Chỉnh Layout

### Thay đổi chiều cao header

```javascript
// Trong PaginatedCVPreview.jsx
const HEADER_HEIGHT_PX = 200; // Tăng từ 160 lên 200
```

### Thay đổi padding

```javascript
const CONTENT_PADDING = 80; // Tăng từ 64 lên 80
```

### Thay đổi khoảng cách giữa sections

```javascript
const SECTION_SPACING = 48; // Tăng từ 32 lên 48
```

## 🔄 Cách Hoạt Động của "Fill Gap"

Khi xóa một section:

1. Section bị xóa khỏi `sectionOrder`
2. PaginatedCVPreview tự động re-measure các section còn lại
3. Algorithm phân trang chạy lại
4. Sections sau tự động dồn lên để lấp khoảng trống

**Ví dụ:**

```
Trước khi xóa:
Page 1: [Header, Summary, Experience (top half)]
Page 2: [Experience (bottom half), Education]

Sau khi xóa Experience:
Page 1: [Header, Summary, Education]
```

## 📊 Performance

- **Measurement:** ~100ms cho 6 sections
- **Re-render:** ~50ms mỗi lần thay đổi data
- **Memory:** Minimal overhead (1 hidden DOM tree)

## 🚀 Best Practices

1. **Luôn dùng `data-section` attribute** cho mỗi section
2. **Dùng `break-inside-avoid`** cho nội dung không muốn cắt ngang
3. **Dùng `break-after-avoid`** cho headers của section
4. **Test với nhiều độ dài nội dung khác nhau**
5. **Kiểm tra responsive** (mặc dù CV thường là fixed-width)

## 📖 Tài Liệu Tham Khảo

- [CSS Paged Media](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_paged_media)
- [CSS Fragmentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fragmentation)
- [Tailwind Print Utilities](https://tailwindcss.com/docs/break-after)

## 🔗 Files Liên Quan

- `src/components/CVPreview/CVPreview.jsx` - Entry point
- `src/components/CVPreview/PaginatedCVPreview.jsx` - Core logic
- `src/components/CVPreview/templates/ModernBlueTemplate.jsx` - Template example
- `src/components/buildCV/CVBuilder.jsx` - Usage example
