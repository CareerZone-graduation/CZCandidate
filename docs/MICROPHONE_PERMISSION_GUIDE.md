# Hướng dẫn Quyền Truy cập Microphone - Tính năng Tìm kiếm Giọng nói

## Tổng quan

Tính năng tìm kiếm bằng giọng nói cho phép người dùng nói từ khóa thay vì gõ. Để sử dụng tính năng này, người dùng cần cấp quyền truy cập microphone cho website.

## Components

### 1. MicrophonePermissionGuide (`fe/src/components/common/MicrophonePermissionGuide.jsx`)

Modal dialog hiển thị hướng dẫn chi tiết cách bật quyền microphone cho từng trình duyệt.

**Features:**
- Tự động phát hiện trình duyệt (Chrome, Firefox, Safari, Edge)
- Hướng dẫn từng bước cụ thể cho mỗi trình duyệt
- 2 phương pháp: Cài đặt nhanh và Cài đặt từ trình duyệt
- Lưu ý về bảo mật và quyền riêng tư
- Tips kiểm tra microphone
- Troubleshooting tips
- Link đến tài liệu chính thức của nhà phát triển trình duyệt
- Nút "Thử lại" để test lại sau khi bật quyền

**Props:**
```jsx
<MicrophonePermissionGuide
  isOpen={boolean}           // Hiển thị/ẩn modal
  onClose={() => void}       // Callback khi đóng modal
  onRetry={() => void}       // Callback khi user nhấn "Thử lại"
/>
```

### 2. MicrophonePermissionAlert (`fe/src/components/common/MicrophonePermissionAlert.jsx`)

Alert component nhỏ gọn hiển thị inline khi quyền bị từ chối.

**Features:**
- Thông báo ngắn gọn về lỗi quyền
- Nút mở modal hướng dẫn chi tiết
- Styling phù hợp với theme (red warning)

**Props:**
```jsx
<MicrophonePermissionAlert
  onShowGuide={() => void}   // Callback để mở modal hướng dẫn
/>
```

### 3. useSonioxSearch Hook (Updated)

Custom hook đã được cập nhật để tích hợp hệ thống hướng dẫn quyền.

**New Features:**
- State `permissionDenied` để track trạng thái quyền bị từ chối
- Callback `onPermissionDenied` để trigger modal hướng dẫn
- Phát hiện lỗi permission từ Soniox API
- Toast notification với action button "Xem hướng dẫn"
- Tự động trigger callback sau 1.5s khi quyền bị từ chối

**Updated API:**
```jsx
const {
  state,
  isListening,
  fullTranscript,
  error,
  permissionDenied,        // NEW
  isSupported,
  toggleSearch
} = useSonioxSearch({
  lang: 'vi',
  onResult: (text) => { /* ... */ },
  onPermissionDenied: () => { /* ... */ }  // NEW
});
```

### 4. JobSearchBar (Updated)

Component search bar chính đã được cập nhật để tích hợp hướng dẫn quyền microphone.

**New Features:**
- State `showMicPermissionGuide` và `micPermissionDenied`
- Hiển thị `MicrophonePermissionAlert` khi quyền bị từ chối
- Modal `MicrophonePermissionGuide` để hướng dẫn
- Sync với `permissionDenied` từ hook
- Auto trigger modal khi quyền bị từ chối

## User Flow

### Khi quyền bị từ chối:

1. User nhấn nút microphone 🎤
2. Trình duyệt yêu cầu quyền → User từ chối
3. **Ngay lập tức:**
   - Toast error hiển thị với nút "Xem hướng dẫn"
   - Alert box màu đỏ hiển thị dưới search bar
4. **Sau 1.5 giây:**
   - Modal hướng dẫn tự động mở
5. User đọc hướng dẫn và bật quyền trong trình duyệt
6. User nhấn "Thử lại" hoặc reload trang
7. Quyền được cấp → Voice search hoạt động bình thường

