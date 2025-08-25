import { Cpu, Megaphone, Palette, Landmark, Users, ShoppingCart, BookOpen, Stethoscope, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-primary mb-4 bg-background border-primary/30">
            🎯 Lĩnh vực hot
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Danh mục <span className="text-gradient-primary">phổ biến</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Khám phá các lĩnh vực việc làm hot nhất hiện nay.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <Card key={index} className="group text-center hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 border-0 shadow-md bg-background">
              <CardHeader>
                <div className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center group-hover:bg-gradient-primary transition-all duration-300">
                  <div className="transform group-hover:scale-110 group-hover:text-primary-foreground transition-all duration-300">
                    {category.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
                <p className="text-muted-foreground font-medium">
                  {category.jobs}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Xem tất cả danh mục
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;