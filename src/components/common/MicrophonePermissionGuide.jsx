import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic,
  Chrome, 
  Globe, 
  Settings, 
  Lock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MicrophonePermissionGuide - Modal hướng dẫn user bật quyền microphone
 * Hiển thị hướng dẫn chi tiết cho từng trình duyệt phổ biến
 */
const MicrophonePermissionGuide = ({ isOpen, onClose, onRetry }) => {
  // Detect browser
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return { name: 'Chrome', icon: Chrome };
    } else if (userAgent.includes('Firefox')) {
      return { name: 'Firefox', icon: Globe };
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return { name: 'Safari', icon: Globe };
    } else if (userAgent.includes('Edg')) {
      return { name: 'Edge', icon: Globe };
    }
    return { name: 'Browser', icon: Globe };
  };

  const browser = getBrowserInfo();
  const BrowserIcon = browser.icon;

  // Browser-specific instructions
  const getInstructions = () => {
    switch (browser.name) {
      case 'Chrome':
        return {
          steps: [
            'Nhấp vào biểu tượng khóa 🔒 hoặc camera 🎥 bên trái thanh địa chỉ',
            'Tìm mục "Microphone" trong danh sách quyền',
            'Chọn "Cho phép" (Allow) từ menu thả xuống',
            'Tải lại trang và thử lại'
          ],
          alternative: [
            'Vào Chrome Settings (chrome://settings/content/microphone)',
            'Tìm website này trong danh sách "Đã chặn"',
            'Nhấp vào biểu tượng thùng rác để xóa',
            'Quay lại trang và thử lại'
          ]
        };
      
      case 'Firefox':
        return {
          steps: [
            'Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ',
            'Chọn "Connection secure" > "More information"',
            'Vào tab "Permissions"',
            'Tìm "Use the Microphone"',
            'Bỏ chọn "Use default" và chọn "Allow"',
            'Đóng cửa sổ và tải lại trang'
          ],
          alternative: [
            'Vào Firefox Settings > Privacy & Security',
            'Cuộn xuống phần "Permissions" > "Microphone"',
            'Nhấp "Settings..." và tìm website này',
            'Thay đổi trạng thái thành "Allow"'
          ]
        };
      
      case 'Safari':
        return {
          steps: [
            'Mở Safari > Settings (hoặc Preferences)',
            'Chọn tab "Websites"',
            'Chọn "Microphone" từ sidebar bên trái',
            'Tìm website này trong danh sách',
            'Chọn "Allow" từ menu thả xuống',
            'Đóng Settings và tải lại trang'
          ],
          alternative: [
            'Trên macOS: System Settings > Privacy & Security > Microphone',
            'Đảm bảo Safari được bật',
            'Quay lại Safari và thử lại'
          ]
        };
      
      case 'Edge':
        return {
          steps: [
            'Nhấp vào biểu tượng khóa 🔒 bên trái thanh địa chỉ',
            'Chọn "Permissions for this site"',
            'Tìm "Microphone" và chọn "Allow"',
            'Tải lại trang và thử lại'
          ],
          alternative: [
            'Vào Edge Settings (edge://settings/content/microphone)',
            'Kiểm tra website này trong danh sách "Block"',
            'Di chuyển sang danh sách "Allow"'
          ]
        };
      
      default:
        return {
          steps: [
            'Tìm biểu tượng khóa 🔒 hoặc cài đặt trang web trên thanh địa chỉ',
            'Tìm cài đặt quyền "Microphone"',
            'Thay đổi thành "Cho phép" (Allow)',
            'Tải lại trang và thử lại'
          ],
          alternative: []
        };
    }
  };

  const instructions = getInstructions();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Mic className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl">
              Cách bật quyền truy cập Microphone
            </DialogTitle>
          </div>
          <DialogDescription>
            Để sử dụng tính năng tìm kiếm bằng giọng nói, bạn cần cho phép 
            website truy cập microphone của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Browser Detection */}
          <Alert>
            <BrowserIcon className="h-4 w-4" />
            <AlertDescription>
              Chúng tôi phát hiện bạn đang dùng <strong>{browser.name}</strong>. 
              Dưới đây là hướng dẫn chi tiết.
            </AlertDescription>
          </Alert>

          {/* Main Instructions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Settings className="h-4 w-4 text-red-500" />
              <span>Cách 1: Cài đặt nhanh từ thanh địa chỉ</span>
            </div>
            
            <ol className="space-y-3 ml-6">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500 font-semibold text-xs">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Alternative Method */}
          {instructions.alternative.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 text-red-500" />
                <span>Cách 2: Từ cài đặt trình duyệt</span>
              </div>
              
              <ol className="space-y-3 ml-6">
                {instructions.alternative.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-red-500 font-semibold text-xs">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Important Notes */}
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>Lưu ý quan trọng:</strong>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Microphone chỉ được sử dụng khi bạn nhấn nút tìm kiếm giọng nói</li>
                <li>Chúng tôi không ghi âm hoặc lưu trữ giọng nói của bạn</li>
                <li>Âm thanh chỉ được xử lý để chuyển thành văn bản tìm kiếm</li>
                <li>Bạn có thể tắt quyền này bất cứ lúc nào</li>
                <li>Đảm bảo microphone của bạn đang hoạt động tốt</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Success Tips */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-green-900">
                  Sau khi bật quyền thành công:
                </p>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Nhấn nút "Thử lại" bên dưới</li>
                  <li>Hoặc tải lại trang và nhấn nút microphone 🎤</li>
                  <li>Nói rõ ràng từ khóa bạn muốn tìm kiếm</li>
                  <li>Trình duyệt sẽ nhớ lựa chọn của bạn cho lần sau</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Microphone */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Volume2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-semibold text-blue-900">
                  Kiểm tra microphone:
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Đảm bảo microphone được kết nối và bật</li>
                  <li>Kiểm tra âm lượng microphone trong cài đặt hệ thống</li>
                  <li>Thử nói "test" để kiểm tra microphone hoạt động</li>
                  <li>Nếu dùng tai nghe, đảm bảo microphone không bị tắt tiếng</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2 hover:text-red-500 transition-colors">
              <AlertCircle className="h-4 w-4" />
              <span>Vẫn không được? Xem thêm cách khắc phục</span>
            </summary>
            <div className="mt-3 ml-6 space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Kiểm tra cài đặt hệ thống:</strong> Đảm bảo quyền microphone được bật cho trình duyệt trong cài đặt máy tính/điện thoại</p>
              <p>• <strong>Thử chế độ ẩn danh:</strong> Mở trang trong cửa sổ ẩn danh để kiểm tra xung đột extension</p>
              <p>• <strong>Xóa cache:</strong> Xóa cache và cookies của website rồi thử lại</p>
              <p>• <strong>Cập nhật trình duyệt:</strong> Đảm bảo bạn dùng phiên bản mới nhất</p>
              <p>• <strong>HTTPS:</strong> Tính năng microphone chỉ hoạt động trên kết nối bảo mật (HTTPS)</p>
              <p>• <strong>Kiểm tra thiết bị:</strong> Thử microphone với ứng dụng khác để đảm bảo nó hoạt động</p>
              <p>• <strong>Driver:</strong> Cập nhật driver âm thanh của máy tính</p>
            </div>
          </details>

          {/* External Resources */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Tài liệu chính thức từ nhà phát triển:
            </p>
            <div className="flex flex-wrap gap-2">
              {browser.name === 'Chrome' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Chrome Help
                </Button>
              )}
              {browser.name === 'Firefox' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('https://support.mozilla.org/kb/permissions-request-access-camera-microphone-location', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Firefox Support
                </Button>
              )}
              {browser.name === 'Safari' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Safari Guide
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Đóng
          </Button>
          <Button
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
          >
            <Mic className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MicrophonePermissionGuide;
