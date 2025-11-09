# Hướng dẫn Frontend - Tính năng CV Masking

## Tổng quan

Đã cập nhật giao diện trang **Privacy Settings** (`/dashboard/settings/privacy`) để cho phép candidate:
1. Bật/tắt chế độ cho phép nhà tuyển dụng tìm kiếm
2. Chọn 1 CV để hiển thị khi bật tìm việc
3. Đổi CV bất cứ lúc nào

## Files đã tạo/cập nhật

### Tạo mới:
- `fe/src/services/cvService.js` - Service quản lý CV

### Cập nhật:
- `fe/src/pages/dashboard/settings/PrivacySettings.jsx` - Thêm CV selector
- `fe/src/services/profileService.js` - Thêm API `getAllowSearchSettings()`, `toggleAllowSearch()`

## Luồng UI

### 1. Trạng thái ban đầu (Tắt tìm việc)
```
┌─────────────────────────────────────────┐
│ [Toggle OFF] Cho phép NTD tìm thấy tôi  │
│                                         │
│ Khi bật, bạn cần chọn 1 CV...          │
└─────────────────────────────────────────┘
```

### 2. Khi bật toggle (Chưa có CV được chọn)
```
┌─────────────────────────────────────────┐
│ [Toggle ON] Cho phép NTD tìm thấy tôi   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Chọn CV để hiển thị:          [Hủy]    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 CV_Frontend_Developer.pdf        │ │
│ │    Tải lên: 15/01/2024              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 CV_Fullstack_2024.pdf            │ │
│ │    Tải lên: 10/01/2024              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. Sau khi chọn CV
```
┌─────────────────────────────────────────┐
│ [Toggle ON] Cho phép NTD tìm thấy tôi   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✅ CV đang sử dụng:          [Đổi CV]  │
│                                         │
│ 📄 CV_Frontend_Developer.pdf            │
│    Tải lên: 15/01/2024                  │
└─────────────────────────────────────────┘
```

### 4. Khi click "Đổi CV"
- Hiển thị lại danh sách CV để chọn
- Highlight CV đang được chọn
- Click vào CV khác để đổi

## API Calls

### 1. Load trang
```javascript
// Lấy cài đặt hiện tại
GET /api/v1/candidates/settings/allow-search
Response: {
  allowSearch: true,
  selectedCvId: "673abc...",
  selectedCv: {
    _id: "673abc...",
    name: "CV_Frontend.pdf",
    uploadedAt: "2024-01-15"
  }
}

// Lấy danh sách CV
GET /api/v1/candidates/cvs
Response: {
  data: [
    { _id: "673abc...", name: "CV_Frontend.pdf", ... },
    { _id: "673def...", name: "CV_Fullstack.pdf", ... }
  ]
}
```

### 2. Bật tìm việc + chọn CV
```javascript
PATCH /api/v1/candidates/settings/allow-search
Body: {
  allowSearch: true,
  selectedCvId: "673abc..."
}
```

### 3. Tắt tìm việc
```javascript
PATCH /api/v1/candidates/settings/allow-search
Body: {
  allowSearch: false
}
```

### 4. Đổi CV
```javascript
PATCH /api/v1/candidates/settings/allow-search
Body: {
  allowSearch: true,
  selectedCvId: "673def..."  // CV mới
}
```

## Validation & Error Handling

### 1. Chưa có CV
```javascript
if (cvs.length === 0) {
  toast.error('Bạn cần upload ít nhất 1 CV trước khi bật tìm việc');
  return;
}
```

### 2. API Error
```javascript
onError: (error) => {
  setAllowSearch(!allowSearch); // Revert toggle
  toast.error(error.response?.data?.message || 'Không thể cập nhật cài đặt');
}
```

## Styling

### Colors:
- **Green** (`green-50`, `green-600`): CV được chọn, trạng thái bật
- **Blue** (`blue-50`, `blue-600`): Thông tin quan trọng
- **Gray** (`gray-50`, `gray-400`): Trạng thái tắt, disabled

### Icons:
- `Eye` / `EyeOff`: Toggle on/off
- `FileText`: CV icon
- `CheckCircle2`: CV được chọn
- `Info`: Thông tin
- `Shield`: Privacy settings

## Testing

### Test Case 1: Bật tìm việc lần đầu
1. Vào trang Privacy Settings
2. Toggle "Cho phép NTD tìm thấy tôi" → ON
3. Kiểm tra hiển thị danh sách CV
4. Click chọn 1 CV
5. Kiểm tra toast success
6. Kiểm tra hiển thị "CV đang sử dụng"

### Test Case 2: Đổi CV
1. Khi đã bật tìm việc
2. Click nút "Đổi CV"
3. Chọn CV khác
4. Kiểm tra toast success
5. Kiểm tra CV mới được hiển thị

### Test Case 3: Tắt tìm việc
1. Toggle → OFF
2. Kiểm tra toast success
3. Kiểm tra không còn hiển thị "CV đang sử dụng"

### Test Case 4: Chưa có CV
1. Xóa hết CV
2. Toggle → ON
3. Kiểm tra toast error: "Bạn cần upload ít nhất 1 CV..."

### Test Case 5: Reload trang
1. Bật tìm việc + chọn CV
2. Reload trang
3. Kiểm tra toggle vẫn ON
4. Kiểm tra CV đã chọn vẫn hiển thị

## Responsive Design

- Desktop: Full width với max-w-4xl
- Mobile: Stack layout, buttons full width
- CV list: Scrollable nếu nhiều CV

## Accessibility

- ✅ Label cho Switch
- ✅ Keyboard navigation
- ✅ Focus states
- ✅ ARIA labels
- ✅ Color contrast (WCAG AA)

## Performance

- ✅ React Query caching
- ✅ Optimistic updates
- ✅ Debounce không cần (chỉ 1 action)
- ✅ Lazy load CV list

## Next Steps

### Tính năng bổ sung (Optional):
1. **Preview CV**: Xem trước CV trước khi chọn
2. **CV Analytics**: Số lượt xem CV
3. **Multiple CV**: Cho phép chọn nhiều CV (future)
4. **CV Recommendations**: Gợi ý CV phù hợp nhất
5. **Notification**: Thông báo khi NTD xem CV

### Improvements:
1. Add loading skeleton cho CV list
2. Add animation khi toggle
3. Add confirmation dialog khi tắt tìm việc
4. Add tooltip giải thích tính năng
