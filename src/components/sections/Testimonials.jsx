import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const testimonials = [
  { 
    id: 1, 
    name: 'Nguyễn Văn An', 
    position: 'Frontend Developer tại TechCorp', 
    content: 'CareerZone đã giúp tôi tìm được công việc mơ ước. Giao diện thân thiện, thông tin việc làm chi tiết và quy trình ứng tuyển rất thuận tiện. Tôi đã nhận được 3 lời mời phỏng vấn chỉ trong tuần đầu tiên.',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg', 
    rating: 5,
    company: 'TechCorp',
    companyLogo: 'https://randomuser.me/api/portraits/lego/5.jpg'
  },
  { 
    id: 2, 
    name: 'Trần Thị Mai', 
    position: 'Marketing Manager tại StartupXYZ', 
    content: 'Tôi rất ấn tượng với chất lượng các cơ hội việc làm trên CareerZone. Đặc biệt là các công ty đều rất uy tín và môi trường làm việc chuyên nghiệp. Hệ thống thông báo việc làm mới cũng rất hữu ích.',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg', 
    rating: 5,
    company: 'StartupXYZ',
    companyLogo: 'https://randomuser.me/api/portraits/lego/1.jpg'
  },
  { 
    id: 3, 
    name: 'Lê Minh Tuấn', 
    position: 'UI/UX Designer tại Creative Agency', 
    content: 'Platform tuyệt vời cho người tìm việc! Tôi đã nhận được nhiều lời mời phỏng vấn chỉ trong vòng 2 tuần sau khi đăng ký. Khả năng kết nối với nhà tuyển dụng rất tốt và tôi đánh giá cao sự hỗ trợ từ đội ngũ CareerZone.',
    avatar: 'https://randomuser.me/api/portraits/men/35.jpg', 
    rating: 5,
    company: 'Creative Agency',
    companyLogo: 'https://randomuser.me/api/portraits/lego/8.jpg'
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="outline" className="text-primary mb-4">Người dùng chia sẻ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Câu chuyện thành công
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hàng ngàn người đã tìm được công việc mơ ước thông qua nền tảng CareerZone. 
              Dưới đây là một số câu chuyện thành công của họ.
            </p>
          </div>
          <div className="flex gap-2 mt-6 md:mt-0">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300 overflow-visible relative">
              <div className="absolute -top-5 left-8 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Quote className="h-5 w-5 text-white" />
              </div>
              <CardContent className="p-8 pt-10">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Công ty:</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={testimonial.companyLogo} alt={testimonial.company} />
                      <AvatarFallback>{testimonial.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{testimonial.company}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary/80 text-white p-8 md:p-12 shadow-xl">
            <CardContent className="p-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Bạn cũng muốn có câu chuyện thành công như vậy?
              </h3>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Hãy tham gia CareerZone ngay hôm nay và khám phá hàng ngàn cơ hội việc làm tuyệt vời!
                Việc làm mơ ước của bạn đang chờ phía trước.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  Tìm việc làm
                </Button>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Đăng ký ngay
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
