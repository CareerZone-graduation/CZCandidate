import { UserPlus, Search, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { SectionHeader } from '../common/SectionHeader';

const steps = [
  {
    icon: <UserPlus className="h-10 w-10" />,
    title: 'Tạo tài khoản',
    description: 'Đăng ký miễn phí và tạo hồ sơ chuyên nghiệp của bạn',
    color: 'from-emerald-500 to-teal-500',
    step: '01'
  },
  {
    icon: <Search className="h-10 w-10" />,
    title: 'Tìm kiếm việc làm',
    description: 'Khám phá hàng nghìn cơ hội việc làm phù hợp với bạn',
    color: 'from-blue-500 to-cyan-500',
    step: '02'
  },
  {
    icon: <FileText className="h-10 w-10" />,
    title: 'Nộp hồ sơ',
    description: 'Ứng tuyển nhanh chóng với CV được tối ưu hóa',
    color: 'from-purple-500 to-pink-500',
    step: '03'
  },
  {
    icon: <CheckCircle className="h-10 w-10" />,
    title: 'Nhận việc làm',
    description: 'Nhận phản hồi và bắt đầu sự nghiệp mới của bạn',
    color: 'from-orange-500 to-red-500',
    step: '04'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10">
        <SectionHeader
          badgeText="🚀 Quy trình đơn giản"
          title={<>Cách thức <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">hoạt động</span></>}
          description="Chỉ với 4 bước đơn giản, bạn có thể tìm được công việc mơ ước"
          className="mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-200 via-blue-200 to-orange-200"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-card">
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-muted to-muted/80 rounded-full flex items-center justify-center font-bold text-muted-foreground shadow-md">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-6 shadow-lg`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
