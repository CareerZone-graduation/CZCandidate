/**
 * Utility functions for formatting data
 */

/**
 * Format currency value from MongoDB (handles $numberDecimal objects)
 * @param {*} value - Value from MongoDB (can be number, string, or object with $numberDecimal)
 * @returns {number|null} - Parsed number or null if invalid
 */
export const parseCurrencyValue = (value) => {
  if (!value) return null;

  // Handle MongoDB $numberDecimal objects
  if (typeof value === 'object' && value.$numberDecimal) {
    const num = Number(value.$numberDecimal);
    return isNaN(num) ? null : num;
  }

  // Handle regular numbers and strings
  if (typeof value === 'string') {
    // Remove dots (thousand separators) before parsing
    const cleanedValue = value.replace(/\./g, '');
    const num = Number(cleanedValue);
    return isNaN(num) ? null : num;
  }

  const num = Number(value);
  return isNaN(num) ? null : num;
};

/**
 * Format salary range for display
 * @param {*} minSalary - Minimum salary (can be MongoDB object)
 * @param {*} maxSalary - Maximum salary (can be MongoDB object)
 * @param {string} unit - Unit to display (default: 'triệu')
 * @returns {string} - Formatted salary string
 */
export const formatSalary = (minSalary, maxSalary, unit = 'triệu') => {
  const min = parseCurrencyValue(minSalary);
  const max = parseCurrencyValue(maxSalary);

  if (!min && !max) return 'Thỏa thuận';

  const formatToMillion = (num) => {
    if (num === null || num === undefined) return null;
    const millions = num / 1000000;
    // Use toFixed to handle decimals and remove unnecessary trailing zeros
    return parseFloat(millions.toFixed(1)).toString();
  };

  const formattedMin = formatToMillion(min);
  const formattedMax = formatToMillion(max);

  if (formattedMin && formattedMax) {
    return `${formattedMin} - ${formattedMax} ${unit}`;
  }

  if (formattedMin) {
    return `Từ ${formattedMin} ${unit}`;
  }

  if (formattedMax) {
    return `Đến ${formattedMax} ${unit}`;
  }

  return 'Thỏa thuận';
};

/**
 * Format salary with VND currency
 * @param {*} minSalary - Minimum salary
 * @param {*} maxSalary - Maximum salary
 * @returns {string} - Formatted salary with VND
 */
export const formatSalaryVND = (minSalary, maxSalary) => {
  let min = parseCurrencyValue(minSalary);
  let max = parseCurrencyValue(maxSalary);

  if (!min && !max) return 'Thỏa thuận';

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  }

  if (min) {
    return `Từ ${formatNumber(min)} VNĐ`;
  }

  if (max) {
    return `Đến ${formatNumber(max)} VNĐ`;
  }

  return 'Thỏa thuận';
};

/**
 * Format work type for display
 * @param {string} type - Work type code
 * @returns {string} - Formatted work type
 */
export const formatWorkType = (type) => {
  const typeMap = {
    'FULL_TIME': 'Toàn thời gian',
    'PART_TIME': 'Bán thời gian',
    'CONTRACT': 'Hợp đồng',
    'FREELANCE': 'Tự do',
    'INTERNSHIP': 'Thực tập',
    'TEMPORARY': 'Tạm thời'
  };
  return typeMap[type] || type || 'Linh hoạt';
};

/**
 * Format experience level for display
 * @param {string} level - Experience level code
 * @returns {string} - Formatted experience level
 */
export const formatExperience = (level) => {
  const levelMap = {
    'INTERN': 'Thực tập sinh',
    'FRESHER': 'Fresher',
    'JUNIOR_LEVEL': 'Junior',
    'MID_LEVEL': 'Middle',
    'SENIOR_LEVEL': 'Senior',
    'MANAGER_LEVEL': 'Quản lý',
    'DIRECTOR_LEVEL': 'Giám đốc',
    'FRESH': 'Sinh viên mới tốt nghiệp',
    'JUNIOR': 'Dưới 1 năm',
    'SENIOR': '3-5 năm',
    'EXPERT': 'Trên 5 năm',
    'MANAGER': 'Quản lý',
    'DIRECTOR': 'Giám đốc'
  };
  return levelMap[level] || level || 'Không yêu cầu';
};

/**
 * Format location for display
 * @param {*} location - Location object or string
 * @returns {string} - Formatted location
 */
export const formatLocation = (location) => {
  if (!location) return 'Chưa xác định';
  
  if (typeof location === 'string') return location;
  
  if (typeof location === 'object') {
    const provinceName = location.province?.name || location.province;
    const districtName = location.district?.name || location.district;
    
    if (provinceName && districtName) {
      return `${districtName}, ${provinceName}`;
    }
    
    if (provinceName) return provinceName;
    if (districtName) return districtName;
  }
  
  return 'Chưa xác định';
};

/**
 * Format time ago
 * @param {string} dateString - Date string
 * @returns {string} - Time ago string
 */
export const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = now - date;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
  return `${Math.ceil(diffDays / 30)} tháng trước`;
};

/**
 * Format distance for display
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string|null} - Formatted distance string or null
 */
export const formatDistance = (distanceInMeters) => {
  if (distanceInMeters === null || distanceInMeters === undefined) {
    return null;
  }

  if (distanceInMeters < 1000) {
    return `cách ${Math.round(distanceInMeters)} m`;
  }

  const distanceInKm = distanceInMeters / 1000;
  return `cách ${distanceInKm.toFixed(1)} km`;
};

/**
 * Calculate the distance between two coordinates using Haversine formula
 * @param {[number, number]} coords1 - [longitude, latitude]
 * @param {[number, number]} coords2 - [longitude, latitude]
 * @returns {number} - Distance in meters
 */
export const calculateDistance = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length !== 2 || coords2.length !== 2) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};
