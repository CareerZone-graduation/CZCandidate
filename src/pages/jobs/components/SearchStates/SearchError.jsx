import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchError component
 * Displays error state when search fails
 */
const SearchError = ({
  error,
  onRetry,
  onGoHome,
  className
}) => {
  /**
   * Get error message from error object
   */
  const getErrorMessage = () => {
    if (!error) return "Đã xảy ra lỗi không xác định";
    
    // Handle different error types
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet của bạn.";
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return "Yêu cầu tìm kiếm đã hết thời gian chờ. Vui lòng thử lại.";
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút.";
    }
    
    // Handle client errors
    if (error.response?.status >= 400) {
      return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại từ khóa tìm kiếm.";
    }
    
    return "Đã xảy ra lỗi khi tìm kiếm việc làm. Vui lòng thử lại.";
  };

  /**
   * Get error type for appropriate styling and actions
   */
  const getErrorType = () => {
    if (!error) return 'unknown';
    
    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return 'network';
    }
    
    if (error.response?.status >= 500) {
      return 'server';
    }
    
    if (error.response?.status >= 400) {
      return 'client';
    }
    
    return 'unknown';
  };

  const errorMessage = getErrorMessage();
  const errorType = getErrorType();

  return (
    <Card className={cn("border-none shadow-none bg-transparent", className)}>
      <CardContent className="py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          {/* Error Title */}
          <h3 className="text-xl font-semibold text-foreground">
            Oops! Có lỗi xảy ra
          </h3>

          {/* Error Message */}
          <p className="text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button
                variant="default"
                onClick={onRetry}
                className="min-w-[120px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            )}
            
            {onGoHome && (
              <Button
                variant="outline"
                onClick={onGoHome}
                className="min-w-[120px]"
              >
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Button>
            )}
          </div>

          {/* Error Details (for development/debugging) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-left text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <summary className="cursor-pointer font-medium mb-2">
                Chi tiết lỗi (Development)
              </summary>
              <pre className="whitespace-pre-wrap overflow-auto">
                {JSON.stringify(
                  {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    code: error.code
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t border-border">
            <p className="font-medium">Nếu lỗi vẫn tiếp tục:</p>
            <ul className="space-y-1 text-left max-w-sm mx-auto">
              {errorType === 'network' && (
                <>
                  <li>• Kiểm tra kết nối internet</li>
                  <li>• Tắt VPN nếu đang sử dụng</li>
                  <li>• Thử tải lại trang</li>
                </>
              )}
              {errorType === 'server' && (
                <>
                  <li>• Chờ một vài phút rồi thử lại</li>
                  <li>• Liên hệ hỗ trợ nếu cần</li>
                </>
              )}
              {errorType === 'client' && (
                <>
                  <li>• Kiểm tra từ khóa tìm kiếm</li>
                  <li>• Thử tìm kiếm đơn giản hơn</li>
                  <li>• Xóa bộ lọc và thử lại</li>
                </>
              )}
              {errorType === 'unknown' && (
                <>
                  <li>• Tải lại trang</li>
                  <li>• Thử với trình duyệt khác</li>
                  <li>• Liên hệ hỗ trợ</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchError;