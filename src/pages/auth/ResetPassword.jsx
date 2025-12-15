import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { resetPassword } from '@/services/authService';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/AuthLayout';

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

    const leftSection = (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-2 mb-8">
                <div className="bg-slate-800 p-2 rounded-lg">
                    <span className="text-white">💼</span>
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    Career <span className="text-emerald-600">Zone</span>
                </span>
            </div>

            <div className="space-y-4 mb-8">
                <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
                    Thiết lập <span className="text-emerald-600">mật khẩu mới</span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
                    Để bảo mật tài khoản, vui lòng đặt mật khẩu mới có độ mạnh cao (bao gồm chữ hoa, chữ thường và số).
                </p>
            </div>

            <div className="mt-auto w-full flex justify-center">
                <img
                    src="https://img.freepik.com/free-vector/reset-password-concept-illustration_114360-7966.jpg"
                    alt="Reset Password Illustration"
                    className="w-full h-auto object-contain max-h-[300px] mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-500"
                />
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <AuthLayout
                title="Đổi mật khẩu thành công!"
                subtitle="Mật khẩu của bạn đã được cập nhật."
                leftSection={leftSection}
            >
                <div className="w-full space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>

                    <p className="text-slate-600">
                        Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới của mình.
                    </p>

                    <Button
                        onClick={() => navigate('/login')}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Đăng nhập ngay
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    if (!token) {
        return (
            <AuthLayout
                title="Liên kết không hợp lệ"
                subtitle="Token không hợp lệ hoặc đã hết hạn"
                leftSection={leftSection}
            >
                <div className="w-full space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        Vui lòng yêu cầu đặt lại mật khẩu mới.
                    </div>

                    <Button
                        onClick={() => navigate('/forgot-password')}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                    >
                        Yêu cầu đặt lại mật khẩu
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Đặt lại mật khẩu"
            subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
            leftSection={leftSection}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            className={`pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-600 ml-1">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            className={`pl-12 pr-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-sm text-red-600 ml-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-[0.98]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang cập nhật...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            Đặt lại mật khẩu
                        </div>
                    )}
                </Button>

                <div className="text-center pt-2">
                    <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
                        Quay lại đăng nhập
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
