import { Briefcase, Building2, LucideMapPin, Clock, DollarSign, BarChart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const categories = [
  { icon: Briefcase, name: 'Lập trình & IT', count: 1523 },
  { icon: Building2, name: 'Kinh doanh & Bán hàng', count: 876 },
  { icon: BarChart, name: 'Marketing & Digital', count: 654 },
  { icon: DollarSign, name: 'Tài chính & Kế toán', count: 321 },
];

const JobSearchSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tìm kiếm cơ hội nghề nghiệp
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Khám phá việc làm trong các lĩnh vực phổ biến hoặc tìm kiếm theo địa điểm và mức lương mong muốn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-700">
                <LucideMapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Tìm theo địa điểm</h3>
              <p className="text-muted-foreground">
                Tìm việc làm gần nơi bạn sống hoặc nơi bạn muốn đến
              </p>
              <div className="pt-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="other">Các tỉnh khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-700">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Tìm theo ngành nghề</h3>
              <p className="text-muted-foreground">
                Khám phá cơ hội việc làm trong lĩnh vực chuyên môn của bạn
              </p>
              <div className="pt-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngành nghề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Công nghệ thông tin</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Tài chính</SelectItem>
                    <SelectItem value="other">Ngành khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-0 space-y-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-amber-100 text-amber-700">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Tìm theo hình thức</h3>
              <p className="text-muted-foreground">
                Lựa chọn hình thức làm việc phù hợp với lối sống của bạn
              </p>
              <div className="pt-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hình thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fulltime">Toàn thời gian</SelectItem>
                    <SelectItem value="parttime">Bán thời gian</SelectItem>
                    <SelectItem value="remote">Từ xa</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{category.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="secondary">{category.count} việc làm</Badge>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <span className="sr-only">Xem chi tiết</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobSearchSection;
