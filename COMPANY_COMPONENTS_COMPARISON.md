# Component Comparison: Company Display Components

Hệ thống có 3 components khác nhau để hiển thị danh sách công ty. Đây là so sánh chi tiết:

## 📊 Overview Table

| Feature | TopCompanies | TrendingCompanies | FeaturedCompanies |
|---------|--------------|-------------------|-------------------|
| **Location** | `sections/` | `sections/` | `dashboard/` |
| **Primary Use** | Landing Page | Flexible/Anywhere | Dashboard Only |
| **Variants** | Grid only | Grid + List | List only |
| **Default Limit** | 6 (fixed) | 12 (configurable) | 8 (6 displayed) |
| **Customizable** | ❌ No | ✅ Yes | ⚠️ Limited |
| **Header** | ✅ Always | ✅ Optional | ✅ Always |
| **Color Theme** | Emerald/Teal | Orange/Red/Pink | Primary/Emerald |
| **Ranking Style** | Simple badges | Enhanced + sparkles | Top 3 colored |
| **React Query** | ❌ No | ✅ Yes | ✅ Yes |
| **States Handling** | Basic | Advanced | Advanced |
| **Responsive** | 3 cols max | 4 cols max | 1 col only |
| **Animation** | Basic | Enhanced | Enhanced |

---

## 1. TopCompanies (Legacy)

### 📍 Path
```
src/components/sections/TopCompanies.jsx
```

### 🎯 Purpose
Component gốc được tạo cho landing page, hiển thị top 6 công ty.

### ✨ Features
- ✅ Fixed 6 companies
- ✅ Grid layout only (1-2-3 columns)
- ✅ Top 3 badges (emerald gradient)
- ✅ Company logo với fallback
- ✅ Active job count highlight
- ✅ Click → Company detail page
- ✅ "Xem tất cả công ty" button

### 🎨 Design
```
Color: Emerald/Teal gradient
Badge: Top 1/2/3 with emerald colors
Layout: Grid 1-2-3 columns (responsive)
Header: Fixed - "Top công ty hàng đầu"
```

### 📱 Responsive
```css
Mobile:  1 column
Tablet:  2 columns
Desktop: 3 columns
```

### 📊 Data Fetching
```jsx
// Using useState + useEffect
useEffect(() => {
  const fetchTopCompanies = async () => {
    const response = await apiClient.get('/analytics/top-companies?limit=6');
    setCompanies(response.data.data);
  };
  fetchTopCompanies();
}, []);
```

### 🎯 Best For
- ✅ Landing page main section
- ✅ Simple display, no customization needed
- ✅ Consistent branding with emerald theme

### ⚠️ Limitations
- ❌ Cannot change limit
- ❌ Cannot hide header
- ❌ No list variant
- ❌ No React Query caching
- ❌ Fixed emerald colors

### 💻 Usage
```jsx
import TopCompanies from '@/components/sections/TopCompanies';

<TopCompanies />
```

---

## 2. TrendingCompanies (New - Flexible)

### 📍 Path
```
src/components/sections/TrendingCompanies.jsx
```

### 🎯 Purpose
Component nâng cao với nhiều tùy chọn, dùng được ở nhiều nơi khác nhau.

### ✨ Features
- ✅ Configurable limit (default 12)
- ✅ Grid + List variants
- ✅ Optional header
- ✅ Enhanced ranking with sparkles ✨
- ✅ React Query caching
- ✅ Advanced states (loading/error/empty)
- ✅ Orange/Red/Pink gradient theme
- ✅ Hover animations
- ✅ Dark mode support

### 🎨 Design
```
Color: Orange → Red → Pink gradient
Badge: Gold 🏆, Silver 🥈, Bronze 🥉
Sparkles: ✨ animation for top 3
Layout: Grid (4 cols) or List
Header: Configurable
```

### 📱 Responsive
```css
/* Grid Variant */
Mobile:  1 column
Tablet:  2 columns
Desktop: 3 columns
XL:      4 columns

/* List Variant */
All:     1 column (always)
```

### 📊 Data Fetching
```jsx
// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['trending-companies', limit],
  queryFn: async () => {
    const response = await apiClient.get(`/analytics/top-companies?limit=${limit}`);
    return response.data;
  },
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
});
```

