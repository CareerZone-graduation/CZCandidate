import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '@/utils/errorHandling';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and error tracking service
    logError(error, {
      context: this.props.context || 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset
        });
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Đã xảy ra lỗi</CardTitle>
                  <CardDescription>
                    {this.props.errorMessage || 'Ứng dụng gặp sự cố không mong muốn'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTitle className="text-sm font-mono">
                    {this.state.error.toString()}
                  </AlertTitle>
                  {this.state.errorInfo && (
                    <AlertDescription className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-semibold mb-2">
                          Stack Trace
                        </summary>
                        <pre className="whitespace-pre-wrap overflow-auto max-h-40 p-2 bg-muted rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    </AlertDescription>
                  )}
                </Alert>
              )}

              {/* User-friendly message */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Chúng tôi rất xin lỗi vì sự bất tiện này. Vui lòng thử một trong các cách sau:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Tải lại trang để thử lại</li>
                  <li>Xóa cache trình duyệt và thử lại</li>
                  <li>Quay về trang chủ và thử lại</li>
                  {this.state.errorCount > 2 && (
                    <li className="text-destructive font-medium">
                      Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ hỗ trợ
                    </li>
                  )}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </div>

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Lỗi đã xảy ra {this.state.errorCount} lần. Vui lòng liên hệ hỗ trợ nếu vấn đề vẫn tiếp diễn.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Hook to use error boundary programmatically
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};
