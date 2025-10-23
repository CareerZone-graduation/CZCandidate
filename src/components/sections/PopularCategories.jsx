import { Cpu, Megaphone, Palette, Landmark, Users, ShoppingCart, BookOpen, Stethoscope, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SectionHeader } from '../common/SectionHeader';

const categories = [
  { name: 'Công nghệ thông tin', jobs: '2,500+ việc làm', icon: <Cpu className="h-10 w-10 text-primary" /> },
  { name: 'Marketing & PR', jobs: '1,200+ việc làm', icon: <Megaphone className="h-10 w-10 text-primary" /> },
  { name: 'Thiết kế', jobs: '800+ việc làm', icon: <Palette className="h-10 w-10 text-primary" /> },
  { name: 'Tài chính & Kế toán', jobs: '950+ việc làm', icon: <Landmark className="h-10 w-10 text-primary" /> },
  { name: 'Nhân sự', jobs: '650+ việc làm', icon: <Users className="h-10 w-10 text-primary" /> },
  { name: 'Bán hàng', jobs: '1,100+ việc làm', icon: <ShoppingCart className="h-10 w-10 text-primary" /> },
  { name: 'Giáo dục', jobs: '450+ việc làm', icon: <BookOpen className="h-10 w-10 text-primary" /> },
  { name: 'Y tế', jobs: '720+ việc làm', icon: <Stethoscope className="h-10 w-10 text-primary" /> },
];

const PopularCategories = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <SectionHeader
          badgeText="🎯 Lĩnh vực hot"
          title={<>Danh mục <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">phổ biến</span></>}
          description="Khám phá các lĩnh vực việc làm hot nhất hiện nay."
          className="mb-12"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="group bg-card hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30 shadow-md hover:shadow-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 border hover:border-emerald-200 dark:hover:border-emerald-800">
              <CardHeader>
                <div className="mx-auto bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-lg">
                  <div className="text-emerald-600 dark:text-emerald-400 group-hover:text-white transform group-hover:scale-110 transition-all duration-300">
                    {category.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-bold text-foreground mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-center">
                  {category.name}
                </CardTitle>
                <p className="text-muted-foreground font-medium text-center text-sm">
                  {category.jobs}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg">
            Xem tất cả danh mục
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;