### 🎯 Best For
- ✅ Landing pages (full featured)
- ✅ Company discovery pages
- ✅ Search results pages
- ✅ Sidebar widgets (list variant)
- ✅ Dashboard sections
- ✅ Dialogs/Modals
- ✅ Any page needing company list

### ✅ Advantages
- ✅ Highly customizable via props
- ✅ Better performance (React Query)
- ✅ More visual appeal (sparkles, animations)
- ✅ Two layout variants
- ✅ Professional error handling
- ✅ Better loading states

### 💻 Usage
```jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

// Full featured
<TrendingCompanies limit={12} showHeader={true} variant="grid" />

// Compact sidebar
<TrendingCompanies limit={6} showHeader={false} variant="list" />

// Dashboard widget
<TrendingCompanies limit={8} showHeader={true} variant="grid" />
```

---

## 3. FeaturedCompanies (Dashboard)

### 📍 Path
```
src/components/dashboard/FeaturedCompanies.jsx
```

### 🎯 Purpose
Component tối ưu cho Dashboard, hiển thị compact list trong sidebar.

### ✨ Features
- ✅ Fixed for dashboard layout
- ✅ List variant only
- ✅ Top 6 companies (fetches 8)
- ✅ Top 3 colored rankings
- ✅ React Query caching
- ✅ Compact card design
- ✅ Star icons for top 3
- ✅ Primary/Emerald colors
- ✅ "Xem tất cả" quick link
- ✅ "Khám phá thêm" button

### 🎨 Design
```
Color: Primary + Emerald accents
Badge: Top 1/2/3 with gold/silver/bronze
Layout: List only (vertical stack)
Header: Card header with quick link
```

### 📱 Responsive
```css
All: 1 column (always)
Optimized for: Dashboard sidebar (300-400px width)
```

### 📊 Data Fetching
```jsx
// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['featured-companies'],
  queryFn: async () => {
    const response = await apiClient.get('/analytics/top-companies?limit=8');
    return response.data;
  },
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000,
});
```

### 🎯 Best For
- ✅ Dashboard sidebar/widget
- ✅ Narrow columns (1 col in 3-col grid)
- ✅ Quick company preview
- ✅ Dashboard integrations

### ⚠️ Limitations
- ❌ Cannot change variant (list only)
- ❌ Limited styling options
- ❌ Dashboard-specific design
- ❌ Not suitable for full-width layouts

### 💻 Usage
```jsx
import FeaturedCompanies from '@/components/dashboard/FeaturedCompanies';

// In Dashboard
<div className="grid grid-cols-3 gap-6">
  <div className="col-span-1">
    <FeaturedCompanies />
  </div>
  <div className="col-span-2">
    <RecommendedJobs />
  </div>
</div>
```

---

## 🎯 Decision Guide

### When to use TopCompanies
```
✅ Landing page ONLY
✅ Need emerald/teal branding
✅ Want simple, no-config solution
✅ Exactly 6 companies needed
✅ Grid 3-column max is enough
```

### When to use TrendingCompanies
```
✅ Multiple pages/locations
✅ Need customization (limit, variant, header)
✅ Want orange/red/pink branding
✅ Need grid OR list layout
✅ Want enhanced UI (sparkles, animations)
✅ Need better performance (React Query)
✅ Want 4-column grid support
✅ Need professional error states
```

### When to use FeaturedCompanies
```
✅ Dashboard sidebar ONLY
✅ Narrow column layout (300-400px)
✅ Need compact list view
✅ Dashboard-consistent styling
✅ Quick preview is enough
```

---

## 🔄 Migration Guide

### From TopCompanies → TrendingCompanies

**Before:**
```jsx
<TopCompanies />
```

**After:**
```jsx
<TrendingCompanies 
  limit={6} 
  showHeader={true} 
  variant="grid" 
/>
```

**Benefits:**
- ✅ Same visual result
- ✅ Better performance (React Query)
- ✅ More customization options
- ✅ Better error handling

---

## 📊 Props Comparison

