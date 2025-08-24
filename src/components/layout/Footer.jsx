import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12">
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
            <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-gray-400 hover:text-primary">Việc làm</Link></li>
              <li><Link to="/companies" className="text-gray-400 hover:text-primary">Công ty</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-primary">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-primary">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-primary">Điều khoản dịch vụ</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-primary">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Đăng ký nhận bản tin</h4>
            <p className="text-gray-400 mb-4">Nhận thông tin việc làm mới nhất và các mẹo nghề nghiệp.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Email của bạn" className="bg-gray-800 border-gray-700" />
              <Button>Đăng ký</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} CareerZone. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary"><Facebook /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Twitter /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Linkedin /></a>
            <a href="#" className="text-gray-400 hover:text-primary"><Instagram /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
