import React from 'react';
import UploadedCVManager from '@/components/cv/UploadedCVManager';

/**
 * Trang quản lý CV đã upload
 */
const UploadedCVPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          CV đã tải lên
        </h1>
        <p className="text-gray-600">
          Quản lý các CV bạn đã tải lên từ file PDF
        </p>
      </div>

      <UploadedCVManager />
    </div>
  );
};

export default UploadedCVPage;
