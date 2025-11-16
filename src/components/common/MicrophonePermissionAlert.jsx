import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

/**
 * MicrophonePermissionAlert - Inline alert hiển thị khi quyền microphone bị từ chối
 * Component nhỏ gọn để nhúng trực tiếp trong UI
 */
const MicrophonePermissionAlert = ({ onShowGuide }) => {
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-900">
        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Quyền truy cập microphone bị từ chối
          </p>
          <p className="text-xs">
            Để sử dụng tính năng tìm kiếm bằng giọng nói, bạn cần cho phép website 
            truy cập microphone của bạn trong cài đặt trình duyệt.
          </p>
          <Button
            onClick={onShowGuide}
            variant="outline"
            size="sm"
            className="w-full mt-2 border-red-300 bg-white hover:bg-red-100 text-red-900"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Xem hướng dẫn chi tiết
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default MicrophonePermissionAlert;
