import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  ChevronDown,
  Bell,
  BellDot,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  Bookmark,
  FileText,
  Coins,
  CreditCard,
  History,
  Plus
} from 'lucide-react';
import { logoutSuccess } from '@/redux/authSlice';
import { logout as logoutService } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { useHeaderTheme } from '@/hooks/useHeaderTheme';
import { cn } from '@/lib/utils';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isHeaderWhite = useHeaderTheme(500); // Khoảng 2/3 màn hình

  // Notification states
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Navigation links
  const navLinks = [
    { to: "/jobs", label: "Tìm việc làm", title: 'Việc làm', href: '/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { to: "/companies", label: "Công ty", title: 'Công ty', href: '/companies', icon: <Building2 className="h-5 w-5" /> },
    { to: "/news", label: "Tin tức", title: 'Cẩm nang', href: '/news', icon: <Newspaper className="h-5 w-5" /> }
  ];

  // Logic lấy tên viết tắt cho Avatar
  const getUserInitials = (currentUser) => {
    if (!currentUser) return "U";
    const name = currentUser.fullname || currentUser.email || "";
    const nameParts = name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name.substring(0, 2).toUpperCase();
  };

  // Format functions
  const formatSalaryRange = (salaryRange) => {
    const salaryMap = {
      'UNDER_10M': 'Dưới 10 triệu',
      '10M_15M': '10-15 triệu',
      '15M_20M': '15-20 triệu',
      '20M_30M': '20-30 triệu',
      '30M_50M': '30-50 triệu',
      'ABOVE_50M': 'Trên 50 triệu',
      'NEGOTIABLE': 'Thỏa thuận'
    };
    return salaryMap[salaryRange] || salaryRange;
  };

  const formatExperience = (experience) => {
    const experienceMap = {
      'INTERNSHIP': 'Thực tập sinh',
      'FRESHER': 'Fresher',
      'JUNIOR_LEVEL': 'Junior',
      'MIDDLE_LEVEL': 'Middle',
      'SENIOR_LEVEL': 'Senior',
      'LEAD_LEVEL': 'Lead',
      'MANAGER_LEVEL': 'Manager'
    };
    return experienceMap[experience] || experience;
  };

  const formatCategory = (category) => {
    const categoryMap = {
      'SOFTWARE_DEVELOPMENT': 'Phát triển phần mềm',
      'WEB_DEVELOPMENT': 'Phát triển web',
      'MOBILE_DEVELOPMENT': 'Phát triển mobile',
      'DATA_SCIENCE': 'Khoa học dữ liệu',
      'DEVOPS': 'DevOps',
      'UI_UX_DESIGN': 'Thiết kế UI/UX',
      'PRODUCT_MANAGEMENT': 'Quản lý sản phẩm',
      'MARKETING': 'Marketing',
      'SALES': 'Kinh doanh',
      'HR': 'Nhân sự'
    };
    return categoryMap[category] || category;
  };

  const formatFrequency = (frequency) => {
    const frequencyMap = {
      'daily': 'Hàng ngày',
      'weekly': 'Hàng tuần',
      'monthly': 'Hàng tháng'
    };
    return frequencyMap[frequency] || frequency;
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Transform job alert to notification format
  const transformJobAlertToNotification = (jobAlert) => {
    const location = jobAlert.location?.province || 'Toàn quốc';
    const salary = formatSalaryRange(jobAlert.salaryRange);
    const experience = formatExperience(jobAlert.experience);
    const category = formatCategory(jobAlert.category);

    return {
      id: jobAlert._id,
      type: 'job_alert',
      title: `Thông báo việc làm: ${jobAlert.keyword}`,
      message: `${category} • ${experience} • ${salary} • ${location} • ${formatFrequency(jobAlert.frequency)}`,
      time: timeAgo(jobAlert.updatedAt || jobAlert.createdAt),
      isRead: false, // API không có field isRead, mặc định là false
      isActive: jobAlert.active,
      icon: <Briefcase className="h-4 w-4 text-emerald-600" />,
      action: () => {
        const searchParams = new URLSearchParams();
        if (jobAlert.keyword) searchParams.set('keyword', jobAlert.keyword);
        if (jobAlert.location?.province) searchParams.set('location', jobAlert.location.province);
        if (jobAlert.salaryRange) searchParams.set('salary', salary);
        if (jobAlert.experience) searchParams.set('experience', experience);
        if (jobAlert.category) searchParams.set('category', category);

        navigate(`/jobs?${searchParams.toString()}`);
      },
      rawData: jobAlert
    };
  };

  // API function to get job alerts
  const fetchJobAlerts = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await apiClient.get('/job-alerts');

      if (response.data.success) {
        const jobAlerts = response.data.data || [];
        const transformedNotifications = jobAlerts.map(transformJobAlertToNotification);

        setNotifications(transformedNotifications);

        // Chỉ tính thông báo active là chưa đọc
        const activeAlerts = transformedNotifications.filter(n => n.isActive);
        setNotificationCount(activeAlerts.length);
        setHasNewNotifications(activeAlerts.length > 0);

        console.log('✅ Job alerts loaded:', transformedNotifications);
      } else {
        console.error('❌ Failed to fetch job alerts:', response.data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching job alerts:', error);
      // Fallback to empty state
      setNotifications([]);
      setNotificationCount(0);
      setHasNewNotifications(false);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Check for new notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchJobAlerts();

      // Kiểm tra thông báo mới mỗi 5 phút
      const interval = setInterval(fetchJobAlerts, 5 * 60 * 1000);

      return () => clearInterval(interval);
    } else {
      // Reset notifications when user logs out
      setNotifications([]);
      setNotificationCount(0);
      setHasNewNotifications(false);
    }
  }, [isAuthenticated]);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both dropdowns
      const isClickInsideDropdown = event.target.closest('[data-dropdown]');
      if (!isClickInsideDropdown) {
        setShowUserDropdown(false);
        setShowNotificationDropdown(false);
      }
    };

    if (showUserDropdown || showNotificationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown, showNotificationDropdown]);

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(logoutSuccess());
      setShowUserDropdown(false);
      navigate('/');
    }
  };

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
    setShowUserDropdown(false);
  };

  const handleUserDropdownClick = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotificationDropdown(false);
  };

  const handleNotificationItemClick = (notification) => {
    // Đánh dấu thông báo đã đọc (local state only)
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Cập nhật số lượng thông báo chưa đọc
    const newUnreadCount = notifications.filter(n => n.id !== notification.id && !n.isRead && n.isActive).length;
    setNotificationCount(newUnreadCount);
    setHasNewNotifications(newUnreadCount > 0);

    // Đóng dropdown và thực hiện action
    setShowNotificationDropdown(false);
    if (notification.action) {
      notification.action();
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setNotificationCount(0);
    setHasNewNotifications(false);
  };

  const viewAllNotifications = () => {
    setShowNotificationDropdown(false);
    navigate('/notifications');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300",
      isHeaderWhite
        ? "bg-transparent border-white/20"
        : "bg-background/80 border-border"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "transition-colors",
                  isHeaderWhite ? "text-white hover:bg-white/10" : ""
                )}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs bg-white">
                <Link to="/" className="flex items-center space-x-2 mb-8">
                  <span className="font-bold text-xl text-foreground">Career<span className="text-primary">Zone</span></span>
                </Link>
                <nav className="grid gap-3 text-lg font-medium">
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <div className="border-t pt-4 mt-4">
                      <Link to="/dashboard" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <User className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <Settings className="h-4 w-4" /> Hồ sơ của tôi
                      </Link>
                      <Link to="/dashboard/applications" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <FileText className="h-4 w-4" /> Việc làm đã ứng tuyển
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-4 px-3 py-2 rounded-lg text-destructive w-full text-left">
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo & Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="flex items-center space-x-2">
              <span className={cn(
                "font-bold text-xl transition-colors",
                "text-foreground"
              )}>
                Career<span className={cn(
                  "transition-colors",
                  "text-primary"
                )}>Zone</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.title} to={link.href} className={cn(
                  "transition-colors duration-300",
                  isHeaderWhite
                    ? "black font-semibold hover:text-primary"
                    : "text-muted-foreground font-semibold hover:text-primary"

                )}>
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative" data-dropdown>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationClick}
                  className="h-10 w-10 rounded-full relative hover:bg-emerald-50 transition-all duration-300"
                  disabled={isLoadingNotifications}
                >
                  {isLoadingNotifications ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                  ) : hasNewNotifications ? (
                    <BellDot className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <Bell className="h-5 w-5 text-muted-foreground hover:text-emerald-600" />
                  )}
                </Button>

                {/* Notification Badge */}
                {notificationCount > 0 && !isLoadingNotifications && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-background"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}

                {/* Notification Dropdown */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-background border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden" data-dropdown>
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          Thông báo việc làm
                          {isLoadingNotifications && (
                            <span className="ml-2 text-xs text-muted-foreground">(Đang tải...)</span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          {notificationCount > 0 && !isLoadingNotifications && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllAsRead}
                              className="text-xs text-emerald-600 hover:text-emerald-700"
                            >
                              Đánh dấu đã đọc
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={viewAllNotifications}
                            className="text-xs text-primary hover:text-primary/80"
                          >
                            Quản lý
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                          {notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationItemClick(notification)}
                              className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-200 ${!notification.isRead && notification.isActive ? 'bg-emerald-50/50 border-l-4 border-l-emerald-500' : ''
                                } ${!notification.isActive ? 'opacity-60' : ''}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {notification.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className={`text-sm ${!notification.isRead && notification.isActive ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                      {notification.title}
                                    </p>
                                    {notification.isActive ? (
                                      <Badge className="text-xs bg-green-100 text-green-700 px-2 py-0.5">
                                        Hoạt động
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5">
                                        Tạm dừng
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                                    {!notification.isRead && notification.isActive && (
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full ml-auto"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground mb-2">Chưa có thông báo việc làm</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Đăng ký thông báo để nhận cơ hội việc làm phù hợp
                          </p>
                          <Button
                            size="sm"
                            onClick={viewAllNotifications}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Đăng ký thông báo
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && !isLoadingNotifications && (
                      <div className="px-4 py-3 border-t border-border bg-muted/30">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={viewAllNotifications}
                          className="w-full text-center text-primary hover:text-primary/80"
                        >
                          Xem thêm {notifications.length - 5} thông báo khác
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" data-dropdown>
                <button
                  onClick={handleUserDropdownClick}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profile?.avatar} alt={user?.fullname} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      Xin chào, {user?.profile?.fullname?.split(' ').slice(-1)[0] || 'bạn'}!
                    </div>
                    <div className="text-sm text-muted-foreground truncate max-w-32">
                      {user?.profile?.fullname || 'Người dùng'}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Professional Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden" data-dropdown>
                    {/* User Profile Header */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                          <AvatarImage src={user?.profile?.avatar} alt={user?.profile?.fullname} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{user?.profile?.fullname || 'Người dùng'}</div>
                          <div className="text-sm text-muted-foreground">{user?.user.email || ''}</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-2">
                      <div className="space-y-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Home className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">Tổng quan</span>
                        </Link>

                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">Hồ sơ của tôi</span>
                        </Link>

                        <Link
                          to="/dashboard/saved-jobs"
                          className="flex items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Bookmark className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">Việc làm đã lưu</span>
                        </Link>

                        <Link
                          to="/dashboard/applications"
                          className="flex items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <FileText className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">Đơn ứng tuyển</span>
                        </Link>

                        <Link
                          to="/notifications"
                          className="flex items-center px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors group"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Bell className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="font-medium">Quản lý thông báo</span>
                          {notificationCount > 0 && (
                            <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                              {notificationCount}
                            </Badge>
                          )}
                        </Link>
                      </div>

                      <Separator className="my-2" />

                      {/* Account Balance - Clickable */}
                      <Link
                        to="/dashboard/billing"
                        className="block px-3 py-2 mb-2"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Coins className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-muted-foreground">Quản lý số dư</span>
                          </div>
                          <div className="text-sm font-semibold text-foreground">
                            {user?.user?.coinBalance?.toLocaleString() || 0} xu
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors group"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild className={cn(
                isHeaderWhite ? "" : ""
              )}>
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                </Link>
              </Button>
              <Button asChild className={cn(
                isHeaderWhite ? "bg-white text-primary hover:bg-white/90" : ""
              )}>
                <Link to="/register">
                  <UserPlus className="mr-2 h-4 w-4" /> Đăng ký
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;