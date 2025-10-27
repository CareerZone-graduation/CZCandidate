# Performance Optimization - Onboarding Page

## 🐛 Vấn đề ban đầu
1. Giao diện bị lag/đơ khi nhập liệu vào các ô textbox, đặc biệt là ở trang onboarding step 1 (họ và tên)
2. Khi bấm "Tiếp tục" không chuyển sang bước kế tiếp
3. Modal bị "nháy"/reload khi chuyển step

## 🔍 Nguyên nhân

### Vấn đề 1: Input Lag
1. **Re-render không cần thiết từ Redux**: `useOnboardingStatus()` hook gây re-render toàn bộ `OnboardingWrapper` mỗi khi Redux state thay đổi
2. **LocalStorage save quá thường xuyên**: `useEffect` trigger mỗi lần user gõ ký tự
3. **Handlers không được memoize**: Các handlers được tái tạo mỗi lần render
4. **Component không được optimize**: Không sử dụng `memo()` và tối ưu

### Vấn đề 2: Không chuyển step
1. **Stale closure**: `handleNext` có dependency `stepData` trong closure
2. **Child props re-creation**: Object props được tái tạo mỗi lần render, gây re-render con component

### Vấn đề 3: Modal nháy
1. **Animation chạy lại**: Không có `key` để React biết khi nào cần animate
2. **Component re-mount**: Do các vấn đề trên

### Vấn đề 4: Hooks violation
1. **useCallback sau return**: Vi phạm Rules of Hooks - hooks phải ở top level
2. **Conditional hooks**: Gọi hooks sau các câu lệnh điều kiện

## ✅ Giải pháp đã áp dụng

### 1. OnboardingWrapper.jsx
- ✅ **Import hooks**: Thêm `useCallback`, `useMemo`, `useRef`
- ✅ **Loại bỏ dependency không cần thiết**: Chỉ lấy `currentStep` từ Redux để init
- ✅ **Debounced localStorage save**: Sử dụng `setTimeout` với 500ms delay
- ✅ **Functional update pattern**: `setStepData(prev => ...)` để loại bỏ dependency
- ✅ **useRef cho stepData**: `stepDataRef.current` để tránh stale closure
- ✅ **Memoize handlers**: Tất cả handlers dùng `useCallback`
- ✅ **Memoize child props**: Sử dụng `useMemo` và loại bỏ `stepData` dependency
- ✅ **Key cho animation**: Thêm `key={localCurrentStep}` cho smooth transition

### 2. BasicInfoStep.jsx
- ✅ **Memoize component**: Wrap với `React.memo()`
- ✅ **Memoize handlers**: Tất cả handlers dùng `useCallback`
- ✅ **Memoize computed values**: `availableProvinces` dùng `useMemo`

### 3. OnboardingPage.jsx
- ✅ **Fix Hooks order**: Di chuyển tất cả hooks lên trước các `if return`
- ✅ **Memoize renderStep**: Sử dụng `useCallback` đúng cách
- ✅ **Proper hook placement**: Đảm bảo tuân thủ Rules of Hooks

## 📊 Kết quả
- ⚡ **Input không bị lag**: User có thể gõ mượt mà
- 🚀 **Chuyển step ngay lập tức**: Không còn bị block
- 🎯 **Animation mượt mà**: Không bị nháy/flash
- 💾 **Tối ưu localStorage**: Chỉ save sau 500ms idle
- ✨ **No Hooks violation**: Tuân thủ đầy đủ Rules of Hooks

## 🔧 Technical Details

### Functional Update Pattern
```javascript
// ❌ BAD - creates dependency on stepData
setStepData({ ...stepData, [currentStep]: data });

// ✅ GOOD - no dependency needed
setStepData(prevStepData => ({ ...prevStepData, [currentStep]: data }));
```

### useRef to avoid stale closure
```javascript
const stepDataRef = useRef(stepData);
useEffect(() => {
  stepDataRef.current = stepData;
}, [stepData]);

// Use stepDataRef.current in memoized callbacks
const childProps = useMemo(() => ({
  stepData: stepDataRef.current[localCurrentStep] || {},
  // ...
}), [localCurrentStep]); // No stepData dependency!
```

### Debounce LocalStorage Pattern
```javascript
useEffect(() => {
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  saveTimeoutRef.current = setTimeout(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, 500); // Debounce 500ms

  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [localCurrentStep, stepData]);
```

### Rules of Hooks Compliance
```javascript
// ✅ GOOD - All hooks at top, before any returns
const MyComponent = () => {
  const [state, setState] = useState();
  const callback = useCallback(() => {}, []);
  useEffect(() => {}, []);
  
  // Conditional returns AFTER all hooks
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return <Content />;
};

// ❌ BAD - Hook after conditional return
const MyComponent = () => {
  if (loading) return <Loading />; // ❌
  
  const callback = useCallback(() => {}, []); // ❌ Hook after return
};
```

### Animation Key Pattern
```javascript
// ✅ GOOD - React knows when to re-animate
<div key={currentStep} className="animate-in">
  {children}
</div>

// ❌ BAD - Animates every render
<div className="animate-in">
  {children}
</div>
```

## 📝 Notes
- Các thay đổi không ảnh hưởng đến logic nghiệp vụ
- Data flow vẫn giữ nguyên, chỉ tối ưu performance
- Không có breaking changes
- Code tuân thủ đầy đủ React best practices
