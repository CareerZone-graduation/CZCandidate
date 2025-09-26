import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { MapPin, X, ChevronDown, ChevronUp } from 'lucide-react';
import locationData from '@/data/oldtree.json';
import { cn } from '@/lib/utils';

/**
 * LocationFilter component for province and district filtering
 * Supports hierarchical location selection
 */
const LocationFilter = ({
  province = '',
  district = '',
  onChange,
  className,
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

  // Update internal state when props change
  useEffect(() => {
    setSelectedProvince(province);
    setSelectedDistrict(district);
  }, [province, district]);

  /**
   * Handle province selection
   * @param {string} provinceName - Selected province name
   */
  const handleProvinceChange = (provinceName) => {
    const actualProvince = provinceName === 'ALL_PROVINCES' ? '' : provinceName;
    setSelectedProvince(actualProvince);
    setSelectedDistrict(''); // Reset district when province changes
    
    onChange({
      province: actualProvince,
      district: ''
    });
  };

  /**
   * Handle district selection
   * @param {string} districtName - Selected district name
   */
  const handleDistrictChange = (districtName) => {
    const actualDistrict = districtName === 'ALL_DISTRICTS' ? '' : districtName;
    setSelectedDistrict(actualDistrict);
    
    onChange({
      province: selectedProvince,
      district: actualDistrict
    });
  };

  /**
   * Clear all location filters
   */
  const handleClear = () => {
    setSelectedProvince('');
    setSelectedDistrict('');
    onChange({
      province: '',
      district: ''
    });
  };

  /**
   * Toggle full collapse state
   */
  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  // Get districts for selected province
  const availableDistricts = selectedProvince
    ? locationHierarchy.districts[selectedProvince] || []
    : [];

  // Check if any filter is active
  const hasActiveFilter = selectedProvince || selectedDistrict;

  return (
    <Card className={cn("border-none shadow-none", className)}>
      <CardHeader className={cn("pb-3", isFullyCollapsed && "pb-0")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Địa điểm
            </CardTitle>
            {/* Show selected location when collapsed */}
            {isFullyCollapsed && hasActiveFilter && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                {selectedProvince && selectedDistrict 
                  ? `${selectedProvince} > ${selectedDistrict}`
                  : selectedProvince || selectedDistrict}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilter && !isFullyCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {allowFullCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullCollapse}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                {isFullyCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {!isFullyCollapsed && (
        <CardContent className="pt-0 space-y-4">
          {/* Province Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tỉnh/Thành phố
            </label>
            <Select value={selectedProvince || 'ALL_PROVINCES'} onValueChange={handleProvinceChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PROVINCES">Tất cả tỉnh/thành phố</SelectItem>
                {locationHierarchy.provinces.map((provinceName) => (
                  <SelectItem key={provinceName} value={provinceName}>
                    {provinceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Quận/Huyện
            </label>
            <Select 
              value={selectedDistrict || 'ALL_DISTRICTS'} 
              onValueChange={handleDistrictChange}
              disabled={!selectedProvince}
            >
              <SelectTrigger className={cn(
                "h-10",
                !selectedProvince && "opacity-50 cursor-not-allowed"
              )}>
                <SelectValue placeholder={
                  selectedProvince 
                    ? "Chọn quận/huyện" 
                    : "Chọn tỉnh/thành phố trước"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_DISTRICTS">Tất cả quận/huyện</SelectItem>
                {availableDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Summary */}
          {hasActiveFilter && (
            <div className="pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Vị trí đã chọn:</span>
                <div className="mt-1">
                  {selectedProvince && (
                    <span className="text-foreground">{selectedProvince}</span>
                  )}
                  {selectedDistrict && (
                    <span className="text-foreground">
                      {selectedProvince ? ` > ${selectedDistrict}` : selectedDistrict}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default LocationFilter;