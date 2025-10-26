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
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

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

  // Xử lý đăng nhập Google
  const handleGoogleLoginSuccess = useCallback(async (credentialResponse) => {
    setIsLoading(true);
    try {
      console.log("🔑 Google credential received:", credentialResponse.credential);

      // Gửi token về backend với role candidate
      const loginData = await authService.googleLogin(credentialResponse.credential);
      console.log("✅ Google login response:", loginData);

      if (loginData && loginData.data && loginData.data.accessToken) {
        // Lưu token vào Redux store giống như đăng nhập thường
        dispatch(loginSuccess({ accessToken: loginData.data.accessToken }));

        // Lấy thông tin user và lưu vào Redux
        await dispatch(fetchUser());

        console.log("✅ Google login completed, user data saved to Redux");

      } else {
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ.');
      }
    } catch (error) {
      console.error("❌ Error during Google login:", error);
      const errorMessage = error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  const handleGoogleLoginError = useCallback((error) => {
    console.error("Google login failure:", error);
    toast.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/25 via-teal-400/20 to-blue-400/25 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-bl from-purple-400/20 via-pink-400/15 to-red-400/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-tr from-yellow-400/20 via-orange-400/15 to-red-400/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-l from-violet-400/25 to-purple-400/25 rounded-full blur-xl"></div>
        </div>
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10"></div>
        
        <div className="w-full max-w-md relative z-10">
          <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
            <CardHeader className="text-center pb-8 pt-10">
              <div className="mb-10">
                <Link to="/" className="inline-flex items-center gap-3 text-3xl font-bold text-foreground hover:opacity-80">
                  <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl">💼</span>
                  </div>                
  Career<span className="text-gradient-primary">Zone</span>
                </Link>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-foreground">
                  Chào mừng trở lại! 👋
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Đăng nhập để tiếp tục hành trình sự nghiệp của bạn
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      disabled={isLoading} 
                      className="pl-10 h-10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">Mật khẩu</label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
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
                      className="pl-10 pr-10 h-10" 
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" 
                      onClick={() => setShowPassword(!showPassword)} 
                      disabled={isLoading}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      }
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-10 bg-gradient-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div> 
                      Đang xử lý...
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">hoặc</span>
                </div>
              </div>

              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                disabled={isLoading}
                width="100%"
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Chưa có tài khoản? </span>
                <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                  Đăng ký ngay
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;