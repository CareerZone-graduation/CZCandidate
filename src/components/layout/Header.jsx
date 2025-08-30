import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Briefcase, Building2, Newspaper, UserPlus, LogIn, Home } from 'lucide-react';
import { logoutSuccess } from '../../redux/authSlice';
import { logout as logoutService } from '../../services/authService';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { title: 'Tổng quan', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
        { title: 'Việc làm', href: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
        { title: 'Công ty', href: '/companies', icon: <Building2 className="h-5 w-5" /> },
        { title: 'Cẩm nang', href: '/blog', icon: <Newspaper className="h-5 w-5" /> },
      ]
    : [
        { title: 'Việc làm', href: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
        { title: 'Công ty', href: '/companies', icon: <Building2 className="h-5 w-5" /> },
        { title: 'Cẩm nang', href: '/blog', icon: <Newspaper className="h-5 w-5" /> },
      ];

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      // Even if API call fails, we log out the user from the client
      console.error("Logout failed", error);
    } finally {
      dispatch(logoutSuccess());
      navigate('/');
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-foreground">
            Career<span className="text-primary">Zone</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.title} to={link.href} className="text-muted-foreground hover:text-primary transition-colors duration-300">
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Xin chào, {profile?.fullname}</span>
                <Button variant="ghost" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/register">
                    <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-6 pt-8">
                <Link to="/" className="text-2xl font-bold" onClick={() => setIsMenuOpen(false)}>
                  Career<span className="text-primary">Zone</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.title}
                      to={link.href}
                      className="flex items-center space-x-3 text-lg text-gray-700 dark:text-gray-200 hover:text-primary transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      <span>{link.title}</span>
                    </Link>
                  ))}
                </nav>
                <div className="border-t pt-6 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">
                        Xin chào, {profile?.fullname}
                      </div>
                      <Button className="w-full" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                        Đăng xuất
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                          <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;