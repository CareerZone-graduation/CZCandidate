# Onboarding Redux Integration Guide

## Tổng quan

Onboarding status giờ đây được lưu trong Redux store và tự động cache, giảm thiểu việc gọi API không cần thiết.

## Cách hoạt động

### 1. Redux Store Structure

```javascript
state.onboarding = {
  isOnboardingComplete: false,
  needsOnboarding: true,
  currentStep: 0,
  completedSteps: [],
  skippedSteps: [],
  completionPercentage: 0,
  profileCompleteness: {
    hasBasicInfo: false,
    hasExperience: false,
    hasEducation: false,
    hasSkills: false,
    hasCV: false,
    percentage: 0
  },
  isLoading: false,
  error: null,
  lastFetchTime: null // Timestamp của lần fetch cuối
}
```

### 2. Auto-fetch Strategy

- **Khi user login**: Onboarding status tự động được fetch trong `authSlice.fetchUser()`
- **Cache duration**: 5 phút (có thể config trong `onboardingThunks.js`)
- **Auto-refresh**: Chỉ fetch lại khi data cũ hơn 5 phút

### 3. Sử dụng Custom Hook

```javascript
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

function MyComponent() {
  const { 
    needsOnboarding,      // true nếu cần onboarding
    isOnboardingComplete, // true nếu đã hoàn thành
    profileCompleteness,  // Object chứa thông tin completeness
    completionPercentage, // % hoàn thành (0-100)
    isLoading,           // Loading state
    error,               // Error nếu có
    refresh              // Function để force refresh
  } = useOnboardingStatus();

  // Hook tự động fetch nếu data chưa có hoặc đã cũ
  // Không cần gọi API thủ công!

  if (needsOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return <div>Dashboard content</div>;
}
```

### 4. Manual Refresh

Nếu cần force refresh (ví dụ sau khi update profile):

```javascript
import { useDispatch } from 'react-redux';
import { fetchOnboardingStatus } from '@/redux/slices/onboardingThunks';

function ProfileUpdateComponent() {
  const dispatch = useDispatch();

  const handleSave = async () => {
    await updateProfile(data);
    // Force refresh onboarding status
    dispatch(fetchOnboardingStatus());
  };
}
```

## Components đã được cập nhật

### ✅ AppRouter.jsx
- `GlobalOnboardingChecker` giờ sử dụng Redux thay vì gọi API
- Tự động redirect đến `/onboarding` nếu `needsOnboarding === true`

### ✅ Dashboard.jsx
- Không còn gọi `getOnboardingStatus()` API
- Sử dụng `useOnboardingStatus()` hook để lấy data từ Redux

### ✅ OnboardingPage.jsx
- Sử dụng Redux để check completion status
- Không còn dùng React Query

### ✅ OnboardingWrapper.jsx
- Sau mỗi update/complete/dismiss, tự động refresh Redux state
- Đảm bảo data luôn sync với backend

## Lợi ích

1. **Giảm API calls**: Chỉ fetch khi cần thiết (login hoặc data cũ hơn 5 phút)
2. **Faster navigation**: Không cần đợi API response mỗi lần check
3. **Consistent state**: Tất cả components dùng chung 1 source of truth
4. **Better UX**: Không có loading flicker khi navigate giữa các pages
5. **Automatic sync**: Tự động refresh sau login và các actions quan trọng

## Migration Notes

### Trước đây:
```javascript
// Mỗi component tự gọi API
const { data } = useQuery(['onboardingStatus'], getOnboardingStatus);
```

### Bây giờ:
```javascript
// Tất cả dùng Redux
const { needsOnboarding } = useOnboardingStatus();
```

## Troubleshooting

### Data không update sau khi thay đổi profile?
```javascript
// Gọi dispatch để force refresh
dispatch(fetchOnboardingStatus());
```

### Muốn thay đổi cache duration?
Sửa trong `fe/src/redux/slices/onboardingThunks.js`:
```javascript
const FIVE_MINUTES = 5 * 60 * 1000; // Thay đổi giá trị này
```

### Debug Redux state
```javascript
import { useSelector } from 'react-redux';

const onboardingState = useSelector(state => state.onboarding);
console.log('Onboarding state:', onboardingState);
```
