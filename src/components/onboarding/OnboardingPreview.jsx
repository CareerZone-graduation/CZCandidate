/**
 * OnboardingPreview Component
 * 
 * Component này để preview thiết kế onboarding mới
 * Chỉ dùng cho development/testing
 */

import { useState } from 'react';
import { OnboardingBackground } from './OnboardingBackground';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, X, Check } from 'lucide-react';

const PREVIEW_STEPS = [
    { id: 1, name: 'Thông tin cơ bản' },
    { id: 2, name: 'Kỹ năng & Kinh nghiệm' },
    { id: 3, name: 'Mức lương & Điều kiện' }
];

export const OnboardingPreview = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const progress = (currentStep / PREVIEW_STEPS.length) * 100;
    const currentStepInfo = PREVIEW_STEPS[currentStep - 1];
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === PREVIEW_STEPS.length;

    const handleNext = () => {
        if (currentStep < PREVIEW_STEPS.length) {
            setIsLoading(true);
            setTimeout(() => {
                setCurrentStep(currentStep + 1);
                setIsLoading(false);
            }, 500);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Animated Background */}
            <OnboardingBackground />

            {/* Backdrop - Blurred background */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-2xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">

                {/* Header with progress */}
                <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-border/50">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary">{currentStep}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">
                                        {currentStepInfo.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Bước {currentStep} / {PREVIEW_STEPS.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-full"
                            title="Đóng và bỏ qua"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Progress bar with step indicators */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {PREVIEW_STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex-1 relative">
                                        <div className={`h-2 rounded-full transition-all duration-500 ${step.id < currentStep
                                            ? 'bg-emerald-500'
                                            : step.id === currentStep
                                                ? 'bg-primary'
                                                : 'bg-muted'
                                            }`}>
                                            {step.id === currentStep && (
                                                <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                    {index < PREVIEW_STEPS.length - 1 && (
                                        <div className="w-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            {PREVIEW_STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`flex-1 text-center text-xs font-medium transition-colors duration-300 ${step.id === currentStep
                                        ? 'text-primary'
                                        : step.id < currentStep
                                            ? 'text-emerald-600'
                                            : 'text-muted-foreground'
                                        }`}
                                >
                                    {step.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    <div className="animate-in slide-in-from-right-5 duration-300">
                        {/* Preview Content */}
                        <div className="space-y-6">
                            <div className="p-6 bg-muted/50 rounded-lg border border-border">
                                <h3 className="text-lg font-semibold mb-2">
                                    Preview: {currentStepInfo.name}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Đây là preview của giao diện onboarding mới với modal trung tâm và backdrop làm mờ.
                                </p>

                                {/* Sample Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Trường mẫu 1
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập thông tin..."
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Trường mẫu 2
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập thông tin..."
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Modal trung tâm</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Giao diện modal chuyên nghiệp, không chiếm toàn màn hình
                                    </p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Backdrop làm mờ</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Background được làm mờ với hiệu ứng blur
                                    </p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Animations mượt mà</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Chuyển động và hiệu ứng được tối ưu
                                    </p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-primary" />
                                        <h4 className="font-semibold">Responsive</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Hoạt động tốt trên mọi thiết bị
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer navigation */}
                <div className="flex-shrink-0 px-8 py-6 border-t border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left: Back button */}
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading || isFirstStep}
                            className="min-w-[120px]"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Quay lại
                        </Button>

                        {/* Right: Skip and Continue buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Bỏ qua bước này
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={isLoading || isLastStep}
                                className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </span>
                                ) : isLastStep ? (
                                    'Hoàn thành'
                                ) : (
                                    'Tiếp tục'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
        </div>
    );
};
