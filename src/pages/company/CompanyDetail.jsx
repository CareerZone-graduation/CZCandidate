import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const CompanyDetail = () => {
  const { companyId } = useParams();

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Building className="h-8 w-8 text-primary" />
            <CardTitle>Trang chi tiết công ty</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">🚧 Đang xây dựng 🚧</h2>
            <p className="text-muted-foreground">
              Trang chi tiết cho công ty đang trong quá trình phát triển. Vui lòng quay lại sau.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Company ID: {companyId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDetail;