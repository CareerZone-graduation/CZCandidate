# TrendingCompanies Component

Component cao cấp hiển thị **"Top công ty được săn đón nhất"** với nhiều tùy chọn hiển thị và tính năng nâng cao.

## 📍 Vị trí
```
src/components/sections/TrendingCompanies.jsx
```

## 🎯 Khác biệt so với TopCompanies

| Feature | TopCompanies | TrendingCompanies |
|---------|--------------|-------------------|
| Use case | Landing page | Anywhere (landing, pages, dashboard) |
| Variants | Grid only | Grid + List |
| Customization | Fixed | Props-based |
| Limit | Fixed 6 | Configurable (default 12) |
| Header | Always show | Optional |
| Styling | Emerald/Teal | Orange/Red/Pink |
| Animation | Basic | Enhanced |
| Ranking | Top 1-3 badges | Enhanced with sparkles |

## 🎨 Props

```jsx
<TrendingCompanies 
  limit={12}           // Số lượng công ty (default: 12)
  showHeader={true}    // Hiển thị header (default: true)
  variant="grid"       // "grid" | "list" (default: "grid")
/>
```

### Props Detail

#### `limit` (number)
- **Default**: `12`
- **Description**: Số lượng công ty tối đa hiển thị
- **Examples**: 
  - `limit={6}` - Hiển thị 6 công ty
  - `limit={20}` - Hiển thị 20 công ty

#### `showHeader` (boolean)
- **Default**: `true`
- **Description**: Hiển thị section header với title và description
- **Use cases**:
  - `showHeader={true}` - Trang landing, trang chính
  - `showHeader={false}` - Sidebar, widget nhỏ

#### `variant` (string)
- **Default**: `"grid"`
- **Options**: `"grid"` | `"list"`
- **Description**: Kiểu hiển thị layout
- **Use cases**:
  - `variant="grid"` - Trang chính, landing page
  - `variant="list"` - Sidebar, compact view

## 🎨 Visual Design

