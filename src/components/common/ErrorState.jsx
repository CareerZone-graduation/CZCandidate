import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * @param {{
 *  message?: string;
 *  onRetry: () => void;
 * }} props
 */
export const ErrorState = ({ message = 'Đã có lỗi xảy ra. Vui lòng thử lại.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-destructive mb-2">Oops! Có lỗi xảy ra</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      <Button onClick={onRetry} variant="outline">
        Thử lại
      </Button>
    </div>
  );
};