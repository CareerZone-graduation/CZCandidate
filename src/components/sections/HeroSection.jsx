import { useState } from 'react';
import { Search, MapPin, Briefcase, Building2, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const HeroSection = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [location, setLocation] = useState('');
  
  const stats = [
    { icon: Briefcase, value: '15,000+', label: 'Việc làm mới' },
    { icon: Building2, value: '2,500+', label: 'Công ty hàng đầu' },
    { icon: TrendingUp, value: '98%', label: 'Tỷ lệ thành công' },
  ];

  return (
    <section className="relative bg-gradient-to-b from-primary/5 to-background pt-16 lg:pt-24 pb-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="outline" className="px-4 py-1 text-sm font-medium text-primary border-primary/30 mb-5">
            Nền tảng việc làm hàng đầu tại Việt Nam
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Tìm kiếm công việc <br />
            <span className="text-foreground">định hình tương lai của bạn</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu 
            phù hợp với kỹ năng và đam mê của bạn.
          </p>
        </div>

        {/* Search Box */}
        <Card className="max-w-3xl mx-auto shadow-lg mb-16">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Vị trí, kỹ năng, từ khóa..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <div className="relative">
                <Select>
                  <SelectTrigger className="h-12">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 mb-3 bg-primary/10 rounded-full">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
