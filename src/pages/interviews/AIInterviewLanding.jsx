import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Sparkles, Video, Mic, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';

const AIInterviewLanding = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[120px] pointer-events-none" />

            {/* Header */}
            <Header />

            <div className="container mx-auto px-4 pt-4 flex items-center justify-between relative z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/interviews')}
                    className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">Danh sách phỏng vấn</span>
                </Button>

                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hidden sm:flex">
                    Beta Version
                </Badge>
            </div>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 pt-2 pb-8 relative z-10 flex flex-col items-center">
                <motion.div
                    className="max-w-4xl w-full text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-4 py-1.5 rounded-full text-sm font-medium">
                        Phỏng vấn cùng AI
                    </Badge>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                        Nâng Cao Kỹ Năng Phỏng Vấn <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">
                            Cùng Điểm Chạm Thực Tế
                        </span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Lựa chọn phong cách người phỏng vấn ảo phù hợp với bạn để trải nghiệm cảm giác như đang bước vào một cuộc phỏng vấn thật.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Anime Option */}
                    <motion.div variants={itemVariants}>
                        <Card className="group h-full relative overflow-hidden border-2 border-transparent hover:border-pink-500/50 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(236,72,153,0.15)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardContent className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                <div className="mb-6">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20 mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">Anime Interview</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                        Trải nghiệm phỏng vấn thú vị với nhân vật Live2D sinh động. Giọng nói truyền cảm, phản ứng mượt mà.
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Dễ tiếp cận, giảm áp lực tâm lý',
                                            'Nhân vật chuyển động 2D mượt mà',
                                            'Hoạt động nhạy trên máy tính yếu',
                                            'Phù hợp luyện tập tư duy'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-pink-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        onClick={() => navigate('/interviews/ai/anime')}
                                        className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300 rounded-xl font-semibold text-base shadow-sm group-hover:shadow-md"
                                    >
                                        Bắt đầu luyện tập
                                        <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Assistant Option */}
                    <motion.div variants={itemVariants}>
                        <Card className="group h-full relative overflow-hidden border-2 border-transparent hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardContent className="p-6 md:p-8 flex flex-col h-full relative z-10">
                                <div className="mb-6">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 group-hover:scale-110 transition-transform duration-500">
                                        <Video className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">AI Assistant</h3>
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] md:text-xs px-2 py-0.5">
                                            Đòi hỏi máy khỏe
                                        </Badge>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                        Mô phỏng 100% video conference với người thật (Deepfake AI). Luyện tập áp lực trước mắt nhà tuyển dụng.
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Khuôn mặt người thật tạo bằng AI',
                                            'Đồng bộ khẩu hình miệng Real-time',
                                            'Mô phỏng áp lực phòng phỏng vấn',
                                            'Yêu cầu kết nối mạng ổn định'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto">
                                    <Button
                                        onClick={() => navigate('/interviews/ai/assistant')}
                                        className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 rounded-xl font-semibold text-base shadow-sm group-hover:shadow-md"
                                    >
                                        Vào phòng phỏng vấn
                                        <Mic className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default AIInterviewLanding;
