import { Briefcase, PieChart, Code, Megaphone, Monitor, PenTool, ShoppingBag, Database } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const categories = [
  { 
    icon: Code, 
    name: 'Phát triển phần mềm', 
    jobCount: 1245,
    skills: ['JavaScript', 'React', 'Node.js', 'Python'] 
  },
  { 
    icon: Megaphone, 
    name: 'Marketing & Truyền thông', 
    jobCount: 856,
    skills: ['Digital Marketing', 'SEO', 'Content', 'Social Media'] 
  },
  { 
    icon: PieChart, 
    name: 'Tài chính & Kế toán', 
    jobCount: 697,
    skills: ['Kế toán', 'Phân tích tài chính', 'Thuế', 'Kiểm toán'] 
  },
  { 
    icon: Monitor, 
    name: 'Thiết kế UI/UX', 
    jobCount: 423,
    skills: ['Figma', 'Adobe XD', 'UI Design', 'Web Design'] 
  },
  { 
    icon: ShoppingBag, 
    name: 'Kinh doanh & Bán hàng', 
    jobCount: 934,
    skills: ['B2B Sales', 'Quản lý KH', 'Đàm phán', 'CRM'] 
  },
  { 
    icon: Database, 
    name: 'Dữ liệu & Phân tích', 
    jobCount: 531,
    skills: ['SQL', 'Python', 'Data Mining', 'Tableau'] 
  },
  { 
    icon: PenTool, 
    name: 'Thiết kế & Sáng tạo', 
    jobCount: 378,
    skills: ['Photoshop', 'Illustrator', 'Branding', '3D'] 
  },
  { 
    icon: Briefcase, 
    name: 'Quản lý dự án', 
    jobCount: 645,
    skills: ['Agile', 'Scrum', 'PM Tools', 'Lãnh đạo'] 
  },
];

const JobCategoriesSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="outline" className="text-primary mb-4">Khám phá lĩnh vực</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Việc làm theo danh mục
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Khám phá các cơ hội việc làm trong nhiều lĩnh vực khác nhau, tìm kiếm ngành nghề phù hợp với kỹ năng và sở thích của bạn.
            </p>
          </div>
          <Button variant="outline" size="lg" className="mt-6 md:mt-0">
            Xem tất cả danh mục
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <category.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground mb-4">{category.jobCount} việc làm có sẵn</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {category.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobCategoriesSection;
