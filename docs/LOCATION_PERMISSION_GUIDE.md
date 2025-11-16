# Hướng dẫn Quyền Truy cập Vị trí - Tính năng Lọc theo Khoảng cách

## Tổng quan

Tính năng lọc theo khoảng cách cho phép người dùng tìm kiếm công việc trong bán kính tùy chọn từ vị trí hiện tại của họ. Để sử dụng tính năng này, người dùng cần cấp quyền truy cập vị trí cho website.

## Components

### 1. LocationPermissionGuide (`fe/src/components/common/LocationPermissionGuide.jsx`)

Modal dialog hiển thị hướng dẫn chi tiết cách bật quyền vị trí cho từng trình duyệt.

**Features:**
- Tự động phát hiện trình duyệt (Chrome, Firefox, Safari, Edge)
- Hướng dẫn từng bước cụ thể cho mỗi trình duyệt
- 2 phương pháp: Cài đặt nhanh và Cài đặt từ trình duyệt
- Lưu ý về bảo mật và quyền riêng tư
- Troubleshooting tips
- Link đến tài liệu chính thức của nhà phát triển trình duyệt
- Nút "Thử lại" để test lại sau khi bật quyền

**Props:**
```jsx
<LocationPermissionGuide
  isOpen={boolean}           // Hiển thị/ẩn modal
  onClose={() => void}       // Callback khi đóng modal
  onRetry={() => void}       // Callback khi user nhấn "Thử lại"
/>
```

### 2. LocationPermissionAlert (`fe/src/components/common/LocationPermissionAlert.jsx`)

Alert component nhỏ gọn hiển thị inline khi quyền bị từ chối.

**Features:**
- Thông báo ngắn gọn về lỗi quyền
- Nút mở modal hướng dẫn chi tiết
- Styling phù hợp với theme (amber warning)

**Props:**
```jsx
<LocationPermissionAlert
  onShowGuide={() => void}   // Callback để mở modal hướng dẫn
/>
```

### 3. DistanceFilter (Updated)

Component filter chính đã được cập nhật để tích hợp hướng dẫn quyền.

**New Features:**
- State `permissionDenied` để track trạng thái quyền bị từ chối
- Hiển thị `LocationPermissionAlert` khi quyền bị từ chối
- Nút help icon (?) để mở hướng dẫn bất cứ lúc nào
- Toast notification với action button "Xem hướng dẫn"
- Tự động mở modal hướng dẫn sau 1.5s khi quyền bị từ chối

## User Flow

### Khi quyền bị từ chối:

1. User nhấn "Bật lọc theo vị trí"
2. Trình duyệt yêu cầu quyền → User từ chối
3. **Ngay lập tức:**
   - Toast error hiển thị với nút "Xem hướng dẫn"
   - Alert box màu vàng hiển thị trong filter
4. **Sau 1.5 giây:**
   - Modal hướng dẫn tự động mở
5. User đọc hướng dẫn và bật quyền trong trình duyệt
6. User nhấn "Thử lại" hoặc reload trang
7. Quyền được cấp → Filter hoạt động bình thường

### Truy cập hướng dẫn bất cứ lúc nào:

- Nhấn icon help (?) bên cạnh tiêu đề "Lọc theo khoảng cách"
- Nhấn "Xem hướng dẫn chi tiết" trong alert box (nếu có)
- Nhấn action button trong toast notification

## Browser-Specific Instructions

### Chrome
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 hoặc thông tin ⓘ bên trái thanh địa chỉ
2. Tìm mục "Vị trí" (Location) trong danh sách quyền
3. Chọn "Cho phép" (Allow) từ menu thả xuống
4. Tải lại trang và thử lại

