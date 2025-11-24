import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Building,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Star,
  Calendar,
  DollarSign,
  Clock
} from 'lucide-react';
import { getCompanyById, getCompanyJobs } from '@/services/companyService';
import { formatSalary, formatTimeAgo } from '@/utils/formatters';
import { toast } from 'sonner';
import JobLocationMap from '@/components/common/JobLocationMap';

const CompanyDetail = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const jobsPerPage = 6;

  // Fetch company details
  const { data: companyData, isLoading: isLoadingCompany, error: companyError } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const response = await getCompanyById(companyId);
      return response.data.data;
    },
    enabled: !!companyId,
    retry: 1
  });

  // Fetch company jobs
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['companyJobs', companyId, currentPage, searchQuery],
    queryFn: async () => {
      const response = await getCompanyJobs(companyId, {
        page: currentPage,
        limit: jobsPerPage,
        search: searchQuery || undefined,
        sortBy: 'createdAt:desc'
      });
      return response.data;
    },
    enabled: !!companyId,
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

  const handleFollowCompany = () => {
    // TODO: Implement follow company logic
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Đã bỏ theo dõi công ty' : 'Đã theo dõi công ty');
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (companyError) {
    return (
      <div className="container py-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Không tìm thấy công ty</h2>
              <p className="text-muted-foreground">
                Công ty này không tồn tại hoặc đã bị xóa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        {isLoadingCompany ? (
          <CompanyDetailSkeleton />
        ) : (
          <>
            {/* Company Header Card */}
            <Card className="mb-8 overflow-hidden border-0 shadow-lg">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

              <CardContent className="relative pt-0 pb-6">
                {/* Company Logo */}
                <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl rounded-2xl">
                    <AvatarImage src={companyData?.logo} alt={companyData?.name} />
                    <AvatarFallback className="rounded-2xl text-3xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <Building className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Company Info */}
                  <div className="flex-1 mt-16 md:mt-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{companyData?.name}</h1>
                        {companyData?.industry && (
                          <Badge variant="secondary" className="gap-1 text-sm">
                            <Briefcase className="h-3 w-3" />
                            {companyData.industry}
                          </Badge>
                        )}
                      </div>

                      {/* Follow Button */}
                      <Button
                        onClick={handleFollowCompany}
                        variant={isFollowing ? "outline" : "default"}
                        className="gap-2"
                      >
                        <Star className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                    </div>

                    {/* Company Stats */}
                    <div className="flex flex-wrap gap-6 text-sm mb-4">
                      {companyData?.size && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{companyData.size}</span>
                        </div>
                      )}
                      {companyData?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{companyData.location.province}</span>
                        </div>
                      )}
                      {jobsData?.meta?.totalItems !== undefined && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{jobsData.meta.totalItems} việc làm đang tuyển</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Company */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Giới thiệu công ty
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {companyData?.about}
                    </p>
                  </CardContent>
                </Card>

                {/* Jobs Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Việc làm đang tuyển
                        {jobsData?.meta?.totalItems > 0 && (
                          <Badge variant="secondary">{jobsData.meta.totalItems}</Badge>
                        )}
                      </CardTitle>

                      {/* Search Form */}
                      <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                        <Input
                          placeholder="Tìm kiếm việc làm..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full sm:w-64"
                        />
                        <Button type="submit" size="icon">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingJobs ? (
                      <JobListSkeleton />
                    ) : jobsData?.data?.length > 0 ? (
                      <>
                        <div className="grid gap-4">
                          {jobsData.data.map((job) => (
                            <JobCard key={job._id} job={job} onClick={() => handleJobClick(job._id)} />
                          ))}
                        </div>

                        {/* Pagination */}
                        {jobsData.meta && jobsData.meta.totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Trước
                            </Button>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Trang {currentPage}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                / {jobsData.meta.totalPages}
                              </span>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(jobsData.meta.totalPages, p + 1))}
                              disabled={currentPage === jobsData.meta.totalPages}
                            >
                              Sau
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ? 'Không tìm thấy việc làm phù hợp' : 'Công ty chưa có việc làm nào'}
                        </p>
                        {searchQuery && (
                          <Button variant="outline" size="sm" onClick={handleClearSearch}>
                            Xóa bộ lọc
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Location Map */}
                {companyData?.location?.coordinates && (
                  <JobLocationMap
                    location={companyData.location}
                    address={companyData.address}
                    companyName={companyData.name}
                  />
                )}

                {/* Company Info Card */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin công ty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {companyData?.location && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Địa chỉ
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">
                          {companyData.address}
                          {companyData.location.commune && `, ${companyData.location.commune}`}
                          {companyData.location.district && `, ${companyData.location.district}`}
                          {companyData.location.province && `, ${companyData.location.province}`}
                        </p>
                      </div>
                    )}

                    {companyData?.size && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Quy mô
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{companyData.size}</p>
                      </div>
                    )}

                    {companyData?.industry && (
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Lĩnh vực
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{companyData.industry}</p>
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t mt-4">
                      {companyData?.website && (
                        <a
                          href={companyData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                      {companyData?.contactInfo?.email && (
                        <a
                          href={`mailto:${companyData.contactInfo.email}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          Email
                        </a>
                      )}
                      {companyData?.contactInfo?.phone && (
                        <a
                          href={`tel:${companyData.contactInfo.phone}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {companyData.contactInfo.phone}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onClick }) => {
  const formatJobType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'FREELANCE': 'Tự do',
      'INTERNSHIP': 'Thực tập'
    };
    return typeMap[type] || type;
  };

  const formatWorkType = (type) => {
    const typeMap = {
      'ON_SITE': 'Tại văn phòng',
      'REMOTE': 'Từ xa',
      'HYBRID': 'Hybrid'
    };
    return typeMap[type] || type;
  };

  return (
    <div
      onClick={onClick}
      className="group border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all cursor-pointer bg-card"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {job.title}
        </h3>
        {job.featured && (
          <Badge variant="default" className="ml-2 shrink-0">
            <Star className="h-3 w-3 mr-1" />
            Nổi bật
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">
              {[job.location.district, job.location.province].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {(job.minSalary || job.maxSalary) && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-primary">
              {formatSalary(job.minSalary, job.maxSalary)}
            </span>
          </div>
        )}

        {job.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.type && (
          <Badge variant="outline" className="text-xs">
            {formatJobType(job.type)}
          </Badge>
        )}
        {job.workType && (
          <Badge variant="outline" className="text-xs">
            {formatWorkType(job.workType)}
          </Badge>
        )}
        {job.experience && (
          <Badge variant="secondary" className="text-xs">
            {job.experience}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
        <Clock className="h-3 w-3" />
        <span>Đăng {formatTimeAgo(job.createdAt)}</span>
      </div>
    </div>
  );
};

// Skeleton Components
const CompanyDetailSkeleton = () => (
  <div className="space-y-8">
    {/* Company Header Card Skeleton */}
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="h-32 bg-muted" />
      <CardContent className="relative pt-0 pb-6">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
          <Skeleton className="h-32 w-32 rounded-2xl border-4 border-background" />
          <div className="flex-1 mt-16 md:mt-4 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 md:w-96" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex flex-wrap gap-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content Skeleton */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Company Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        {/* Jobs Section Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <JobListSkeleton />
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Sidebar Skeleton */}
      <div className="space-y-6">
        {/* Map Skeleton */}
        <Skeleton className="h-64 w-full rounded-lg" />

        {/* Info Card Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const JobListSkeleton = () => (
  <div className="grid gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-xl p-5">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default CompanyDetail;