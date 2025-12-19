import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Briefcase, Bookmark, FileCheck, Bell, Shield, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const JobsDropdownMenu = ({ isHeaderWhite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const timeoutRef = useRef(null);

  const menuItems = [
    {
      to: '/jobs/search',
      label: 'Tìm việc làm',
      icon: <Briefcase className="h-4 w-4" />,
      description: 'Khám phá cơ hội nghề nghiệp',
      public: true,
    },
    {
      to: '/dashboard/saved-jobs',
      label: 'Việc làm đã lưu',
      icon: <Bookmark className="h-4 w-4" />,
      description: 'Danh sách công việc yêu thích',
      public: false,
    },
    {
      to: '/dashboard/applications',
      label: 'Việc làm đã ứng tuyển',
      icon: <FileCheck className="h-4 w-4" />,
      description: 'Theo dõi đơn ứng tuyển',
      public: false,
    },
    {
      to: '/dashboard/settings/job-alerts',
      label: 'Quản lý thông báo việc làm',
      icon: <Bell className="h-4 w-4" />,
      description: 'Cài đặt thông báo việc làm',
      public: false,
    },
    {
      to: '/dashboard/settings/privacy',
      label: 'Cài đặt riêng tư',
      icon: <Shield className="h-4 w-4" />,
      description: 'Quản lý quyền riêng tư hồ sơ',
      public: false,
    },
  ];

  const visibleItems = isAuthenticated
    ? menuItems
    : menuItems.filter(item => item.public);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // 150ms delay before closing
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <Link
        to="/jobs/search"
        className={cn(
          "relative px-4 py-2 rounded-lg transition-colors duration-300 font-semibold group flex items-center gap-1",
          isHeaderWhite
            ? "text-foreground hover:text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <span className="relative z-10">Việc làm</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
        {/* Bottom border animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 group-hover:w-3/4 transition-all duration-300" />
      </Link>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 pt-2 w-72 z-50",
            "animate-in fade-in-0 duration-300"
          )}
        >
          <div className={cn(
            "bg-background/95 backdrop-blur-xl",
            "border-2 border-border/50 rounded-2xl overflow-hidden",
            // Enhanced shadow for depth
            "shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)]",
            "dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)]",
            // Ring effect
            "ring-1 ring-black/5 dark:ring-white/10"
          )}>
            <div className="py-2">
              {visibleItems.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors duration-200",
                    "hover:bg-muted/50",
                    index !== visibleItems.length - 1 && "border-b border-border/30"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5 text-primary">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {item.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsDropdownMenu;
