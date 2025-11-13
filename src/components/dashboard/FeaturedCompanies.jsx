import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, Briefcase, MapPin, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import apiClient from '../../services/apiClient';

export const FeaturedCompanies = () => {
  const navigate = useNavigate();

  // Fetch top companies với React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-companies'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/top-companies?limit=8');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  });

  const companies = data?.data || [];

  // Format số nhân viên
  const formatEmployees = (employees) => {
    if (!employees) return 'N/A';
    if (employees >= 10000) return `${Math.floor(employees / 1000)}K+`;
    if (employees >= 1000) return `${Math.floor(employees / 1000)}K+`;
    return `${employees}+`;
  };

  // Handle click vào công ty
  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Top công ty được săn đón</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Top công ty được săn đón</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Không thể tải danh sách công ty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!companies || companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Top công ty được săn đón</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu công ty</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg">Top công ty được săn đón</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/companies')}
            className="text-xs text-primary hover:text-primary/80"
          >
            Xem tất cả →
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Các công ty có nhiều tin tuyển dụng nhất
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {companies.slice(0, 6).map((company, index) => (
          <div
            key={company._id}
            onClick={() => handleCompanyClick(company._id)}
            className="group relative flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer"
          >
            {/* Ranking badge cho top 3 */}
            {index < 3 && (
              <div className="absolute -top-2 -left-2 z-10">
                <Badge
                  className={`
                    h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : ''}
                    ${index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : ''}
                    ${index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : ''}
                  `}
                >
                  {index + 1}
                </Badge>
              </div>
            )}

            {/* Company logo */}
            <Avatar className="h-14 w-14 rounded-lg border-2 border-border/50 flex-shrink-0">
              <AvatarImage
                src={company.logo}
                alt={company.companyName}
                className="object-contain p-1"
              />
              <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg">
                {company.companyName?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>

            {/* Company info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {company.companyName}
                </h4>
                {index < 3 && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                {company.industry || 'Đa lĩnh vực'}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-emerald-600" />
                  <span className="font-medium text-emerald-600">
                    {company.activeJobCount}
                  </span>
                  <span className="hidden sm:inline">việc làm</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{formatEmployees(company.employees)}</span>
                </div>

                {company.location?.province && (
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{company.location.province}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* View all button */}
        <Button
          variant="outline"
          className="w-full mt-4 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
          onClick={() => navigate('/companies')}
        >
          <Building2 className="h-4 w-4 mr-2" />
          Khám phá thêm công ty
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeaturedCompanies;
