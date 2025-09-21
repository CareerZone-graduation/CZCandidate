import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { forgotPassword } from '@/services/authService';
import { toast } from 'sonner';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showDevMode, setShowDevMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await forgotPassword(data.email);

      if (response.success) {
        // Check if response contains a reset token (for development/testing)
        if (response.data?.resetToken) {
          setResetToken(response.data.resetToken);
          setShowDevMode(true);
          toast.success('Token đặt lại mật khẩu đã được tạo!');
        } else {
          // For production or when email is sent, show success message
          setIsSuccess(true);
          toast.success('Email đặt lại mật khẩu đã được gửi thành công!');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi gửi email';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (showDevMode && resetToken) {
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Token đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-gray-600">
              Chế độ phát triển - Sử dụng token dưới đây để đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Token:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded text-sm font-mono text-blue-700 border">
                    {resetToken}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(resetToken)}
                    className="shrink-0"
                  >
                    Sao chép
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Liên kết đặt lại:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded text-xs font-mono text-blue-700 border break-all">
                    {resetLink}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(resetLink)}
                    className="shrink-0"
                  >
                    Sao chép
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Đặt lại mật khẩu ngay
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDevMode(false);
                  setResetToken('');
                }}
                className="w-full"
              >
                Quay lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Email đã được gửi!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {getValues('email')}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Vui lòng kiểm tra hộp thư đến và thư rác. Liên kết sẽ hết hạn sau 15 phút.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Quay lại đăng nhập
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="w-full"
              >
                Gửi lại email
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
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-gray-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            <br />
            <span className="text-xs text-amber-600 mt-1 block">
              💡 Lưu ý: Nếu backend trả về token trực tiếp, chế độ phát triển sẽ hiển thị token để test
            </span>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
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
                  Đang gửi...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi liên kết đặt lại
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;