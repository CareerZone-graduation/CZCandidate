# 🚀 Quick Start: CV Auto-Pagination

## TL;DR

CV của bạn giờ đây sẽ **tự động phân trang** theo khổ A4, không bao giờ cắt ngang nội dung section nữa! 🎉

## ✨ Tính Năng Mới

### 1. Auto Page Break
- CV tự động chia thành nhiều trang A4
- Sections không bị cắt ngang
- Header chỉ hiện ở trang đầu

### 2. Smart Fill Gap  
- Xóa section → các section sau tự động dồn lên
- Thêm section → tự động tính lại phân trang
- Không cần làm gì thêm!

### 3. PDF Export Ready
- Phân trang được giữ nguyên khi export PDF
- Print-friendly
- Professional appearance

## 🎯 Cho End Users

### Không Cần Làm Gì! 
Mọi thứ hoạt động tự động:
- Tạo CV như bình thường
- Thêm/xóa sections như bình thường
- Export PDF như bình thường

Hệ thống sẽ tự động:
- ✅ Phân trang hợp lý
- ✅ Tránh cắt ngang nội dung
- ✅ Dồn sections khi cần

## 👨‍💻 Cho Developers

### Sử Dụng Component

```jsx
import CVPreview from '@/components/CVPreview/CVPreview';

// Sử dụng như cũ - không thay đổi gì!
<CVPreview cvData={cvData} />
```

### Kiểm Tra Hoạt Động

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to CV Builder
# 3. Tạo CV với nhiều sections
# 4. Scroll preview → thấy nhiều trang
# 5. Xóa 1 section → sections tự dồn lên
# 6. Export PDF → check pagination
```

### Debug Mode

```jsx
// Trong PaginatedCVPreview.jsx, uncomment dòng này:
console.log('Pages:', pages);

// Sẽ thấy:
// Pages: [
//   { isFirstPage: true, sections: [summary, experience-top] },
//   { isFirstPage: false, sections: [experience-bottom, education] }
// ]
```

## 🎨 Tạo Template Mới

### Minimum Requirements

```jsx
const MyTemplate = ({ 
  cvData, 
  showHeader = true,    // ✅ BẮT BUỘC
  measureMode = false,  // ✅ BẮT BUỘC
  pageNumber = 1        // ✅ BẮT BUỘC
}) => {
  // Each section needs data-section attribute
  const renderSummary = () => (
    <section data-section="summary" className="mb-8 break-inside-avoid">
      {/* Content */}
    </section>
  );

  return (
    <div className="w-full bg-white">
      {/* Only show header on first page */}
      {showHeader && <Header />}
      
      {/* Render sections */}
      <div className="p-8">
        {sectionOrder.map(id => renderSection(id))}
      </div>
    </div>
  );
};
```

**Chi tiết:** Xem [TEMPLATE_UPDATE_GUIDE.md](./TEMPLATE_UPDATE_GUIDE.md)

## ⚙️ Configuration

### Điều Chỉnh Spacing

```javascript
// src/components/CVPreview/PaginatedCVPreview.jsx

// Nếu pages quá đầy:
const SECTION_SPACING = 48;  // Default: 32

// Nếu pages quá trống:
const SECTION_SPACING = 24;  // Default: 32

// Nếu header quá lớn/nhỏ:
const HEADER_HEIGHT_PX = 200; // Default: 160
```

### Custom Page Size

```javascript
// Cho Letter size (US):
const A4_HEIGHT_MM = 279.4;  // 11 inches
const A4_WIDTH_MM = 215.9;   // 8.5 inches

// Cho A4 landscape:
const A4_HEIGHT_MM = 210;
const A4_WIDTH_MM = 297;
```

## 🐛 Troubleshooting

### Section bị cắt ngang

**Kiểm tra:**
```jsx
// ❌ Thiếu break-inside-avoid
<section data-section="skills">

// ✅ Có break-inside-avoid  
<section data-section="skills" className="break-inside-avoid">
```

### Header xuất hiện nhiều trang

**Kiểm tra:**
```jsx
// ❌ Không conditional
<header>...</header>

// ✅ Có conditional
{showHeader && <header>...</header>}
```

### Chiều cao không chính xác

**Giải pháp:**
```javascript
// Tăng delay measurement trong PaginatedCVPreview.jsx
const timeoutId = setTimeout(measureAndPaginate, 200); // Default: 100
```

## 📚 Full Documentation

- 📖 [CV_PAGINATION_GUIDE.md](./CV_PAGINATION_GUIDE.md) - Complete guide
- 🎨 [TEMPLATE_UPDATE_GUIDE.md](./TEMPLATE_UPDATE_GUIDE.md) - Template guide  
- ✅ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's done

## 💬 FAQs

### Q: Có ảnh hưởng đến code hiện tại không?
**A:** Không! 100% backward compatible. Code cũ vẫn chạy bình thường.

### Q: Performance có bị ảnh hưởng không?
**A:** Minimal. Chỉ thêm ~100ms cho measurement khi render lần đầu.

### Q: Có thể tắt pagination không?
**A:** Có, chỉ cần dùng template component trực tiếp thay vì qua CVPreview.

### Q: Two-column templates hoạt động không?
**A:** Hiện tại chưa hỗ trợ tốt. Cần logic đặc biệt (coming soon).

### Q: Tôi có thể customize algorithm không?
**A:** Có! Edit `PaginatedCVPreview.jsx` và adjust constants/logic.

## 🎉 Demo

### Before Pagination
```
[Trang 1]
Header
Summary
Experience (cắt ngang) ✂️
---
[Trang 2]  
Experience (nửa dưới)
Education
```

### After Pagination  
```
[Trang 1]
Header
Summary
---
[Trang 2]
Experience (hoàn chỉnh) ✅
Education
```

## 🚀 What's Next?

1. ✅ **ModernBlueTemplate** - Done!
2. ⏳ **Other templates** - In progress
3. ⏳ **Two-column support** - Coming soon
4. ⏳ **Custom page sizes** - Coming soon

---

**Need Help?** Check the full guides hoặc contact dev team!

**Happy Coding!** 🎨✨
