import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/contexts/ChatContext';
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
  Plus,
  FileEdit,
  Upload,
  Shield,
  MessageCircle,
  Video,
  Calendar
} from 'lucide-react';
import { logoutSuccess } from '@/redux/authSlice';
import { clearNotifications } from '@/redux/notificationSlice';
import { logout as logoutService } from '@/services/authService';
import apiClient from '@/services/apiClient';
import { useHeaderTheme } from '@/hooks/useHeaderTheme';
import { cn } from '@/lib/utils';
import JobsDropdownMenu from './JobsDropdownMenu';
import CVDropdownMenu from './CVDropdownMenu';
import ThemeToggle from '@/components/common/ThemeToggle';
import socketService from '@/services/socketService';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount: notificationCount } = useSelector((state) => state.notifications);
  const isHeaderWhite = useHeaderTheme(500); // Khoảng 2/3 màn hình
  const { openChat } = useChat();

  // User dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Messages states
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Navigation links (excluding Jobs and CV - handled by dropdown menus)
  // Contact link only shows when authenticated
  const navLinks = [
    { to: "/companies", label: "Công ty", title: 'Công ty', href: '/companies', icon: <Building2 className="h-5 w-5" /> },
    { to: "/news", label: "Tin tức", title: 'Cẩm nang', href: '/news', icon: <Newspaper className="h-5 w-5" /> },
    ...(isAuthenticated ? [{ to: "/contact", label: "Liên hệ hỗ trợ", title: 'Liên hệ hỗ trợ', href: '/contact', icon: <Newspaper className="h-5 w-5" /> }] : [])
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

  // Fetch unread messages count
  const fetchUnreadMessagesCount = async () => {
    try {
      const response = await apiClient.get('/chat/conversations');
      if (response.data.success) {
        const conversations = response.data.data || [];
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadMessagesCount(0);
    }
  };

  // Check for messages and setup Socket.io for real-time updates
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadMessagesCount();

      // Connect to Socket.io for real-time message updates
      socketService.connect().then(() => {
        console.log('[Header] Socket.io connected for real-time updates');
      }).catch((error) => {
        console.error('[Header] Failed to connect to Socket.io:', error);
      });

      // Subscribe to new message events to update unread count
      const handleNewMessage = (message) => {
        console.log('[Header] New message received via Socket.io:', message);
        // Increment unread count if message is not from current user
        if (message.senderId !== user?.user?._id) {
          setUnreadMessagesCount(prev => prev + 1);
        }
      };

      socketService.onNewMessage(handleNewMessage);

      // Kiểm tra tin nhắn mới mỗi 5 phút (fallback)
      const interval = setInterval(() => {
        fetchUnreadMessagesCount();
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(interval);
        // Clean up Socket.io event listener
        socketService.off('onNewMessage', handleNewMessage);
      };
    } else {
      // Reset messages when user logs out
      setUnreadMessagesCount(0);
      
      // Disconnect Socket.io when user logs out
      socketService.disconnect();
    }
  }, [isAuthenticated, user]);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown
      const isClickInsideDropdown = event.target.closest('[data-dropdown]');
      if (!isClickInsideDropdown) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Clear React Query cache để tránh data user cũ bị giữ lại
      queryClient.clear();
      dispatch(clearNotifications());
      dispatch(logoutSuccess());
      setShowUserDropdown(false);
      navigate('/');
    }
  };

  const handleUserDropdownClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-500 shadow-sm",
      isHeaderWhite
        ? "bg-white/10 border-white/20 shadow-white/10"
        : "bg-background/50 border-border shadow-md"
    )}>
      <div className="container flex h-16 items-center justify-between relative">
        {/* Gradient accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
              <SheetContent side="left" className="w-full max-w-xs bg-white dark:bg-card">
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl text-foreground">Career<span className="text-primary">Zone</span></span>
                  </Link>
                  <ThemeToggle variant="ghost" size="icon" />
                </div>
                <nav className="grid gap-3 text-lg font-medium">
                  {/* Jobs Section */}
                  <Link to="/jobs/search" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                    <Briefcase className="h-4 w-4" /> Tìm việc làm
                  </Link>
                  {isAuthenticated && (
                    <>
                      <button 
                        onClick={() => openChat()} 
                        className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4 w-full text-left"
                      >
                        <MessageCircle className="h-4 w-4" /> Tin nhắn
                        {unreadMessagesCount > 0 && (
                          <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs">
                            {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                          </Badge>
                        )}
                      </button>
                      <Link to="/interviews" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <Video className="h-4 w-4" /> Lịch phỏng vấn
                      </Link>
                      <Link to="/dashboard/saved-jobs" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <Bookmark className="h-4 w-4" /> Việc làm đã lưu
                      </Link>
                      <Link to="/dashboard/applications" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <FileText className="h-4 w-4" /> Việc làm đã ứng tuyển
                      </Link>
                      <Link to="/dashboard/settings/job-alerts" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <Bell className="h-4 w-4" /> Quản lý thông báo
                      </Link>
                      <Link to="/dashboard/settings/privacy" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <Shield className="h-4 w-4" /> Cài đặt riêng tư
                      </Link>
                    </>
                  )}

                  {/* Other Links */}
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                      {link.icon} {link.label}
                    </Link>
                  ))}

                  {/* CV Management Section */}
                  {isAuthenticated && (
                    <>
                      <Link to="/my-cvs/builder" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <FileEdit className="h-4 w-4" /> CV Builder
                      </Link>
                      <Link to="/my-cvs/uploaded" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent ml-4">
                        <Upload className="h-4 w-4" /> CV đã tải lên
                      </Link>
                    </>
                  )}

                  {isAuthenticated && (
                    <div className="border-t pt-4 mt-4">
                      <Link to="/dashboard" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <User className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-4 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                        <Settings className="h-4 w-4" /> Hồ sơ của tôi
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
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <span className={cn(
                  "font-bold text-2xl transition-all duration-300 group-hover:scale-105",
                  "bg-gradient-to-r from-foreground to-foreground bg-clip-text"
                )}>
                  Career<span className={cn(
                    "transition-all duration-300",
                    "bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent",
                    "group-hover:from-blue-600 group-hover:via-primary group-hover:to-primary"
                  )}>Zone</span>
                </span>
                {/* Animated underline effect */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 group-hover:w-full transition-all duration-500" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* Jobs Dropdown Menu */}
              <JobsDropdownMenu isHeaderWhite={isHeaderWhite} />

              {/* Other Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  to={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg transition-all duration-300 font-semibold group",
                    "hover:bg-primary/5 hover:scale-105",
                    isHeaderWhite
                      ? "text-foreground hover:text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <span className="relative z-10">{link.title}</span>
                  {/* Hover effect background */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Bottom border animation */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 group-hover:w-3/4 transition-all duration-300" />
                </Link>
              ))}

              {/* CV Dropdown Menu - Only show when authenticated */}
              {isAuthenticated && <CVDropdownMenu isHeaderWhite={isHeaderWhite} />}
            </nav>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Messages Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openChat()}
                  className={cn(
                    "h-10 w-10 rounded-full relative transition-all duration-300 group",
                    "hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50",
                    "hover:shadow-lg hover:shadow-blue-500/20 hover:scale-110"
                  )}
                >
                  <MessageCircle className={cn(
                    "h-5 w-5 transition-all",
                    unreadMessagesCount > 0 
                      ? "text-blue-600 group-hover:scale-110" 
                      : "text-muted-foreground group-hover:text-blue-600 group-hover:scale-110"
                  )} />
                </Button>

                {/* Unread Badge */}
                {unreadMessagesCount > 0 && (
                  <Badge
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0",
                      "bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold",
                      "rounded-full border-2 border-background shadow-lg"
                    )}
                  >
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </Badge>
                )}
              </div>

              {/* Notification Dropdown Component */}
              <NotificationDropdown />

              {/* User Dropdown */}
              <div className="relative" data-dropdown>
                <button
                  onClick={handleUserDropdownClick}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 group",
                    "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                    "hover:shadow-lg hover:shadow-primary/10 hover:scale-105"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                      <AvatarImage src={user?.profile?.avatar} alt={user?.fullname}
                      referrerPolicy="no-referrer"
  crossOrigin="anonymous"
   />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-600/20 text-primary text-sm font-semibold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-lg" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      Xin chào, {user?.profile?.fullname?.split(' ').slice(-1)[0] || 'bạn'}!
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-32 group-hover:text-primary transition-colors">
                      {user?.profile?.fullname || 'Người dùng'}
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-all duration-300",
                    "group-hover:text-primary",
                    showUserDropdown && "rotate-180"
                  )} />
                </button>

                {/* Professional Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    className={cn(
                      "absolute right-0 top-full mt-2 w-80",
                      // Glass morphism effect
                      "bg-background/95 backdrop-blur-xl",
                      // Enhanced border with gradient
                      "border-2 border-border/50",
                      "rounded-2xl shadow-2xl z-50 overflow-hidden",
                      // Enhanced shadow for depth
                      "shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)]",
                      "dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)]",
                      // Animation
                      "animate-in slide-in-from-top-2 fade-in-0 duration-300",
                      // Ring effect
                      "ring-1 ring-black/5 dark:ring-white/10"
                    )}
                    data-dropdown
                  >
                    {/* User Profile Header */}
                    <div
                      className="relative px-6 py-4 border-b border-border overflow-hidden"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)'
                      }}
                    >
                      {/* Animated background elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                      <div className="flex items-center space-x-4 relative z-10">
                        <div className="relative">
                          <Avatar className="w-14 h-14 ring-2 ring-primary/30 shadow-lg">
                            <AvatarImage referrerPolicy="no-referrer"
  crossOrigin="anonymous" src={user?.profile?.avatar} alt={user?.profile?.fullname} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-blue-600/30 text-primary font-bold text-lg">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online status with glow */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-lg">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-foreground text-base">{user?.profile?.fullname || 'Người dùng'}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{user?.user.email || ''}</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="p-3">
                      <div className="space-y-1">
                        <Link
                          to="/dashboard"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Home className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">Tổng quan</span>
                        </Link>

                        <Link
                          to="/profile"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">Hồ sơ của tôi</span>
                        </Link>

                        <Link
                          to="/dashboard/saved-jobs"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                            <Bookmark className="h-4 w-4 text-amber-600" />
                          </div>
                          <span className="font-medium">Việc làm đã lưu</span>
                        </Link>

                        <Link
                          to="/dashboard/applications"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                            <FileText className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="font-medium">Đơn ứng tuyển</span>
                        </Link>

                        <Link
                          to="/interviews"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                            <Video className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium">Lịch phỏng vấn</span>
                        </Link>

                        <Link
                          to="/notifications"
                          className={cn(
                            "flex items-center px-3 py-2.5 text-sm text-foreground rounded-xl transition-all duration-300 group",
                            "hover:bg-gradient-to-r hover:from-muted hover:to-muted/50",
                            "hover:shadow-md hover:scale-105 hover:translate-x-1"
                          )}
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <div className="mr-3 p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                            <Bell className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-medium">Quản lý thông báo</span>
                          {notificationCount > 0 && (
                            <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs animate-pulse">
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
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer group",
                          "bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100",
                          "border border-amber-200/50 hover:border-amber-300",
                          "hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105"
                        )}>
                          <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                              <Coins className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium text-amber-900">Quản lý số dư</span>
                          </div>
                          <div className="text-sm font-bold text-amber-900 bg-yellow-100 px-2 py-1 rounded-lg">
                            {user?.user?.coinBalance?.toLocaleString() || 0} xu
                          </div>
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className={cn(
                          "flex items-center w-full px-3 py-2.5 text-sm text-destructive rounded-xl transition-all duration-300 group",
                          "hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5",
                          "hover:shadow-md hover:scale-105 hover:translate-x-1"
                        )}
                      >
                        <div className="mr-3 p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Theme Toggle for non-authenticated users */}
              <ThemeToggle />

              <Button
                variant="ghost"
                asChild
                className={cn(
                  "rounded-xl font-semibold transition-all duration-300 hover:scale-105",
                  "hover:bg-muted hover:shadow-md",
                  isHeaderWhite ? "text-foreground" : ""
                )}
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Link>
              </Button>
              <Button
                asChild
                className={cn(
                  "rounded-xl font-semibold transition-all duration-300 hover:scale-105",
                  "bg-gradient-to-r from-primary via-primary to-blue-600",
                  "hover:from-blue-600 hover:via-primary hover:to-primary",
                  "hover:shadow-lg hover:shadow-primary/30",
                  isHeaderWhite ? "text-white" : ""
                )}
              >
                <Link to="/register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký</span>
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