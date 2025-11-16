import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, AlertCircle } from 'lucide-react';
import { checkBrowserCompatibility, ERROR_CODES, getErrorMessage } from '@/utils/interviewErrorHandler';
import ErrorDialog from './ErrorDialog';

/**
 * PermissionGuard component - Checks and requests media permissions
 * Requirements: 6.1, 6.2, 10.1, 10.2, 10.3
 */
const PermissionGuard = ({ children, onPermissionsGranted }) => {
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setChecking(true);
    setError(null);

    try {
      // Check browser compatibility
      const compatibility = checkBrowserCompatibility();
      if (!compatibility.isCompatible) {
        setError(ERROR_CODES.WEBRTC_NOT_SUPPORTED);
        setChecking(false);
        return;
      }

      // Request permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Stop all tracks immediately after permission check
      stream.getTracks().forEach(track => track.stop());

      setPermissionsGranted(true);
      setPermissionsChecked(true);
      onPermissionsGranted?.();
    } catch (err) {
      console.error('[PermissionGuard] Permission error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(ERROR_CODES.MEDIA_PERMISSION_DENIED);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError(ERROR_CODES.MEDIA_DEVICE_NOT_FOUND);
      } else {
        setError(ERROR_CODES.PEER_CONNECTION_FAILED);
      }
      
      setPermissionsChecked(true);
    } finally {
      setChecking(false);
    }
  };

  if (!permissionsChecked || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Kiểm tra quyền truy cập</CardTitle>
            <CardDescription>
              Đang kiểm tra quyền truy cập camera và microphone...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!permissionsGranted && error) {
    const errorInfo = getErrorMessage(error);
    
    return (
      <>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <CardTitle>{errorInfo.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {errorInfo.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">Camera</div>
                  <div className="text-sm text-muted-foreground">Cần để hiển thị video</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Mic className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">Microphone</div>
                  <div className="text-sm text-muted-foreground">Cần để truyền âm thanh</div>
                </div>
              </div>
              <Button onClick={checkPermissions} className="w-full">
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <ErrorDialog
          open={!!error}
          errorCode={error}
          onClose={() => setError(null)}
          onAction={checkPermissions}
        />
      </>
    );
  }

  return permissionsGranted ? children : null;
};

export default PermissionGuard;
