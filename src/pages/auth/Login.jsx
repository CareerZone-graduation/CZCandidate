import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { loginSuccess, fetchUser } from '@/redux/authSlice';
import * as authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  // COMMENT: Giữ nguyên toàn bộ logic state và xử lý form.
  const [email, setEmail] = useState('c1@gmail.com');
  const [password, setPassword] = useState('a');
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
        toast.success('Đăng nhập thành công!');
        // Chuyển hướng về trang chủ sau khi đăng nhập thành công
        navigate('/', { replace: true });
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

  return (
    // REPLACED: Layout toàn trang với nền gradient nhẹ nhàng.
    <div className="min-h-screen bg-gradient-to-br from-primary-light/20 via-background to-muted/30 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md">
        {/* REPLACED: Sử dụng <Card> của ShadCN để chứa form, tạo hiệu ứng shadow nổi bật. */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <Link to="/" className="text-3xl font-bold text-foreground mb-6 inline-block">
              Career<span className="text-primary">Zone</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-2">Chào mừng trở lại!</h1>
            <p className="text-muted-foreground text-sm">
              Đăng nhập để tiếp tục hành trình sự nghiệp của bạn.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* REPLACED: Input field với icon từ lucide-react, tăng tính trực quan. */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="pl-10 h-11" />
                </div>
              </div>

              {/* REPLACED: Input field password với nút ẩn/hiện mật khẩu. */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Mật khẩu</label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Quên mật khẩu?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} className="pl-10 pr-10 h-11" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" variant="default" disabled={isLoading} className="w-full h-11 font-semibold transition-all duration-300 bg-gradient-primary hover:opacity-90">
                {isLoading ? (
                  <div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div> Đang xử lý...</div>
                ) : (
                  <div className="flex items-center"><ArrowRight className="mr-2 h-4 w-4" /> Đăng nhập</div>
                )}
              </Button>
            </form>

            {/* REPLACED: Phân tách "hoặc" với <Separator> */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><Separator /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">hoặc tiếp tục với</span></div>
            </div>

            {/* REPLACED: Button đăng nhập với Google. */}
            <Button variant="outline" className="w-full h-11" disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                {/* ... SVG path ... */}
              </svg>
              Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">Đăng ký ngay</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;