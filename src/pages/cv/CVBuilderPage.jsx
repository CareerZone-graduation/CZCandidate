import React from 'react';
import CVListPage from './CVListPage';

/**
 * Trang CV Builder
 * Wrapper cho CVListPage với header riêng
 */
const CVBuilderPage = () => {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          CV Builder
        </h1>
        <p className="text-gray-600">
          Tạo CV chuyên nghiệp với các template có sẵn
        </p>
      </div>

      <CVListPage />
    </div>
  );
};

export default CVBuilderPage;
