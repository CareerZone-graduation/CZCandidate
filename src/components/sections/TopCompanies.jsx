import { Users, Briefcase, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SectionHeader } from '../common/SectionHeader';

const companies = [
  { 
    id: 1, 
    name: 'FPT Software', 
    logo: 'https://img5.thuthuatphanmem.vn/uploads/2022/01/16/logo-truong-fpt_043152255.png', 
    employees: '10,000+ nhân viên', 
    jobs: '120 việc làm', 
    industry: 'Công nghệ thông tin', 
    rating: 4.8, 
    featured: true 
  },
  { 
    id: 2, 
    name: 'VinGroup', 
    logo: 'https://static.znews.vn/static/topic/company/vingr.jpg', 
    employees: '50,000+ nhân viên', 
    jobs: '200 việc làm', 
    industry: 'Tập đoàn đa ngành', 
    rating: 4.7, 
    featured: true 
  },
  { 
    id: 3, 
    name: 'Shopee Vietnam', 
    logo: 'https://cdngarenanow-a.akamaihd.net/shopee/shopee-pcmall-live-vn/assets/6ce1f4f6d79353c5f24ee047a5132d77.jpg', 
    employees: '5,000+ nhân viên', 
    jobs: '85 việc làm', 
    industry: 'Thương mại điện tử', 
    rating: 4.6, 
    featured: false 
  },
  { 
    id: 4, 
    name: 'Grab Vietnam', 
    logo: 'https://tse2.mm.bing.net/th/id/OIP.ekYxD6W8hcBQ_2TRdIyb9QHaHa?pid=Api&P=0&h=220', 
    employees: '3,000+ nhân viên', 
    jobs: '60 việc làm', 
    industry: 'Công nghệ - Vận tải', 
    rating: 4.5, 
    featured: true 
  },
  { 
    id: 5, 
    name: 'Viettel Group', 
    logo: 'https://tse3.mm.bing.net/th/id/OIP.4eEWshveEygfqxR5uNDl2wHaBk?pid=Api&P=0&h=220', 
    employees: '20,000+ nhân viên', 
    jobs: '150 việc làm', 
    industry: 'Viễn thông', 
    rating: 4.4, 
    featured: false 
  },
  { 
    id: 6, 
    name: 'Techcombank', 
    logo: 'https://forbes.vn/wp-content/uploads/2022/08/LogoTop25tc_techcombank.jpg', 
    employees: '8,000+ nhân viên', 
    jobs: '75 việc làm', 
    industry: 'Ngân hàng', 
    rating: 4.3, 
    featured: true 
  },
];


const TopCompanies = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <SectionHeader
          badgeText="🏢 Đối tác uy tín"
          title={<>Top công ty <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">hàng đầu</span></>}
          description="Khám phá và ứng tuyển vào các công ty uy tín, môi trường làm việc tốt nhất."
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <Card key={company.id} className="group flex flex-col text-center relative border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-card">
            <CardHeader>
  <div className="mb-3 mx-auto">
    <img
      src={company.logo}
      alt={company.name}
      className="h-34 w-34 mx-auto object-contain rounded-full"
    />
  </div>
  <CardTitle className="text-xl font-bold text-foreground">{company.name}</CardTitle>
  <CardDescription className="text-muted-foreground">{company.industry}</CardDescription>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <span className="font-semibold text-foreground">{company.rating}</span>
                </div>
                {company.featured && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">Top</Badge>
                )}
              </CardHeader>
              <CardContent className="grow">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> 
                    <span className="font-medium">{company.employees}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Briefcase className="h-4 w-4 text-success" /> 
                    <span className="font-medium">{company.jobs}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 rounded-xl font-semibold">
                  Xem công ty <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Xem tất cả công ty
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;