### Grid Variant
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 🏆 Top 1    │ │ 🥈 Top 2    │ │ 🥉 Top 3    │ │   #4        │
│    [Logo]   │ │    [Logo]   │ │    [Logo]   │ │   [Logo]    │
│  ✨ Sparkle │ │  ✨ Sparkle │ │  ✨ Sparkle │ │             │
│             │ │             │ │             │ │             │
│ Company Name│ │ Company Name│ │ Company Name│ │ Company Name│
│  Industry   │ │  Industry   │ │  Industry   │ │  Industry   │
│             │ │             │ │             │ │             │
│ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │ │ ┌─────────┐ │
│ │💼 5 jobs│ │ │ │💼 5 jobs│ │ │ │💼 5 jobs│ │ │ │💼 5 jobs│ │
│ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │ │ └─────────┘ │
│ 👥 1K  📍 HN│ │ 👥 1K  📍 HN│ │ 👥 1K  📍 HN│ │ 👥 1K  📍 HN│
│             │ │             │ │             │ │             │
│ [Xem công ty│ │ [Xem công ty│ │ [Xem công ty│ │ [Xem công ty│
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### List Variant
```
┌──────────────────────────────────────────────────────────────┐
│ [1] [Logo] Company Name ⭐        💼 5 việc làm 👥 1K+ 📍 HN →│
├──────────────────────────────────────────────────────────────┤
│ [2] [Logo] Company Name ⭐        💼 5 việc làm 👥 1K+ 📍 HN →│
├──────────────────────────────────────────────────────────────┤
│ [3] [Logo] Company Name ⭐        💼 5 việc làm 👥 1K+ 📍 HN →│
├──────────────────────────────────────────────────────────────┤
│ [4] [Logo] Company Name           💼 5 việc làm 👥 1K+ 📍 HN →│
└──────────────────────────────────────────────────────────────┘
```

## 🎯 UI Features

### 1. **Enhanced Ranking System**

#### Top 1 (Gold)
- 🏆 Gold badge: `from-yellow-400 to-yellow-600`
- ⭐ Star icon
- ✨ Sparkle animation (absolute positioned)
- Hover: Scale + glow effect

#### Top 2 (Silver)
- 🥈 Silver badge: `from-gray-300 to-gray-500`
- ⭐ Star icon
- ✨ Sparkle animation

#### Top 3 (Bronze)
- 🥉 Bronze badge: `from-orange-400 to-orange-600`
- ⭐ Star icon
- ✨ Sparkle animation

#### Rank 4+
- Number badge: `bg-muted text-muted-foreground`
- No star, no sparkle

### 2. **Job Count Highlight**
```jsx
<div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200">
  💼 5 tin tuyển dụng
</div>
```
- Prominent display with emerald background
- Dark mode support
- Bold font for number

### 3. **Hover Effects**

#### Grid Cards
- Border: `border-border/50` → `border-primary/30`
- Shadow: `shadow` → `shadow-xl`
- Company name: `text-foreground` → `text-primary`
- Logo border: `border-border/50` → `border-primary/50`
- Button arrow: Translate X animation

#### List Items
- Background: `bg-card` → `bg-accent/50`
- Arrow: Translate X + color change
- All transitions: `duration-200`

### 4. **Color Scheme**
- **Primary**: Orange → Red → Pink gradient
- **Accent**: Emerald for job counts
- **Rankings**: Gold/Silver/Bronze
- **Muted**: For secondary info

## 📱 Responsive Grid

### Grid Variant
```css
grid-cols-1           /* Mobile: 1 column */
md:grid-cols-2        /* Tablet: 2 columns */
lg:grid-cols-3        /* Desktop: 3 columns */
xl:grid-cols-4        /* Large: 4 columns */
```

### List Variant
- Always 1 column
- Compact layout optimized for narrow spaces

## 🔄 States

### 1. Loading State
- **Grid**: Skeleton cards với số lượng = `limit`
- **List**: 6 skeleton rows
- Animation: Pulse effect

### 2. Error State
- Destructive icon color
- Error message: "Không thể tải danh sách công ty"
- Retry button: "Tải lại trang"

### 3. Empty State
- Muted icon
- Message: "Chưa có dữ liệu công ty"
- CTA button: "Khám phá công ty"

### 4. Success State
- Show companies based on variant
- Show "View All" button at bottom

## 🎯 User Interactions

### Grid Variant
1. **Click on card** → Navigate to company detail
2. **Click on "Xem công ty" button** → Navigate to company detail
3. **Click on "Khám phá tất cả công ty"** → Navigate to companies list

### List Variant
1. **Click on row** → Navigate to company detail
2. **Hover** → Show arrow translate effect

## 🔗 Usage Examples

### 1. Landing Page (Full Featured)
```jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

<TrendingCompanies 
  limit={12} 
  showHeader={true} 
  variant="grid" 
/>
```

### 2. Sidebar Widget (Compact)
```jsx
<TrendingCompanies 
  limit={6} 
  showHeader={false} 
  variant="list" 
/>
```

### 3. Company Page (Grid Without Header)
```jsx
<TrendingCompanies 
  limit={8} 
  showHeader={false} 
  variant="grid" 
/>
```

### 4. Dashboard Section
```jsx
<TrendingCompanies 
  limit={4} 
  showHeader={true} 
  variant="grid" 
/>
```

## 🎨 Styling Customization

### Header
```jsx
<SectionHeader
  badgeText="🔥 Đang hot"
  title={<>Top công ty <span className="gradient">được săn đón nhất</span></>}
/>
```

### Gradient Classes
- Header gradient: `from-orange-600 via-red-600 to-pink-600`
- Button gradient: Same as header
- Job count: `from-emerald-50 to-emerald-950/20`

### Border & Background
- Card border: `border-border/50 hover:border-primary/30`
- Card background: `bg-card hover:shadow-xl`
- List hover: `bg-card hover:bg-accent/50`

## 🔧 Dependencies

```jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, Users, Briefcase, MapPin, TrendingUp, 
  Star, Award, ArrowRight, Sparkles, Target 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { SectionHeader } from '../common/SectionHeader';
import apiClient from '../../services/apiClient';
```

## 📊 Data Flow

```
API Call: GET /analytics/top-companies?limit={limit}
    ↓
React Query (cache 5min)
    ↓
Transform & Sort by activeJobCount DESC
    ↓
Render based on variant (grid/list)
    ↓
User interaction → Navigate
```

## 🧪 Testing Checklist

### Grid Variant
- [ ] Loading state shows correct number of skeletons
- [ ] Top 3 show gold/silver/bronze badges
- [ ] Top 3 show sparkle animations
- [ ] Top 3 show star icons
- [ ] Hover effects work smoothly
- [ ] Cards are clickable
- [ ] "Xem công ty" button works
- [ ] "Khám phá tất cả" button works
- [ ] Responsive grid on mobile/tablet/desktop
- [ ] Logo fallback shows first letter
- [ ] Job count highlighted in emerald
- [ ] Empty state shows correctly
- [ ] Error state shows correctly

### List Variant
- [ ] Loading shows 6 skeleton rows
- [ ] Rank numbers show correctly
- [ ] Top 3 have colored backgrounds
- [ ] Top 3 show star icons
- [ ] Hover shows arrow translate
- [ ] Rows are clickable
- [ ] Stats display correctly
- [ ] Responsive on narrow screens

### Props
- [ ] `limit` prop changes number of items
- [ ] `showHeader={false}` hides header
- [ ] `variant="list"` shows list layout
- [ ] `variant="grid"` shows grid layout

## 📈 Performance

- **React Query**: 
  - Query key includes `limit` for cache separation
  - staleTime: 5 minutes
  - cacheTime: 10 minutes
- **Render Optimization**: 
  - Conditional rendering based on variant
  - Memoized with query dependencies
- **Image Loading**: 
  - Avatar component with lazy loading
  - Fallback with first letter

## 🎨 Animation Details

### Sparkle Effect
```jsx
<Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
```
- Only on top 3 companies
- Absolute positioned top-right of logo
- Pulse animation

### Button Hover
```jsx
<ArrowRight className="group-hover:translate-x-1 transition-transform" />
```
- Translates 0.25rem to right
- Smooth transition

### Award Icon Hover
```jsx
<Award className="group-hover:rotate-12 transition-transform" />
```
- Rotates 12 degrees on hover
- In "View All" button

## 🔮 Future Enhancements

- [ ] Add filter by industry
- [ ] Add filter by location
- [ ] Add sorting options (jobs, employees, rating)
- [ ] Add pagination for large lists
- [ ] Add "Follow" button
- [ ] Add company rating display
- [ ] Add verified badge for verified companies
- [ ] Add "Recently viewed" section
- [ ] Add infinite scroll for list variant
- [ ] Add search/filter overlay
- [ ] Add company comparison feature
- [ ] Add export to PDF feature
- [ ] Add bookmark/save feature
- [ ] Add share button
- [ ] Add company growth indicator
