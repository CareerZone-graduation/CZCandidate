# 🐛 Debug Section Order Manager

## Vấn đề: Preview không cập nhật khi thay đổi thứ tự

### ✅ Đã sửa!

Tôi đã tạo `SimpleSectionOrderManager` - một version đơn giản hơn không dùng internal state, tất cả state được quản lý trực tiếp bởi parent component (CVBuilder).

## 🔍 Cách kiểm tra

### Bước 1: Mở Console
1. Mở DevTools (F12)
2. Vào tab Console

### Bước 2: Test thay đổi section order
1. Vào tab "Bố cục & Thứ tự"
2. Di chuyển một section (ví dụ: Skills lên trên)
3. Xem console log:
   ```
   Section order changed: ['skills', 'summary', 'experience', 'education', 'projects', 'certificates']
   ```

### Bước 3: Kiểm tra Preview
1. Click "Xem Preview"
2. Kiểm tra thứ tự sections trong CV preview
3. Nó phải khớp với thứ tự trong tab "Bố cục & Thứ tự"

### Bước 4: Test ẩn/hiện sections
1. Click icon mắt để ẩn section "Projects"
2. Xem console log:
   ```
   Hidden sections changed: ['projects']
   ```
3. Kiểm tra Preview - section "Projects" không còn xuất hiện

## 🔧 Nếu vẫn không hoạt động

### Debug 1: Kiểm tra CVData state
Thêm console.log vào CVBuilder:

```jsx
// Trong CVBuilder.jsx, thêm useEffect
useEffect(() => {
  console.log('CVData updated:', {
    sectionOrder: cvData?.sectionOrder,
    hiddenSections: cvData?.hiddenSections,
    template: cvData?.template
  });
}, [cvData]);
```

### Debug 2: Kiểm tra CVPreview nhận đúng props
Thêm console.log vào CVPreview:

```jsx
// Trong CVPreview.jsx
const CVPreview = React.forwardRef(({ cvData, template, className = '' }, ref) => {
  console.log('CVPreview received:', {
    sectionOrder: cvData.sectionOrder,
    hiddenSections: cvData.hiddenSections,
    visibleSections: cvData.sectionOrder?.filter(s => !cvData.hiddenSections?.includes(s))
  });
  
  // ... rest of code
});
```

### Debug 3: Kiểm tra Template component
Mỗi template (ModernBlueTemplate, ClassicWhiteTemplate, etc.) phải sử dụng `sectionOrder` từ props:

```jsx
// Trong template component
const ModernBlueTemplate = ({ cvData, showHeader = true }) => {
  console.log('Template rendering with sectionOrder:', cvData.sectionOrder);
  
  return (
    <div>
      {cvData.sectionOrder && cvData.sectionOrder.map((sectionId) => {
        const renderFunction = sectionComponents[sectionId];
        return renderFunction ? renderFunction() : null;
      })}
    </div>
  );
};
```

## 📊 Flow dữ liệu

```
SimpleSectionOrderManager
  ↓ onChange(newOrder)
CVBuilder (setCVData)
  ↓ cvData prop
CVPreview
  ↓ filter hidden sections
  ↓ cvData prop
PaginatedCVPreview
  ↓ cvData prop
Template Component (ModernBlueTemplate, etc.)
  ↓ render sections theo sectionOrder
```

## ✅ Checklist

- [ ] SimpleSectionOrderManager được import trong CVBuilder
- [ ] onChange và onHiddenChange được gọi đúng
- [ ] CVBuilder state (cvData) được update
- [ ] CVPreview nhận props mới
- [ ] CVPreview filter hidden sections
- [ ] Template component render theo sectionOrder

## 🎯 Test Cases

### Test 1: Di chuyển section lên
1. Section order ban đầu: `['summary', 'experience', 'education', 'skills']`
2. Click mũi tên lên ở "education"
3. Kết quả mong đợi: `['summary', 'education', 'experience', 'skills']`
4. Preview phải hiển thị Education trước Experience

### Test 2: Ẩn section
1. Hidden sections ban đầu: `[]`
2. Click icon mắt ở "projects"
3. Kết quả mong đợi: `['projects']`
4. Preview không hiển thị Projects section

### Test 3: Drag & Drop
1. Kéo "skills" lên đầu
2. Kết quả mong đợi: `['skills', 'summary', 'experience', 'education', 'projects', 'certificates']`
3. Preview hiển thị Skills ở đầu tiên

