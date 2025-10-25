import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, FileEdit, Upload, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CVDropdownMenu = ({ isHeaderWhite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const menuItems = [
    {
      to: '/my-cvs/builder',
      label: 'CV Builder',
      icon: <FileEdit className="h-4 w-4" />,
      description: 'Tạo CV với template có sẵn',
    },
    {
      to: '/my-cvs/uploaded',
      label: 'CV đã tải lên',
      icon: <Upload className="h-4 w-4" />,
      description: 'Quản lý CV đã upload',
    },
  ];

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
      <button
        className={cn(
          "relative px-4 py-2 rounded-lg transition-all duration-300 font-semibold group flex items-center gap-1",
          "hover:bg-primary/5 hover:scale-105",
          isHeaderWhite
            ? "text-foreground hover:text-primary"
            : "text-muted-foreground hover:text-primary"
        )}
      >
        <span className="relative z-10">Quản lý CV</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
        {/* Hover effect background */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Bottom border animation */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-blue-600 group-hover:w-3/4 transition-all duration-300" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 pt-2 w-72 z-50",
            "animate-in slide-in-from-top-2 fade-in-0 duration-300"
          )}
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors duration-200",
                    "hover:bg-muted/50",
                    index !== menuItems.length - 1 && "border-b border-border/30"
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

export default CVDropdownMenu;
