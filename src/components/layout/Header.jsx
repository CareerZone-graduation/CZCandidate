import { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
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
  Calendar,
  FileCheck
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      setIsLoggingOut(true);
      await logoutService();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Clear React Query cache để tránh data user cũ bị giữ lại
      queryClient.clear();
      dispatch(clearNotifications());
      dispatch(logoutSuccess());
      setShowUserDropdown(false);
      setIsLoggingOut(false);
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
                  "transition-colors hover:bg-transparent",
                  isHeaderWhite ? "text-white hover:text-white/80" : "text-foreground"
                )}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs p-0 flex flex-col bg-background/95 backdrop-blur-xl border-r">
                <div className="flex flex-col h-full">
                  {/* Mobile Header Logo or User Profile */}
                  <div className="p-4 border-b">
                    {isAuthenticated ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                          <AvatarImage src={user?.profile?.avatar} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{user?.profile?.fullname || 'Người dùng'}</div>
                          <div className="text-xs text-muted-foreground truncate">{user?.user?.email}</div>
                        </div>
                      </div>
                    ) : (
                      <Link to="/" className="flex items-center gap-2" onClick={() => document.querySelector('[data-radix-collection-item]')?.click()}>
                        <span className="font-bold text-xl text-foreground">Career<span className="text-primary">Zone</span></span>
                      </Link>
                    )}
                  </div>

                  {/* Scrollable Nav Items */}
                  <div className="flex-1 overflow-y-auto py-4 px-2">
                    <nav className="grid gap-1">

                      {/* Accordion Menu for Jobs and CV */}
                      <Accordion type="multiple" collapsible className="w-full">
                        {/* Jobs Dropdown */}
                        <AccordionItem value="jobs" className="border-b-0">
                          <AccordionTrigger className="px-3 py-2 text-sm font-semibold hover:no-underline hover:bg-accent rounded-lg">
                            <div className="flex items-center gap-3">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <span>Việc làm</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-4 space-y-1 mt-1">
                              <Link
                                to="/jobs/search"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/50" /> Tìm việc làm
                              </Link>
                              {isAuthenticated && (
                                <>
                                  <Link
                                    to="/dashboard/saved-jobs"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50" /> Việc làm đã lưu
                                  </Link>
                                  <Link
                                    to="/dashboard/applications"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" /> Việc làm đã ứng tuyển
                                  </Link>
                                  <Link
                                    to="/dashboard/settings/job-alerts"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500/50" /> Thông báo việc làm
                                  </Link>
                                  <Link
                                    to="/dashboard/settings/privacy"
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500/50" /> Cài đặt riêng tư
                                  </Link>
                                </>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* CV Dropdown - Auth Only */}
                        {isAuthenticated && (
                          <AccordionItem value="cv" className="border-b-0">
                            <AccordionTrigger className="px-3 py-2 text-sm font-semibold hover:no-underline hover:bg-accent rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-primary" />
                                <span>CV & Hồ sơ</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-4 space-y-1 mt-1">
                                <Link
                                  to="/my-cvs/builder"
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  <FileEdit className="h-3 w-3 text-primary" /> CV Builder
                                </Link>
                                <Link
                                  to="/my-cvs/uploaded"
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                  <Upload className="h-3 w-3 text-primary" /> CV đã tải lên
                                </Link>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>

                      {/* Standard Links */}
                      {navLinks.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <div className="text-primary">{link.icon}</div>
                          {link.label}
                        </Link>
                      ))}

                      {isAuthenticated && (
                        <>
                          <div className="mt-4 px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Cá nhân
                          </div>
                          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Home className="h-4 w-4 text-primary" /> Dashboard
                          </Link>
                          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <User className="h-4 w-4 text-primary" /> Hồ sơ của tôi
                          </Link>
                          <Link to="/dashboard/saved-jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Bookmark className="h-4 w-4 text-primary" /> Việc làm đã lưu
                          </Link>
                          <Link to="/dashboard/applications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <FileText className="h-4 w-4 text-primary" /> Đơn ứng tuyển
                          </Link>
                          <Link to="/interviews" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Video className="h-4 w-4 text-primary" /> Lịch phỏng vấn
                          </Link>
                          <button
                            onClick={() => openChat()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                          >
                            <MessageCircle className="h-4 w-4 text-primary" />
                            Tin nhắn
                            {unreadMessagesCount > 0 && (
                              <Badge variant="destructive" className="ml-auto h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center">
                                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                              </Badge>
                            )}
                          </button>
                          <Link to="/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                            <Bell className="h-4 w-4 text-primary" />
                            Thông báo
                            {notificationCount > 0 && (
                              <Badge variant="destructive" className="ml-auto h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center">
                                {notificationCount}
                              </Badge>
                            )}
                          </Link>
                        </>
                      )}
                    </nav>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t bg-muted/30">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <Link
                          to="/dashboard/billing"
                          className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
                        >
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-900">Số dư</span>
                          </div>
                          <span className="text-sm font-bold text-amber-700">{user?.user?.coinBalance?.toLocaleString() || 0} xu</span>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full justify-start gap-3"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" asChild className="w-full">
                          <Link to="/login">Đăng nhập</Link>
                        </Button>
                        <Button asChild variant="gradient" className="w-full">
                          <Link to="/register">Đăng ký</Link>
                        </Button>
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <ThemeToggle variant="ghost" size="icon" className="w-full flex justify-center" />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Logo & Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <span className={cn(
                  "font-bold text-2xl transition-colors duration-300",
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
                <NavLink
                  key={link.title}
                  to={link.href}
                  className={({ isActive }) => cn(
                    "relative px-4 py-2 rounded-lg transition-colors duration-300 font-semibold group",
                    isActive ? "text-primary" : (isHeaderWhite ? "text-foreground hover:text-primary" : "text-muted-foreground hover:text-primary")
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.title}</span>
                      {/* Bottom border animation */}
                      <div className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-primary to-blue-600 transition-all duration-300",
                        isActive ? "w-3/4" : "w-0 group-hover:w-3/4"
                      )} />
                    </>
                  )}
                </NavLink>
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
                    "hover:shadow-lg hover:shadow-blue-500/20"
                  )}
                >
                  <MessageCircle className={cn(
                    "h-5 w-5 transition-all text-muted-foreground group-hover:text-blue-600",
                    unreadMessagesCount > 0 && "text-blue-600"
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
                    "hover:shadow-lg hover:shadow-primary/10"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300">
                      <AvatarImage
                        src={user?.profile?.avatar}
                        alt={user?.fullname}
                        referrerPolicy="no-referrer"
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
                            <AvatarImage
                              referrerPolicy="no-referrer"
                              src={user?.profile?.avatar}
                              alt={user?.profile?.fullname}
                            />
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
                          "hover:shadow-md hover:scale-105 hover:translate-x-1",
                          isLoggingOut && "opacity-70 pointer-events-none"
                        )}
                        disabled={isLoggingOut}
                      >
                        <div className="mr-3 p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                          {isLoggingOut ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-medium">{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
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
                  "rounded-xl font-semibold transition-all duration-300",
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
                variant="gradient"
                className={cn(
                  "rounded-xl font-semibold transition-all duration-300"
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