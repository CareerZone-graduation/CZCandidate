import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, ArrowLeft, Map, List } from 'lucide-react';
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
 * Main JobSearch page component
 * Handles URL parameters, search state management, and layout
 */
const JobSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

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

  // Validate URL parameters
  const paramValidation = validateSearchParams(rawParams);

  if (!paramValidation.success) {
    console.warn('Invalid search parameters:', paramValidation.errors);
    // Show validation errors to user if needed
    paramValidation.errors?.forEach(error => {
      toast.error(`Lỗi tham số: ${error.message}`);
    });
  }

  // Use validated parameters or defaults
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

  // Search parameters object for API calls
  const searchParameters = {
    query: query || '', // Always include query, even if empty string
    page,
    size,
    textWeight: 0.4, // Default weight for text search
    vectorWeight: 0.6, // Default weight for vector search
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

  // Debug: Log search parameters
  console.log('Search Parameters:', searchParameters);

  // Validate API request parameters - always use hybrid search now
  const apiValidation = validateHybridSearchRequest(searchParameters);

  if (!apiValidation.success) {
    console.warn('Invalid API parameters:', apiValidation.errors);
  } else {
    console.log('Validated API Parameters:', apiValidation.data);
  }

  // React Query for search results - always use hybrid search
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
      
      // 🔍 DEBUG: Log API response để kiểm tra logo
      console.log('🔍 API Response:', result);
      if (result?.data?.length > 0) {
        console.log('📊 First job sample:', {
          title: result.data[0].title,
          company: result.data[0].company,
          hasLogo: !!result.data[0].company?.logo,
          logoUrl: result.data[0].company?.logo
        });
      }
      
      return result;
    },
    enabled: apiValidation.success, // Always fetch when parameters are valid
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    keepPreviousData: true // Keep previous data while loading new data to prevent layout shift
  });

  /**
   * Handle search query changes
   * @param {string} newQuery - New search query
   */
  const handleSearch = (newQuery) => {
    const newParams = new URLSearchParams(searchParams);
    // Always set query, even if empty string
    newParams.set('query', newQuery ? newQuery.trim() : '');
    newParams.set('page', 1); // Reset to first page
    setSearchParams(newParams);
  };

  /**
   * Handle filter changes
   * @param {Object} filters - Filter values object
   */
  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);

    // Update all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to first page when filters change
    newParams.set('page', 1);
    setSearchParams(newParams);
  };

  /**
   * Handle pagination
   * @param {number} newPage - New page number
   */
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('query', query);
    newParams.set('page', '1');
    newParams.set('size', size.toString());
    setSearchParams(newParams);
  };

  /**
   * Handle back navigation
   */
  const handleBackNavigation = () => {
    navigate(-1);
  };

  // Current filter values for the filter components
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

  // Check if any filters are applied
  const hasActiveFilters = Object.values(currentFilters).some(value => value !== '');
  
  // User location for map view (if distance filter is active)
  const userLocationForMap = (latitude && longitude) ? `[${longitude}, ${latitude}]` : null;

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm relative z-10">
      {/* Header with search bar */}
      <div className={cn(
        "sticky top-0 z-40",
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

            {/* Mobile Filter Button */}
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "lg:hidden flex-shrink-0 rounded-xl",
                    "border-2 border-primary/40 hover:border-primary",
                    "hover:bg-primary/10 hover:scale-105",
                    "transition-all duration-300",
                    hasActiveFilters && "bg-primary/10 border-primary animate-pulse"
                  )}
                >
                  <Filter className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    hasActiveFilters ? "text-primary" : "text-muted-foreground"
                  )} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Bộ lọc tìm kiếm</h3>
                  <SearchFilters
                    filters={currentFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </SheetContent>
            </Sheet>
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
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                  <Separator className="mb-4 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <SearchFilters
                    filters={currentFilters}
                    onFilterChange={handleFilterChange}
                  />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Search Results - Main Content Area */}
          <main className="min-w-0">
            {/* Results Header with View Mode Toggle */}
            <div className="mb-8">
              <Card className={cn(
                "border-2 border-border/30 shadow-lg shadow-primary/5",
                "bg-card/90 backdrop-blur-sm",
                "transition-all duration-300"
              )}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    {/* Search Results Header */}
                    <div className="flex-1">
                      <SearchResultsHeader
                        query={query}
                        currentPage={page}
                        totalPages={searchResults?.meta?.totalPages || 0}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                    
                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <span className="text-sm text-muted-foreground font-medium mr-2">
                        Hiển thị:
                      </span>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "transition-all duration-300",
                          viewMode === 'list' && "btn-gradient text-white shadow-lg shadow-primary/20"
                        )}
                      >
                        <List className="h-4 w-4 mr-2" />
                        Danh sách
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                        className={cn(
                          "transition-all duration-300",
                          viewMode === 'map' && "btn-gradient text-white shadow-lg shadow-primary/20"
                        )}
                      >
                        <Map className="h-4 w-4 mr-2" />
                        Bản đồ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conditional View - List or Map */}
            {viewMode === 'list' ? (
              /* Results List - Enhanced spacing */
              <div className="min-h-[600px] space-y-4">
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
              </div>
            ) : (
              /* Map View - No Pagination Needed */
              <div className="min-h-[600px]">
                <JobMapView
                  initialJobs={searchResults?.data || []}
                  isLoading={isLoading}
                  userLocation={userLocationForMap}
                  searchFilters={searchParameters}
                />
              </div>
            )}

            {/* Pagination - Only for List View */}
            {viewMode === 'list' && searchResults?.data?.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Card className={cn(
                  "border-2 border-border/30 shadow-lg shadow-primary/5",
                  "bg-card/90 backdrop-blur-sm"
                )}>
                  <CardContent className="p-4">
                    <ResultsPagination
                      currentPage={page}
                      totalPages={searchResults?.meta?.totalPages || 0}
                      totalResults={searchResults?.meta?.total || 0}
                      pageSize={size}
                      onPageChange={handlePageChange}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
