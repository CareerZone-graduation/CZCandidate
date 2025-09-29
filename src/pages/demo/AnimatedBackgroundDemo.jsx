import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Palette, 
  Activity, 
  Eye,
  Settings,
  Star,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * Demo page showcasing the animated background system
 */
const AnimatedBackgroundDemo = () => {
  const sampleJobs = [
    {
      id: 1,
      title: "Senior React Developer",
      company: "TechViet Solutions",
      location: "Ho Chi Minh City",
      salary: "$2000 - $3000",
      type: "Full-time",
      posted: "2 ngày trước",
      skills: ["React", "TypeScript", "Node.js"],
      rating: 4.8
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Creative Studio",
      location: "Hanoi",
      salary: "$1500 - $2500",
      type: "Remote",
      posted: "1 ngày trước",
      skills: ["Figma", "Adobe XD", "Sketch"],
      rating: 4.9
    },
    {
      id: 3,
      title: "DevOps Engineer",
      company: "CloudTech Vietnam",
      location: "Da Nang",
      salary: "$2200 - $3200",
      type: "Hybrid",
      posted: "3 ngày trước",
      skills: ["AWS", "Docker", "Kubernetes"],
      rating: 4.7
    }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="text-primary border-primary/30">
            <Sparkles className="h-4 w-4 mr-2" />
            Animated Background Demo
          </Badge>
          
          <h1 className="text-5xl font-bold text-gradient-primary">
            Trải nghiệm nền động
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Khám phá hệ thống nền động mới với hiệu ứng hạt noise và gradient tinh tế. 
            Các thẻ được tối ưu hóa với hiệu ứng backdrop blur để tạo độ tương phản tốt hơn.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <Palette className="h-8 w-8 text-primary mb-2" />
              <EnhancedCardTitle>Thiết kế tinh tế</EnhancedCardTitle>
              <EnhancedCardDescription>
                Gradient và hạt động được thiết kế để không làm phân tán sự chú ý
              </EnhancedCardDescription>
            </EnhancedCardHeader>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <Activity className="h-8 w-8 text-primary mb-2" />
              <EnhancedCardTitle>Hiệu suất cao</EnhancedCardTitle>
              <EnhancedCardDescription>
                Tự động điều chỉnh chất lượng dựa trên hiệu suất thiết bị
              </EnhancedCardDescription>
            </EnhancedCardHeader>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <Eye className="h-8 w-8 text-primary mb-2" />
              <EnhancedCardTitle>Accessibility</EnhancedCardTitle>
              <EnhancedCardDescription>
                Tôn trọng cài đặt "reduced motion" của người dùng
              </EnhancedCardDescription>
            </EnhancedCardHeader>
          </EnhancedCard>
        </div>

        {/* Card Comparison */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">So sánh thẻ</h2>
            <p className="text-muted-foreground">
              Xem sự khác biệt giữa thẻ thường và thẻ được tối ưu hóa cho nền động
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Standard Card */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Thẻ thường</h3>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Thẻ chuẩn</CardTitle>
                  <CardDescription>
                    Thẻ thông thường có thể không có độ tương phản tốt với nền động
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nội dung có thể khó đọc trên nền có hiệu ứng động.
                  </p>
                  <Button className="mt-4 w-full">Thử ngay</Button>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Card */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Thẻ tối ưu</h3>
              <EnhancedCard variant="interactive">
                <EnhancedCardHeader>
                  <EnhancedCardTitle>Thẻ tối ưu hóa</EnhancedCardTitle>
                  <EnhancedCardDescription>
                    Thẻ với backdrop blur và độ tương phản được cải thiện
                  </EnhancedCardDescription>
                </EnhancedCardHeader>
                <EnhancedCardContent>
                  <p className="text-sm text-muted-foreground">
                    Nội dung rõ ràng và dễ đọc với hiệu ứng backdrop blur.
                  </p>
                  <Button className="mt-4 w-full btn-gradient">Thử ngay</Button>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </div>
        </div>

        {/* Job Cards Demo */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ví dụ thực tế</h2>
            <p className="text-muted-foreground">
              Các thẻ việc làm với nền động tạo trải nghiệm người dùng tốt hơn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleJobs.map((job) => (
              <EnhancedCard key={job.id} variant="interactive">
                <EnhancedCardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <EnhancedCardTitle className="text-lg">{job.title}</EnhancedCardTitle>
                      <EnhancedCardDescription className="font-medium text-primary">
                        {job.company}
                      </EnhancedCardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{job.rating}</span>
                    </div>
                  </div>
                </EnhancedCardHeader>
                
                <EnhancedCardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {job.posted}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                    {job.type}
                  </Badge>
                </EnhancedCardContent>
                
                <EnhancedCardContent className="pt-0">
                  <Button className="w-full btn-gradient">
                    Ứng tuyển ngay
                  </Button>
                </EnhancedCardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <EnhancedCard className="max-w-4xl mx-auto">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Hướng dẫn sử dụng
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Trong Development Mode:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sử dụng panel điều khiển ở góc phải dưới</li>
                    <li>• Xem thông tin hiệu suất ở góc trái dưới</li>
                    <li>• Điều chỉnh mật độ hạt, tốc độ và gradient</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tính năng tự động:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tự động điều chỉnh chất lượng theo hiệu suất</li>
                    <li>• Tạm dừng khi tab không được xem</li>
                    <li>• Tôn trọng cài đặt "reduced motion"</li>
                  </ul>
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default AnimatedBackgroundDemo;