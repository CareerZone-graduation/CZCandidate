import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Menu, 
  Briefcase, 
  Building2, 
  Newspaper, 
  UserPlus, 
  LogIn, 
  Home,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { logoutSuccess } from '../../redux/authSlice';
import { logout as logoutService } from '../../services/authService';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
      setShowUserDropdown(false);
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
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={user?.fullname} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user?.fullname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium">Xin chào!</div>
                    <div className="text-sm text-muted-foreground truncate max-w-32">
                      {user?.fullname || 'Người dùng'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-20">
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user?.avatar} alt={user?.fullname} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.fullname?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user?.fullname || 'Người dùng'}</div>
                              <div className="text-sm text-muted-foreground">{user?.email || ''}</div>
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <User className="mr-3 h-4 w-4" />
                          Hồ sơ của tôi
                        </Link>
                        
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Home className="mr-3 h-4 w-4" />
                          Tổng quan
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full pt-6">
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
                  <div className="border-t pt-6 space-y-2 mt-6">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user?.avatar} alt={user?.fullname} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user?.fullname?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user?.fullname || 'Người dùng'}</div>
                            <div className="text-sm text-muted-foreground">{user?.email || ''}</div>
                          </div>
                        </div>
                        
                        <Button className="w-full justify-start" variant="ghost" asChild>
                          <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Hồ sơ của tôi
                          </Link>
                        </Button>
                        
                        <Button className="w-full justify-start" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
                          <LogOut className="mr-2 h-4 w-4" />
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
      </div>
    </header>
  );
};

export default Header;