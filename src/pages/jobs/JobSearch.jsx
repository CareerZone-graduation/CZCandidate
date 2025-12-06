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
    distance: searchParams.get('distance') || ''
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
    ...(distance && { distance: parseFloat(distance) })
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
    <div className="min-h-screen bg-background/80 backdrop-blur-sm relative z-10">
      {/* Header with search bar */}
      <div className={cn(
        "sticky top-16 z-40",
        "bg-background/80 backdrop-blur-xl",
        "border-b-2 border-border/50",
        "shadow-lg shadow-primary/5",
        "transition-all duration-300"
      )}>
        <div className="container py-5">
          <div className="flex items-center gap-4">
            {/* Back Button with enhanced styling */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className={cn(
                "flex-shrink-0 rounded-xl",
                "hover:bg-primary/10 hover:scale-105",
                "transition-all duration-300",
                "border-2 border-transparent hover:border-primary/30"
              )}
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-300" />
            </Button>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-10">
                <SheetHeader className="mb-4">
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                </SheetHeader>
                <SearchFilters
                  filters={currentFilters}
                  onFilterChange={handleFilterChange}
                />
              </SheetContent>
            </Sheet>

            {/* Search Bar */}
            <div className="flex-1">
              <JobSearchBar
                initialQuery={query}
                currentFilters={currentFilters}
                onSearch={handleSearch}
                onFiltersApply={handleFilterChange}
                placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
              />
            </div>

            {/* Quick Stats */}
            {searchResults?.meta?.total > 0 && (
              <div className="mt-6 flex items-center gap-2 text-white/80">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">
                  Tìm thấy <span className="font-semibold text-white">{searchResults.meta.total.toLocaleString()}</span> việc làm phù hợp
                </span>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Desktop Filters Sidebar - Fixed Width */}
          <aside className="hidden lg:block w-[320px]">
            <div className="sticky top-28">
              <Card className={cn(
                "border-2 border-border/50 shadow-xl shadow-primary/5",
                "bg-card/95 backdrop-blur-sm",
                "hover:shadow-2xl hover:shadow-primary/10",
                "transition-shadow duration-500",
                "overflow-hidden relative"
              )}>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                        <Filter className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Bộ lọc
                      </h3>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className={cn(
                          "text-xs font-semibold rounded-lg",
                          "text-red-600 hover:text-red-700",
                          "hover:bg-red-50/20 border border-transparent",
                          "hover:border-red-500/30",
                          "transition-all duration-300 hover:scale-105"
                        )}
                      >
                        Xóa tất cả
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardContent className="p-4 relative z-10">
                  <SearchFilters
                    filters={currentFilters}
                    onFilterChange={handleFilterChange}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Results Area */}
          <main className="min-w-0">
            {/* Results Header */}
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

            {/* Results Content */}
            {viewMode === 'list' ? (
              <div className="space-y-4">
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

                {/* Pagination */}
                {searchResults?.data?.length > 0 && (
                  <div className="mt-8 flex justify-center">
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
              <div className="rounded-2xl overflow-hidden border shadow-lg">
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
