import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeDemo = () => {
  const { theme, isDark } = useTheme();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Dark Mode Demo
          </h1>
          <p className="text-muted-foreground">
            Chế độ hiện tại: <Badge variant="outline">{isDark ? 'Dark' : 'Light'}</Badge>
          </p>
          <div className="flex justify-center gap-4">
            <ThemeToggle size="lg" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Primary Colors</CardTitle>
              <CardDescription>Màu chủ đạo của ứng dụng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary" />
                <span className="text-sm">Primary</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary" />
                <span className="text-sm">Secondary</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent" />
                <span className="text-sm">Accent</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Colors</CardTitle>
              <CardDescription>Màu trạng thái</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success" />
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning" />
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-destructive" />
                <span className="text-sm">Destructive</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Các kiểu button</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Kiểu chữ và màu sắc</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">Foreground text</p>
              <p className="text-muted-foreground">Muted foreground text</p>
              <p className="text-primary">Primary text</p>
              <p className="text-secondary-foreground">Secondary text</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Background Variants</CardTitle>
            <CardDescription>Các biến thể nền</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background border">
              <p className="text-sm">Background</p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <p className="text-sm">Card</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm">Muted</p>
            </div>
            <div className="p-4 rounded-lg bg-popover border">
              <p className="text-sm">Popover</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeDemo;
