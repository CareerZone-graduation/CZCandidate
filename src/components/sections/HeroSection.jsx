import { useState } from 'react';
import { Search, MapPin, Briefcase, Building2, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const HeroSection = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const stats = [
    { icon: Briefcase, value: '15,000+', label: 'Việc làm mới' },
    { icon: Building2, value: '2,500+', label: 'Công ty hàng đầu' },
    { icon: TrendingUp, value: '98%', label: 'Tỷ lệ thành công' },
  ];

  return (
    <section className="relative bg-gradient-to-primary min-h-[85vh] flex items-center pt-20 lg:pt-24 pb-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background/80 backdrop-blur-sm mb-6">
            🚀 Nền tảng việc làm hàng đầu tại Việt Nam
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-gradient-primary">Tìm kiếm công việc</span>
            <br />
            <span className="text-foreground">định hình tương lai của bạn</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu 
            phù hợp với kỹ năng và đam mê của bạn.
          </p>
        </div>

        {/* Search Box */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-background/95 backdrop-blur-md mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Vị trí, kỹ năng, từ khóa..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-12 h-14 text-base border-border/50 focus:border-primary bg-background"
                />
              </div>
              <div className="relative">
                <Select>
                  <SelectTrigger className="h-14 border-border/50 focus:border-primary bg-background">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
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
              <Button size="lg" className="h-14 w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm ngay
              </Button>
            </div>
            
            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-muted-foreground mr-2">Tìm kiếm phổ biến:</span>
              {['Frontend Developer', 'Marketing', 'Data Science', 'Product Manager', 'UI/UX Designer'].map((term, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 bg-background/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-primary rounded-xl shadow-lg">
                  <stat.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
