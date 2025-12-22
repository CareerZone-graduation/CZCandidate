import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  Briefcase,
  ArrowRight,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SectionHeader } from '../common/SectionHeader';
import apiClient from '../../services/apiClient';

export const TrendingCompanies = ({ limit = 6, showHeader = true }) => {
  const navigate = useNavigate();

  // Fetch most applied companies (công ty được nộp CV nhiều nhất) với React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending-companies', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/analytics/most-applied-companies?limit=${limit}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
  });

  const companies = data?.data || [];


  // Format số nhân viên
  const formatEmployees = (employees) => {
    if (!employees) return 'Chưa cập nhật';
    if (employees >= 10000) return `${Math.floor(employees / 1000)}K+ nhân viên`;
    if (employees >= 1000) return `${Math.floor(employees / 1000)}K+ nhân viên`;
    return `${employees}+ nhân viên`;
  };

  // Handler khi click vào công ty
  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  // Handler cho nút "Xem tất cả công ty"
  const handleViewAllCompanies = () => {
    navigate('/companies');
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        {showHeader && (
          <SectionHeader
            badgeText="🔥 Đang hot"
            title={<>Top công ty <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">được săn đón nhất</span></>}
            description="Những công ty được ứng viên quan tâm và nộp CV nhiều nhất. Nơi có cơ hội việc làm thu hút và hấp dẫn nhất."
            className="mb-12"
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted h-80" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Chưa có dữ liệu công ty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company, index) => (
              <Card
                key={company._id}
                className="group flex flex-col text-center relative border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-card cursor-pointer"
                onClick={() => handleCompanyClick(company._id)}
              >
                <CardHeader>
                  <div className="mb-3 mx-auto">
                    <img
                      src={company.logo || 'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg'}
                      alt={company.companyName}
                      className="h-24 w-24 mx-auto object-contain rounded-lg border-2 border-gray-100"
                      onError={(e) => {
                        e.target.src = 'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg';
                      }}
                    />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground line-clamp-1">
                    {company.companyName}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {company.industry || 'Đa lĩnh vực'}
                  </CardDescription>

                  {index < 3 && (
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md">
                      Top {index + 1}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="grow">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-medium">{formatEmployees(company.employees)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-600 font-semibold">
                        {company.applicationCount || 0} CV nhận được
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-emerald-600">
                        {company.activeJobCount} tin tuyển dụng
                      </span>
                    </div>
                    {company.location?.province && (
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span>📍 {company.location.province}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 rounded-xl font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompanyClick(company._id);
                    }}
                  >
                    Xem công ty <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="px-8 py-6 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleViewAllCompanies}
          >
            Xem tất cả công ty
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingCompanies;
