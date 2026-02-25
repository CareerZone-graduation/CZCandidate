import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SlidersHorizontal, ArrowLeft, Map, LayoutGrid, Briefcase, X, Sparkles, Filter } from 'lucide-react';
import { searchJobsHybrid } from '@/services/jobService';
import { validateSearchParams, validateHybridSearchRequest } from '@/schemas/searchSchemas';
import { toast } from 'sonner';

// Import search interface components
import JobSearchBar from './components/SearchInterface/JobSearchBar';
import SearchFilters from './components/SearchInterface/SearchFilters';
import JobResultsList from './components/SearchResults/JobResultsList';
import SearchResultsHeader from './components/SearchResults/SearchResultsHeader';
import ResultsPagination from './components/SearchResults/ResultsPagination';
import JobMapView from './components/MapView/JobMapView';
import { cn } from '@/lib/utils';

/**
 * Main JobSearch page component - Redesigned for professional job portal
 */
const JobSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  // Extract and validate search parameters from URL
  const rawParams = {
    query: searchParams.get('query') || '',
    page: searchParams.get('page') || 1,
    size: searchParams.get('size') || 10,
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    workType: searchParams.get('workType') || '',
    experience: searchParams.get('experience') || '',
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    latitude: searchParams.get('latitude') || '',
    longitude: searchParams.get('longitude') || '',
    distance: searchParams.get('distance') || '',
    aiSearch: searchParams.get('aiSearch') === 'true'
  };

  const paramValidation = validateSearchParams(rawParams);

  if (!paramValidation.success) {
    console.warn('Invalid search parameters:', paramValidation.errors);
    paramValidation.errors?.forEach(error => {
      toast.error(`Lỗi tham số: ${error.message}`);
    });
  }

  const validatedParams = paramValidation.data || {};
  const query = validatedParams.query || '';
  const page = validatedParams.page || 1;
  const size = validatedParams.size || 10;
  const category = validatedParams.category || '';
  const type = validatedParams.type || '';
  const workType = validatedParams.workType || '';
  const experience = validatedParams.experience || '';
  const province = validatedParams.province || '';
  const district = validatedParams.district || '';
  const minSalary = validatedParams.minSalary || '';
  const maxSalary = validatedParams.maxSalary || '';
  const latitude = validatedParams.latitude || '';
  const longitude = validatedParams.longitude || '';
  const distance = validatedParams.distance || '';
  const aiSearch = validatedParams.aiSearch || false;

  const searchParameters = {
    query: query || '',
    page,
    size,
    textWeight: 0.4,
    vectorWeight: 0.6,
    ...(category && { category }),
    ...(type && { type }),
    ...(workType && { workType }),
    ...(experience && { experience }),
    ...(province && { province }),
    ...(district && { district }),
    ...(minSalary && { minSalary: parseInt(minSalary) }),
    ...(maxSalary && { maxSalary: parseInt(maxSalary) }),
    ...(latitude && { latitude: parseFloat(latitude) }),
    ...(longitude && { longitude: parseFloat(longitude) }),
    ...(distance && { distance: parseFloat(distance) }),
    aiSearch
  };

  const apiValidation = validateHybridSearchRequest(searchParameters);

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['jobs', 'search', apiValidation.data || searchParameters],
    queryFn: async () => {
      const result = await searchJobsHybrid(apiValidation.data || searchParameters);
      return result;
    },
    enabled: apiValidation.success,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });

  const handleSearch = (newQuery) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('query', newQuery ? newQuery.trim() : '');
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const handleToggleAiSearch = (checked) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('aiSearch', 'true');
    } else {
      newParams.delete('aiSearch');
    }
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('query', query);
    newParams.set('page', '1');
    newParams.set('size', size.toString());
    setSearchParams(newParams);
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  const currentFilters = {
    category,
    type,
    workType,
    experience,
    province,
    district,
    minSalary,
    maxSalary,
    latitude,
    longitude,
    distance
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => value !== '');
  const activeFilterCount = Object.values(currentFilters).filter(value => value !== '').length;
  const userLocationForMap = (latitude && longitude) ? `[${longitude}, ${latitude}]` : null;

  // Get active filter labels for display
  const getActiveFilterLabels = () => {
    const labels = [];
    if (category) labels.push({ key: 'category', label: category });
    if (type) labels.push({ key: 'type', label: type });
    if (workType) labels.push({ key: 'workType', label: workType });
    if (experience) labels.push({ key: 'experience', label: experience });
    if (province) labels.push({ key: 'province', label: province });
    if (district) labels.push({ key: 'district', label: district });
    if (minSalary || maxSalary) labels.push({ key: 'salary', label: 'Mức lương' });
    if (distance) labels.push({ key: 'distance', label: `${distance}km` });
    return labels;
  };

  const removeFilter = (filterKey) => {
    const newFilters = { ...currentFilters };
    if (filterKey === 'salary') {
      newFilters.minSalary = '';
      newFilters.maxSalary = '';
    } else if (filterKey === 'distance') {
      newFilters.distance = '';
      newFilters.latitude = '';
      newFilters.longitude = '';
    } else {
      newFilters[filterKey] = '';
    }
    handleFilterChange(newFilters);
  };

  return (
    <div className="min-h-screen bg-background relative z-10">
      {/* ── Sticky search header ── */}
      <div className={cn(
        'sticky top-16 z-40',
        'bg-background/95 backdrop-blur-md',
        'border-b border-border/60',
        'shadow-sm'
      )}>
        <div className="container py-3">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              aria-label="Quay lại"
              className={cn(
                'flex-shrink-0 h-9 w-9 rounded-lg cursor-pointer',
                'text-muted-foreground hover:text-primary',
                'hover:bg-primary/8 transition-all duration-200'
              )}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'lg:hidden shrink-0 h-9 w-9 rounded-lg cursor-pointer',
                    'border-border/60 hover:border-primary/40 hover:bg-primary/8',
                    'transition-all duration-200',
                    hasActiveFilters && 'border-primary/50 bg-primary/8 text-primary'
                  )}
                  aria-label="Mở bộ lọc"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[380px] overflow-y-auto pt-10">
                <SheetHeader className="mb-4">
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                </SheetHeader>
                <SearchFilters filters={currentFilters} onFilterChange={handleFilterChange} />
              </SheetContent>
            </Sheet>

            {/* Search Bar + AI Toggle */}
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1">
                <JobSearchBar
                  initialQuery={query}
                  currentFilters={currentFilters}
                  onSearch={handleSearch}
                  onFiltersApply={handleFilterChange}
                  placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
                />
              </div>

              {/* AI Toggle chip */}
              <button
                type="button"
                onClick={() => handleToggleAiSearch(!aiSearch)}
                aria-pressed={aiSearch}
                title={aiSearch ? 'Tắt AI tìm kiếm' : 'Bật AI tìm kiếm'}
                className={cn(
                  'relative flex-shrink-0 flex items-center gap-2 h-10 px-3.5 rounded-lg',
                  'text-xs font-semibold whitespace-nowrap cursor-pointer',
                  'border transition-all duration-250',
                  aiSearch
                    ? 'bg-primary/12 border-primary/35 text-primary shadow-sm shadow-primary/15'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/25 hover:bg-primary/5'
                )}
              >
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-250',
                  aiSearch ? 'bg-primary' : 'bg-muted-foreground/40'
                )} />
                <Sparkles className={cn(
                  'w-3.5 h-3.5 transition-colors duration-250',
                  aiSearch ? 'text-primary' : 'text-muted-foreground/60'
                )} />
                <span>{aiSearch ? 'AI On' : 'AI'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* ── Main Content ── */}
      <div className="container py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">
          {/* ── Desktop Filters Sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(4rem+57px)]">
              <Card className={cn(
                'border border-border/60 shadow-sm',
                'bg-card overflow-hidden'
              )}>
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10">
                      <Filter className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Bộ lọc</span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className={cn(
                        'text-xs font-medium cursor-pointer',
                        'text-muted-foreground hover:text-destructive',
                        'transition-colors duration-200'
                      )}
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
                <CardContent className="p-4">
                  <SearchFilters filters={currentFilters} onFilterChange={handleFilterChange} />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* ── Results area ── */}
          <main className="min-w-0 flex flex-col gap-4">

            {/* Active filter chips — quick remove */}
            {hasActiveFilters && (() => {
              const labels = getActiveFilterLabels();
              return labels.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Đang lọc:</span>
                  {labels.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => removeFilter(key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer',
                        'text-xs font-medium border',
                        'bg-primary/8 border-primary/25 text-primary',
                        'hover:bg-red-50 hover:border-red-300 hover:text-red-600',
                        'transition-all duration-200'
                      )}
                    >
                      {label}
                      <X className="h-3 w-3" />
                    </button>
                  ))}
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-medium text-muted-foreground hover:text-destructive cursor-pointer transition-colors duration-200 ml-1 underline underline-offset-2"
                  >
                    Xóa tất cả
                  </button>
                </div>
              ) : null;
            })()}

            {/* AI thinking indicator */}
            {isLoading && aiSearch && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5">
                <div className="h-1 flex-1 rounded-full overflow-hidden bg-primary/15">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: 'ai-wave 1.4s ease-in-out infinite'
                    }}
                  />
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-primary whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI đang phân tích
                  <span className="inline-flex gap-[3px]">
                    <span className="w-1 h-1 rounded-full bg-primary" style={{ animation: 'ai-dot 1.4s ease-in-out infinite' }} />
                    <span className="w-1 h-1 rounded-full bg-primary" style={{ animation: 'ai-dot 1.4s ease-in-out 0.2s infinite' }} />
                    <span className="w-1 h-1 rounded-full bg-primary" style={{ animation: 'ai-dot 1.4s ease-in-out 0.4s infinite' }} />
                  </span>
                </span>
                <style>{`
                  @keyframes ai-wave {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                  }
                  @keyframes ai-dot {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1.2); }
                  }
                  @media (prefers-reduced-motion: reduce) {
                    @keyframes ai-wave { 0%, 100% { background-position: 0 0; } }
                    @keyframes ai-dot  { 0%, 100% { opacity: 0.6; transform: none; } }
                  }
                `}</style>
              </div>
            )}

            {/* Results header — title + total + view toggle */}
            <SearchResultsHeader
              query={query}
              totalResults={searchResults?.meta?.total || 0}
              currentPage={page}
              totalPages={searchResults?.meta?.totalPages || 0}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Results content */}
            {viewMode === 'list' ? (
              <div className="space-y-3">
                <JobResultsList
                  jobs={searchResults?.data || []}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  onRetry={refetch}
                  query={query}
                  userLocation={userLocationForMap}
                  searchParameters={apiValidation.data || searchParameters}
                />

                {searchResults?.data?.length > 0 && (
                  <div className="mt-6">
                    <ResultsPagination
                      currentPage={page}
                      totalPages={searchResults?.meta?.totalPages || 0}
                      totalResults={searchResults?.meta?.total || 0}
                      pageSize={size}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
                <JobMapView
                  initialJobs={searchResults?.data || []}
                  isLoading={isLoading}
                  userLocation={userLocationForMap}
                  searchFilters={searchParameters}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
