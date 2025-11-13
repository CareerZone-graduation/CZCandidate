# Dashboard Components

## FeaturedCompanies Component

Component hiển thị **Top công ty được săn đón nhất** trong Dashboard của ứng viên.

### 📍 Vị trí
```
src/components/dashboard/FeaturedCompanies.jsx
```

### 🎯 Mục đích
Hiển thị danh sách các công ty có nhiều tin tuyển dụng nhất, giúp ứng viên khám phá các nhà tuyển dụng uy tín và có nhiều cơ hội việc làm.

### 📊 Nguồn dữ liệu
- **API Endpoint**: `GET /analytics/top-companies?limit=8`
- **Caching**: React Query với staleTime 5 phút
- **Data source**: MongoDB collection `recruiterprofiles` join với `jobs`
- **Sorting**: Sắp xếp theo `activeJobCount` (số tin ACTIVE + APPROVED) giảm dần

### 🎨 UI Features

#### 1. **Ranking Badges** (Top 1-3)
- 🥇 **Top 1**: Gradient vàng (gold)
- 🥈 **Top 2**: Gradient bạc (silver)  
- 🥉 **Top 3**: Gradient đồng (bronze)
- ⭐ Star icon cho top 3

#### 2. **Company Card Layout**
```
┌─────────────────────────────────┐
│ [Badge] [Logo] Company Name  ⭐ │
│         Industry                │
│         💼 5 việc làm           │
│         👥 1K+ 📍 Hà Nội        │
└─────────────────────────────────┘
```

#### 3. **Avatar Fallback**
- Hiển thị chữ cái đầu tiên của tên công ty
- Gradient background: primary/10 to primary/5
- Rounded corners cho modern look

#### 4. **Hover Effects**
- Border color chuyển sang primary/30
- Background chuyển sang accent/50
- Company name chuyển màu primary
- Smooth transition 200ms

### 📱 Responsive Design

| Screen Size | Layout | Companies Shown |
|-------------|--------|-----------------|
| Mobile (<768px) | 1 column | 6 công ty |
| Tablet (768-1024px) | 1 column | 6 công ty |
| Desktop (>1024px) | 1 column (in 3-col grid) | 6 công ty |

### 🔄 States

#### Loading State
- 4 skeleton cards với animation pulse
- Giữ layout consistency

#### Error State
- Building2 icon mờ
- Thông báo lỗi thân thiện
- Không crash app

#### Empty State
- Building2 icon mờ
- "Chưa có dữ liệu công ty"

### 🎯 User Interactions

1. **Click vào company card** → Navigate đến `/company/{companyId}`
2. **Click "Xem tất cả" (header)** → Navigate đến `/companies`
3. **Click "Khám phá thêm công ty" (footer button)** → Navigate đến `/companies`

### 📊 Data Display

#### Company Info
- **Logo**: Avatar component với fallback
- **Company Name**: Line-clamp-1, hover:text-primary
- **Industry**: Text muted, fallback "Đa lĩnh vực"

#### Statistics
- **Active Jobs**: 💼 icon, text emerald-600, font-medium
- **Employees**: 👥 icon, formatted (1K+, 10K+)
- **Location**: 📍 icon, province name, truncate

### 🔗 Integration với Dashboard

```jsx
// Dashboard.jsx
import FeaturedCompanies from '../../components/dashboard/FeaturedCompanies';

// Layout: 3-column grid
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Featured Companies - 1 column */}
  <div className="lg:col-span-1">
    <FeaturedCompanies />
  </div>

  {/* Recommended Jobs - 2 columns */}
  <div className="lg:col-span-2">
    {/* Job recommendations */}
  </div>
</div>
```

### 🎨 Styling Classes

#### Card
- `shadow-sm hover:shadow-md` - Subtle elevation
- `transition-shadow duration-300` - Smooth shadow change

#### Company Item
- `border-border/50 hover:border-primary/30` - Border color transition
- `bg-card hover:bg-accent/50` - Background highlight
- `rounded-xl` - Rounded corners
- `cursor-pointer` - Interactive feedback

#### Rankings
- Top 1: `from-yellow-400 to-yellow-600`
- Top 2: `from-gray-300 to-gray-500`
- Top 3: `from-orange-400 to-orange-600`

### 🔧 Dependencies
```jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Briefcase, MapPin, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import apiClient from '../../services/apiClient';
```

### 📈 Performance

- **React Query Caching**: 
  - staleTime: 5 minutes
  - cacheTime: 10 minutes
- **Render Optimization**: Memoized với queryKey
- **Image Loading**: Lazy loading với Avatar component

### 🧪 Testing Checklist

- [ ] Loading state hiển thị 4 skeleton cards
- [ ] Error state hiển thị thông báo lỗi
- [ ] Empty state hiển thị khi không có data
- [ ] Top 3 badges hiển thị đúng màu sắc
- [ ] Logo fallback hiển thị chữ cái đầu
- [ ] Click vào card navigate đến company detail
- [ ] Click "Xem tất cả" navigate đến company list
- [ ] Hover effects hoạt động smooth
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Data format đúng (employees, job count)

### 🔮 Future Enhancements

- [ ] Add company rating stars
- [ ] Add "Following" status
- [ ] Add quick apply button
- [ ] Add company size filter
- [ ] Add location filter
- [ ] Add animation on data load
- [ ] Add infinite scroll option
- [ ] Add bookmark feature
