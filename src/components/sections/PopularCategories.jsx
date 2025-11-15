import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Megaphone, Palette, Landmark, Users, ShoppingCart, BookOpen, Stethoscope, ArrowRight, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SectionHeader } from '../common/SectionHeader';
import apiClient from '../../services/apiClient';

// Icon mapping cho các category
const categoryIcons = {
  'SOFTWARE_DEVELOPMENT': <Cpu className="h-10 w-10 text-primary" />,
  'MARKETING': <Megaphone className="h-10 w-10 text-primary" />,
  'DESIGN': <Palette className="h-10 w-10 text-primary" />,
  'FINANCE': <Landmark className="h-10 w-10 text-primary" />,
  'HUMAN_RESOURCES': <Users className="h-10 w-10 text-primary" />,
  'SALES': <ShoppingCart className="h-10 w-10 text-primary" />,
  'EDUCATION': <BookOpen className="h-10 w-10 text-primary" />,
  'HEALTHCARE': <Stethoscope className="h-10 w-10 text-primary" />,
};

// Tên tiếng Việt cho categories
const categoryNames = {
  'SOFTWARE_DEVELOPMENT': 'Phát triển phần mềm',
  'MARKETING': 'Marketing & PR',
  'DESIGN': 'Thiết kế',
  'FINANCE': 'Tài chính & Kế toán',
  'HUMAN_RESOURCES': 'Nhân sự',
  'SALES': 'Bán hàng',
  'EDUCATION': 'Giáo dục',
  'HEALTHCARE': 'Y tế',
  'ACCOUNTING': 'Kế toán',
  'DATA_SCIENCE': 'Khoa học dữ liệu',
  'IT': 'Công nghệ thông tin',
  'CUSTOMER_SERVICE': 'Dịch vụ khách hàng',
  'GRAPHIC_DESIGN': 'Thiết kế đồ họa',
  'WEB_DEVELOPMENT': 'Phát triển Web',
};

const PopularCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handler khi click vào một danh mục
  const handleCategoryClick = (categoryKey) => {
    navigate(`/jobs/search?category=${categoryKey}`);
  };

  // Handler cho nút "Xem tất cả danh mục"
  const handleViewAllCategories = () => {
    navigate('/jobs/search');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Gọi API không cần authentication
        const response = await apiClient.get('/analytics/job-categories');
        if (response.data.success) {
          const categoryData = response.data.data.map(cat => ({
            name: categoryNames[cat.category] || cat.category,
            jobs: `${cat.count.toLocaleString()} việc làm`,
            icon: categoryIcons[cat.category] || <Briefcase className="h-10 w-10 text-primary" />,
            category: cat.category
          }));
          setCategories(categoryData);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array or show error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container">
        <SectionHeader
          badgeText="🎯 Lĩnh vực hot"
          title={<>Danh mục <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">phổ biến</span></>}
          description="Khám phá các lĩnh vực việc làm hot nhất hiện nay."
          className="mb-12"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted h-48" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Không có dữ liệu danh mục
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={index} 
                className="group bg-card hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30 shadow-md hover:shadow-xl rounded-2xl p-6 cursor-pointer transition-all duration-300 border hover:border-emerald-200 dark:hover:border-emerald-800"
                onClick={() => handleCategoryClick(category.category)}
              >
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
        )}

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-6 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={handleViewAllCategories}
          >
            Xem tất cả danh mục
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;