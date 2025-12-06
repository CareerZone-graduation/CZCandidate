import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    // Sử dụng màu từ theme
    <footer className="bg-gray-950 text-gray-100">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Career<span className="text-primary">Zone</span></h3>
            <p className="text-gray-400">
              Kết nối tài năng với cơ hội. Tìm kiếm công việc mơ ước của bạn và phát triển sự nghiệp cùng chúng tôi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-gray-400 hover:text-primary transition-colors">Việc làm</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-primary transition-colors">Công ty</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">Về chúng tôi</Link></li>
              {isAuthenticated && (
                <li><Link to="/contact" className="text-gray-400 hover:text-primary transition-colors">Liên hệ</Link></li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Pháp lý</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-100">Đăng ký nhận bản tin</h4>
            <p className="text-gray-400 mb-4">Nhận thông tin việc làm mới nhất và các mẹo nghề nghiệp.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email của bạn"
                // Tùy chỉnh input cho phù hợp theme
                className="bg-gray-900 border-gray-800 placeholder:text-gray-500 text-gray-100 focus:border-primary"
              />
              <Button>Đăng ký</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} CareerZone. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors p-2"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors p-2"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors p-2"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors p-2"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
