import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isActiveState } from "@soniox/speech-to-text-web";

/**
 * VoiceSearchButton component with professional animated effects
 * @param {object} props
 * @param {string} props.state - Trạng thái từ useSonioxSearch.
 * @param {boolean} props.isSupported - Trình duyệt có hỗ trợ không.
 * @param {Function} props.onClick - Click handler.
 * @param {string} props.className - Additional CSS classes.
 * @param {string} props.size - Button size ('sm', 'default', 'lg').
 */
const VoiceSearchButton = ({
  state = "Idle",
  isSupported = true,
  onClick,
  className,
  size = 'default',
  disabled = false
}) => {
  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        className={cn("h-10 w-10 rounded-full opacity-50 cursor-not-allowed", className)}
        title="Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói"
      >
        <MicOff className="h-5 w-5 text-muted-foreground" />
      </Button>
    );
  }
  
  const isListening = isActiveState(state);
  const isProcessing = state === "FinishingProcessing";

  const sizeClasses = {
    sm: 'h-9 w-9',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Multi-layer backdrop blur overlay when listening */}
      {isListening && (
        <>
          {/* Outer blur ring - Largest */}
          <div className="absolute inset-0 -m-20 rounded-full bg-red-500/3 backdrop-blur-[4px] animate-fade-in pointer-events-none" />
          
          {/* Middle blur ring */}
          <div className="absolute inset-0 -m-12 rounded-full bg-red-500/5 backdrop-blur-[6px] animate-fade-in pointer-events-none" 
               style={{ animationDelay: '0.1s' }} />
          
          {/* Inner blur ring - Strongest */}
          <div className="absolute inset-0 -m-6 rounded-full bg-red-500/8 backdrop-blur-[8px] animate-fade-in pointer-events-none" 
               style={{ animationDelay: '0.2s' }} />
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled || isProcessing}
        className={cn(
          sizeClasses[size],
          "relative rounded-full transition-all duration-500 ease-out overflow-hidden",
          "shadow-lg hover:shadow-xl",
          isListening
            ? "bg-gradient-to-br from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 text-white scale-110 animate-breathe"
            : isProcessing
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            : "bg-gradient-to-br from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 text-muted-foreground hover:text-foreground hover:scale-105",
          "group border-2",
          isListening ? "border-white/30" : "border-transparent",
          className
        )}
        title={
          isListening 
            ? "Đang nghe... (Nhấn để dừng)" 
            : isProcessing
            ? "Đang xử lý..."
            : "Tìm kiếm bằng giọng nói"
        }
      >
        {/* Shimmer effect when listening */}
        {isListening && (
          <span className="absolute inset-0 w-full h-full">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                  style={{ width: '200%', height: '200%' }} />
          </span>
        )}
        {/* Sound wave rings when listening - Breathing effect */}
        {isListening && (
          <>
            {/* Wave 1 - Fastest, largest expansion */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-white/40 animate-sound-wave-1"
              style={{ animationDelay: '0s' }}
            />
            {/* Wave 2 - Medium speed */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-white/35 animate-sound-wave-2"
              style={{ animationDelay: '0.2s' }}
            />
            {/* Wave 3 - Slower */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-white/30 animate-sound-wave-3"
              style={{ animationDelay: '0.4s' }}
            />
            {/* Wave 4 - Even slower */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-pink-200/25 animate-sound-wave-2"
              style={{ animationDelay: '0.6s' }}
            />
            {/* Wave 5 - Slowest, subtle */}
            <span 
              className="absolute inset-0 rounded-full border-2 border-red-200/20 animate-sound-wave-3"
              style={{ animationDelay: '0.8s' }}
            />
            
            {/* ========== RADIANCE GLOW EFFECTS (Multi-layer) ========== */}
            
            {/* Layer 1: Mega outer radiance - Largest, most diffused */}
            <span className="absolute -inset-16 rounded-full bg-gradient-radial from-red-400/20 via-pink-500/15 to-transparent blur-[60px] animate-radiance-pulse" />
            
            {/* Layer 2: Outer radiance */}
            <span className="absolute -inset-12 rounded-full bg-gradient-radial from-red-500/25 via-pink-600/20 to-transparent blur-[40px] animate-radiance-pulse" 
                  style={{ animationDelay: '0.3s' }} />
            
            {/* Layer 3: Middle radiance */}
            <span className="absolute -inset-8 rounded-full bg-gradient-radial from-red-400/30 via-pink-500/25 to-transparent blur-3xl animate-radiance-pulse" 
                  style={{ animationDelay: '0.6s' }} />
            
            {/* Layer 4: Inner radiance */}
            <span className="absolute -inset-4 rounded-full bg-gradient-radial from-red-500/35 via-pink-600/30 to-transparent blur-2xl animate-radiance-pulse" 
                  style={{ animationDelay: '0.9s' }} />
            
            {/* Layer 5: Core glow - Strongest, closest to button */}
            <span className="absolute inset-0 rounded-full bg-gradient-radial from-red-400/40 via-pink-500/35 to-transparent blur-xl animate-radiance-pulse" 
                  style={{ animationDelay: '1.2s' }} />
            
            {/* ========== ROTATING RADIANCE BEAMS ========== */}
            
            {/* Beam 1 */}
            <span className="absolute inset-0 rounded-full animate-rotate-slow">
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-white/40 via-red-400/30 to-transparent blur-sm" />
            </span>
            
            {/* Beam 2 */}
            <span className="absolute inset-0 rounded-full animate-rotate-slow" style={{ animationDelay: '1s' }}>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-white/30 via-pink-400/25 to-transparent blur-sm rotate-90" />
            </span>
            
            {/* ========== SPARKLE PARTICLES ========== */}
            
            {/* Sparkle 1 - Top */}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/80 animate-sparkle-1 shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
            
            {/* Sparkle 2 - Right */}
            <span className="absolute top-1/2 -right-6 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-300/80 animate-sparkle-2 shadow-[0_0_10px_2px_rgba(251,207,232,0.8)]" />
            
            {/* Sparkle 3 - Bottom */}
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-300/80 animate-sparkle-3 shadow-[0_0_10px_2px_rgba(252,165,165,0.8)]" />
            
            {/* Sparkle 4 - Left */}
            <span className="absolute top-1/2 -left-6 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80 animate-sparkle-4 shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]" />
            
            {/* ========== ENERGY RING ========== */}
            <span className="absolute -inset-2 rounded-full border-2 border-white/20 animate-energy-ring" />
          </>
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <span className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        )}

        {/* Microphone Icon */}
        <span className="relative z-10 flex items-center justify-center">
          <Mic 
            className={cn(
              iconSizes[size],
              "transition-all duration-300",
              isListening && "animate-voice-pulse",
              isProcessing && "animate-spin",
              "group-hover:scale-110"
            )} 
          />
        </span>

        {/* Hover glow effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 blur-sm" />
      </Button>

      {/* Status indicator dot */}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white shadow-lg" />
        </span>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes sound-wave-1 {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.8);
            opacity: 0.3;
          }
        }

        @keyframes sound-wave-2 {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.25;
          }
        }

        @keyframes sound-wave-3 {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.2;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes voice-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.9;
          }
        }

        @keyframes radiance-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sparkle-1 {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -10px) scale(1.5);
          }
        }

        @keyframes sparkle-2 {
          0%, 100% {
            opacity: 0;
            transform: translate(0, -50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(10px, -50%) scale(1.5);
          }
        }

        @keyframes sparkle-3 {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, 10px) scale(1.5);
          }
        }

        @keyframes sparkle-4 {
          0%, 100% {
            opacity: 0;
            transform: translate(0, -50%) scale(0);
          }
          50% {
            opacity: 1;
            transform: translate(-10px, -50%) scale(1.5);
          }
        }

        @keyframes energy-ring {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        .animate-sound-wave-1 {
          animation: sound-wave-1 2s ease-in-out infinite;
        }

        .animate-sound-wave-2 {
          animation: sound-wave-2 2.2s ease-in-out infinite;
        }

        .animate-sound-wave-3 {
          animation: sound-wave-3 2.4s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-voice-pulse {
          animation: voice-pulse 1s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }

        .animate-radiance-pulse {
          animation: radiance-pulse 2.5s ease-in-out infinite;
        }

        .animate-rotate-slow {
          animation: rotate-slow 8s linear infinite;
        }

        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }

        .animate-sparkle-2 {
          animation: sparkle-2 2s ease-in-out infinite 0.5s;
        }

        .animate-sparkle-3 {
          animation: sparkle-3 2s ease-in-out infinite 1s;
        }

        .animate-sparkle-4 {
          animation: sparkle-4 2s ease-in-out infinite 1.5s;
        }

        .animate-energy-ring {
          animation: energy-ring 2s ease-out infinite;
        }

        /* Gradient radial utility */
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
};

export default VoiceSearchButton;
