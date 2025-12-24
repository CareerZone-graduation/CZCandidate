import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Star, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SectionHeader } from '../common/SectionHeader';
import apiClient from '../../services/apiClient';

const TopCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchTopCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/analytics/top-companies?limit=6');

        if (response.data.success) {
          setCompanies(response.data.data);
        } else {
          console.warn('⚠️ API returned success: false');
        }
      } catch (error) {
        console.error('❌ Failed to fetch top companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCompanies();
  }, []);
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <SectionHeader
          badgeText="🏢 Đối tác uy tín"
          title={<>Top công ty <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">hàng đầu</span></>}
          description="Những công ty tuyển dụng nhiều vị trí nhất. Nơi có nhiều cơ hội việc làm đa dạng và phong phú."
          className="mb-12"
        />

        {loading ? (
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
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
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
                      <Briefcase className="h-4 w-4 text-emerald-600" /> 
                      <span className="font-medium text-emerald-600 font-semibold">
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
                    className="w-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 rounded-xl font-semibold"
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
            className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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

export default TopCompanies;