### Test 4: Template 2 cột
1. Chọn template "Two Column Sidebar"
2. Di chuyển "skills" trong sidebar
3. Chỉ sections trong sidebar được reorder
4. Main content không bị ảnh hưởng

### Test 5: Reset
1. Thay đổi nhiều sections
2. Click "Reset mặc định"
3. Về thứ tự mặc định của template
4. Hidden sections = []

## 🚨 Common Issues

### Issue 1: Preview không update ngay
**Nguyên nhân**: React batching state updates

**Giải pháp**: Đã sửa bằng cách gọi onChange trực tiếp trong handlers

### Issue 2: Sections bị duplicate
**Nguyên nhân**: Drag & drop logic sai

**Giải pháp**: Đã sửa logic splice trong handleDrop

### Issue 3: Hidden sections vẫn hiển thị
**Nguyên nhân**: CVPreview không filter hidden sections

**Giải pháp**: Đã thêm filter trong CVPreview.jsx:
```jsx
const visibleSectionOrder = sectionOrder.filter(section => !hiddenSections.includes(section));
```

### Issue 4: Template 2 cột không hoạt động đúng
**Nguyên nhân**: Không phân chia sections theo column

**Giải pháp**: Sử dụng `splitSectionsByColumn` và `moveSectionInColumn`

## 📝 Logs mẫu khi hoạt động đúng

```
// Khi di chuyển section
Section order changed: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates']
CVData updated: {
  sectionOrder: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates'],
  hiddenSections: [],
  template: 'modern-blue'
}
CVPreview received: {
  sectionOrder: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates'],
  hiddenSections: [],
  visibleSections: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates']
}

// Khi ẩn section
Hidden sections changed: ['projects']
CVData updated: {
  sectionOrder: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates'],
  hiddenSections: ['projects'],
  template: 'modern-blue'
}
CVPreview received: {
  sectionOrder: ['summary', 'education', 'experience', 'skills', 'projects', 'certificates'],
  hiddenSections: ['projects'],
  visibleSections: ['summary', 'education', 'experience', 'skills', 'certificates']
}
```

## 🎓 Để hiểu rõ hơn

### React State Updates
```jsx
// ❌ Sai - state không update ngay
const handleChange = () => {
  setSectionOrder(newOrder);
  console.log(sectionOrder); // Vẫn là giá trị cũ!
};

// ✅ Đúng - dùng callback hoặc useEffect
const handleChange = () => {
  setSectionOrder(newOrder);
  onChange(newOrder); // Gọi callback ngay
};

useEffect(() => {
  console.log('Section order changed:', sectionOrder);
}, [sectionOrder]);
```

### Props vs State
```jsx
// SimpleSectionOrderManager - Không có internal state
// Tất cả state từ parent (CVBuilder)
const SimpleSectionOrderManager = ({ sectionOrder, onChange }) => {
  const handleMove = () => {
    const newOrder = [...sectionOrder];
    // ... modify newOrder
    onChange(newOrder); // Update parent ngay
  };
};

// ImprovedSectionOrderManager - Có internal state
// Cần sync với parent qua useEffect
const ImprovedSectionOrderManager = ({ sectionOrder: initialOrder, onChange }) => {
  const [internalOrder, setInternalOrder] = useState(initialOrder);
  
  useEffect(() => {
    onChange(internalOrder); // Sync với parent
  }, [internalOrder]);
};
```

## 🔗 Files liên quan

- `CareerZone-Candidate-FE/src/components/buildCV/SimpleSectionOrderManager.jsx` - Component chính (MỚI)
- `CareerZone-Candidate-FE/src/components/buildCV/CVBuilder.jsx` - Parent component
- `CareerZone-Candidate-FE/src/components/CVPreview/CVPreview.jsx` - Preview component
- `CareerZone-Candidate-FE/src/utils/templateHelpers.js` - Helper functions
- `CareerZone-Candidate-FE/src/hooks/useSectionManager.js` - Custom hook (không dùng nữa trong SimpleSectionOrderManager)

---

**Nếu vẫn gặp vấn đề, hãy:**
1. Check console logs
2. Verify CVData state trong React DevTools
3. Kiểm tra props được pass đúng không
4. Test từng bước một (move → check state → check preview)
