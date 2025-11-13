# Usage Examples - TrendingCompanies Component

## 1. Trang Landing Page (Full Featured - Grid)

```jsx
// src/pages/Home.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Popular Categories */}
      <PopularCategories />
      
      {/* Trending Companies - Full Featured */}
      <TrendingCompanies 
        limit={12} 
        showHeader={true} 
        variant="grid" 
      />
      
      {/* Featured Jobs */}
      <FeaturedJobs />
    </div>
  );
}
```

**Result**: Hiển thị 12 công ty ở dạng grid 4 cột với header đầy đủ, màu gradient orange-red-pink.

---

## 2. Sidebar Widget (Compact - List)

```jsx
// src/components/layout/Sidebar.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function Sidebar() {
  return (
    <aside className="w-80 space-y-6">
      {/* Profile Summary */}
      <ProfileCard />
      
      {/* Trending Companies - Compact */}
      <TrendingCompanies 
        limit={6} 
        showHeader={false} 
        variant="list" 
      />
      
      {/* Quick Links */}
      <QuickLinks />
    </aside>
  );
}
```

**Result**: Hiển thị 6 công ty dạng list compact, không có header, phù hợp sidebar.

---

## 3. Company Discovery Page (Grid - No Header)

```jsx
// src/pages/CompanyDiscovery.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function CompanyDiscovery() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Khám phá công ty</h1>
        <p className="text-muted-foreground">
          Tìm kiếm và kết nối với các nhà tuyển dụng hàng đầu
        </p>
      </div>

      {/* Search & Filters */}
      <CompanySearchFilters />

      {/* Trending Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Công ty được săn đón nhất</h2>
        <TrendingCompanies 
          limit={8} 
          showHeader={false} 
          variant="grid" 
        />
      </div>

      {/* All Companies */}
      <AllCompaniesList />
    </div>
  );
}
```

**Result**: Grid 8 công ty không có section header (dùng custom heading), 4 cột responsive.

---

## 4. Dashboard Widget (Small Grid)

```jsx
// src/pages/dashboard/Dashboard.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats Grid */}
      <StatsGrid />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Việc làm phù hợp</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendedJobs />
          </CardContent>
        </Card>

        {/* Trending Companies */}
        <div>
          <TrendingCompanies 
            limit={4} 
            showHeader={true} 
            variant="grid" 
          />
        </div>
      </div>
    </div>
  );
}
```

**Result**: Grid 2x2 (4 companies) với header, hiển thị trong dashboard layout.

---

## 5. Job Detail Page (Sidebar - List)

```jsx
// src/pages/jobs/JobDetail.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function JobDetail() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2">
          <JobDetailCard />
          <JobDescription />
          <CompanyInfo />
        </div>

        {/* Sidebar - 1 column */}
        <aside className="space-y-6">
          {/* Apply Button */}
          <ApplyButton />

          {/* Similar Jobs */}
          <SimilarJobs limit={3} />

          {/* Trending Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Công ty hot</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingCompanies 
                limit={5} 
                showHeader={false} 
                variant="list" 
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
```

**Result**: List 5 công ty trong sidebar của job detail, compact format.

---

## 6. Company List Page (With Tabs)

```jsx
// src/pages/companies/CompanyList.jsx
import { useState } from 'react';
import TrendingCompanies from '@/components/sections/TrendingCompanies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CompanyList() {
  const [activeTab, setActiveTab] = useState('trending');

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Danh sách công ty</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="trending">🔥 Đang hot</TabsTrigger>
          <TabsTrigger value="featured">⭐ Nổi bật</TabsTrigger>
          <TabsTrigger value="all">📋 Tất cả</TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <TrendingCompanies 
            limit={20} 
            showHeader={false} 
            variant="grid" 
          />
        </TabsContent>

        <TabsContent value="featured">
          <FeaturedCompanies limit={20} />
        </TabsContent>

        <TabsContent value="all">
          <AllCompanies />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Result**: Tab "Đang hot" hiển thị 20 công ty trending dạng grid.

---

## 7. Mobile Bottom Sheet (List)

```jsx
// src/components/mobile/CompaniesBottomSheet.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function CompaniesBottomSheet({ open, onClose }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Công ty được săn đón</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 overflow-y-auto h-full pb-20">
          <TrendingCompanies 
            limit={10} 
            showHeader={false} 
            variant="list" 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Result**: Bottom sheet mobile với list 10 công ty, scroll vertical.

