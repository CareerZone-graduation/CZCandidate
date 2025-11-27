import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle, Users, Briefcase } from 'lucide-react';
import { submitContactForm } from '@/services/contactService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AttachmentUploader from '@/components/common/AttachmentUploader';

// Form validation schema - title, category và message
const contactFormSchema = z.object({
  title: z.string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(100, 'Tiêu đề không được quá 100 ký tự'),
  category: z.string()
    .min(1, 'Vui lòng chọn chủ đề'),
  message: z.string()
    .min(10, 'Tin nhắn phải có ít nhất 10 ký tự')
    .max(500, 'Tin nhắn không được quá 500 ký tự')
});

const categories = [
  { value: '', label: 'Chọn một chủ đề' },
  { value: 'technical-issue', label: 'Vấn đề kỹ thuật' },
  { value: 'account-issue', label: 'Vấn đề tài khoản' },
  { value: 'payment-issue', label: 'Vấn đề thanh toán' },
  { value: 'job-posting-issue', label: 'Vấn đề đăng tin' },
  { value: 'application-issue', label: 'Vấn đề ứng tuyển' },
  { value: 'general-inquiry', label: 'Thắc mắc chung' }
];

const ContactPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  
  // Get user info from Redux store
  // Note: state.auth.user contains { user: {...}, profile: {...} }
  const { user: authData, isAuthenticated } = useSelector((state) => state.auth);
  const user = authData?.user; // Extract actual user object
  const profile = authData?.profile; // Extract profile if needed

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      title: '',
      category: '',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user?.email) {
        toast.error('Vui lòng đăng nhập để gửi yêu cầu hỗ trợ.');
        setIsSubmitting(false);
        return;
      }

      // Build submit data with user info
      const submitData = {
        title: data.title,
        category: data.category,
        message: data.message,
        userType: 'candidate',
        // Include user info from Redux store (user object or profile)
        name: profile?.fullname || user?.fullName || user?.name || user?.email?.split('@')[0] || 'Ứng viên',
        email: user?.email,
        phone: profile?.phone || user?.phone || user?.phoneNumber || ''
      };

      // Submit with files if any
      await submitContactForm(submitData, files);

      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 48 giờ.');

      // Reset form and files
      form.reset({
        title: '',
        category: '',
        message: ''
      });
      setFiles([]);
    } catch (error) {
      console.error('❌ Contact form error:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email hỗ trợ',
      content: 'support@careerzone.vn',
      description: 'Gửi email cho chúng tôi bất cứ lúc nào, 24/7'
    },
    {
      icon: Phone,
      title: 'Hotline hỗ trợ',
      content: '+84 123 456 789',
      description: 'Thứ 2 - Thứ 6: 8:00 - 18:00, Thứ 7: 8:00 - 12:00'
    },
    {
      icon: MapPin,
      title: 'Địa chỉ văn phòng',
      content: '123 Đường ABC, Quận 1, TP.HCM',
      description: 'Ghé thăm văn phòng của chúng tôi'
    },
    {
      icon: Clock,
      title: 'Thời gian phản hồi',
      content: 'Trong vòng 24 giờ',
      description: 'Cam kết phản hồi nhanh chóng trong giờ hành chính'
    }
  ];

  const trustMetrics = [
    {
      icon: Users,
      number: '50,000+',
      label: 'Ứng viên tin tưởng sử dụng'
    },
    {
      icon: Briefcase,
      number: '10,000+',
      label: 'Công việc được ứng tuyển thành công'
    },
    {
      icon: CheckCircle,
      number: '95%',
      label: 'Tỷ lệ hài lòng của ứng viên'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-lg text-primary-foreground/90">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin và chúng tôi sẽ phản hồi sớm nhất.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Gửi tin nhắn cho chúng tôi
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Điền thông tin vào form bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề *</FormLabel>
                        <FormControl>
                          <input
                            type="text"
                            placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chủ đề *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white h-11"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội dung *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập nội dung tin nhắn của bạn..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Tối thiểu 10 ký tự. Vui lòng mô tả chi tiết vấn đề của bạn.
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Attachments */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Tệp đính kèm (Tùy chọn)
                    </label>
                    <AttachmentUploader
                      files={files}
                      onChange={setFiles}
                    />
                    <p className="text-xs text-gray-500">
                      Bạn có thể đính kèm ảnh chụp màn hình hoặc file liên quan đến vấn đề.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Gửi tin nhắn
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information & Trust Indicators */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-900 font-medium mb-1">{info.content}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Support Link */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
              <div className="flex items-start space-x-3 mb-4">
                <MessageSquare className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cần hỗ trợ ngay?</h3>
                  <p className="text-sm text-gray-600">
                    Truy cập trang hỗ trợ để tạo yêu cầu và theo dõi tiến độ xử lý.
                  </p>
                </div>
              </div>
              <Button
                className="w-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                variant="outline"
                onClick={() => navigate('/support')}
              >
                Đi đến trang hỗ trợ
              </Button>
            </div>

            {/* Trust Metrics */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Tại sao chọn CareerZone?
                </h3>
                <div className="grid gap-6">
                  {trustMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <metric.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{metric.number}</div>
                        <div className="text-sm text-gray-700">{metric.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="bg-white shadow-md">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Thời gian phản hồi trung bình là bao lâu?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc. Các yêu cầu khẩn cấp sẽ được ưu tiên xử lý.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Tôi có thể theo dõi yêu cầu hỗ trợ của mình ở đâu?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Bạn có thể truy cập trang <button onClick={() => navigate('/support')} className="text-primary hover:underline">Hỗ trợ</button> để xem tất cả các yêu cầu và trạng thái xử lý.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Làm sao để liên hệ khẩn cấp?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Vui lòng gọi hotline: <a href="tel:+84123456789" className="text-primary hover:underline">+84 123 456 789</a> trong giờ làm việc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