| Prop | TopCompanies | TrendingCompanies | FeaturedCompanies |
|------|--------------|-------------------|-------------------|
| `limit` | ❌ Fixed 6 | ✅ Configurable | ❌ Fixed 8→6 |
| `showHeader` | ❌ Always | ✅ true/false | ❌ Always |
| `variant` | ❌ Grid only | ✅ grid/list | ❌ List only |
| `className` | ❌ No | ❌ No | ❌ No |
| `onCompanyClick` | ❌ No | ❌ No | ❌ No |

---

## 🎨 Visual Comparison

### TopCompanies
```
┌─────────────────────────────────────────────────┐
│ 🏢 Đối tác uy tín                               │
│ Top công ty hàng đầu (Emerald gradient)        │
│ Các công ty có nhiều tin tuyển dụng nhất       │
├─────────────┬─────────────┬─────────────────────┤
│  [Top 1]    │  [Top 2]    │  [Top 3]           │
│  Logo       │  Logo       │  Logo              │
│  Company    │  Company    │  Company           │
│  5 jobs     │  4 jobs     │  3 jobs            │
├─────────────┼─────────────┼─────────────────────┤
│  Company 4  │  Company 5  │  Company 6         │
└─────────────┴─────────────┴─────────────────────┘
        [Xem tất cả công ty (Emerald)]
```

### TrendingCompanies (Grid)
```
┌──────────────────────────────────────────────────┐
│ 🔥 Đang hot                                      │
│ Top công ty được săn đón nhất (Orange gradient) │
│ Khám phá những công ty hàng đầu...              │
├──────────┬──────────┬──────────┬──────────────┤
│ 🏆 Top 1 │ 🥈 Top 2 │ 🥉 Top 3 │    #4        │
│ ✨       │ ✨       │ ✨       │              │
│  Logo    │  Logo    │  Logo    │  Logo        │
│ Company  │ Company  │ Company  │ Company      │
│ [5 jobs] │ [4 jobs] │ [3 jobs] │ [2 jobs]     │
│ 1K+ HN   │ 1K+ HN   │ 1K+ HN   │ 1K+ HN       │
│ [View]   │ [View]   │ [View]   │ [View]       │
└──────────┴──────────┴──────────┴──────────────┘
   [Khám phá tất cả công ty 🏆 (Orange gradient)]
```

### FeaturedCompanies (List)
```
┌─────────────────────────────────────────┐
│ 🔥 Top công ty được săn đón  [Xem tất cả] │
│ Các công ty có nhiều tin tuyển dụng nhất│
├─────────────────────────────────────────┤
│ [1] [Logo] Company Name ⭐              │
│           💼 5 việc làm 👥 1K+ 📍 HN    │
├─────────────────────────────────────────┤
│ [2] [Logo] Company Name ⭐              │
│           💼 4 việc làm 👥 1K+ 📍 HCM   │
├─────────────────────────────────────────┤
│ [3] [Logo] Company Name ⭐              │
│           💼 3 việc làm 👥 500+ 📍 DN   │
├─────────────────────────────────────────┤
│ [4] [Logo] Company Name                 │
│ [5] [Logo] Company Name                 │
│ [6] [Logo] Company Name                 │
├─────────────────────────────────────────┤
│      [🏢 Khám phá thêm công ty]         │
└─────────────────────────────────────────┘
```

---

## 🚀 Recommendations

### For New Development
**Use TrendingCompanies** - Most flexible and feature-rich

### For Dashboard
**Use FeaturedCompanies** - Optimized for narrow layouts

### For Landing Page
- **Option A**: Keep TopCompanies (simple, proven)
- **Option B**: Migrate to TrendingCompanies (better features)

### Deprecation Plan
Consider deprecating TopCompanies in favor of TrendingCompanies for:
- Better maintainability (single source of truth)
- Consistent API (React Query)
- More features out of the box
- Better performance

---

## 📝 Summary

| Component | Best Use Case | Flexibility | Performance |
|-----------|---------------|-------------|-------------|
| **TopCompanies** | Landing page only | ⭐ Low | ⭐⭐ Fair |
| **TrendingCompanies** | Anywhere | ⭐⭐⭐ High | ⭐⭐⭐ Excellent |
| **FeaturedCompanies** | Dashboard sidebar | ⭐⭐ Medium | ⭐⭐⭐ Excellent |

**Verdict**: Use **TrendingCompanies** for maximum flexibility and performance! 🎯
