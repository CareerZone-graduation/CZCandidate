import React, { useState, useEffect } from 'react';
import { ChevronRight, X, MapPin } from 'lucide-react';
import locationData from '@/data/oldtree.json';

const LocationFilter = ({
  province = '',
  district = '',
  onChange,
  className = '',
  allowFullCollapse = true
}) => {
  const [selectedProvince, setSelectedProvince] = useState(province);
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);
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
    onChange({
      province: '',
      district: ''
    });
  };

  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  const availableDistricts = selectedProvince
    ? locationHierarchy.districts[selectedProvince] || []
    : [];

  const hasActiveFilter = selectedProvince || selectedDistrict;

  return (
    <div className={`border rounded-lg bg-white shadow-sm transition-all duration-300 ${className}`}>
      <div 
        className={`
          flex items-center justify-between p-4 cursor-pointer
          bg-gray-50 hover:bg-gray-100 transition-colors duration-200
          rounded-t-lg
          ${isFullyCollapsed ? 'rounded-b-lg' : ''}
        `}
        onClick={allowFullCollapse ? toggleFullCollapse : undefined}
        role={allowFullCollapse ? 'button' : undefined}
        aria-expanded={!isFullyCollapsed}
      >
        <div className="flex items-center gap-3">
          <ChevronRight 
            className={`
              h-5 w-5 text-gray-500 transition-transform duration-300
              ${isFullyCollapsed ? 'rotate-0' : 'rotate-90'}
            `}
          />
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Địa điểm
          </h3>
          {isFullyCollapsed && hasActiveFilter && (
            <span className="text-sm text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full font-medium">
              {selectedProvince && selectedDistrict 
                ? `${selectedProvince} > ${selectedDistrict}`
                : selectedProvince || selectedDistrict}
            </span>
          )}
        </div>
        {hasActiveFilter && !isFullyCollapsed && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Xóa bộ lọc"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!isFullyCollapsed && (
        <div className="p-4 animate-slide-down space-y-4">
          <div className="space-y-1">
            <label htmlFor="province" className="text-sm font-medium text-gray-700">
              Tỉnh/Thành phố
            </label>
            <select
              id="province"
              value={selectedProvince || 'ALL_PROVINCES'}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="
                w-full h-10 px-3 rounded-md border border-gray-300
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm text-gray-700
              "
            >
              <option value="ALL_PROVINCES">Tất cả tỉnh/thành phố</option>
              {locationHierarchy.provinces.map((provinceName) => (
                <option key={provinceName} value={provinceName}>
                  {provinceName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="district" className="text-sm font-medium text-gray-700">
              Quận/Huyện
            </label>
            <select
              id="district"
              value={selectedDistrict || 'ALL_DISTRICTS'}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvince}
              className={`
                w-full h-10 px-3 rounded-md border border-gray-300
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                text-sm text-gray-700
                ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <option value="ALL_DISTRICTS">
                {selectedProvince ? 'Tất cả quận/huyện' : 'Chọn tỉnh/thành phố trước'}
              </option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilter && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Vị trí đã chọn:</span>
                <div className="mt-1">
                  {selectedProvince && (
                    <span className="text-gray-700">{selectedProvince}</span>
                  )}
                  {selectedDistrict && (
                    <span className="text-gray-700">
                      {selectedProvince ? ` > ${selectedDistrict}` : selectedDistrict}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;