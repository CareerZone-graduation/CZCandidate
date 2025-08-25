import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register as registerService } from '../../services/authService';
const Register = () => {
  const [formData, setFormData] = useState({
    password: '',
    fullname: '',
    email: '',
    role: 'candidate' // default là candidate
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Không cho phép thay đổi role - luôn giữ là candidate
    if (name === 'role') return;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Tự động tạo username từ email (lấy phần trước dấu @)
      const username = formData.email.split('@')[0];
      const payload = {
        ...formData,
        username: username
      };

      await registerService(payload);
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      
      // Reset form sau khi đăng ký thành công
      setFormData({
        password: '',
        fullname: '',
        email: '',
        role: 'candidate'
      });

    } catch (error) {
      const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Register error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-2">
            Đăng ký
          </h2>
          <p className="text-gray-600">
            Tạo tài khoản mới trên CareerZone
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-brand-primary">
              CareerZone
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-black mb-2">
                Họ và tên
              </label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Nguyen Van A"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ring-brand-primary border-brand-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ring-brand-primary border-brand-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ring-brand-primary border-brand-primary disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700">
                Ứng viên
              </div>
              <input
                type="hidden"
                name="role"
                value="candidate"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-brand-primary hover:text-brand-primary-dark font-medium">
                Đăng nhập ngay
              </Link>
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Về trang chủ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