**Cách 2: Từ Settings**
1. Vào Chrome Settings (chrome://settings/content/location)
2. Tìm website này trong danh sách "Đã chặn"
3. Nhấp vào biểu tượng thùng rác để xóa
4. Quay lại trang và thử lại

### Firefox
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ
2. Chọn "Connection secure" > "More information"
3. Vào tab "Permissions"
4. Bỏ chọn "Use default" cho "Access Your Location"
5. Chọn "Allow" và đóng cửa sổ
6. Tải lại trang và thử lại

**Cách 2: Từ Settings**
1. Vào Firefox Settings > Privacy & Security
2. Cuộn xuống phần "Permissions" > "Location"
3. Nhấp "Settings..." và tìm website này
4. Thay đổi trạng thái thành "Allow"

### Safari
**Cách 1: Từ Safari Settings**
1. Mở Safari > Settings (hoặc Preferences)
2. Chọn tab "Websites"
3. Chọn "Location" từ sidebar bên trái
4. Tìm website này trong danh sách
5. Chọn "Allow" từ menu thả xuống
6. Đóng Settings và tải lại trang

**Cách 2: Từ System Settings**
1. Trên macOS: System Settings > Privacy & Security > Location Services
2. Đảm bảo Safari được bật
3. Quay lại Safari và thử lại

### Edge
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ
2. Chọn "Permissions for this site"
3. Tìm "Location" và chọn "Allow"
4. Tải lại trang và thử lại

**Cách 2: Từ Settings**
1. Vào Edge Settings (edge://settings/content/location)
2. Kiểm tra website này trong danh sách "Block"
3. Di chuyển sang danh sách "Allow"

## Troubleshooting

### Vẫn không lấy được vị trí sau khi bật quyền?

1. **Kiểm tra cài đặt hệ thống:**
   - Windows: Settings > Privacy > Location
   - macOS: System Settings > Privacy & Security > Location Services
   - Đảm bảo Location Services được bật cho trình duyệt

2. **Thử chế độ ẩn danh:**
   - Mở trang trong cửa sổ ẩn danh/private
   - Kiểm tra xem có extension nào chặn quyền không

3. **Xóa cache và cookies:**
   - Xóa cache của website
   - Xóa cookies và site data
   - Reload trang

4. **Cập nhật trình duyệt:**
   - Đảm bảo dùng phiên bản mới nhất
   - Một số tính năng chỉ hoạt động trên phiên bản mới

5. **Kiểm tra HTTPS:**
   - Geolocation API chỉ hoạt động trên HTTPS
   - Không hoạt động trên HTTP (trừ localhost)

6. **VPN/Proxy:**
   - Nếu dùng VPN, vị trí có thể không chính xác
   - Thử tắt VPN và test lại

7. **GPS/Location Services trên thiết bị:**
   - Đảm bảo GPS được bật trên điện thoại/máy tính
   - Kiểm tra kết nối mạng

## Security & Privacy

### Thông tin cho người dùng:

- ✅ Vị trí chỉ được sử dụng để tìm công việc gần bạn
- ✅ Không lưu trữ vị trí trên server
- ✅ Vị trí chỉ được gửi khi bạn thực hiện tìm kiếm
- ✅ Bạn có thể tắt quyền bất cứ lúc nào
- ✅ Không chia sẻ vị trí với bên thứ ba

### Implementation:

```javascript
// Geolocation options
{
  enableHighAccuracy: true,  // Yêu cầu độ chính xác cao
  timeout: 10000,            // Timeout sau 10 giây
  maximumAge: 0              // Không dùng cache cũ
}
```

## Testing

### Test Cases:

1. **Permission Granted:**
   - User nhấn "Bật lọc theo vị trí"
   - Trình duyệt hiển thị prompt
   - User chọn "Allow"
   - ✅ Vị trí được lấy thành công
   - ✅ Filter được bật với vị trí hiện tại

2. **Permission Denied:**
   - User nhấn "Bật lọc theo vị trí"
   - Trình duyệt hiển thị prompt
   - User chọn "Block"
   - ✅ Toast error hiển thị
   - ✅ Alert box hiển thị trong filter
   - ✅ Modal hướng dẫn tự động mở sau 1.5s

3. **Permission Previously Denied:**
   - User đã từ chối quyền trước đó
   - User nhấn "Bật lọc theo vị trí"
   - ✅ Lỗi ngay lập tức (không có prompt)
   - ✅ Alert và modal hiển thị

4. **Help Icon:**
   - User nhấn icon help (?)
   - ✅ Modal hướng dẫn mở
   - User đọc và đóng modal
   - ✅ Modal đóng, không ảnh hưởng state

5. **Retry After Granting Permission:**
   - User bật quyền theo hướng dẫn
   - User nhấn "Thử lại" trong modal
   - ✅ Modal đóng
   - ✅ Geolocation được gọi lại
   - ✅ Vị trí được lấy thành công

## Future Improvements

- [ ] Thêm animation cho modal và alert
- [ ] Hỗ trợ nhiều ngôn ngữ (i18n)
- [ ] Video hướng dẫn cho từng trình duyệt
- [ ] Screenshot minh họa từng bước
- [ ] Detect mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Fallback: Cho phép user nhập địa chỉ thủ công
- [ ] Remember user preference (đã xem hướng dẫn)
- [ ] Analytics: Track permission grant/deny rate

## Related Files

- `fe/src/components/common/LocationPermissionGuide.jsx` - Modal hướng dẫn
- `fe/src/components/common/LocationPermissionAlert.jsx` - Inline alert
- `fe/src/pages/jobs/components/SearchInterface/DistanceFilter.jsx` - Filter component
- `fe/src/components/ui/dialog.jsx` - Dialog component (shadcn/ui)
- `fe/src/components/ui/alert.jsx` - Alert component (shadcn/ui)
