// Simple router without react-router-dom dependency
import { useState, useEffect } from 'react';
import HomePage from '../components/HomePage';
import Register from '../pages/auth/Register';

// Simple Login component inline để tránh lỗi import
const SimpleLogin = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng nhập
          </h2>
          <p className="text-gray-600">
            Đăng nhập vào tài khoản ứng viên của bạn
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-[#0B8043]">
              CareerZone
            </div>
          </div>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:border-[#0B8043]"
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
                placeholder="Nhập mật khẩu"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:border-[#0B8043]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B8043] text-white py-2 px-4 rounded-md hover:bg-[#0F6B3D] focus:outline-none focus:ring-2 focus:ring-[#0B8043] focus:ring-offset-2 transition duration-300"
            >
              Đăng nhập
            </button>

            <div className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="/register" className="text-[#0B8043] hover:text-[#0F6B3D] font-medium">
                Đăng ký ngay
              </a>
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

const AppRouter = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Simple routing logic
  if (currentPath === '/login') {
    return <SimpleLogin />;
  }
  
  if (currentPath === '/register') {
    return <Register />;
  }
  
  return <HomePage />;
};

export default AppRouter;