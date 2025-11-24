import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Building,
  MapPin,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { getAllCompanies } from '@/services/companyService';

const CompanyList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const companiesPerPage = 12;

  // Fetch companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', currentPage, searchQuery],
    queryFn: async () => {
      const response = await getAllCompanies({
        page: currentPage,
        limit: companiesPerPage,
        search: searchQuery || undefined
      });
      return response.data;
    },
    keepPreviousData: true
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/company/${companyId}`);
  };

  return (
    <div className="container py-10 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Danh sách công ty</h1>
        <p className="text-muted-foreground">
          Khám phá các công ty hàng đầu đang tuyển dụng
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Tìm kiếm công ty theo tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      ) : companiesData?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companiesData.data.map((company) => (
              <CompanyCard
                key={company._id}
                company={company}
                onClick={() => handleCompanyClick(company._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {companiesData.meta && companiesData.meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                Trang {currentPage} / {companiesData.meta.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(companiesData.meta.totalPages, p + 1))}
                disabled={currentPage === companiesData.meta.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Không tìm thấy công ty phù hợp' : 'Chưa có công ty nào'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSearch}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Company Card Component
const CompanyCard = ({ company, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-300"
    >
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Avatar className="h-20 w-20 mb-4 rounded-lg">
            <AvatarImage src={company.logo} alt={company.name} />
            <AvatarFallback className="rounded-lg text-2xl">
              <Building className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>

          <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {company.name}
          </h3>

          {company.industry && (
            <Badge variant="secondary" className="mb-3">
              <Briefcase className="h-3 w-3 mr-1" />
              {company.industry}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {company.size && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{company.size}</span>
            </div>
          )}

          {company.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">
                {company.location.province}
              </span>
            </div>
          )}
        </div>

        {company.about && (
          <p className="text-sm text-muted-foreground mt-4 line-clamp-3">
            {company.about}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Skeleton Component
const CompanyCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex flex-col items-center mb-4">
        <Skeleton className="h-20 w-20 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/3 mb-3" />
      </div>

      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </CardContent>
  </Card>
);

export default CompanyList;
