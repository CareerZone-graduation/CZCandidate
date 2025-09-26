import React from 'react';
import { Separator } from '@/components/ui/separator';
import {
  jobCategoryEnum,
  jobTypeEnum,
  workTypeEnum,
  experienceEnum
} from '@/schemas/searchSchemas';
import FilterGroup from './FilterGroup';
import SalaryRangeFilter from './SalaryRangeFilter';
import LocationFilter from './LocationFilter';

/**
 * Main SearchFilters component that combines all filter types
 * Manages the filter state and passes changes to parent component
 */
const SearchFilters = ({
  filters = {},
  onFilterChange
}) => {
  // Filter configurations aligned with searchSchemas.js
  const categoryOptions = [
    { value: '', label: 'Tất cả' },
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
        REMOTE: 'Từ xa',
        HYBRID: 'Linh hoạt'
      }[value] || value
    }))
  ];

  const experienceOptions = [
    { value: '', label: 'Tất cả' },
    ...experienceEnum.map(value => ({
      value,
      label: {
        ENTRY_LEVEL: 'Nhân viên',
        MID_LEVEL: 'Trung cấp',
        SENIOR_LEVEL: 'Cao cấp',
        EXECUTIVE: 'Điều hành',
        NO_EXPERIENCE: 'Không yêu cầu kinh nghiệm',
        INTERN: 'Thực tập sinh',
        FRESHER: 'Mới tốt nghiệp'
      }[value] || value
    }))
  ];

  /**
   * Handle individual filter changes
   * @param {string} filterType - Type of filter (category, type, etc.)
   * @param {string} value - New value for the filter
   */
  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  /**
   * Handle salary range changes
   * @param {Object} salaryData - Object with minSalary and maxSalary
   */
  const handleSalaryChange = (salaryData) => {
    onFilterChange({
      ...filters,
      minSalary: salaryData.minSalary,
      maxSalary: salaryData.maxSalary
    });
  };

  /**
   * Handle location changes
   * @param {Object} locationData - Object with province and district
   */
  const handleLocationChange = (locationData) => {
    onFilterChange({
      ...filters,
      province: locationData.province,
      district: locationData.district
    });
  };

  return (
    <div className="space-y-6">
      {/* Job Category Filter */}
      <FilterGroup
        title="Lĩnh vực"
        value={filters.category || ''}
        options={categoryOptions}
        onChange={(value) => handleFilterChange('category', value)}
        collapsible={true}
        defaultExpanded={false}
        maxVisibleItems={6}
      />

      <Separator />

      {/* Job Type Filter */}
      <FilterGroup
        title="Loại hình công việc"
        value={filters.type || ''}
        options={jobTypeOptions}
        onChange={(value) => handleFilterChange('type', value)}
        collapsible={true}
        defaultExpanded={true}
        maxVisibleItems={4}
      />

      <Separator />

      {/* Work Type Filter */}
      <FilterGroup
        title="Hình thức làm việc"
        value={filters.workType || ''}
        options={workTypeOptions}
        onChange={(value) => handleFilterChange('workType', value)}
        collapsible={true}
        defaultExpanded={true}
        maxVisibleItems={3}
      />

      <Separator />

      {/* Experience Level Filter */}
      <FilterGroup
        title="Kinh nghiệm"
        value={filters.experience || ''}
        options={experienceOptions}
        onChange={(value) => handleFilterChange('experience', value)}
        collapsible={true}
        defaultExpanded={false}
        maxVisibleItems={4}
      />

      <Separator />

      {/* Location Filter */}
      <LocationFilter
        province={filters.province || ''}
        district={filters.district || ''}
        onChange={handleLocationChange}
      />

      <Separator />

      {/* Salary Range Filter */}
      <SalaryRangeFilter
        minSalary={filters.minSalary || ''}
        maxSalary={filters.maxSalary || ''}
        onChange={handleSalaryChange}
      />
    </div>
  );
};

export default SearchFilters;
