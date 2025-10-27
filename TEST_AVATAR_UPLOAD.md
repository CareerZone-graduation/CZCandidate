# Test Avatar Upload Loading States

## Mục đích
Đảm bảo loading state hiển thị đúng ở cả 2 vị trí khi upload avatar:
1. **Avatar area**: Spinner overlay trên avatar + text "Đang tải ảnh lên..."
2. **Footer button**: Nút "Tiếp tục" hiển thị "Đang tải ảnh..."

## Flow hiện tại

### 1. User chọn file avatar
```
handleAvatarChange() 
  → setAvatarFile(file)
  → Preview ảnh local
```

### 2. User click "Tiếp tục"
```
onSubmit() được gọi
  ↓
if (avatarFile) {
  setUploadingAvatar(true)           // ✅ Avatar loading = true
  onLoadingChange(true)              // ✅ Button loading = true
  ↓
  uploadAvatar(avatarFile)           // Upload to server
  ↓
  setUploadingAvatar(false)          // ✅ Avatar loading = false
  onLoadingChange(false)             // ✅ Button loading = false
}
  ↓
onNext(data)                         // Submit form
```

## Loading States

### Avatar Area (BasicInfoStep.jsx)
```jsx
{uploadingAvatar && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  </div>
)}

{uploadingAvatar && (
  <p className="text-xs text-primary mt-1 flex items-center gap-1">
    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    Đang tải ảnh lên...
  </p>
)}
```

### Footer Button (OnboardingWrapper.jsx)
```jsx
{isLoading ? (
  <span className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    {isStepLoading ? 'Đang tải ảnh...' : 'Đang xử lý...'}
  </span>
) : currentStep === STEPS.length ? (
  'Hoàn thành'
) : (
  'Tiếp tục'
)}
```

## Test Cases

### ✅ Test 1: Upload avatar thành công
1. Chọn file ảnh hợp lệ (< 5MB, JPG/PNG/GIF)
2. Click "Tiếp tục"
3. **Expected:**
   - Avatar area: Hiển thị spinner overlay + text "Đang tải ảnh lên..."
   - Footer button: Disabled + hiển thị "Đang tải ảnh..."
4. Sau khi upload xong:
   - Avatar area: Spinner biến mất
   - Footer button: Chuyển sang "Đang xử lý..." (submit form)
   - Chuyển sang step tiếp theo

### ✅ Test 2: Upload avatar thất bại
1. Chọn file ảnh hợp lệ
2. Click "Tiếp tục"
3. Giả lập lỗi network (disconnect wifi)
4. **Expected:**
   - Avatar area: Hiển thị spinner
   - Footer button: Hiển thị "Đang tải ảnh..."
5. Khi upload fail:
   - Avatar area: Spinner biến mất + hiển thị error message
   - Footer button: Trở về "Tiếp tục" (enabled)
   - Form không submit

### ✅ Test 3: Không upload avatar
1. Không chọn file ảnh
2. Click "Tiếp tục"
3. **Expected:**
   - Avatar area: Không có spinner
   - Footer button: Hiển thị "Đang xử lý..." (submit form ngay)
   - Chuyển sang step tiếp theo

### ✅ Test 4: File quá lớn
1. Chọn file > 5MB
2. **Expected:**
   - Hiển thị error ngay lập tức
   - Không cho phép upload
   - Button "Tiếp tục" vẫn enabled

### ✅ Test 5: File không hợp lệ
1. Chọn file .pdf hoặc .txt
2. **Expected:**
   - Hiển thị error ngay lập tức
   - Không cho phép upload
   - Button "Tiếp tục" vẫn enabled

## Debugging

### Nếu loading không hiển thị ở avatar:
```js
// Check trong BasicInfoStep.jsx
console.log('uploadingAvatar:', uploadingAvatar);
```

### Nếu loading không hiển thị ở button:
```js
// Check trong OnboardingWrapper.jsx
console.log('isStepLoading:', isStepLoading);
console.log('isLoading:', isLoading);
```

### Nếu callback không được gọi:
```js
// Check trong BasicInfoStep.jsx onSubmit
console.log('Calling onLoadingChange(true)');
onLoadingChange?.(true);
```

## Cải tiến có thể thêm

### 1. Progress bar cho upload
```jsx
const [uploadProgress, setUploadProgress] = useState(0);

// Trong uploadAvatar
onUploadProgress: (progressEvent) => {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  setUploadProgress(percentCompleted);
}
```

### 2. Preview ảnh trước khi upload
```jsx
// Đã có - hiển thị preview ngay khi chọn file
```

### 3. Retry mechanism
```jsx
const [retryCount, setRetryCount] = useState(0);

if (uploadError && retryCount < 3) {
  // Auto retry
  setRetryCount(prev => prev + 1);
  await uploadAvatar(avatarFile);
}
```

### 4. Cancel upload
```jsx
const abortController = new AbortController();

// Trong uploadAvatar
signal: abortController.signal

// Cancel button
<Button onClick={() => abortController.abort()}>
  Hủy
</Button>
```

## Kết luận

✅ Loading states đã được implement đúng ở cả 2 vị trí
✅ Flow upload avatar hoạt động như mong đợi
✅ Error handling đã được xử lý

Nếu vẫn không thấy loading, kiểm tra:
1. Console logs để debug
2. Network tab để xem request upload
3. React DevTools để xem state changes
