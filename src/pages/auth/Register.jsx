import { useState, useEffect } from "react";
import { Turnstile } from '@marsidev/react-turnstile';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { register as registerService } from "@/services/authService";
import { loginSuccess } from '@/redux/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "candidate"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Bypass captcha for Cypress testing
  useEffect(() => {
    if (window.Cypress) {
      setTurnstileToken("mock-valid-token-for-testing");
    }
  }, []);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullname || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    /* if (!turnstileToken) {
      setError("Vui lòng hoàn thành xác thực bạn không phải là robot.");
      return;
    } */

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const resp = await registerService({ ...formData, turnstileToken });
      console.log(resp);

      // Check if registration returns access token (auto-login)
      if (resp.accessToken) {
        // Auto-login after registration
        dispatch(loginSuccess({ accessToken: resp.accessToken }));

        setSuccess("Đăng ký thành công! Đang chuyển đến hoàn thiện hồ sơ...");
        toast.success("Đăng ký thành công!");

        // Reset form
        setFormData({
          fullname: "",
          email: "",
          password: "",
          role: "candidate"
        });

        // Redirect to onboarding for new users
        setTimeout(() => {
          navigate('/onboarding');
        }, 1500);
      } else {
        // Email verification required
        setSuccess(resp.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");

        // Reset form
        setFormData({
          fullname: "",
          email: "",
          password: "",
          role: "candidate"
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (err) {
      console.log(err);
      const errorMessage = err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(errorMessage);
      setTurnstileToken("");
      setTurnstileKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Multi-layer animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950"></div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/30 via-teal-400/20 to-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-purple-400/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Medium gradient orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-bl from-cyan-400/20 via-sky-400/15 to-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-tr from-green-400/20 via-emerald-400/15 to-teal-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>

        {/* Small accent orbs */}
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-teal-400/25 to-cyan-400/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-l from-indigo-400/25 to-blue-400/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-32 left-32 w-4 h-4 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-48 right-48 w-3 h-3 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 rounded-full animate-bounce" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-48 left-24 w-5 h-5 bg-gradient-to-r from-teal-500/40 to-emerald-500/40 rounded-full animate-bounce" style={{ animationDelay: '2.1s' }}></div>
        <div className="absolute bottom-32 right-32 w-2 h-2 bg-gradient-to-r from-sky-500/40 to-cyan-500/40 rounded-full animate-bounce" style={{ animationDelay: '3.3s' }}></div>

        {/* Additional small particles */}
        <div className="absolute top-64 left-64 w-1 h-1 bg-teal-500/50 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute top-80 right-80 w-1 h-1 bg-cyan-500/50 rounded-full animate-ping" style={{ animationDelay: '1.6s' }}></div>
        <div className="absolute bottom-64 left-80 w-1 h-1 bg-emerald-500/50 rounded-full animate-ping" style={{ animationDelay: '2.4s' }}></div>
        <div className="absolute bottom-80 right-64 w-1 h-1 bg-blue-500/50 rounded-full animate-ping" style={{ animationDelay: '3.2s' }}></div>
      </div>

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10 dark:from-black/20 dark:to-black/10"></div>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl glass transition-all duration-500 hover:shadow-3xl hover:bg-card/98">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mb-10">
              <Link to="/" className="inline-flex items-center gap-3 text-3xl font-bold text-foreground hover:opacity-80 transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:rotate-3">
                  <span className="text-white text-2xl">💼</span>
                </div>
                Career<span className="text-gradient-primary">Zone</span>
              </Link>
            </div>

            <div className="space-y-4" style={{ animationDelay: '0.4s' }}>
              <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Tạo tài khoản mới 🚀
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Bắt đầu hành trình sự nghiệp của bạn
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Thông báo lỗi */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Thông báo thành công */}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-sm font-medium text-foreground">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullname"
                    name="fullname"
                    type="text"
                    placeholder="r1@gmail.com"
                    value={formData.fullname}
                    onChange={handleChange}

                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="r1@gmail.com"
                    value={formData.email}
                    onChange={handleChange}

                    disabled={isLoading}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={formData.password}
                    onChange={handleChange}

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

              {/* Turnstile Captcha */}
              <div className="flex justify-center w-full my-4">
                <Turnstile
                  key={turnstileKey}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAA1VN-QDsgdhQAiP"}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{
                    theme: 'auto',
                    size: 'normal',
                  }}
                />
              </div>

              {/* Nút đăng ký */}
              <Button
                type="submit"
                disabled={isLoading || !turnstileToken}
                className={`w-full h-11 bg-gradient-primary hover:opacity-90 text-white font-medium transition-all duration-300 ${(isLoading || !turnstileToken) ? 'bg-gray-400 cursor-not-allowed opacity-70' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Tạo tài khoản
                  </div>
                )}
              </Button>
            </form>



            {/* Link đăng nhập */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Đăng nhập ngay
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

export default Register;