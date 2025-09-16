import { Search, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const HeroSection = () => {
  return (
    // REPLACED: Section với background gradient từ màu primary-light và các khối trang trí
    <section className="relative bg-gradient-to-b from-green-100 to-background pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-green-500/10 blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* REPLACED: Badge với style mới, nổi bật hơn */}
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium text-green-800 border-green-800/30 bg-background/80 backdrop-blur-sm mb-6 shadow-sm">
            🚀 Nền tảng việc làm hàng đầu tại Việt Nam
          </Badge>
          {/* REPLACED: Heading với text gradient để tạo điểm nhấn */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Tìm kiếm công việc</span>
            <br />
            <span className="text-foreground">định hình tương lai của bạn</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Khám phá hàng ngàn cơ hội việc làm chất lượng từ các công ty hàng đầu phù hợp với kỹ năng và đam mê của bạn.
          </p>
        </div>

        {/* REPLACED: Search Box sử dụng <Card> và các component input của ShadCN */}
        <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-background/90 backdrop-blur-md">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="pl-12 h-14 text-base border-border/50 focus:border-green-600 bg-background"
                />
              </div>
              <div className="relative md:col-span-3">
                <Select>
                  <SelectTrigger className="h-14 w-full border-border/50 focus:border-green-600 bg-background">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                    <SelectValue placeholder="Địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="h-14 w-full md:col-span-3 bg-green-700 text-white hover:bg-green-800 transition-all duration-300 shadow-lg hover:shadow-green-700/40 font-semibold text-base">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-muted-foreground mr-2">Phổ biến:</span>
              {['Frontend', 'Marketing', 'Data Science', 'UI/UX'].map((term, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-green-100 hover:text-green-700 transition-colors">
                  {term}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default HeroSection;
