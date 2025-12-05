import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ChevronDown, X, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import LocationPermissionGuide from '@/components/common/LocationPermissionGuide';
import LocationPermissionAlert from '@/components/common/LocationPermissionAlert';

/**
 * DistanceFilter - Professional distance filter component
 */
const DistanceFilter = ({ 
  distance = '', 
  latitude = '',
  longitude = '',
  onChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [distanceValue, setDistanceValue] = useState(10);
  const [userCoords, setUserCoords] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const distancePresets = [
    { value: 5, label: '5km' },
    { value: 10, label: '10km' },
    { value: 20, label: '20km' },
    { value: 50, label: '50km' },
  ];

  useEffect(() => {
    if (distance && latitude && longitude) {
      setIsEnabled(true);
      setDistanceValue(Number(distance));
      setUserCoords([Number(longitude), Number(latitude)]);
    } else {
      setIsEnabled(false);
    }
  }, [distance, latitude, longitude]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGettingLocation(true);
    setPermissionDenied(false);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserCoords([longitude, latitude]);
        setIsGettingLocation(false);
        toast.success('Đã lấy vị trí của bạn!');
        
        setIsEnabled(true);
        onChange({
          distance: distanceValue,
          latitude: latitude,
          longitude: longitude
        });
      },
      (error) => {
        setIsGettingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionDenied(true);
          toast.error('Quyền vị trí bị từ chối', {
            action: {
              label: 'Hướng dẫn',
              onClick: () => setShowPermissionGuide(true)
            }
          });
        } else {
          toast.error('Không thể lấy vị trí. Vui lòng thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDistanceChange = (value) => {
    const newDistance = value[0];
    setDistanceValue(newDistance);
    
    if (isEnabled && userCoords) {
      onChange({
        distance: newDistance,
        latitude: userCoords[1],
        longitude: userCoords[0]
      });
    }
  };

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

  const toggleFilter = () => {
    if (!isEnabled) {
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
      setIsEnabled(false);
      onChange({ distance: '', latitude: '', longitude: '' });
    }
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    setIsEnabled(false);
    setUserCoords(null);
    onChange({ distance: '', latitude: '', longitude: '' });
  };

  return (
    <>
      <div className="border-b border-slate-100">
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
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isEnabled 
                ? "bg-primary text-white" 
                : "bg-orange-500/10 text-orange-600"
            )}>
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <span className="font-medium text-slate-800 text-sm">Khoảng cách</span>
              {!isExpanded && isEnabled && (
                <p className="text-xs text-primary font-medium mt-0.5">
                  Trong {distanceValue}km
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEnabled && (
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
            {/* Permission Denied Alert */}
            {!isEnabled && permissionDenied && (
              <LocationPermissionAlert 
                onShowGuide={() => setShowPermissionGuide(true)}
              />
            )}

            {/* Enable Button */}
            {!isEnabled && (
              <Button
                onClick={toggleFilter}
                disabled={isGettingLocation}
                variant="outline"
                size="sm"
                className={cn(
                  "w-full gap-2 rounded-lg",
                  "border-orange-200 text-orange-700 hover:bg-orange-50"
                )}
              >
                <Navigation className={cn(
                  "h-4 w-4",
                  isGettingLocation && "animate-pulse"
                )} />
                {isGettingLocation ? 'Đang lấy vị trí...' : 'Bật lọc theo vị trí'}
              </Button>
            )}

            {/* Distance Controls (when enabled) */}
            {isEnabled && userCoords && (
              <div className="space-y-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                {/* Distance Display */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Bán kính</span>
                  <span className="text-lg font-bold text-primary">
                    {distanceValue} km
                  </span>
                </div>

                {/* Slider */}
                <div className="px-1">
                  <Slider
                    value={[distanceValue]}
                    onValueChange={handleDistanceChange}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>1km</span>
                    <span>100km</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-4 gap-2">
                  {distancePresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetClick(preset.value)}
                      className={cn(
                        "py-1.5 text-xs font-medium rounded-lg border transition-all",
                        distanceValue === preset.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Vị trí: {userCoords[1].toFixed(4)}, {userCoords[0].toFixed(4)}</span>
                </div>

                {/* Disable Button */}
                <button
                  type="button"
                  onClick={toggleFilter}
                  className="w-full text-xs text-slate-500 hover:text-red-600 transition-colors py-1"
                >
                  Tắt lọc khoảng cách
                </button>
              </div>
            )}

            {/* Help Text */}
            {!isEnabled && !permissionDenied && (
              <p className="text-xs text-slate-500 flex items-start gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                Tìm việc làm gần vị trí hiện tại của bạn
              </p>
            )}
          </div>
        )}
      </div>

      {/* Permission Guide Modal */}
      <LocationPermissionGuide
        isOpen={showPermissionGuide}
        onClose={() => setShowPermissionGuide(false)}
        onRetry={getUserLocation}
      />
    </>
  );
};

export default DistanceFilter;
