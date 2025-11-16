import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';

/**
 * ReconnectionHandler - Displays reconnection status and allows manual retry
 * Requirements: 8.2, 8.3, 10.4
 */
const ReconnectionHandler = ({ 
  isReconnecting, 
  reconnectAttempt, 
  maxAttempts,
  onRetry 
}) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (isReconnecting) {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isReconnecting, reconnectAttempt]);

  if (!isReconnecting) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Alert className="max-w-md bg-background">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">Mất kết nối</h3>
            <AlertDescription>
              Đang thử kết nối lại... (Lần {reconnectAttempt}/{maxAttempts})
            </AlertDescription>
            {countdown > 0 && (
              <div className="text-sm text-muted-foreground">
                Thử lại trong {countdown} giây
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={onRetry} 
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại ngay
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default ReconnectionHandler;
