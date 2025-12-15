import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, leftSection, showBackButton = true }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden min-h-[600px] animate-in fade-in zoom-in-95 duration-500">

                {/* Left Side: Branding and Illustration */}
                <div className="hidden md:flex md:w-1/2 bg-slate-50 p-12 flex-col items-start relative overflow-hidden">
                    {/* Background Pattern for Left Side */}
                    <div className="absolute inset-0 opacity-40"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.15) 1px, transparent 0px)',
                            backgroundSize: '24px 24px'
                        }}
                    />

                    <div className="relative z-10 w-full h-full flex flex-col">
                        {leftSection}

                        {/* Footer/Copyright on Left (now part of the section) */}
                        <div className="mt-auto pt-8 text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} CareerZone. All rights reserved.
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white flex flex-col justify-center relative">
                    {showBackButton && (
                        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium hidden sm:inline">Trang chủ</span>
                        </Link>
                    )}

                    <div className="w-full max-w-md mx-auto space-y-6">
                        {/* Mobile Logo (visible only on small screens) */}
                        <div className="md:hidden flex items-center gap-2 mb-6">
                            <div className="bg-emerald-600 p-2 rounded-lg">
                                <span className="text-xl">💼</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">
                                Career <span className="text-emerald-600">Zone</span>
                            </span>
                        </div>

                        <div className="text-left space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                {title}
                            </h2>
                            {subtitle && <p className="text-slate-500">{subtitle}</p>}
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
