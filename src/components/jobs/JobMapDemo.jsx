import React from 'react';
import { JobMapLeaflet } from './JobMapLeaflet';

/**
 * Component demo đơn giản để test nhanh tính năng bản đồ
 * Sử dụng: Import và render component này ở bất kỳ đâu
 */
export function JobMapDemo() {
  return (
    <div className="w-full h-screen p-4 bg-background">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gradient-primary">
            🗺️ Demo: Tìm kiếm công việc trên Bản đồ
          </h1>
          <p className="text-muted-foreground">
            Di chuyển và zoom bản đồ để khám phá các công việc
          </p>
        </div>

        <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden shadow-2xl border border-border">
          <JobMapLeaflet 
            initialCenter={[10.762622, 106.660172]} // TP.HCM
            initialZoom={12}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Tip: Phóng to để xem chi tiết từng công việc trong cụm</p>
        </div>
      </div>
    </div>
  );
}

export default JobMapDemo;
