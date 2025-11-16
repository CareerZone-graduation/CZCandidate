import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

/**
 * LocationPermissionAlert - Inline alert hiển thị khi quyền vị trí bị từ chối
 * Component nhỏ gọn để nhúng trực tiếp trong filter
 */
const LocationPermissionAlert = ({ onShowGuide }) => {
  return (
    <Alert variant="destructive" className="border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-900">
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Quyền truy cập vị trí bị từ chối
          </p>
          <p className="text-xs">
            Để sử dụng tính năng lọc theo khoảng cách, bạn cần cho phép website 
            truy cập vị trí của bạn trong cài đặt trình duyệt.
          </p>
          <Button
            onClick={onShowGuide}
            variant="outline"
            size="sm"
            className="w-full mt-2 border-amber-300 bg-white hover:bg-amber-100 text-amber-900"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Xem hướng dẫn chi tiết
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LocationPermissionAlert;
