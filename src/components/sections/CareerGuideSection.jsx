import { ArrowRight, Clock, User, BookOpen } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const guideItems = [
  {
    title: 'Cách viết CV thu hút nhà tuyển dụng trong ngành IT',
    description: 'Khám phá những bí quyết để tạo ra một CV nổi bật giúp bạn gây ấn tượng với nhà tuyển dụng và tăng cơ hội được mời phỏng vấn.',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=500&auto=format&fit=crop',
    author: 'Nguyễn Văn A',
    date: '12/07/2025',
    readTime: '8 phút',
    category: 'Kỹ năng CV'
  },
  {
    title: 'Những câu hỏi phỏng vấn thường gặp và cách trả lời hiệu quả',
    description: 'Tổng hợp các câu hỏi phỏng vấn phổ biến và hướng dẫn cách trả lời chuyên nghiệp để tăng khả năng thành công trong buổi phỏng vấn.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop',
    author: 'Trần Thị B',
    date: '05/08/2025',
    readTime: '10 phút',
    category: 'Phỏng vấn'
  },
  {
    title: '5 kỹ năng mềm quan trọng cần có để phát triển sự nghiệp',
    description: 'Những kỹ năng mềm thiết yếu giúp bạn không chỉ tìm được việc làm tốt mà còn phát triển sự nghiệp bền vững trong dài hạn.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=500&auto=format&fit=crop',
    author: 'Lê Văn C',
    date: '23/06/2025',
    readTime: '6 phút',
    category: 'Phát triển bản thân'
  },
];

const CareerGuideSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <Badge variant="outline" className="text-primary mb-4 bg-background border-primary/30">📚 Cẩm nang nghề nghiệp</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Bí quyết <span className="text-gradient-primary">phát triển sự nghiệp</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Những bài viết hữu ích giúp bạn đạt được thành công trong hành trình sự nghiệp của mình.
            </p>
          </div>
          <Button variant="outline" size="lg" className="mt-6 md:mt-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Xem tất cả bài viết
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guideItems.map((item, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-background group hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-gradient-primary text-primary-foreground hover:opacity-90">{item.category}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center text-sm text-muted-foreground space-x-4 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{item.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{item.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground line-clamp-3">{item.description}</p>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button variant="link" className="p-0 h-auto text-primary">
                  Đọc tiếp <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 rounded-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Trung tâm hướng nghiệp</h3>
              <p className="text-muted-foreground max-w-xl">
                Khám phá các khóa học, webinar và tài liệu miễn phí để phát triển kỹ năng và định hướng sự nghiệp. 
                Được thiết kế bởi các chuyên gia hàng đầu trong ngành.
              </p>
            </div>
            <Button size="lg" className="min-w-[180px]">
              Truy cập ngay
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CareerGuideSection;
