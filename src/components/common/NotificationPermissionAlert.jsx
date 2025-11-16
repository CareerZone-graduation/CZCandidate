import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

/**
 * NotificationPermissionAlert - Inline alert hiển thị khi quyền thông báo bị từ chối
 * Component nhỏ gọn để nhúng trực tiếp trong UI
 */
const NotificationPermissionAlert = ({ onShowGuide }) => {
  return (
    <Alert variant="destructive" className="border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-900">
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Quyền thông báo bị từ chối
          </p>
          <p className="text-xs">
            Để nhận thông báo về công việc mới, tin nhắn và cập nhật quan trọng, 
            bạn cần cho phép website gửi thông báo trong cài đặt trình duyệt.
          </p>
          <Button
            onClick={onShowGuide}
            variant="outline"
            size="sm"
            className="w-full mt-2 border-blue-300 bg-white hover:bg-blue-100 text-blue-900"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Xem hướng dẫn chi tiết
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NotificationPermissionAlert;
