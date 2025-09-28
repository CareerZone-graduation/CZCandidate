import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter, ArrowLeft } from 'lucide-react';
import { searchJobsHybrid, getAllJobs } from '@/services/jobService';
import { validateSearchParams, validateHybridSearchRequest } from '@/schemas/searchSchemas';
import { toast } from 'sonner';

// Import search interface components
import JobSearchBar from './components/SearchInterface/JobSearchBar';
import SearchFilters from './components/SearchInterface/SearchFilters';
import JobResultsList from './components/SearchResults/JobResultsList';
import SearchResultsHeader from './components/SearchResults/SearchResultsHeader';
import ResultsPagination from './components/SearchResults/ResultsPagination';

/**
 * Main JobSearch page component
 * Handles URL parameters, search state management, and layout
 */
const JobSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract and validate search parameters from URL
  const rawParams = {
    query: searchParams.get('query') || '',
    page: searchParams.get('page') || '1',
    size: searchParams.get('size') || (searchParams.get('query') ? '10' : '1000'), // Show all jobs when no search query
    category: searchParams.get('category') || '',
    type: searchParams.get('type') || '',
    workType: searchParams.get('workType') || '',
    experience: searchParams.get('experience') || '',
    province: searchParams.get('province') || '',
    district: searchParams.get('district') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || ''
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

  // Search parameters object for API calls
  const searchParameters = {
    query,
    page,
    size,
    ...(category && { category }),
    ...(type && { type }),
    ...(workType && { workType }),
    ...(experience && { experience }),
    ...(province && { province }),
    ...(district && { district }),
    ...(minSalary && { minSalary: parseInt(minSalary) }),
    ...(maxSalary && { maxSalary: parseInt(maxSalary) })
  };

  // Validate API request parameters
  const apiValidation = query ? validateHybridSearchRequest(searchParameters) : { success: true, data: searchParameters };
  
  if (!apiValidation.success) {
    console.warn('Invalid API parameters:', apiValidation.errors);
  }

  // React Query for search results
  const {
    data: searchResults,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: query ? ['jobs', 'search', apiValidation.data || searchParameters] : ['jobs', 'all', searchParameters],
    queryFn: () => query ? searchJobsHybrid(apiValidation.data || searchParameters) : getAllJobs(searchParameters),
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
    newParams.set('query', newQuery);
    newParams.set('page', '1'); // Reset to first page
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
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  /**
   * Handle pagination
   * @param {number} newPage - New page number
   */
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
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
    maxSalary
  };

  // Check if any filters are applied
  const hasActiveFilters = Object.values(currentFilters).some(value => value !== '');

  return (
    <div className="min-h-screen bg-background">
      {/* Header with search bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackNavigation}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {/* Search Bar */}
            <div className="flex-1">
              <JobSearchBar
                initialQuery={query}
                onSearch={handleSearch}
                placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
              />
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="lg:hidden flex-shrink-0"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Bộ lọc tìm kiếm</h3>
                  <SearchFilters
                    filters={currentFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Bộ lọc tìm kiếm</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-primary hover:text-primary/80"
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                  <Separator className="mb-4" />
                  <SearchFilters
                    filters={currentFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    hasActiveFilters={hasActiveFilters}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header - Fixed height to prevent layout shift */}
            <div className="mb-6">
              <SearchResultsHeader
                query={query}
                currentPage={page}
                totalPages={searchResults?.meta?.totalPages || 0}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Results List - Min height to prevent layout shift */}
            <div className="min-h-[600px]">
              <JobResultsList
                jobs={searchResults?.data || []}
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                query={query}
              />
            </div>

            {/* Pagination - Fixed position */}
            <div className="mt-8 flex justify-center">
              {searchResults?.data?.length > 0 && (
                <ResultsPagination
                  currentPage={page}
                  totalPages={searchResults?.meta?.totalPages || 0}
                  totalResults={searchResults?.meta?.total || 0}
                  pageSize={size}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;