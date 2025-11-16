import { HelpCircle, X, AlertTriangle, Wifi, Video, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpPanel = () => {
  const troubleshootingTips = [
    {
      id: 'connection',
      icon: Wifi,
      title: 'Sự cố kết nối mạng',
      problems: [
        {
          issue: 'Video bị giật, lag',
          solutions: [
            'Kiểm tra tốc độ mạng (tối thiểu 1.5 Mbps)',
            'Đóng các ứng dụng đang sử dụng băng thông',
            'Kết nối dây mạng thay vì WiFi nếu có thể',
            'Di chuyển gần router WiFi hơn'
          ]
        },
        {
          issue: 'Mất kết nối thường xuyên',
          solutions: [
            'Khởi động lại router/modem',
            'Kiểm tra các thiết bị khác có đang tải nặng không',
            'Tắt VPN nếu đang bật',
            'Thử chuyển sang mạng 4G/5G nếu có'
          ]
        }
      ]
    },
    {
      id: 'video',
      icon: Video,
      title: 'Sự cố camera',
      problems: [
        {
          issue: 'Không thấy hình ảnh camera',
          solutions: [
            'Kiểm tra camera có bị che hoặc tắt không',
            'Đảm bảo đã cấp quyền camera cho trình duyệt',
            'Kiểm tra camera có đang được ứng dụng khác sử dụng không',
            'Thử tải lại trang hoặc khởi động lại trình duyệt'
          ]
        },
        {
          issue: 'Hình ảnh camera bị tối hoặc mờ',
          solutions: [
            'Điều chỉnh ánh sáng trong phòng',
            'Lau ống kính camera',
            'Kiểm tra cài đặt camera trong hệ thống',
            'Thử sử dụng camera khác nếu có'
          ]
        }
      ]
    },
    {
      id: 'audio',
      icon: Mic,
      title: 'Sự cố âm thanh',
      problems: [
        {
          issue: 'Không nghe thấy nhà tuyển dụng',
          solutions: [
            'Kiểm tra âm lượng hệ thống và trình duyệt',
            'Thử đổi loa/tai nghe khác',
            'Kiểm tra loa có bị tắt tiếng không',
            'Nhấn F5 để tải lại trang'
          ]
        },
        {
          issue: 'Nhà tuyển dụng không nghe thấy tôi',
          solutions: [
            'Kiểm tra micro có bị tắt tiếng không',
            'Đảm bảo đã cấp quyền microphone cho trình duyệt',
            'Thử micro khác hoặc dùng tai nghe có micro',
            'Kiểm tra micro có đang được ứng dụng khác sử dụng không'
          ]
        },
        {
          issue: 'Tiếng vọng hoặc tạp âm',
          solutions: [
            'Sử dụng tai nghe thay vì loa',
            'Giảm âm lượng loa',
            'Di chuyển đến nơi yên tĩnh hơn',
            'Tắt các nguồn âm thanh khác trong phòng'
          ]
        }
      ]
    }
  ];

  const quickTips = [
    'Đảm bảo bạn ở nơi yên tĩnh, có ánh sáng tốt',
    'Kiểm tra camera và micro trước khi vào phỏng vấn',
    'Đóng các tab/ứng dụng không cần thiết',
    'Sử dụng tai nghe để tránh tiếng vọng',
    'Chuẩn bị giấy bút để ghi chú nếu cần',
    'Giữ kết nối mạng ổn định (dây mạng tốt hơn WiFi)',
    'Ngồi ở vị trí camera quay được cả người và mặt',
    'Mặc trang phục chỉnh chu như phỏng vấn trực tiếp'
  ];

  const emergencySteps = [
    {
      step: 1,
      title: 'Giữ bình tĩnh',
      description: 'Sự cố kỹ thuật có thể xảy ra. Hãy giữ bình tĩnh và xử lý từng bước.'
    },
    {
      step: 2,
      title: 'Thông báo cho nhà tuyển dụng',
      description: 'Sử dụng tính năng chat để thông báo vấn đề bạn đang gặp phải.'
    },
    {
      step: 3,
      title: 'Thử các giải pháp cơ bản',
      description: 'Tải lại trang (F5), kiểm tra kết nối mạng, khởi động lại trình duyệt.'
    },
    {
      step: 4,
      title: 'Liên hệ hỗ trợ',
      description: 'Nếu vấn đề vẫn tiếp diễn, liên hệ đội ngũ hỗ trợ kỹ thuật qua email hoặc hotline.'
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Trợ giúp & Khắc phục sự cố
          </DialogTitle>
          <DialogDescription>
            Hướng dẫn giải quyết các vấn đề thường gặp trong phỏng vấn trực tuyến
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mẹo để có buổi phỏng vấn tốt</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quickTips.map((tip, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Separator />

            {/* Troubleshooting */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Khắc phục sự cố</h3>
              
              {troubleshootingTips.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <category.icon className="h-5 w-5" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.problems.map((problem, idx) => (
                        <AccordionItem key={idx} value={`problem-${idx}`}>
                          <AccordionTrigger className="text-sm">
                            {problem.issue}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Giải pháp:
                              </p>
                              <ol className="list-decimal list-inside space-y-1">
                                {problem.solutions.map((solution, sIdx) => (
                                  <li key={sIdx} className="text-sm">
                                    {solution}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Emergency Steps */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Xử lý khi gặp sự cố nghiêm trọng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencySteps.map((step) => (
                    <div key={step.step} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liên hệ hỗ trợ</CardTitle>
                <CardDescription>
                  Nếu bạn không thể tự khắc phục sự cố, hãy liên hệ với chúng tôi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@careerzone.vn</p>
                <p><strong>Hotline:</strong> 1900-xxxx (8:00 - 22:00)</p>
                <p className="text-muted-foreground text-xs mt-4">
                  Lưu ý: Trong giờ phỏng vấn, thời gian phản hồi có thể lâu hơn. 
                  Hãy thử các bước khắc phục sự cố ở trên trước khi liên hệ.
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpPanel;
