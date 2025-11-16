import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import LocationPermissionGuide from './LocationPermissionGuide';
import LocationPermissionAlert from './LocationPermissionAlert';

/**
 * LocationPermissionDemo - Component demo để test Location Permission components
 * Chỉ dùng cho development/testing, không deploy lên production
 */
const LocationPermissionDemo = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [location, setLocation] = useState(null);
  const [isGetting, setIsGetting] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setIsGetting(true);
    setPermissionDenied(false);
    setError(null);
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsGetting(false);
        toast.success('Đã lấy vị trí thành công!');
      },
      (error) => {
        setIsGetting(false);
        console.error('Geolocation error:', error);

        let errorMessage = 'Không thể lấy vị trí của bạn.';
        let showGuideAuto = false;

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Quyền truy cập vị trí bị từ chối. Nhấn "Xem hướng dẫn" để biết cách bật.';
          showGuideAuto = true;
          setPermissionDenied(true);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Thông tin vị trí không khả dụng. Vui lòng kiểm tra cài đặt thiết bị.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian. Vui lòng thử lại.';
        }

        setError({
          code: error.code,
          message: errorMessage
        });

        toast.error(errorMessage, {
          duration: 5000,
          action: showGuideAuto ? {
            label: 'Xem hướng dẫn',
            onClick: () => setShowGuide(true)
          } : undefined
        });

        // Auto show guide for permission denied
        if (showGuideAuto) {
          setTimeout(() => setShowGuide(true), 1500);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const reset = () => {
    setPermissionDenied(false);
    setLocation(null);
    setError(null);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location Permission Components Demo
          </CardTitle>
          <CardDescription>
            Test và demo các components hỗ trợ quyền truy cập vị trí
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Denied Alert */}
          {permissionDenied && (
            <LocationPermissionAlert 
              onShowGuide={() => setShowGuide(true)}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={getLocation}
              disabled={isGetting}
              className="btn-gradient"
            >
              <Navigation className={`h-4 w-4 mr-2 ${isGetting ? 'animate-pulse' : ''}`} />
              {isGetting ? 'Đang lấy vị trí...' : 'Lấy vị trí của tôi'}
            </Button>

            <Button
              onClick={() => setShowGuide(true)}
              variant="outline"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Xem hướng dẫn
            </Button>

            <Button
              onClick={reset}
              variant="ghost"
            >
              Reset
            </Button>
          </div>

          {/* Status Display */}
          <div className="space-y-4">
            {/* Success State */}
            {location && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-green-900">
                        Vị trí đã được lấy thành công!
                      </p>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                        </p>
                        <p>
                          <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                        </p>
                        <p>
                          <strong>Accuracy:</strong> ±{location.accuracy.toFixed(0)}m
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-red-900">
                        Lỗi khi lấy vị trí
                      </p>
                      <div className="text-sm text-red-800 space-y-1">
                        <p>
                          <strong>Error Code:</strong> {error.code}
                        </p>
                        <p>
                          <strong>Message:</strong> {error.message}
                        </p>
                      </div>
                      {error.code === 1 && (
                        <Button
                          onClick={() => setShowGuide(true)}
                          size="sm"
                          variant="outline"
                          className="mt-2 border-red-300 bg-white hover:bg-red-100 text-red-900"
                        >
                          <HelpCircle className="h-3 w-3 mr-2" />
                          Xem hướng dẫn bật quyền
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-sm text-blue-900 space-y-2">
                <p className="font-semibold">Hướng dẫn test:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Nhấn "Lấy vị trí của tôi" để test flow bình thường</li>
                  <li>Từ chối quyền khi trình duyệt hỏi để test error flow</li>
                  <li>Nhấn "Xem hướng dẫn" để xem modal hướng dẫn</li>
                  <li>Sau khi bật quyền, nhấn "Thử lại" trong modal</li>
                </ol>
                <p className="mt-3 text-xs text-blue-700">
                  <strong>Lưu ý:</strong> Component này chỉ dùng để test, không deploy lên production.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Permission Guide Modal */}
      <LocationPermissionGuide
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onRetry={getLocation}
      />
    </div>
  );
};

export default LocationPermissionDemo;
