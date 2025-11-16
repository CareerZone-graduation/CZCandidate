# Location Permission Components

Components hỗ trợ hướng dẫn user bật quyền truy cập vị trí cho tính năng lọc theo khoảng cách.

## Quick Start

### 1. LocationPermissionGuide (Modal)

Modal dialog với hướng dẫn chi tiết cho từng trình duyệt.

```jsx
import LocationPermissionGuide from '@/components/common/LocationPermissionGuide';

function MyComponent() {
  const [showGuide, setShowGuide] = useState(false);

  const handleRetry = () => {
    // Logic để thử lại lấy vị trí
    navigator.geolocation.getCurrentPosition(...);
  };

  return (
    <>
      <button onClick={() => setShowGuide(true)}>
        Xem hướng dẫn
      </button>
      
      <LocationPermissionGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onRetry={handleRetry}
      />
    </>
  );
}
```

### 2. LocationPermissionAlert (Inline Alert)

Alert nhỏ gọn để hiển thị inline khi quyền bị từ chối.

```jsx
import LocationPermissionAlert from '@/components/common/LocationPermissionAlert';

function MyComponent() {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      {permissionDenied && (
        <LocationPermissionAlert 
          onShowGuide={() => setShowGuide(true)}
        />
      )}
      
      <LocationPermissionGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onRetry={handleRetry}
      />
    </>
  );
}
```

## Features

### LocationPermissionGuide
- ✅ Tự động phát hiện trình duyệt (Chrome, Firefox, Safari, Edge)
- ✅ Hướng dẫn 2 phương pháp: Nhanh & Chi tiết
- ✅ Troubleshooting tips
- ✅ Link tài liệu chính thức
- ✅ Lưu ý bảo mật & quyền riêng tư
- ✅ Responsive design

### LocationPermissionAlert
- ✅ Thông báo ngắn gọn
- ✅ Nút mở modal hướng dẫn
- ✅ Amber warning theme

## Example: Complete Integration

```jsx
import { useState } from 'react';
import { toast } from 'sonner';
import LocationPermissionGuide from '@/components/common/LocationPermissionGuide';
import LocationPermissionAlert from '@/components/common/LocationPermissionAlert';

function LocationFeature() {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('Đã lấy vị trí thành công!');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          toast.error('Quyền vị trí bị từ chối', {
            action: {
              label: 'Xem hướng dẫn',
              onClick: () => setShowGuide(true)
            }
          });
          // Auto show guide after delay
          setTimeout(() => setShowGuide(true), 1500);
        } else {
          toast.error('Không thể lấy vị trí');
        }
      }
    );
  };

  return (
    <div>
      {/* Permission Denied Alert */}
      {permissionDenied && (
        <LocationPermissionAlert 
          onShowGuide={() => setShowGuide(true)}
        />
      )}

      {/* Get Location Button */}
      <button onClick={getLocation}>
        Lấy vị trí của tôi
      </button>

      {/* Help Button */}
      <button onClick={() => setShowGuide(true)}>
        ? Hướng dẫn
      </button>

      {/* Permission Guide Modal */}
      <LocationPermissionGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onRetry={getLocation}
      />

      {/* Display Location */}
      {location && (
        <div>
          Vị trí: {location.lat}, {location.lng}
        </div>
      )}
    </div>
  );
}
```

## Browser Detection

Component tự động phát hiện trình duyệt và hiển thị hướng dẫn phù hợp:

- **Chrome**: Hướng dẫn cho Chrome/Chromium
- **Firefox**: Hướng dẫn cho Firefox
- **Safari**: Hướng dẫn cho Safari (macOS)
- **Edge**: Hướng dẫn cho Microsoft Edge
- **Other**: Hướng dẫn chung

## Geolocation Error Codes

```javascript
// PERMISSION_DENIED = 1
if (error.code === error.PERMISSION_DENIED) {
  // User từ chối quyền
  setPermissionDenied(true);
  setShowGuide(true);
}

// POSITION_UNAVAILABLE = 2
if (error.code === error.POSITION_UNAVAILABLE) {
  // Không thể xác định vị trí
  toast.error('Vị trí không khả dụng');
}

// TIMEOUT = 3
if (error.code === error.TIMEOUT) {
  // Hết thời gian chờ
  toast.error('Hết thời gian chờ');
}
```

## Best Practices

1. **Auto-show guide**: Tự động mở modal sau 1-2s khi quyền bị từ chối
2. **Toast with action**: Hiển thị toast có nút "Xem hướng dẫn"
3. **Inline alert**: Hiển thị alert trong UI để user biết có vấn đề
4. **Help icon**: Luôn có icon help để user có thể xem hướng dẫn bất cứ lúc nào
5. **Reset state**: Reset `permissionDenied` khi thử lại

## Styling

Components sử dụng:
- **shadcn/ui**: Dialog, Alert, Button
- **Tailwind CSS**: Utility classes
- **Lucide React**: Icons

Có thể customize theme thông qua Tailwind config.

## See Also

- [Full Documentation](../../docs/LOCATION_PERMISSION_GUIDE.md)
- [DistanceFilter Implementation](../../pages/jobs/components/SearchInterface/DistanceFilter.jsx)
