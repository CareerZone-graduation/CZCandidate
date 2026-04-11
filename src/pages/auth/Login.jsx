import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { fetchUser, logoutSuccess } from '@/redux/authSlice';
import * as authService from '@/services/authService';
import { initiateGoogleLogin, handleGoogleCallback } from '@/services/googleAuthService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, LogIn, Users, TrendingUp, Cpu } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { saveAccessToken } from '@/utils/token';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedGoogleCallback = useRef(false);

  useEffect(() => {
    dispatch(logoutSuccess());
  }, [dispatch]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (!code && !errorParam) {
      return;
    }

    if (hasProcessedGoogleCallback.current) {
      return;
    }

    hasProcessedGoogleCallback.current = true;

    const processGoogleCallback = async () => {
      setIsGoogleLoading(true);

      if (errorParam) {
        toast.error('Đăng nhập Google thất bại hoặc đã bị hủy.');
        navigate('/login', { replace: true });
        setIsGoogleLoading(false);
        return;
      }

      if (!code || !state) {
        toast.error('Thiếu thông tin xác thực Google.');
        navigate('/login', { replace: true });
        setIsGoogleLoading(false);
        return;
      }

      try {
        const loginData = await handleGoogleCallback(code, state);

        if (!loginData?.data?.accessToken) {
          throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
        }

        if (loginData.data.role && loginData.data.role !== 'candidate') {
          toast.error('Tài khoản này là tài khoản nhà tuyển dụng, không thể đăng nhập vào trang ứng viên.');
          navigate('/login', { replace: true });
          return;
        }

        saveAccessToken(loginData.data.accessToken);
        await dispatch(fetchUser()).unwrap();
        toast.success('Đăng nhập thành công!');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Google callback login error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập Google thất bại.';
        toast.error(errorMessage);
        navigate('/login', { replace: true });
      } finally {
        setIsGoogleLoading(false);
      }
    };

    processGoogleCallback();
  }, [dispatch, navigate, searchParams]);

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
        if (loginData.data.role && loginData.data.role !== 'candidate') {
          toast.info('Trang này chỉ dành cho ứng viên đăng nhập');
          return;
        }

        saveAccessToken(loginData.data.accessToken);
        await dispatch(fetchUser()).unwrap();
        navigate('/');
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

  const handleGoogleLogin = useCallback(() => {
    setIsGoogleLoading(true);
    initiateGoogleLogin('candidate').catch((error) => {
      console.error('Google login init error:', error);
      toast.error('Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.');
      setIsGoogleLoading(false);
    });
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
                disabled={isLoading || isGoogleLoading}
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
                disabled={isLoading || isGoogleLoading}
                className="pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isGoogleLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
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
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            variant="outline"
            className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                <span className="font-semibold text-slate-700">Đang xác thực Google...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-semibold text-slate-700">Đăng nhập với Google</span>
              </div>
            )}
          </Button>

          {/* Sign up link */}
          <p className="text-center text-slate-500 mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              Đăng ký miễn phí
            </Link>
          </p>
        </form>
      </AuthLayout>
  );
};

export default Login;
