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
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn, Users, TrendingUp, Cpu } from 'lucide-react';

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
    { icon: Users, title: 'Hơn 100,000+ việc làm', desc: 'Cơ hội việc làm từ các công ty hàng đầu' },
    { icon: TrendingUp, title: 'Tỷ lệ thành công 95%', desc: 'Kết nối thành công với nhà tuyển dụng' },
    { icon: Cpu, title: 'Công cụ AI thông minh', desc: 'Gợi ý việc làm phù hợp với bạn' },
  ];

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0px)',
              backgroundSize: '30px 30px'
            }}
          />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>



        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Panel - Info */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20 text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💼</span>
              </div>
              <div>
                <span className="text-3xl font-bold">CareerZone</span>
                <p className="text-sm text-white/60">Nền tảng tìm việc hàng đầu</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Tìm kiếm công việc<br />
              <span className="text-emerald-400">phù hợp với bạn</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-md">
              Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu Việt Nam. 
              Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.
            </p>

            {/* Features */}
            <div className="space-y-5 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
                    <p className="text-white/60">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md">
              <p className="text-white/80 italic mb-4">
                "CareerZone đã giúp tôi tìm được công việc mơ ước chỉ trong 2 tuần. 
                Giao diện dễ sử dụng và nhiều cơ hội việc làm chất lượng."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white">
                  T
                </div>
                <div>
                  <p className="font-semibold text-white">Trần Minh Tuấn</p>
                  <p className="text-sm text-white/60">Software Developer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-8">
                <Link to="/" className="inline-flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💼</span>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    Career<span className="text-emerald-400">Zone</span>
                  </span>
                </Link>
              </div>

              {/* Back Button */}
              <div className="mb-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Quay lại trang chủ</span>
                </Link>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Chào mừng trở lại!
                  </h2>
                  <p className="text-gray-500">
                    Đăng nhập để tiếp tục tìm kiếm công việc
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Địa chỉ email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Mật khẩu
                      </label>
                      <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30"
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
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-400">Hoặc</span>
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
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="center"
                  />
                </div>

                {/* Sign up link */}
                <p className="text-center text-gray-500 mt-6">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Đăng ký miễn phí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
