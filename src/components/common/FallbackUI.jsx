import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  ServerCrash, 
  Clock,
  ShieldAlert,
  FileQuestion
} from 'lucide-react';

/**
 * Generic Error Fallback
 */
export const ErrorFallback = ({ 
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  showRetry = true,
  icon: Icon = AlertCircle,
  variant = 'default'
}) => {
  return (
    <div className="flex items-center justify-center min-h-[300px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              variant === 'destructive' 
                ? 'bg-destructive/10' 
                : 'bg-muted'
            }`}>
              <Icon className={`w-6 h-6 ${
                variant === 'destructive' 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
              }`} />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>{message}</CardDescription>
          {showRetry && onRetry && (
            <Button onClick={onRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Network Error Fallback
 */
export const NetworkErrorFallback = ({ onRetry }) => {
  return (
    <ErrorFallback
      title="Không có kết nối mạng"
      message="Vui lòng kiểm tra kết nối internet và thử lại."
      onRetry={onRetry}
      icon={WifiOff}
      variant="destructive"
    />
  );
};

/**
 * Server Error Fallback
 */
export const ServerErrorFallback = ({ onRetry }) => {
  return (
    <ErrorFallback
      title="Lỗi máy chủ"
      message="Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút."
      onRetry={onRetry}
      icon={ServerCrash}
      variant="destructive"
    />
  );
};

/**
 * Timeout Error Fallback
 */
export const TimeoutErrorFallback = ({ onRetry }) => {
  return (
    <ErrorFallback
      title="Yêu cầu quá thời gian chờ"
      message="Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại."
      onRetry={onRetry}
      icon={Clock}
      variant="destructive"
    />
  );
};

/**
 * Unauthorized Error Fallback
 */
export const UnauthorizedFallback = ({ onLogin }) => {
  return (
    <ErrorFallback
      title="Phiên đăng nhập hết hạn"
      message="Vui lòng đăng nhập lại để tiếp tục."
      onRetry={onLogin}
      icon={ShieldAlert}
      variant="destructive"
    />
  );
};

/**
 * Not Found Fallback
 */
export const NotFoundFallback = ({ message, onGoBack }) => {
  return (
    <ErrorFallback
      title="Không tìm thấy"
      message={message || 'Nội dung bạn tìm kiếm không tồn tại.'}
      onRetry={onGoBack}
      icon={FileQuestion}
      showRetry={!!onGoBack}
    />
  );
};

/**
 * Loading Fallback with Skeleton
 */
export const LoadingFallback = ({ 
  title = 'Đang tải...',
  rows = 3 
}) => {
  return (
    <div className="space-y-4 p-4">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Inline Error Alert
 */
export const InlineErrorAlert = ({ 
  message, 
  onRetry,
  onDismiss,
  variant = 'destructive'
}) => {
  if (!message) return null;

  return (
    <Alert variant={variant} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Lỗi</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">{message}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex-shrink-0"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Thử lại
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="flex-shrink-0"
            >
              Đóng
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Empty State Fallback
 */
export const EmptyStateFallback = ({ 
  title = 'Không có dữ liệu',
  message = 'Chưa có dữ liệu để hiển thị.',
  action,
  actionLabel = 'Thêm mới',
  icon: Icon = FileQuestion
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      {action && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Retry Button Component
 */
export const RetryButton = ({ 
  onRetry, 
  isRetrying = false,
  label = 'Thử lại',
  variant = 'outline',
  size = 'default'
}) => {
  return (
    <Button
      onClick={onRetry}
      disabled={isRetrying}
      variant={variant}
      size={size}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Đang thử lại...' : label}
    </Button>
  );
};
