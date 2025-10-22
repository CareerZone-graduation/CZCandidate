# Tính năng Quản lý Thông báo Việc làm

## 📋 Tổng quan

Tính năng cho phép người dùng đăng ký nhận thông báo khi có việc làm phù hợp với tiêu chí của họ. Mỗi user có thể tạo tối đa 3 thông báo việc làm.

## 🎯 Các tính năng chính

### 1. Quản lý Thông báo
- **Tạo thông báo mới**: Người dùng có thể tạo thông báo với các bộ lọc chi tiết
- **Chỉnh sửa thông báo**: Cập nhật tiêu chí của thông báo đã tạo
- **Xóa thông báo**: Xóa thông báo không còn cần thiết
- **Bật/Tắt thông báo**: Tạm dừng hoặc kích hoạt lại thông báo

### 2. Bộ lọc thông báo
- **Từ khóa**: Tìm kiếm theo từ khóa (tùy chọn)
- **Địa điểm**: Tỉnh/Thành phố và Quận/Huyện
- **Ngành nghề**: 25+ ngành nghề khác nhau
- **Kinh nghiệm**: Từ Intern đến Executive
- **Mức lương**: 5 khoảng lương khác nhau
- **Loại hình công việc**: Full-time, Part-time, Contract, etc.
- **Hình thức làm việc**: On-site, Remote, Hybrid
- **Tần suất nhận**: Hàng ngày hoặc hàng tuần
- **Phương thức nhận**: Trong app, Email, hoặc cả hai

### 3. Giới hạn
- Mỗi user chỉ được tạo tối đa **3 thông báo việc làm**
- Chỉ tính các thông báo đang hoạt động (active) vào giới hạn

## 🗂️ Cấu trúc File

```
src/
├── services/
│   └── jobAlertService.js          # API service cho job alerts
├── constants/
│   └── jobAlertEnums.js            # Enum values và helper functions
├── components/
│   ├── jobs/
│   │   └── JobAlertDialog.jsx      # Dialog tạo/sửa thông báo
│   └── layout/
│       ├── Header.jsx              # Updated với Jobs dropdown
│       └── JobsDropdownMenu.jsx    # Dropdown menu cho Việc làm
└── pages/
    └── dashboard/
        └── settings/
            └── JobAlertSettings.jsx # Trang quản lý thông báo
```

## 🚀 Cách sử dụng

### Truy cập trang quản lý
Có 3 cách để truy cập trang quản lý thông báo:

1. **Từ Header**: Hover vào "Việc làm" → Click "Quản lý thông báo việc làm"
2. **Từ Dashboard**: Sidebar → Settings → Job Alerts
3. **Direct URL**: `/dashboard/settings/job-alerts`

### Tạo thông báo mới
1. Click nút "Thêm thông báo"
2. Điền các tiêu chí mong muốn
3. Click "Tạo thông báo"

### Chỉnh sửa thông báo
1. Click icon ✏️ (Pencil) trên hàng thông báo
2. Cập nhật thông tin
3. Click "Cập nhật"

### Bật/Tắt thông báo
- Click icon 🔔 (Bell) để tạm dừng thông báo
- Click icon 🔕 (BellOff) để kích hoạt lại

### Xóa thông báo
1. Click icon 🗑️ (Trash) trên hàng thông báo
2. Xác nhận xóa trong dialog

## 🔌 API Endpoints

```javascript
// Get all job alerts
GET /api/job-alerts

// Create new job alert
POST /api/job-alerts
Body: {
  keyword: string (optional),
  location: { province: string, district: string },
  frequency: 'daily' | 'weekly',
  salaryRange: enum,
  type: enum,
  workType: enum,
  experience: enum,
  category: enum,
  notificationMethod: 'EMAIL' | 'APPLICATION' | 'BOTH'
}

// Update job alert
PUT /api/job-alerts/:id
Body: Partial<CreateJobAlertBody> + { active: boolean }

// Delete job alert
DELETE /api/job-alerts/:id

// Get notification history
GET /api/job-alerts/:id/history?page=1&limit=20
GET /api/job-alerts/history?page=1&limit=20
```

## 🎨 UI Components

### JobAlertSettings (Main Page)
- Hiển thị danh sách thông báo dạng Table
- Actions: Edit, Delete, Toggle Active
- Button "Thêm thông báo" (disabled khi đạt giới hạn)
- Warning message khi đạt giới hạn 3 thông báo

### JobAlertDialog (Form)
- Form 2 cột responsive
- Tất cả fields sử dụng shadcn/ui Select components
- Province/District có logic cascade (chọn tỉnh → load quận)
- Validation tự động từ backend

### JobsDropdownMenu (Header)
- Hover để hiển thị dropdown
- 4 menu items:
  - Tìm việc làm (public)
  - Việc làm đã lưu (authenticated)
  - Việc làm đã ứng tuyển (authenticated)
  - Quản lý thông báo việc làm (authenticated)

## 📱 Responsive Design

- **Desktop**: Table layout với đầy đủ thông tin
- **Mobile**: Mobile menu với nested items cho Jobs section

## 🔄 State Management

- **TanStack Query** cho server state
  - Query key: `['jobAlerts']`
  - Auto refetch on window focus
  - Optimistic updates cho toggle active
- **Local State** cho UI (dialogs, forms)

## ⚡ Performance

- Sử dụng `.lean()` trong backend queries
- Pagination cho notification history
- Debounce cho search inputs (nếu có)

## 🎯 Best Practices

1. **Error Handling**: Tất cả API calls đều có error handling với toast notifications
2. **Loading States**: Skeleton loaders và disabled states
3. **Validation**: Client-side validation + backend Zod schemas
4. **Accessibility**: Proper ARIA labels, keyboard navigation
5. **UX**: Confirmation dialogs cho destructive actions

## 🐛 Troubleshooting

### Không thể tạo thông báo mới
- Kiểm tra đã đạt giới hạn 3 thông báo chưa
- Xóa thông báo cũ để tạo mới

### Dropdown không hiển thị
- Kiểm tra z-index conflicts
- Đảm bảo `data-dropdown` attribute được set

### API errors
- Kiểm tra token authentication
- Verify backend API đang chạy
- Check network tab trong DevTools

## 📝 Notes

- Tính năng này yêu cầu user đã đăng nhập
- Backend sẽ tự động gửi thông báo theo tần suất đã chọn
- Notification history được lưu để tracking
