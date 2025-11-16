import { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * ConnectionStatus component - Displays real-time connection quality
 * Requirements: 3.3, 8.5, 10.4
 */
const ConnectionStatus = ({ quality, metrics, className }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide excellent quality after 5 seconds
    if (quality === 'excellent') {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [quality]);

  if (!isVisible && quality === 'excellent') {
    return null;
  }

  const getStatusConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Tuyệt vời',
          description: 'Kết nối ổn định'
        };
      case 'good':
        return {
          icon: Wifi,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          label: 'Tốt',
          description: 'Kết nối ổn định'
        };
      case 'fair':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          label: 'Trung bình',
          description: 'Chất lượng có thể giảm'
        };
      case 'poor':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Kém',
          description: 'Kết nối không ổn định'
        };
      default:
        return {
          icon: Wifi,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Đang kiểm tra...',
          description: 'Đang đánh giá chất lượng'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const tooltipContent = metrics ? (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">{config.description}</div>
      {metrics.latency && (
        <div>Độ trễ: {metrics.latency}ms</div>
      )}
      {metrics.videoPacketLoss !== undefined && (
        <div>Mất gói video: {metrics.videoPacketLoss}</div>
      )}
      {metrics.audioPacketLoss !== undefined && (
        <div>Mất gói audio: {metrics.audioPacketLoss}</div>
      )}
      {metrics.videoBitrate && (
        <div>Bitrate: {Math.round(metrics.videoBitrate / 1000)}kbps</div>
      )}
      {metrics.fps && (
        <div>FPS: {metrics.fps}</div>
      )}
    </div>
  ) : (
    config.description
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              config.bgColor,
              config.color,
              className
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatus;
