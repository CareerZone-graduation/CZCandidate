# Fix: Modal đóng/mở lại gây khó chịu + ReferenceError

## 🐛 Vấn đề

### Vấn đề 1: Modal bị đóng và mở lại
- **Triệu chứng**: Khi nhấn "Tiếp tục" hoặc "Bỏ qua", modal bị unmount và mount lại
- **Nguyên nhân**: 
  - `dispatch(nextStep())` thay đổi Redux state
  - `useOnboardingStatus()` hook trả về `currentStep` mới
  - Component re-render với prop mới
  - Modal bị unmount và mount lại
  - Gây cảm giác giật lag, khó chịu

### Vấn đề 2: ReferenceError: currentStep is not defined
- **Triệu chứng**: Lỗi khi truy cập `/onboarding` trực tiếp
- **Nguyên nhân**:
  - `getInitialStep()` được gọi trước khi `useOnboardingStatus()` hook chạy
  - `reduxCurrentStep` chưa có giá trị (undefined)
  - Dùng `reduxCurrentStep` trong `getInitialStep()` gây lỗi

## ✅ Giải pháp

### 1. Tách biệt Local State và Redux State

**Trước:**
```javascript
// Dùng trực tiếp Redux state cho UI
const { currentStep } = useOnboardingStatus();

// Mỗi lần Redux thay đổi → component re-render → modal bị unmount/mount
```

**Sau:**
```javascript
// Local state cho UI (không bị ảnh hưởng bởi Redux)
const [localCurrentStep, setLocalCurrentStep] = useState(getInitialStep);

// Redux state chỉ dùng để sync data, không dùng cho UI
const { currentStep: reduxCurrentStep } = useOnboardingStatus();
```

### 2. Khởi tạo đúng thứ tự

**Trước:**
```javascript
// SAI: Dùng reduxCurrentStep trước khi nó được khởi tạo
const getInitialStep = () => {
  // ...
  return reduxCurrentStep > 0 ? reduxCurrentStep : 1; // ← reduxCurrentStep = undefined
};

const [localCurrentStep, setLocalCurrentStep] = useState(getInitialStep);
const { currentStep: reduxCurrentStep } = useOnboardingStatus(); // ← Chạy sau
```

**Sau:**
```javascript
// ĐÚNG: Khởi tạo từ localStorage trước (synchronous)
const getInitialStep = () => {
  try {
    const savedProgress = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedProgress) {
      const { step } = JSON.parse(savedProgress);
      if (step && step >= 1 && step <= STEPS.length) {
        return step;
      }
    }
  } catch (error) {
    console.error('Failed to load onboarding progress:', error);
  }
  return 1; // Default to step 1, không dùng reduxCurrentStep
};

const [localCurrentStep, setLocalCurrentStep] = useState(getInitialStep);
const { currentStep: reduxCurrentStep } = useOnboardingStatus();

// Sync với Redux sau khi mount
useEffect(() => {
  if (reduxCurrentStep > 0 && reduxCurrentStep !== localCurrentStep) {
    setLocalCurrentStep(reduxCurrentStep);
  }
}, [reduxCurrentStep]);
```

### 3. Cập nhật tất cả references

Thay thế tất cả `currentStep` bằng `localCurrentStep` trong:
- Progress bar
- Step indicator
- Button logic
- Children props
- Conditional rendering

## 🎯 Kết quả

### Trước khi sửa:
- ❌ Modal bị đóng/mở lại khi chuyển step
- ❌ Lỗi ReferenceError khi truy cập trực tiếp
- ❌ UX giật lag, khó chịu

### Sau khi sửa:
- ✅ Modal mượt mà, không bị unmount/mount
- ✅ Không còn lỗi ReferenceError
- ✅ UX mượt mà, chuyển step nhanh
- ✅ Vẫn sync với Redux trong nền

## 🧪 Test Cases

### Test 1: Truy cập trực tiếp `/onboarding`
```
✅ Không có lỗi ReferenceError
✅ Modal hiển thị đúng step 1
✅ Có thể chuyển step bình thường
```

### Test 2: Redirect từ trang khác
```
✅ Modal hiển thị đúng
✅ Không bị đóng/mở lại
✅ Chuyển step mượt mà
```

### Test 3: Nhấn "Tiếp tục"
```
✅ Modal không bị unmount
✅ Chuyển step ngay lập tức
✅ Progress bar cập nhật mượt mà
✅ Không có animation giật lag
```

### Test 4: Nhấn "Bỏ qua"
```
✅ Modal không bị unmount
✅ Chuyển step ngay lập tức
✅ Hiển thị toast notification
```

### Test 5: Reload trang giữa chừng
```
✅ Load đúng step từ localStorage
✅ Không mất dữ liệu đã nhập
✅ Tiếp tục từ step đã lưu
```

## 📝 Files đã thay đổi

**`fe/src/components/onboarding/OnboardingWrapper.jsx`**
- Thêm `localCurrentStep` state
- Sửa `getInitialStep()` không dùng `reduxCurrentStep`
- Thêm useEffect để sync với Redux sau mount
- Cập nhật tất cả references từ `currentStep` → `localCurrentStep`

## 🚀 Technical Details

### State Management Strategy

```
┌─────────────────────────────────────────┐
│         OnboardingWrapper               │
├─────────────────────────────────────────┤
│                                         │
│  Local State (UI)                       │
│  ├─ localCurrentStep (useState)         │
│  ├─ stepData (useState)                 │
│  └─ submitError (useState)              │
│                                         │
│  Redux State (Background Sync)          │
│  ├─ reduxCurrentStep (useSelector)      │
│  ├─ profileCompleteness (useSelector)   │
│  └─ isOnboardingComplete (useSelector)  │
│                                         │
│  Persistence                            │
│  └─ localStorage (ONBOARDING_STORAGE)   │
│                                         │
└─────────────────────────────────────────┘

Flow:
1. Component mount → Load từ localStorage
2. User action → Update localCurrentStep (UI)
3. Background → Sync với Redux (không gây re-render)
4. Auto-save → Save to localStorage
```

### Why This Works

1. **Local State cho UI**: Không bị ảnh hưởng bởi Redux updates
2. **Redux cho Data Sync**: Vẫn giữ data consistency
3. **localStorage cho Persistence**: Không mất data khi reload
4. **Separation of Concerns**: UI state ≠ Global state

---

**Tóm tắt**: Đã sửa thành công vấn đề modal bị đóng/mở lại và lỗi ReferenceError bằng cách tách biệt local state (UI) và Redux state (data sync).