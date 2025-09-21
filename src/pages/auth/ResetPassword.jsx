import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '@/services/authService';
import { toast } from 'sonner';

// Validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Get token from URL parameters
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    if (!token) {
      setError('Token đặt lại mật khẩu không hợp lệ.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await resetPassword(token, data.password);

      console.log('Reset password response:', response); // Debug log

      if (response.success) {
        setIsSuccess(true);
        reset(); // Clear form and validation errors
        toast.success('Mật khẩu đã được đặt lại thành công!');
      }
    } catch (err) {
      let errorMessage = 'Có lỗi xảy ra khi đặt lại mật khẩu';

      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Dữ liệu không hợp lệ';
      } else if (err.response?.status === 401) {
        errorMessage = 'Token không hợp lệ hoặc đã hết hạn';
      } else if (err.response?.status === 404) {
        errorMessage = 'Không tìm thấy tài khoản';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Đặt lại mật khẩu thành công!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Đăng nhập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Liên kết không hợp lệ
            </CardTitle>
            <CardDescription className="text-gray-600">
              Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vui lòng yêu cầu đặt lại mật khẩu mới từ trang đăng nhập.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full"
              >
                Yêu cầu đặt lại mật khẩu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Đặt lại mật khẩu
          </CardTitle>
          <CardDescription className="text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Đặt lại mật khẩu
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;