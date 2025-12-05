import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import locationData from '@/data/oldtree.json';

const LocationFilter = ({
  province = '',
  district = '',
  onChange,
  className = ''
}) => {
  const [selectedProvince, setSelectedProvince] = useState(province);
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [isExpanded, setIsExpanded] = useState(false);
  const [locationHierarchy, setLocationHierarchy] = useState({ provinces: [], districts: {} });

  useEffect(() => {
    const provinces = locationData.map(p => p.name);
    const districts = locationData.reduce((acc, p) => {
      acc[p.name] = p.districts.map(d => d.name);
      return acc;
    }, {});
    setLocationHierarchy({ provinces, districts });
  }, []);

  useEffect(() => {
    setSelectedProvince(province);
    setSelectedDistrict(district);
  }, [province, district]);

  const handleProvinceChange = (provinceName) => {
    const actualProvince = provinceName === 'ALL_PROVINCES' ? '' : provinceName;
    setSelectedProvince(actualProvince);
    setSelectedDistrict('');
    onChange({
      province: actualProvince,
      district: ''
    });
  };

  const handleDistrictChange = (districtName) => {
    const actualDistrict = districtName === 'ALL_DISTRICTS' ? '' : districtName;
    setSelectedDistrict(actualDistrict);
    onChange({
      province: selectedProvince,
      district: actualDistrict
    });
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedProvince('');
    setSelectedDistrict('');
    onChange({ province: '', district: '' });
  };

  const availableDistricts = selectedProvince
    ? locationHierarchy.districts[selectedProvince] || []
    : [];

  const hasActiveFilter = selectedProvince || selectedDistrict;

  const getDisplayText = () => {
    if (selectedProvince && selectedDistrict) {
      return `${selectedDistrict}, ${selectedProvince}`;
    }
    if (selectedProvince) return selectedProvince;
    return null;
  };

  return (
    <div className={cn("border-b border-slate-100", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between py-3 px-1",
          "text-left transition-colors hover:bg-slate-50 rounded-lg -mx-1"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium text-slate-800 text-sm">Địa điểm</span>
            {!isExpanded && hasActiveFilter && (
              <p className="text-xs text-blue-600 font-medium mt-0.5 truncate max-w-[150px]">
                {getDisplayText()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Province Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 px-1">
              Tỉnh/Thành phố
            </label>
            <div className="relative">
              <select
                value={selectedProvince || 'ALL_PROVINCES'}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={cn(
                  "w-full h-10 px-3 pr-8 rounded-lg border text-sm",
                  "bg-white appearance-none cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "transition-all duration-150",
                  selectedProvince 
                    ? "border-primary/30 text-slate-800" 
                    : "border-slate-200 text-slate-500"
                )}
              >
                <option value="ALL_PROVINCES">Tất cả tỉnh/thành</option>
                {locationHierarchy.provinces.map((provinceName) => (
                  <option key={provinceName} value={provinceName}>
                    {provinceName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* District Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500 px-1">
              Quận/Huyện
            </label>
            <div className="relative">
              <select
                value={selectedDistrict || 'ALL_DISTRICTS'}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedProvince}
                className={cn(
                  "w-full h-10 px-3 pr-8 rounded-lg border text-sm",
                  "bg-white appearance-none cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                  "transition-all duration-150",
                  !selectedProvince && "opacity-50 cursor-not-allowed bg-slate-50",
                  selectedDistrict 
                    ? "border-primary/30 text-slate-800" 
                    : "border-slate-200 text-slate-500"
                )}
              >
                <option value="ALL_DISTRICTS">
                  {selectedProvince ? 'Tất cả quận/huyện' : 'Chọn tỉnh/thành trước'}
                </option>
                {availableDistricts.map((districtName) => (
                  <option key={districtName} value={districtName}>
                    {districtName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Selected Location Display */}
          {hasActiveFilter && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-700 font-medium truncate">
                {getDisplayText()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
