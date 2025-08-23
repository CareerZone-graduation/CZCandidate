import { useState } from 'react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigateToLogin = () => {
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navigateToRegister = () => {
    window.history.pushState({}, '', '/register');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header className="bg-black shadow-lg sticky top-0 z-50 w-full border-b border-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              onClick={navigateToHome}
              className="text-2xl font-bold text-white cursor-pointer hover:text-[#0B8043] transition duration-300"
            >
              CareerZone
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-white hover:text-[#0B8043] transition duration-300">
              Trang chủ
            </a>
            <a href="#" className="text-white hover:text-[#0B8043] transition duration-300">
              Tìm việc làm
            </a>
            <a href="#" className="text-white hover:text-[#0B8043] transition duration-300">
              Công ty
            </a>
            <a href="#" className="text-white hover:text-[#0B8043] transition duration-300">
              Cẩm nang
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
              <button className="text-white hover:text-[#0B8043] transition duration-300">
              Trang nhà tuyển dụng
            </button>
            <button 
              onClick={navigateToLogin}
              className="text-white hover:text-[#0B8043] transition duration-300"
            >
              Đăng nhập
            </button>
            <button 
              onClick={navigateToRegister}
              className="bg-[#0B8043] text-white px-6 py-2 rounded-lg hover:bg-[#0F6B3D] transition duration-300 shadow-lg"
            >
              Đăng ký
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-green-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-green-300 hover:text-green-200 transition duration-300">
                Trang chủ
              </a>
              <a href="#" className="text-green-300 hover:text-green-200 transition duration-300">
                Tìm việc làm
              </a>
              <a href="#" className="text-green-300 hover:text-green-200 transition duration-300">
                Công ty
              </a>
              <a href="#" className="text-green-300 hover:text-green-200 transition duration-300">
                Cẩm nang
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <button 
                  onClick={navigateToLogin}
                  className="text-green-300 hover:text-green-200 transition duration-300 text-left"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={navigateToRegister}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Đăng ký
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
