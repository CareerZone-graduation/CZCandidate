import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Settings, Bell, ChevronDown, FileText } from "lucide-react";
import { logoutSuccess } from "@/redux/authSlice";
import { useHeaderTheme } from "@/hooks/useHeaderTheme";
import { cn } from "@/lib/utils";
import NotificationDropdown from "./NotificationDropdown";

// COMMENT: Navigation links, giữ nguyên logic
const navLinks = [
  { to: "/jobs", label: "Tìm việc làm" },
  { to: "/companies", label: "Công ty" },
  { to: "/news", label: "Tin tức" },
];

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isHeaderWhite = useHeaderTheme(500); // Khoảng 2/3 màn hình

  // COMMENT: Logic xử lý logout không thay đổi.
  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate("/");
  };
  
  // COMMENT: Logic lấy tên viết tắt cho Avatar không thay đổi.
  const getUserInitials = (currentUser) => {
    if (!currentUser) return "U";
    const name = currentUser.fullname || currentUser.email || "";
    const nameParts = name.split(" ");
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name.substring(0, 2).toUpperCase();
  };

  return (
    // REPLACED: Header với style thay đổi theo scroll position
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300",
      isHeaderWhite 
        ? "bg-transparent border-white/20" 
        : "bg-background/80 border-border"
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* REPLACED: Mobile Menu sử dụng <Sheet> của ShadCN */}
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
          
          {/* REPLACED: Desktop Logo & Navigation với style thay đổi theo scroll */}
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
            <nav className="flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className={cn(
                    "hover:text-primary transition-colors font-semibold text-sm",
                    "text-foreground/80"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* REPLACED: Actions Section với UI components từ ShadCN */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              
              {/* REPLACED: Dropdown Menu cho user profile, chuyên nghiệp và hiện đại hơn */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "flex items-center gap-2 px-2 py-1 h-auto transition-colors",
                      ""
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.fullname || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-colors",
                      "text-muted-foreground"
                    )} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border shadow-lg" align="end">
                  <DropdownMenuLabel>
                    <div className="font-bold">{user?.fullname}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard"><User className="mr-2 h-4 w-4" /><span>Dashboard</span></Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/profile"><Settings className="mr-2 h-4 w-4" /><span>Hồ sơ của tôi</span></Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/applications"><FileText className="mr-2 h-4 w-4" /><span>Việc làm đã ứng tuyển</span></Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button 
                asChild 
                variant="ghost"
                className={cn(
                  "transition-colors",
                )}
              >
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button 
                asChild 
                className={cn(
                  "transition-colors",
 "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;