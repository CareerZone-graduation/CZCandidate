import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Briefcase, Lock, Shield, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const sidebarItems = [
  {
    href: '/profile',
    label: 'Hồ sơ cá nhân',
    icon: User,
    description: 'Thông tin cơ bản, kinh nghiệm, học vấn'
  },
  {
    href: '/profile/work-preferences',
    label: 'Điều kiện làm việc',
    icon: Briefcase,
    description: 'Mức lương, địa điểm, ngành nghề mong muốn'
  },
  {
    href: '/profile/privacy',
    label: 'Cài đặt riêng tư',
    icon: Lock,
    description: 'Quản lý quyền riêng tư hồ sơ'
  },
  {
    href: '/profile/security',
    label: 'Bảo mật tài khoản',
    icon: Shield,
    description: 'Đổi mật khẩu và bảo mật'
  }
];

const ProfileLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent opacity-50" />
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-[10%] -left-[10%] w-[40%] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-primary to-primary/80">
                  <h2 className="text-lg font-semibold text-white">Tài khoản của tôi</h2>
                  <p className="text-sm text-white/80 mt-1">Quản lý hồ sơ và cài đặt</p>
                </div>
                <nav className="p-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || 
                      (item.href !== '/profile' && location.pathname.startsWith(item.href));
                    const isExactProfile = item.href === '/profile' && location.pathname === '/profile';
                    const active = isExactProfile || (item.href !== '/profile' && isActive);
                    
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/profile'}
                        className={({ isActive: navIsActive }) => cn(
                          "flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                          (item.href === '/profile' ? navIsActive && location.pathname === '/profile' : navIsActive)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 mt-0.5 flex-shrink-0 transition-colors",
                          active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-medium text-sm",
                            active ? "text-primary-foreground" : ""
                          )}>
                            {item.label}
                          </div>
                          <div className={cn(
                            "text-xs mt-0.5 line-clamp-2",
                            active ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {item.description}
                          </div>
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>
              </Card>
            </div>
          </aside>

          {/* Mobile Navigation - Horizontal Tabs */}
          <div className="lg:hidden col-span-1">
            <Card className="overflow-hidden">
              <ScrollArea className="w-full">
                <div className="flex p-2 gap-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/profile'}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex-shrink-0",
                          (item.href === '/profile' ? isActive && location.pathname === '/profile' : isActive)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
