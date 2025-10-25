import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CVListPage from './CVListPage';
import UploadedCVManager from '@/components/cv/UploadedCVManager';
import { FileEdit, Upload } from 'lucide-react';

/**
 * Trang quản lý CV tổng hợp
 * Bao gồm cả CV builder và CV upload
 */
const CVManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'builder');

  // Sync tab with URL
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'builder' || tabFromUrl === 'uploaded')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          Quản lý CV
        </h1>
        <p className="text-gray-600">
          Tạo CV mới hoặc quản lý CV đã tải lên
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            CV Builder
          </TabsTrigger>
          <TabsTrigger value="uploaded" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CV đã tải lên
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-0 space-y-0">
          <div className="space-y-6">
            <CVListPage />
          </div>
        </TabsContent>

        <TabsContent value="uploaded" className="mt-0">
          <UploadedCVManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CVManagementPage;
