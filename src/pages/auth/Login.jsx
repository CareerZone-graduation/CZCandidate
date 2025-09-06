import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { loginSuccess, fetchUser } from '../../redux/authSlice';
import * as authService from '../../services/authService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      const loginData = await authService.login({ email, password });
      if (loginData && loginData.data.accessToken) {
        dispatch(loginSuccess({ accessToken: loginData.data.accessToken }));
        await dispatch(fetchUser());
        // Thay đổi từ /dashboard thành /jobs
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ.');
      }
    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, dispatch, navigate]);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-card backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <div className="mx-auto mb-6">
              <Link to="/" className="text-3xl font-bold text-foreground">
                <span className="text-primary">🏢</span> Career<span className="text-primary">Zone</span>
              </Link>
            </div>
            
            {/* Tiêu đề */}
            <h1 className="text-2xl font-bold text-foreground mb-2">Đăng nhập</h1>
            <p className="text-muted-foreground text-sm">
              Nhập thông tin của bạn để truy cập tài khoản
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="r1@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Mật khẩu
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10 h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Nút đăng nhập */}
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </div>
                )}
              </Button>
            </form>

            {/* Đăng nhập với Google */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">hoặc</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 border-border hover:bg-muted/50 transition-all duration-300"
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập với Google
            </Button>

            {/* Link đăng ký */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Nút quay về trang chủ */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleBackHome}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Quay về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;