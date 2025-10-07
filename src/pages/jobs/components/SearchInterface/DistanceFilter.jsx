import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * DistanceFilter - Component lọc công việc theo khoảng cách
 * Cho phép user chọn bán kính tìm kiếm từ vị trí hiện tại
 */
const DistanceFilter = ({ 
  distance = '', 
  latitude = '',
  longitude = '',
  onChange 
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [distanceValue, setDistanceValue] = useState(10); // Default 10km
  const [userCoords, setUserCoords] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Distance presets in km
  const distancePresets = [
    { value: 5, label: '5km' },
    { value: 10, label: '10km' },
    { value: 20, label: '20km' },
    { value: 50, label: '50km' },
  ];

  // Initialize from props
  useEffect(() => {
    if (distance && latitude && longitude) {
      setIsEnabled(true);
      setDistanceValue(Number(distance));
      setUserCoords([Number(longitude), Number(latitude)]);
    } else {
      setIsEnabled(false);
    }
  }, [distance, latitude, longitude]);

  /**
   * Get user's current location
   */
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserCoords([longitude, latitude]);
        setIsGettingLocation(false);
        toast.success('Đã lấy vị trí của bạn!');
        
        // Enable filter and apply
        setIsEnabled(true);
        onChange({
          distance: distanceValue,
          latitude: latitude,
          longitude: longitude
        });
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Không thể lấy vị trí của bạn.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Thông tin vị trí không khả dụng.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian.';
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Handle distance change from slider
   */
  const handleDistanceChange = (value) => {
    const newDistance = value[0];
    setDistanceValue(newDistance);
    
    if (isEnabled && userCoords) {
      onChange({
        distance: newDistance,
        latitude: userCoords[1], // latitude
        longitude: userCoords[0] // longitude
      });
    }
  };

  /**
   * Handle preset button click
   */
  const handlePresetClick = (presetValue) => {
    setDistanceValue(presetValue);
    
    if (isEnabled && userCoords) {
      onChange({
        distance: presetValue,
        latitude: userCoords[1],
        longitude: userCoords[0]
      });
    }
  };

  /**
   * Enable/disable distance filter
   */
  const toggleFilter = () => {
    if (!isEnabled) {
      // Enabling - get location if not already have
      if (!userCoords) {
        getUserLocation();
      } else {
        setIsEnabled(true);
        onChange({
          distance: distanceValue,
          latitude: userCoords[1],
          longitude: userCoords[0]
        });
      }
    } else {
      // Disabling - clear filter
      setIsEnabled(false);
      onChange({
        distance: '',
        latitude: '',
        longitude: ''
      });
    }
  };

  /**
   * Clear filter completely
   */
  const handleClear = () => {
    setIsEnabled(false);
    setUserCoords(null);
    onChange({
      distance: '',
      latitude: '',
      longitude: ''
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <Label className="font-semibold text-sm">Lọc theo khoảng cách</Label>
        </div>
        {isEnabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Enable/Get Location Button */}
      {!isEnabled && (
        <Button
          onClick={toggleFilter}
          disabled={isGettingLocation}
          variant="outline"
          size="sm"
          className={cn(
            "w-full transition-all duration-300",
            "border-2 border-primary/40 hover:border-primary",
            "hover:bg-primary/10"
          )}
        >
          <Navigation className={cn(
            "h-4 w-4 mr-2",
            isGettingLocation && "animate-pulse"
          )} />
          {isGettingLocation ? 'Đang lấy vị trí...' : 'Bật lọc theo vị trí'}
        </Button>
      )}

      {/* Distance Slider & Controls (when enabled) */}
      {isEnabled && userCoords && (
        <div className="space-y-4 p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
          {/* Current Distance Display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Bán kính tìm kiếm
            </span>
            <span className="text-lg font-bold text-primary">
              {distanceValue} km
            </span>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[distanceValue]}
              onValueChange={handleDistanceChange}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>1 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {distancePresets.map((preset) => (
              <Button
                key={preset.value}
                variant={distanceValue === preset.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
                className={cn(
                  "text-xs transition-all duration-300",
                  distanceValue === preset.value && "btn-gradient text-white"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Location Info */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Navigation className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground mb-1">Vị trí của bạn:</p>
                <p className="font-mono">
                  {userCoords[1].toFixed(6)}, {userCoords[0].toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Disable Button */}
          <Button
            onClick={toggleFilter}
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive"
          >
            Tắt lọc theo khoảng cách
          </Button>
        </div>
      )}

      {/* Help Text */}
      {!isEnabled && (
        <p className="text-xs text-muted-foreground">
          Tìm công việc trong bán kính tùy chọn từ vị trí hiện tại của bạn.
        </p>
      )}
    </div>
  );
};

export default DistanceFilter;
