import { useState } from 'react';

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

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký
          </h2>
          <p className="text-gray-600">
            Tạo tài khoản mới trên CareerZone
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-[#0B8043]">
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
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:border-[#0B8043] disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:border-[#0B8043] disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:border-[#0B8043] disabled:bg-gray-100"
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
              className="w-full bg-[#0B8043] text-white py-2 px-4 rounded-md hover:bg-[#0F6B3D] focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/login');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="text-[#0B8043] hover:text-[#0F6B3D] font-medium"
              >
                Đăng nhập ngay
              </button>
            </div>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Về trang chủ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
