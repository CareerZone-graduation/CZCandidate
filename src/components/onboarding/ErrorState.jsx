import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ 
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Thử lại
          </Button>
        )}
      </Alert>
    </div>
  );
};

export const InlineError = ({ message }) => {
  if (!message) return null;
  
  // Clean up technical error messages to be more user-friendly
  let displayMessage = message;
  
  // Replace technical enum errors with friendly messages
  if (message.includes('Invalid enum value') || message.includes('expected one of')) {
    displayMessage = 'Vui lòng chọn một trong các tùy chọn được cung cấp';
  }
  
  // Replace other technical messages
  if (message.toLowerCase().includes('required') && !message.includes('Vui lòng')) {
    displayMessage = 'Trường này là bắt buộc';
  }
  
  if (message.includes('Invalid type') || message.includes('invalid_type')) {
    displayMessage = 'Giá trị không hợp lệ';
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1 animate-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{displayMessage}</span>
    </div>
  );
};
