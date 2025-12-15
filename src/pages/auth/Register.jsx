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
  UserPlus,
  Briefcase,
  Shield,
  Zap,
} from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';

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
          Bắt đầu hành trình <br />
          <span className="text-emerald-600">sự nghiệp</span> của bạn
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
          Tạo tài khoản miễn phí để tiếp cận hàng nghìn cơ hội việc làm hấp dẫn và xây dựng CV chuyên nghiệp.
        </p>
      </div>

      {/* Illustration */}
      <div className="mt-auto w-full flex justify-center">
        <img
          src="https://img.freepik.com/free-vector/business-team-brainstorming-discussing-startup-project_74855-6909.jpg"
          alt="Register Illustration"
          className="w-full h-auto object-contain max-h-[300px] mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-500"
        />
      </div>
    </div>
  );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthLayout
        title="Tạo tài khoản mới"
        subtitle="Đăng ký miễn phí và tìm việc ngay hôm nay"
        leftSection={leftSection}
      >
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5" >⚠️</div>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="w-5 h-5 flex-shrink-0 mt-0.5" >✅</div>
              <p>{success}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="fullname" className="text-sm font-semibold text-slate-700">
              Họ và tên
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullname}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Địa chỉ email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
            <p className="text-xs text-slate-500 pl-1">Mật khẩu phải có ít nhất 6 ký tự</p>
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
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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



          {/* Login link */}
          <p className="text-center text-slate-500 mt-8">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </form>
      </AuthLayout>
    </GoogleOAuthProvider>
  );
};

export default Register;
