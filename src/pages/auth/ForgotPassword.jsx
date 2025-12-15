import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { forgotPassword } from '@/services/authService';
import { toast } from 'sonner';
import AuthLayout from '@/components/layout/AuthLayout';

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
    const [turnstileToken, setTurnstileToken] = useState("");
    const [turnstileKey, setTurnstileKey] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data) => {
        if (!turnstileToken) {
            setError("Vui lòng hoàn thành xác thực bạn không phải là robot.");
            return;
        }
        try {
            setIsLoading(true);
            setError('');

            const response = await forgotPassword(data.email, turnstileToken);

            if (response.success) {
                if (response.data?.resetToken) {
                    setResetToken(response.data.resetToken);
                    setShowDevMode(true);
                    toast.success('Token đặt lại mật khẩu đã được tạo!');
                } else {
                    setIsSuccess(true);
                    toast.success('Email đặt lại mật khẩu đã được gửi thành công!');
                }
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi gửi email';
            setError(errorMessage);
            setTurnstileToken("");
            setTurnstileKey(prev => prev + 1);
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
                    Quên <span className="text-emerald-600">mật khẩu?</span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed max-w-sm">
                    Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản của mình chỉ với vài bước đơn giản.
                </p>
            </div>

            <div className="mt-auto w-full flex justify-center">
                <img
                    src="https://img.freepik.com/free-vector/forgot-password-concept-illustration_114360-1123.jpg"
                    alt="Forgot Password Illustration"
                    className="w-full h-auto object-contain max-h-[300px] mix-blend-multiply opacity-90 hover:scale-105 transition-transform duration-500"
                />
            </div>
        </div>
    );

    if (showDevMode && resetToken) {
        const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;
        return (
            <AuthLayout title="Chế độ phát triển" subtitle="Token đặt lại mật khẩu" leftSection={leftSection}>
                <div className="w-full space-y-4">
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Token:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-3 bg-white rounded-lg text-sm font-mono text-emerald-600 border border-slate-200 break-all">
                                    {resetToken}
                                </code>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(resetToken);
                                        toast.success("Đã sao chép token!");
                                    }}
                                    className="shrink-0 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
                                >
                                    Sao chép
                                </Button>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Liên kết:</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(resetLink);
                                        toast.success("Đã sao chép liên kết!");
                                    }}
                                    className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm"
                                >
                                    Sao chép liên kết đầy đủ
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                            Đặt lại mật khẩu ngay
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDevMode(false);
                                setResetToken('');
                            }}
                            className="w-full h-12 border-slate-200"
                        >
                            Quay lại
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    if (isSuccess) {
        return (
            <AuthLayout
                title="Check email của bạn"
                subtitle={`Chúng tôi đã gửi link đến ${getValues('email')}`}
                leftSection={leftSection}
            >
                <div className="w-full space-y-6 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>

                    <p className="text-slate-600">
                        Vui lòng kiểm tra hộp thư đến (và cả thư mục spam). Liên kết xác thực sẽ hết hạn sau 15 phút.
                    </p>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                        >
                            Quay lại đăng nhập
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsSuccess(false);
                                setTurnstileKey(p => p + 1);
                            }}
                            className="w-full text-slate-500 hover:text-emerald-600"
                        >
                            Gửi lại email
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Khôi phục mật khẩu"
            subtitle="Nhập email để nhận liên kết đặt lại mật khẩu"
            leftSection={leftSection}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register('email')}
                            className={`pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-emerald-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600 ml-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Turnstile Captcha */}
                <div className="flex justify-center w-full py-2">
                    <Turnstile
                        key={turnstileKey}
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAAA1VN-QDsgdhQAiP"}
                        onSuccess={(token) => setTurnstileToken(token)}
                        options={{
                            theme: 'light',
                            size: 'normal',
                        }}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isLoading || !turnstileToken}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang gửi...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4" />
                            Gửi liên kết
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

export default ForgotPassword;
