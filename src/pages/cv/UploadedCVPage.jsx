import React from 'react';
import UploadedCVManager from '@/components/cv/UploadedCVManager';

/**
 * Trang quản lý CV đã upload
 */
const UploadedCVPage = () => {
  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <div className="h-full overflow-hidden rounded-xl border bg-background shadow-sm">
        <UploadedCVManager />
      </div>
    </div>
  );
};

export default UploadedCVPage;