### Truy cập hướng dẫn bất cứ lúc nào:

- Nhấn "Xem hướng dẫn chi tiết" trong alert box (nếu có)
- Nhấn action button trong toast notification

## Browser-Specific Instructions

### Chrome
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 hoặc camera 🎥 bên trái thanh địa chỉ
2. Tìm mục "Microphone" trong danh sách quyền
3. Chọn "Cho phép" (Allow) từ menu thả xuống
4. Tải lại trang và thử lại

**Cách 2: Từ Settings**
1. Vào Chrome Settings (chrome://settings/content/microphone)
2. Tìm website này trong danh sách "Đã chặn"
3. Nhấp vào biểu tượng thùng rác để xóa
4. Quay lại trang và thử lại

### Firefox
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ
2. Chọn "Connection secure" > "More information"
3. Vào tab "Permissions"
4. Tìm "Use the Microphone"
5. Bỏ chọn "Use default" và chọn "Allow"
6. Đóng cửa sổ và tải lại trang

**Cách 2: Từ Settings**
1. Vào Firefox Settings > Privacy & Security
2. Cuộn xuống phần "Permissions" > "Microphone"
3. Nhấp "Settings..." và tìm website này
4. Thay đổi trạng thái thành "Allow"

### Safari
**Cách 1: Từ Safari Settings**
1. Mở Safari > Settings (hoặc Preferences)
2. Chọn tab "Websites"
3. Chọn "Microphone" từ sidebar bên trái
4. Tìm website này trong danh sách
5. Chọn "Allow" từ menu thả xuống
6. Đóng Settings và tải lại trang

**Cách 2: Từ System Settings**
1. Trên macOS: System Settings > Privacy & Security > Microphone
2. Đảm bảo Safari được bật
3. Quay lại Safari và thử lại

### Edge
**Cách 1: Từ thanh địa chỉ**
1. Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ
2. Chọn "Permissions for this site"
3. Tìm "Microphone" và chọn "Allow"
4. Tải lại trang và thử lại

**Cách 2: Từ Settings**
1. Vào Edge Settings (edge://settings/content/microphone)
2. Kiểm tra website này trong danh sách "Block"
3. Di chuyển sang danh sách "Allow"

## Troubleshooting

### Vẫn không lấy được âm thanh sau khi bật quyền?

1. **Kiểm tra cài đặt hệ thống:**
   - Windows: Settings > Privacy > Microphone
   - macOS: System Settings > Privacy & Security > Microphone
   - Đảm bảo Microphone được bật cho trình duyệt

2. **Kiểm tra thiết bị microphone:**
   - Đảm bảo microphone được kết nối và bật
   - Kiểm tra âm lượng microphone trong cài đặt hệ thống
   - Thử microphone với ứng dụng khác (Zoom, Skype, etc.)
   - Nếu dùng tai nghe, đảm bảo microphone không bị tắt tiếng

3. **Thử chế độ ẩn danh:**
   - Mở trang trong cửa sổ ẩn danh/private
   - Kiểm tra xem có extension nào chặn quyền không

4. **Xóa cache và cookies:**
   - Xóa cache của website
   - Xóa cookies và site data
   - Reload trang

5. **Cập nhật trình duyệt:**
   - Đảm bảo dùng phiên bản mới nhất
   - Một số tính năng chỉ hoạt động trên phiên bản mới

6. **Kiểm tra HTTPS:**
   - Microphone API chỉ hoạt động trên HTTPS
   - Không hoạt động trên HTTP (trừ localhost)

7. **Driver âm thanh:**
   - Cập nhật driver âm thanh của máy tính
   - Restart máy tính sau khi cập nhật

8. **Kiểm tra default microphone:**
   - Đảm bảo microphone đúng được chọn làm default
   - Windows: Sound Settings > Input
   - macOS: Sound Settings > Input

## Security & Privacy

### Thông tin cho người dùng:

- ✅ Microphone chỉ được sử dụng khi bạn nhấn nút tìm kiếm giọng nói
- ✅ Không ghi âm hoặc lưu trữ giọng nói của bạn
- ✅ Âm thanh chỉ được xử lý để chuyển thành văn bản tìm kiếm
- ✅ Bạn có thể tắt quyền bất cứ lúc nào
- ✅ Không chia sẻ dữ liệu âm thanh với bên thứ ba

### Implementation:

Sử dụng Soniox Speech-to-Text API:
- Real-time transcription
- Hỗ trợ tiếng Việt
- Endpoint detection tự động
- API key được refresh tự động

## Testing

### Test Cases:

1. **Permission Granted:**
   - User nhấn nút microphone 🎤
   - Trình duyệt hiển thị prompt
   - User chọn "Allow"
   - ✅ Microphone được kích hoạt
   - ✅ Button chuyển sang trạng thái "listening" với animation
   - ✅ User nói và transcript hiển thị real-time

2. **Permission Denied:**
   - User nhấn nút microphone 🎤
   - Trình duyệt hiển thị prompt
   - User chọn "Block"
   - ✅ Toast error hiển thị
   - ✅ Alert box hiển thị dưới search bar
   - ✅ Modal hướng dẫn tự động mở sau 1.5s

3. **Permission Previously Denied:**
   - User đã từ chối quyền trước đó
   - User nhấn nút microphone 🎤
   - ✅ Lỗi ngay lập tức (không có prompt)
   - ✅ Alert và modal hiển thị

4. **Retry After Granting Permission:**
   - User bật quyền theo hướng dẫn
   - User nhấn "Thử lại" trong modal
   - ✅ Modal đóng
   - ✅ Voice search được kích hoạt lại
   - ✅ Microphone hoạt động bình thường

5. **Voice Recognition:**
   - User nói từ khóa
   - ✅ Transcript hiển thị real-time trong input
   - ✅ Khi dừng nói, tự động search
   - ✅ Toast success hiển thị kết quả nhận dạng

## Integration with Soniox

### API Flow:

```
1. User nhấn microphone button
   ↓
2. useSonioxSearch.startSearch()
   ↓
3. Check & refresh API key if needed
   ↓
4. sonioxClient.start() với config
   ↓
5. Browser request microphone permission
   ↓
6. If granted: Start listening
   If denied: Trigger onPermissionDenied
   ↓
7. Real-time transcription
   ↓
8. onFinished: Call onResult with final text
```

### Error Handling:

```javascript
onError: (status, message) => {
  // Check if permission error
  const isPermissionError = 
    message.includes('permission') || 
    message.includes('denied') ||
    message.includes('notallowed');
  
  if (isPermissionError) {
    // Show guide
    setPermissionDenied(true);
    onPermissionDenied();
  }
}
```

## Future Improvements

- [ ] Thêm animation cho modal và alert
- [ ] Hỗ trợ nhiều ngôn ngữ (i18n)
- [ ] Video hướng dẫn cho từng trình duyệt
- [ ] Screenshot minh họa từng bước
- [ ] Detect mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Test microphone trực tiếp trong modal
- [ ] Remember user preference (đã xem hướng dẫn)
- [ ] Analytics: Track permission grant/deny rate
- [ ] Fallback: Gợi ý dùng keyboard nếu không có microphone

## Related Files

- `fe/src/components/common/MicrophonePermissionGuide.jsx` - Modal hướng dẫn
- `fe/src/components/common/MicrophonePermissionAlert.jsx` - Inline alert
- `fe/src/hooks/useSonioxSearch.js` - Voice search hook
- `fe/src/pages/jobs/components/SearchInterface/JobSearchBar.jsx` - Search bar component
- `fe/src/components/common/VoiceSearchButton.jsx` - Microphone button
- `fe/src/components/ui/dialog.jsx` - Dialog component (shadcn/ui)
- `fe/src/components/ui/alert.jsx` - Alert component (shadcn/ui)
