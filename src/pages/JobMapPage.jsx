import React, { useState } from 'react';
import { JobMapLeaflet } from '@/components/jobs/JobMapLeaflet';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function JobMapPage() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">
          Tìm kiếm công việc trên bản đồ
        </h1>
        <p className="text-muted-foreground">
          Khám phá các cơ hội việc làm xung quanh bạn
        </p>
      </div>

      {/* Filters */}
      <EnhancedCard variant="glass">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ngành nghề</Label>
              <Select onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả ngành nghề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="IT">Công nghệ thông tin</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="SALES">Kinh doanh</SelectItem>
                  <SelectItem value="ACCOUNTING">Kế toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loại công việc</Label>
              <Select onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="FULL_TIME">Toàn thời gian</SelectItem>
                  <SelectItem value="PART_TIME">Bán thời gian</SelectItem>
                  <SelectItem value="INTERNSHIP">Thực tập</SelectItem>
                  <SelectItem value="CONTRACT">Hợp đồng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hình thức làm việc</Label>
              <Select onValueChange={(value) => handleFilterChange('workType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả hình thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="ON_SITE">Tại văn phòng</SelectItem>
                  <SelectItem value="REMOTE">Từ xa</SelectItem>
                  <SelectItem value="HYBRID">Kết hợp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Map */}
      <EnhancedCard variant="glass" className="overflow-hidden">
        <div className="h-[600px]">
          <JobMapLeaflet 
            filters={filters}
            initialCenter={[10.762622, 106.660172]}
            initialZoom={12}
          />
        </div>
      </EnhancedCard>

      {/* Instructions */}
      <EnhancedCard variant="glass">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>💡 <strong>Hướng dẫn sử dụng:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Di chuyển bản đồ để khám phá các khu vực khác nhau</li>
              <li>Phóng to để xem chi tiết các công việc trong cụm</li>
              <li>Click vào marker để xem thông tin công việc</li>
              <li>Sử dụng bộ lọc để tìm kiếm chính xác hơn</li>
            </ul>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}
