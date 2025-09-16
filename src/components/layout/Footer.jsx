import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Career<span className="text-green-400">Zone</span></h3>
            <p className="text-gray-300">
              Kết nối tài năng với cơ hội. Tìm kiếm công việc mơ ước của bạn và phát triển sự nghiệp cùng chúng tôi.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-gray-300 hover:text-green-400 transition-colors">Việc làm</Link></li>
              <li><Link to="/companies" className="text-gray-300 hover:text-green-400 transition-colors">Công ty</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-green-400 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-green-400 transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Pháp lý</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-300 hover:text-green-400 transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-green-400 transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Đăng ký nhận bản tin</h4>
            <p className="text-gray-300 mb-4">Nhận thông tin việc làm mới nhất và các mẹo nghề nghiệp.</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Email của bạn" 
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-400"
              />
              <Button className="bg-green-600 hover:bg-green-700 text-white">Đăng ký</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-600 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} CareerZone. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors p-2"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors p-2"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors p-2"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="text-gray-400 hover:text-green-400 transition-colors p-2"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
