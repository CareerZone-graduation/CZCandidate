import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom fallback UI for onboarding errors
 */
const OnboardingErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Lỗi trong quá trình hoàn thiện hồ sơ</CardTitle>
              <CardDescription>
                Đã xảy ra lỗi khi hoàn thiện hồ sơ của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Chúng tôi rất xin lỗi vì sự bất tiện này. Tiến trình của bạn đã được lưu và bạn có thể:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Thử lại để tiếp tục hoàn thiện hồ sơ</li>
              <li>Quay về dashboard và hoàn thiện sau</li>
              <li>Liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn</li>
            </ul>
          </div>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-mono text-destructive">
                {error.toString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={resetError}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            <Button
              onClick={handleGoToDashboard}
              className="flex-1"
              variant="outline"
            >
              Về Dashboard
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1"
              variant="ghost"
            >
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            Tiến trình của bạn đã được lưu tự động. Bạn có thể quay lại bất cứ lúc nào.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Error Boundary wrapper for onboarding flow
 */
export const OnboardingErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={OnboardingErrorFallback}
      context="OnboardingFlow"
      errorMessage="Lỗi trong quá trình hoàn thiện hồ sơ"
    >
      {children}
    </ErrorBoundary>
  );
};
