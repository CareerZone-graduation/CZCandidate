import React, { useState } from 'react';
import {
  jobCategoryEnum,
  jobTypeEnum,
  workTypeEnum,
  experienceEnum
} from '@/schemas/searchSchemas';
import FilterGroup from './FilterGroup';
import SalaryRangeSlider from './SalaryRangeSlider';
import LocationFilter from './LocationFilter';
import DistanceFilter from './DistanceFilter';
import SearchableSelect from '@/components/ui/searchable-select';
import { Briefcase, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchFilters - Redesigned professional filter panel
 */
const SearchFilters = ({
  filters = {},
  onFilterChange
}) => {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const categoryOptions = [
    { value: '', label: 'Tất cả ngành nghề' },
    ...jobCategoryEnum.map(value => ({
      value,
      label: {
        IT: 'Công nghệ thông tin',
        SOFTWARE_DEVELOPMENT: 'Phát triển phần mềm',
        DATA_SCIENCE: 'Khoa học dữ liệu',
        MACHINE_LEARNING: 'Học máy',
        WEB_DEVELOPMENT: 'Phát triển web',
        SALES: 'Bán hàng',
        MARKETING: 'Marketing',
        ACCOUNTING: 'Kế toán',
        GRAPHIC_DESIGN: 'Thiết kế đồ họa',
        CONTENT_WRITING: 'Viết nội dung',
        MEDICAL: 'Y tế',
        TEACHING: 'Giảng dạy',
        ENGINEERING: 'Kỹ thuật',
        PRODUCTION: 'Sản xuất',
        LOGISTICS: 'Logistics',
        HOSPITALITY: 'Khách sạn - Du lịch',
        REAL_ESTATE: 'Bất động sản',
        LAW: 'Pháp lý',
        FINANCE: 'Tài chính',
        HUMAN_RESOURCES: 'Nhân sự',
        CUSTOMER_SERVICE: 'Chăm sóc khách hàng',
        ADMINISTRATION: 'Hành chính',
        MANAGEMENT: 'Quản lý',
        OTHER: 'Khác'
      }[value] || value
    }))
  ];

  const jobTypeOptions = [
    { value: '', label: 'Tất cả' },
    ...jobTypeEnum.map(value => ({
      value,
      label: {
        FULL_TIME: 'Toàn thời gian',
        PART_TIME: 'Bán thời gian',
        CONTRACT: 'Hợp đồng',
        TEMPORARY: 'Tạm thời',
        INTERNSHIP: 'Thực tập',
        FREELANCE: 'Tự do'
      }[value] || value
    }))
  ];

  const workTypeOptions = [
    { value: '', label: 'Tất cả' },
    ...workTypeEnum.map(value => ({
      value,
      label: {
        ON_SITE: 'Tại văn phòng',
        REMOTE: 'Làm từ xa',
        HYBRID: 'Linh hoạt'
      }[value] || value
    }))
  ];

  const experienceOptions = [
    { value: '', label: 'Tất cả' },
    ...experienceEnum.map(value => ({
      value,
      label: {
        ENTRY_LEVEL: 'Nhân viên mới',
        MID_LEVEL: 'Trung cấp',
        SENIOR_LEVEL: 'Cao cấp',
        EXECUTIVE: 'Điều hành',
        NO_EXPERIENCE: 'Không yêu cầu',
        INTERN: 'Thực tập sinh',
        FRESHER: 'Mới tốt nghiệp'
      }[value] || value
    }))
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleSalaryChange = (salaryData) => {
    onFilterChange({
      ...filters,
      minSalary: salaryData.minSalary,
      maxSalary: salaryData.maxSalary
    });
  };

  const handleLocationChange = (locationData) => {
    onFilterChange({
      ...filters,
      province: locationData.province,
      district: locationData.district
    });
  };

  const handleDistanceChange = (distanceData) => {
    onFilterChange({
      ...filters,
      distance: distanceData.distance,
      latitude: distanceData.latitude,
      longitude: distanceData.longitude
    });
  };

  return (
    <div className="space-y-1">
      {/* Distance Filter */}
      <DistanceFilter
        distance={filters.distance || ''}
        latitude={filters.latitude || ''}
        longitude={filters.longitude || ''}
        onChange={handleDistanceChange}
      />

      {/* Location Filter */}
      <LocationFilter
        province={filters.province || ''}
        district={filters.district || ''}
        onChange={handleLocationChange}
      />

      {/* Job Category */}
      <div className="border-b border-slate-100">
        <button
          type="button"
          onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
          className={cn(
            "w-full flex items-center justify-between py-3 px-1",
            "text-left transition-colors hover:bg-slate-50 rounded-lg -mx-1"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="font-medium text-slate-800 text-sm">Ngành nghề</span>
              {!isCategoryExpanded && filters.category && (
                <p className="text-xs text-primary font-medium mt-0.5 truncate max-w-[150px]">
                  {categoryOptions.find(opt => opt.value === filters.category)?.label || filters.category}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isCategoryExpanded && "rotate-180"
            )}
          />
        </button>

        {isCategoryExpanded && (
          <div className="pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
            <SearchableSelect
              options={categoryOptions}
              value={filters.category || ''}
              onChange={(value) => handleFilterChange('category', value)}
              placeholder="Tất cả ngành nghề"
              searchPlaceholder="Tìm ngành nghề..."
              className="w-full bg-white"
            />
          </div>
        )}
      </div>

      {/* Job Type */}
      <FilterGroup
        title="Loại hình"
        icon="clock"
        value={filters.type || ''}
        options={jobTypeOptions}
        onChange={(value) => handleFilterChange('type', value)}
        collapsible={true}
        defaultExpanded={true}
        maxVisibleItems={6}
      />

      {/* Work Type */}
      <FilterGroup
        title="Hình thức"
        icon="building"
        value={filters.workType || ''}
        options={workTypeOptions}
        onChange={(value) => handleFilterChange('workType', value)}
        collapsible={true}
        defaultExpanded={true}
        maxVisibleItems={4}
      />

      {/* Experience Level */}
      <FilterGroup
        title="Kinh nghiệm"
        icon="award"
        value={filters.experience || ''}
        options={experienceOptions}
        onChange={(value) => handleFilterChange('experience', value)}
        collapsible={true}
        defaultExpanded={false}
        maxVisibleItems={5}
      />

      {/* Salary Range */}
      <SalaryRangeSlider
        minSalary={filters.minSalary || ''}
        maxSalary={filters.maxSalary || ''}
        onChange={handleSalaryChange}
      />
    </div>
  );
};

export default SearchFilters;
