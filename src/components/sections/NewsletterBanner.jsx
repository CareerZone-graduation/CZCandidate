import { Mail, Check } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

const NewsletterBanner = () => {
  return (
    <section className="relative bg-linear-to-r from-green-500 via-teal-500 to-blue-600 py-20">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>
      
      <div className="container relative z-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left Content */}
          <div className="text-white">
            <div className="flex items-center mb-6">
              <Mail className="h-8 w-8 mr-3" />
              <div className="h-1 w-12 bg-white/30 rounded"></div>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Nhận thông báo về <span className="text-teal-200">việc làm mới nhất</span>
            </h2>
            
            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              Đăng ký nhận bản tin của chúng tôi để cập nhật những cơ hội việc làm 
              mới nhất và nhận các mẹo hữu ích để phát triển sự nghiệp của bạn.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-teal-200" />
                <span className="text-white/90">Nhận thông báo về các vị trí việc làm mới nhất phù hợp với bạn</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-teal-200" />
                <span className="text-white/90">Cập nhật tin tức và xu hướng thị trường lao động</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-teal-200" />
                <span className="text-white/90">Chia sẻ mẹo và bí quyết tìm việc thành công</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-3 text-teal-200" />
                <span className="text-white/90">Hoàn toàn miễn phí và dễ dàng hủy đăng ký bất kỳ lúc nào</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20 backdrop-blur-sm"
              />
              <Button 
                className="h-12 bg-white text-blue-600 hover:bg-white/90 font-semibold px-8 whitespace-nowrap"
              >
                Đăng ký ngay →
              </Button>
            </div>
            
            <p className="text-sm text-white/70 mt-4">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <a href="#" className="underline hover:text-white">chính sách bảo mật</a> của chúng tôi.
            </p>
          </div>
          
          {/* Right Content */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Tăng 70% cơ hội tìm việc
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                Những người đăng ký nhận thông báo việc làm có khả năng tìm được công việc 
                phù hợp cao hơn 70% so với những người không đăng ký.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBanner;