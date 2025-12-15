import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { register as registerService } from '@/services/authService';
import { loginSuccess } from '@/redux/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import * as authService from '@/services/authService';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  UserPlus,
  Briefcase,
  Shield,
  Zap,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: 'candidate',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'role') return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!turnstileToken) {
      setError('Vui lòng hoàn thành xác thực bạn không phải là robot.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const resp = await registerService({ ...formData, turnstileToken });

      if (resp.accessToken) {
        dispatch(loginSuccess({ accessToken: resp.accessToken }));
        setSuccess('Đăng ký thành công! Đang chuyển đến hoàn thiện hồ sơ...');
        toast.success('Đăng ký thành công!');
        setFormData({ fullname: '', email: '', password: '', role: 'candidate' });
        setTimeout(() => navigate('/onboarding'), 1500);
      } else {
        setSuccess(resp.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        setFormData({ fullname: '', email: '', password: '', role: 'candidate' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      setTurnstileToken('');
      setTurnstileKey((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const loginData = await authService.googleLogin(credentialResponse.credential);
      if (loginData && loginData.data && loginData.data.accessToken) {
        if (loginData.data.role !== 'candidate') {
          toast.error('Tài khoản này là tài khoản nhà tuyển dụng, không thể đăng nhập vào trang ứng viên.');
          return;
        }
        dispatch(loginSuccess({ accessToken: loginData.data.accessToken }));
        toast.success('Đăng ký thành công!');
        navigate('/onboarding');
      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký Google thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error('Đăng ký Google thất bại. Vui lòng thử lại.');
  };

  const features = [
    { icon: Briefcase, title: 'Hàng nghìn việc làm', desc: 'Cơ hội từ các công ty hàng đầu Việt Nam' },
    { icon: Shield, title: 'Bảo mật thông tin', desc: 'Dữ liệu của bạn được bảo vệ an toàn' },
    { icon: Zap, title: 'Ứng tuyển nhanh chóng', desc: 'Chỉ cần vài click để ứng tuyển' },
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
              backgroundSize: '30px 30px',
            }}
          />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
              Bắt đầu hành trình<br />
              <span className="text-emerald-400">sự nghiệp của bạn</span>
            </h1>
            <p className="text-lg text-white/70 mb-10 max-w-md">
              Tạo tài khoản miễn phí để tiếp cận hàng nghìn cơ hội việc làm hấp dẫn
              và xây dựng CV chuyên nghiệp.
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">100K+</p>
                <p className="text-sm text-white/60">Việc làm</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">50K+</p>
                <p className="text-sm text-white/60">Ứng viên</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">5K+</p>
                <p className="text-sm text-white/60">Công ty</p>
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
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Tạo tài khoản mới
                  </h2>
                  <p className="text-gray-500">Đăng ký để bắt đầu tìm việc ngay</p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-4">
                    {success}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullname" className="text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullname"
                        name="fullname"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Địa chỉ email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
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
                    <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>

                  {/* Turnstile Captcha */}
                  <div className="flex justify-center py-2">
                    <Turnstile
                      key={turnstileKey}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAA1VN-QDsgdhQAiP'}
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'light', size: 'normal' }}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !turnstileToken}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang tạo tài khoản...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Tạo tài khoản
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
                    text="signup_with"
                    shape="rectangular"
                    logo_alignment="center"
                  />
                </div>

                {/* Login link */}
                <p className="text-center text-gray-500 mt-6">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Đăng nhập ngay
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

export default Register;
