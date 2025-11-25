import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { submitContactForm } from '@/services/contactService';

const ContactPage = () => {
  // Get user info from Redux store
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-fill form when user is logged in
  useEffect(() => {
    console.log('🔍 Contact Form - Checking user info...');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user object:', user);
    
    if (isAuthenticated && user) {
      // User data is nested in user.user based on Redux structure
      const userData = user.user || user;
      const profileData = user.profile || {};
      
      console.log('userData:', userData);
      console.log('profileData:', profileData);
      
      // Try multiple possible name fields
      const possibleNames = [
        userData.fullName,
        userData.name,
        profileData.fullName,
        profileData.name,
        userData.candidateProfile?.fullName,
        // Try combining first and last name if available
        (userData.firstName && userData.lastName) ? `${userData.firstName} ${userData.lastName}` : null,
        (profileData.firstName && profileData.lastName) ? `${profileData.firstName} ${profileData.lastName}` : null,
      ];
      
      const selectedName = possibleNames.find(n => n && n.trim()) || '';
      
      console.log('✅ Selected name:', selectedName);
      console.log('✅ Selected email:', userData.email);
      console.log('✅ Selected phone:', userData.phone || userData.phoneNumber || profileData.phone);
      
      setFormData((prev) => ({
        ...prev,
        name: selectedName,
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || profileData.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn chủ đề';
    }
    
    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = 'Tin nhắn phải có ít nhất 10 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setShowError(false);

    try {
      // Add userType to identify as candidate
      const submitData = {
        ...formData,
        userType: 'candidate'
      };
      
      await submitContactForm(submitData);
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-sm text-gray-600 mb-2">Gửi email cho chúng tôi</p>
                  <a
                    href="mailto:support@careerzone.vn"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    support@careerzone.vn
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Điện thoại</h3>
                  <p className="text-sm text-gray-600 mb-2">Gọi cho chúng tôi</p>
                  <a
                    href="tel:+84123456789"
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    +84 123 456 789
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p className="text-sm text-gray-600 mb-2">Ghé thăm văn phòng</p>
                  <p className="text-sm text-gray-700">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                  <p className="text-sm text-gray-600 mb-2">Thời gian hỗ trợ</p>
                  <p className="text-sm text-gray-700">
                    Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                    Thứ 7: 8:00 - 12:00<br />
                    Chủ nhật: Nghỉ
                  </p>
                </div>
              </div>
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
              <button
                className="w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                onClick={() => (window.location.href = '/support')}
              >
                Đi đến trang hỗ trợ
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gửi tin nhắn cho chúng tôi</h2>
              <p className="text-gray-600 mb-6">
                Điền thông tin vào form bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
              </p>

              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Gửi thành công!</h3>
                    <p className="text-sm text-green-700">Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 48 giờ.</p>
                  </div>
                </div>
              )}

              {showError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900">Có lỗi xảy ra!</h3>
                    <p className="text-sm text-red-700">Vui lòng thử lại sau hoặc liên hệ qua hotline.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isAuthenticated && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Thông tin của bạn đã được tự động điền từ tài khoản
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                      disabled={isAuthenticated}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                      disabled={isAuthenticated}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0123456789"
                      disabled={isAuthenticated}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      } ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Chủ đề <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="general">Câu hỏi chung</option>
                      <option value="job_search">Tìm kiếm việc làm</option>
                      <option value="cv_support">Hỗ trợ CV</option>
                      <option value="account">Vấn đề tài khoản</option>
                      <option value="technical">Hỗ trợ kỹ thuật</option>
                      <option value="billing">Thanh toán & Gói dịch vụ</option>
                      <option value="feedback">Góp ý & Phản hồi</option>
                      <option value="other">Khác</option>
                    </select>
                    {errors.category && (
                      <p className="text-xs text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    rows={6}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600">{errors.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Tối thiểu 10 ký tự. Vui lòng mô tả chi tiết vấn đề của bạn.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-8 border border-gray-200">
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
                    Bạn có thể truy cập trang <a href="/support" className="text-primary hover:underline">Hỗ trợ</a> để xem tất cả các yêu cầu và trạng thái xử lý.
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
