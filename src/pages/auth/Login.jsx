import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { loginSuccess, fetchUser, logoutSuccess } from '@/redux/authSlice';
import * as authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Eye, EyeOff, Mail, Lock, LogIn, Users, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(logoutSuccess());
  }, [dispatch]);

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
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate, email, password]);

  const handleGoogleLoginSuccess = useCallback(async (credentialResponse) => {
    setIsLoading(true);
    try {
      const loginData = await authService.googleLogin(credentialResponse.credential);
      if (loginData && loginData.data && loginData.data.accessToken) {
        if (loginData.data.role !== 'candidate') {
          toast.error('Tài khoản này là tài khoản nhà tuyển dụng, không thể đăng nhập vào trang ứng viên.');
          return;
        }
        dispatch(loginSuccess({ accessToken: loginData.data.accessToken }));
        await dispatch(fetchUser());
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  const handleGoogleLoginError = useCallback(() => {
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
  }, []);

  const features = [
    { icon: Users, title: 'Hơn 100,000+ việc làm', desc: 'Cơ hội từ các công ty hàng đầu' },
    { icon: TrendingUp, title: 'Tỷ lệ thành công 95%', desc: 'Kết nối ứng viên với doanh nghiệp' },
    { icon: Cpu, title: 'Công nghệ AI Match', desc: 'Gợi ý việc làm chuẩn xác' },
  ];

  const leftSection = (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-slate-800 p-2 rounded-lg">
          <span className="text-white">💼</span>
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          Career <span className="text-emerald-600">Zone</span>
        </span>
      </div>

      {/* Main Copy */}
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
          Tìm kiếm cơ hội <br />
          nghề nghiệp <span className="text-emerald-600">mơ ước</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
          Kết nối với hàng nghìn doanh nghiệp hàng đầu và phát triển sự nghiệp của bạn ngay hôm nay.
        </p>
      </div>

      {/* Illustration */}
      <div className="mt-auto w-full flex justify-center">
        <img
          src="https://img.freepik.com/free-vector/job-interview-concept-illustration_114360-312.jpg"
          alt="Career Illustration"
          className="w-full h-auto object-contain max-h-[300px] mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthLayout
        title="Chào mừng trở lại!"
        subtitle="Đăng nhập để tiếp tục hành trình sự nghiệp"
        leftSection={leftSection}
      >
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Đăng nhập
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              disabled={isLoading}
              theme="outline"
              size="large"
              width="100%"
              text="signin_with"
              shape="rectangular"
              logo_alignment="center"
            />
          </div>

          {/* Sign up link */}
          <p className="text-center text-slate-500 mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </form>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
};

export default Login;
