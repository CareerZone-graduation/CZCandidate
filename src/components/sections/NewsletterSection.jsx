import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const features = [
  'Nhận thông báo về các vị trí việc làm mới nhất phù hợp với bạn',
  'Cập nhật tin tức và xu hướng thị trường lao động',
  'Chia sẻ mẹo và bí quyết tìm việc thành công',
  'Hoàn toàn miễn phí và dễ dàng hủy đăng ký bất kỳ lúc nào'
];

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <Card className="shadow-xl border-0 overflow-hidden bg-background">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-6">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Nhận thông báo về <span className="text-gradient-primary">việc làm mới nhất</span>
                </h2>
                <p className="text-muted-foreground mb-8">
                  Đăng ký nhận bản tin của chúng tôi để cập nhật những cơ hội việc làm mới nhất 
                  và nhận các mẹo hữu ích để phát triển sự nghiệp của bạn.
                </p>
                
                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="Email của bạn" 
                    className="h-12 sm:max-w-sm"
                  />
                  <Button size="lg" className="h-12 bg-gradient-primary hover:opacity-90 text-white">
                    Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Bằng cách đăng ký, bạn đồng ý với <a href="#" className="underline hover:text-primary">chính sách bảo mật</a> của chúng tôi.
                </p>
              </div>
              
              <div className="relative h-64 md:h-auto overflow-hidden bg-gradient-primary">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center text-primary-foreground">
                    <h3 className="text-2xl font-bold mb-3">Tăng 70% cơ hội tìm việc</h3>
                    <p className="text-primary-foreground/80">
                      Những người đăng ký nhận thông báo việc làm có khả năng tìm được công việc phù hợp cao hơn 70% 
                      so với những người không đăng ký.
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/10"></div>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default NewsletterSection;
