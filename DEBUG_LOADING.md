# Debug Loading State Issue

## Vấn đề
Nút "Tiếp tục" không hiển thị loading state khi upload avatar.

## Cách test

### 1. Mở Console (F12)
Bạn sẽ thấy các log sau:

### 2. Chọn file avatar
```
(Không có log - chỉ preview local)
```

### 3. Click "Tiếp tục"
```
🔄 Starting avatar upload...
🔔 OnboardingWrapper: handleStepLoadingChange called with: true
🔔 OnboardingWrapper: isStepLoading set to: true
📊 State Update: {
  isStepLoading: true,
  updateProfilePending: false,
  dismissPending: false,
  isLoading: true
}
📤 Uploading avatar to server...
```

### 4. Sau khi upload xong
```
✅ Avatar uploaded successfully: <url>
🏁 Avatar upload finished
🔔 OnboardingWrapper: handleStepLoadingChange called with: false
🔔 OnboardingWrapper: isStepLoading set to: false
📊 State Update: {
  isStepLoading: false,
  updateProfilePending: true,  // Form đang submit
  dismissPending: false,
  isLoading: true
}
```

## Kiểm tra

### ✅ Nếu thấy logs trên
- Loading state đang hoạt động đúng
- Button text sẽ hiển thị "Đang tải ảnh..." khi isStepLoading = true
- Sau đó chuyển sang "Đang xử lý..." khi submit form

### ❌ Nếu KHÔNG thấy logs
Kiểm tra:

1. **onLoadingChange không được gọi**
   - Check BasicInfoStep có nhận prop `onLoadingChange` không
   - Check có gọi `onLoadingChange?.(true)` không

2. **handleStepLoadingChange không được gọi**
   - Check OnboardingWrapper có truyền `onLoadingChange: handleStepLoadingChange` không
   - Check children function có nhận prop này không

3. **State không update**
   - Check `setIsStepLoading` có được gọi không
   - Check React DevTools để xem state

## Giải pháp nếu vẫn không hoạt động

### Option 1: Sử dụng Context
```jsx
// OnboardingContext.jsx
const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [isStepLoading, setIsStepLoading] = useState(false);
  return (
    <OnboardingContext.Provider value={{ isStepLoading, setIsStepLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
};

// BasicInfoStep.jsx
const { setIsStepLoading } = useContext(OnboardingContext);
setIsStepLoading(true);
```

### Option 2: Sử dụng ref
```jsx
// OnboardingWrapper.jsx
const isStepLoadingRef = useRef(false);

const handleStepLoadingChange = (loading) => {
  isStepLoadingRef.current = loading;
  forceUpdate(); // Force re-render
};
```

### Option 3: Đơn giản hóa - Chỉ hiển thị "Đang xử lý..."
```jsx
// OnboardingWrapper.jsx
{isLoading ? (
  <span className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    Đang xử lý...
  </span>
) : (
  'Tiếp tục'
)}
```

## Current Implementation

### BasicInfoStep.jsx
```jsx
const onSubmit = async (data) => {
  if (avatarFile) {
    setUploadingAvatar(true);
    onLoadingChange?.(true);  // ← Gọi callback
    try {
      await uploadAvatar(avatarFile);
    } finally {
      setUploadingAvatar(false);
      onLoadingChange?.(false);  // ← Gọi callback
    }
  }
  await onNext(data);
};
```

### OnboardingWrapper.jsx
```jsx
const [isStepLoading, setIsStepLoading] = useState(false);

const handleStepLoadingChange = (loading) => {
  setIsStepLoading(loading);  // ← Update state
};

// Truyền vào children
{children({
  onLoadingChange: handleStepLoadingChange  // ← Pass callback
})}

// Button
{isLoading ? (
  {isStepLoading ? 'Đang tải ảnh...' : 'Đang xử lý...'}  // ← Check state
) : (
  'Tiếp tục'
)}
```

## Test với fake delay

Để test dễ hơn, thêm delay giả:

```jsx
// BasicInfoStep.jsx
if (avatarFile) {
  setUploadingAvatar(true);
  onLoadingChange?.(true);
  
  // Fake delay 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await uploadAvatar(avatarFile);
  
  setUploadingAvatar(false);
  onLoadingChange?.(false);
}
```

Bây giờ bạn sẽ thấy loading state trong 3 giây.