---

## 8. Email Template (Static HTML)

```jsx
// src/services/email/templates/weeklyDigest.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export function WeeklyDigestEmail({ user }) {
  return (
    <EmailLayout>
      <EmailHeader>
        Chào {user.fullname}, đây là bản tin tuần này! 📬
      </EmailHeader>

      <EmailSection title="📊 Thống kê của bạn">
        <UserStats user={user} />
      </EmailSection>

      <EmailSection title="🔥 Công ty hot tuần này">
        <TrendingCompanies 
          limit={6} 
          showHeader={false} 
          variant="grid" 
        />
      </EmailSection>

      <EmailSection title="💼 Việc làm mới">
        <NewJobs limit={5} />
      </EmailSection>

      <EmailFooter />
    </EmailLayout>
  );
}
```

**Result**: Email digest với 6 công ty trending, 3 columns grid (2 rows).

---

## 9. Dialog/Modal (Compact Grid)

```jsx
// src/components/dialogs/ExploreCompaniesDialog.jsx
import TrendingCompanies from '@/components/sections/TrendingCompanies';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExploreCompaniesDialog({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Khám phá công ty hàng đầu</DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <TrendingCompanies 
            limit={8} 
            showHeader={false} 
            variant="grid" 
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
          <Button onClick={() => navigate('/companies')}>
            Xem tất cả công ty
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Result**: Dialog hiển thị 8 công ty grid 2x4, có buttons ở footer.

---

## 10. Search Results Page (Mixed Layout)

```jsx
// src/pages/search/SearchResults.jsx
import { useSearchParams } from 'react-router-dom';
import TrendingCompanies from '@/components/sections/TrendingCompanies';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        Kết quả tìm kiếm: "{query}"
      </h1>

      {/* Search Results */}
      <div className="mb-12">
        <JobSearchResults query={query} />
      </div>

      {/* Related Companies */}
      {query && (
        <div className="border-t pt-12">
          <h2 className="text-xl font-bold mb-6">
            Công ty liên quan đến "{query}"
          </h2>
          <TrendingCompanies 
            limit={8} 
            showHeader={false} 
            variant="grid" 
          />
        </div>
      )}
    </div>
  );
}
```

**Result**: Hiển thị công ty liên quan đến search query dưới job results.

---

## 🎯 Best Practices

### When to use Grid
- ✅ Landing pages (full width)
- ✅ Discovery pages
- ✅ Dashboard main section
- ✅ Company listing pages
- ✅ Wide layouts (>1024px)

### When to use List
- ✅ Sidebars
- ✅ Narrow widgets
- ✅ Mobile views
- ✅ Bottom sheets
- ✅ Compact sections

### Limit Guidelines
- **4-6**: Small widgets, cards
- **8-12**: Standard sections
- **16-20**: Full pages, tabs
- **20+**: Use with pagination

### showHeader Usage
- `true`: Standalone sections, landing pages
- `false`: Integrated into custom layouts, widgets

---

## 🎨 Customization Examples

### Custom Wrapper
```jsx
<div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
  <TrendingCompanies 
    limit={12} 
    showHeader={true} 
    variant="grid" 
  />
</div>
```

### With Custom Title
```jsx
<section>
  <div className="text-center mb-8">
    <h2 className="text-4xl font-bold mb-4">
      Các công ty <span className="text-primary">đáng chú ý</span>
    </h2>
    <p className="text-lg text-muted-foreground">
      Nơi có nhiều cơ hội việc làm nhất
    </p>
  </div>
  
  <TrendingCompanies 
    limit={8} 
    showHeader={false} 
    variant="grid" 
  />
</section>
```

### Conditional Rendering
```jsx
{isAuthenticated ? (
  <TrendingCompanies limit={12} variant="grid" />
) : (
  <TrendingCompanies limit={6} variant="list" />
)}
```
