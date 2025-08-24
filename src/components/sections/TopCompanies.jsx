import { Users, Briefcase, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const companies = [
  { id: 1, name: 'FPT Software', logo: '🏢', employees: '10,000+ nhân viên', jobs: '120 việc làm', industry: 'Công nghệ thông tin', rating: 4.8, featured: true },
  { id: 2, name: 'VinGroup', logo: '🏭', employees: '50,000+ nhân viên', jobs: '200 việc làm', industry: 'Tập đoàn đa ngành', rating: 4.7, featured: true },
  { id: 3, name: 'Shopee Vietnam', logo: '🛒', employees: '5,000+ nhân viên', jobs: '85 việc làm', industry: 'Thương mại điện tử', rating: 4.6, featured: false },
  { id: 4, name: 'Grab Vietnam', logo: '🚗', employees: '3,000+ nhân viên', jobs: '60 việc làm', industry: 'Công nghệ - Vận tải', rating: 4.5, featured: true },
  { id: 5, name: 'Viettel Group', logo: '📱', employees: '20,000+ nhân viên', jobs: '150 việc làm', industry: 'Viễn thông', rating: 4.4, featured: false },
  { id: 6, name: 'Techcombank', logo: '🏦', employees: '8,000+ nhân viên', jobs: '75 việc làm', industry: 'Ngân hàng', rating: 4.3, featured: true },
];

const TopCompanies = () => {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Top công ty hàng đầu
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Khám phá và ứng tuyển vào các công ty uy tín, môi trường làm việc tốt nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <Card key={company.id} className="flex flex-col text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="text-5xl mb-3 mx-auto">{company.logo}</div>
                <CardTitle className="text-xl font-bold">{company.name}</CardTitle>
                <CardDescription>{company.industry}</CardDescription>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{company.rating}</span>
                </div>
                {company.featured && (
                  <Badge className="absolute top-4 right-4">Top</Badge>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-center gap-2"><Users className="h-4 w-4 text-primary" /> {company.employees}</div>
                  <div className="flex items-center justify-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> {company.jobs}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Xem công ty <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg">
            Xem tất cả công ty
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;
