import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, WifiOff, Camera, Mic, Video } from 'lucide-react';
import { getErrorMessage, getTroubleshootingSteps } from '@/utils/interviewErrorHandler';


const ErrorDialog = ({ open, errorCode, onClose, onAction }) => {
  const errorInfo = getErrorMessage(errorCode);
  const troubleshootingSteps = getTroubleshootingSteps(errorCode);

  const getErrorIcon = () => {
    if (errorCode?.includes('MEDIA_PERMISSION') || errorCode?.includes('DEVICE')) {
      return <Camera className="h-10 w-10 text-destructive" />;
    }
    if (errorCode?.includes('CONNECTION') || errorCode?.includes('SOCKET')) {
      return <WifiOff className="h-10 w-10 text-destructive" />;
    }
    if (errorCode?.includes('RECORDING')) {
      return <Video className="h-10 w-10 text-destructive" />;
    }
    return <AlertTriangle className="h-10 w-10 text-destructive" />;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-4">
            {getErrorIcon()}
            <AlertDialogTitle className="text-xl">{errorInfo.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-foreground">
            {errorInfo.message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {troubleshootingSteps.length > 0 && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <h4 className="font-semibold mb-2 text-sm">Hướng dẫn khắc phục:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              {troubleshootingSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <AlertDialogFooter>
          {errorInfo.actionUrl ? (
            <>
              <AlertDialogAction variant="outline" onClick={onClose}>
                Đóng
              </AlertDialogAction>
              <AlertDialogAction asChild>
                <a href={errorInfo.actionUrl} target="_blank" rel="noopener noreferrer">
                  {errorInfo.action}
                </a>
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={onAction || onClose}>
              {errorInfo.action}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
