# Animated Background System

Hệ thống nền động với hiệu ứng hạt noise và gradient tinh tế được thiết kế để tăng cường trải nghiệm người dùng mà không làm phân tán sự chú ý.

## 🌟 Tính năng chính

- **Hiệu ứng hạt động**: Hạt noise di chuyển mượt mà với hiệu suất cao
- **Gradient tinh tế**: Các gradient nhẹ nhàng tạo chiều sâu
- **Tối ưu hiệu suất**: Tự động điều chỉnh chất lượng dựa trên FPS
- **Responsive**: Thích ứng với các kích thước màn hình khác nhau
- **Accessibility**: Tôn trọng cài đặt "reduced motion"
- **Theme-aware**: Tự động thích ứng với light/dark mode

## 🚀 Cài đặt và sử dụng

### 1. Cài đặt cơ bản

```jsx
import { BackgroundProvider, AnimatedBackground } from '@/components/background';

function App() {
  return (
    <BackgroundProvider>
      <AnimatedBackground />
      <YourAppContent />
    </BackgroundProvider>
  );
}
```

### 2. Với điều khiển (Development mode)

```jsx
import { 
  BackgroundProvider, 
  AnimatedBackground, 
  BackgroundControls, 
  PerformanceMonitor 
} from '@/components/background';

function App() {
  return (
    <BackgroundProvider>
      <AnimatedBackground />
      <YourAppContent />
      
      {process.env.NODE_ENV === 'development' && (
        <>
          <BackgroundControls />
          <PerformanceMonitor />
        </>
      )}
    </BackgroundProvider>
  );
}
```

### 3. Sử dụng Enhanced Cards

```jsx
import { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardTitle, 
  EnhancedCardContent 
} from '@/components/ui/enhanced-card';

function JobCard() {
  return (
    <EnhancedCard variant="interactive">
      <EnhancedCardHeader>
        <EnhancedCardTitle>Job Title</EnhancedCardTitle>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        Content with better contrast against animated background
      </EnhancedCardContent>
    </EnhancedCard>
  );
}
```

## 🎛️ Cấu hình

### Particle Density (Mật độ hạt)
- `low`: Ít hạt, hiệu suất cao
- `medium`: Cân bằng tốt (mặc định)
- `high`: Nhiều hạt, đẹp mắt

### Animation Speed (Tốc độ animation)
- `slow`: Chuyển động nhẹ nhàng
- `normal`: Tốc độ chuẩn (mặc định)
- `fast`: Chuyển động năng động

### Gradient Intensity (Cường độ gradient)
- `subtle`: Gradient nhẹ (mặc định)
- `medium`: Gradient vừa phải
- `strong`: Gradient rõ nét

### Sử dụng Context API

```jsx
import { useBackground } from '@/components/background';

function CustomComponent() {
  const { config, updateConfig, performance } = useBackground();
  
  const handleConfigChange = () => {
    updateConfig({
      particleDensity: 'high',
      animationSpeed: 'fast',
      gradientIntensity: 'medium'
    });
  };
  
  return (
    <div>
      <p>Current FPS: {performance.fps}</p>
      <button onClick={handleConfigChange}>
        Increase Effects
      </button>
    </div>
  );
}
```

## 🎨 Enhanced Card Variants

### Default
```jsx
<EnhancedCard>
  Standard enhanced card with backdrop blur
</EnhancedCard>
```

### Glass
```jsx
<EnhancedCard variant="glass">
  Glass morphism effect with subtle transparency
</EnhancedCard>
```

### Interactive
```jsx
<EnhancedCard variant="interactive">
  Hover effects with scale and cursor pointer
</EnhancedCard>
```

### Solid
```jsx
<EnhancedCard variant="solid">
  Solid background without transparency
</EnhancedCard>
```

## 📊 Performance Monitoring

Trong development mode, bạn có thể:

1. **Xem FPS real-time**: Theo dõi hiệu suất animation
2. **Đếm số hạt**: Kiểm tra số lượng hạt đang hoạt động
3. **Điều chỉnh cài đặt**: Thay đổi cấu hình trực tiếp
4. **Xem thông tin hệ thống**: Kích thước màn hình, DPR, reduced motion

## 🔧 Tối ưu hóa hiệu suất

### Tự động
- Giảm mật độ hạt khi FPS < 30
- Tạm dừng animation khi tab không được xem
- Điều chỉnh số lượng hạt theo kích thước màn hình

### Thủ công
```jsx
// Giảm hiệu ứng cho thiết bị yếu
const { updateConfig } = useBackground();

if (isLowEndDevice) {
  updateConfig({
    particleDensity: 'low',
    animationSpeed: 'slow',
    gradientIntensity: 'subtle'
  });
}
```

## 🎯 Best Practices

1. **Sử dụng EnhancedCard**: Thay thế Card thường bằng EnhancedCard để có độ tương phản tốt hơn
2. **Kiểm tra performance**: Theo dõi FPS trong development mode
3. **Tôn trọng accessibility**: Hệ thống tự động tôn trọng cài đặt "reduced motion"
4. **Responsive design**: Hệ thống tự động điều chỉnh theo kích thước màn hình

## 🐛 Troubleshooting

### FPS thấp
- Giảm `particleDensity` xuống `low`
- Giảm `animationSpeed` xuống `slow`
- Kiểm tra các animation khác trên trang

### Không thấy hiệu ứng
- Kiểm tra `config.enabled` có `true` không
- Kiểm tra cài đặt "reduced motion" của browser
- Đảm bảo `BackgroundProvider` bao bọc component

### Thẻ không rõ ràng
- Sử dụng `EnhancedCard` thay vì `Card`
- Tăng `gradientIntensity` nếu cần
- Kiểm tra contrast ratio

## 📱 Responsive Behavior

- **Mobile** (< 768px): 50% mật độ hạt, tối đa 100 hạt
- **Tablet** (768px - 1024px): 75% mật độ hạt, tối đa 150 hạt  
- **Desktop** (> 1024px): 100% mật độ hạt, tối đa 200 hạt

## 🎨 Theme Support

Hệ thống tự động phát hiện và thích ứng với light/dark theme:

- **Light mode**: Hạt màu xám nhạt với undertone ấm
- **Dark mode**: Hạt màu sáng hơn với undertone lạnh

## 📄 API Reference

### BackgroundProvider Props
- Không có props, sử dụng localStorage để lưu cấu hình

### AnimatedBackground Props
- `className?: string` - CSS class tùy chỉnh

### useBackground Hook Returns
```typescript
{
  config: BackgroundConfig;
  performance: PerformanceStats;
  updateConfig: (config: Partial<BackgroundConfig>) => void;
  updatePerformance: (stats: PerformanceStats) => void;
  resetConfig: () => void;
  toggleEnabled: () => void;
}
```

### EnhancedCard Props
```typescript
{
  variant?: 'default' | 'glass' | 'solid' | 'interactive';
  className?: string;
  children: React.ReactNode;
}
```

## 🔗 Demo

Truy cập `/demo/background` để xem demo đầy đủ với các ví dụ và điều khiển tương tác.