import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import VoiceSearchButton from '@/components/common/VoiceSearchButton';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { toast } from 'sonner';
import { Mic, Volume2, AlertCircle, Sparkles, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Demo component to test voice search functionality with professional UI
 * Shows real-time transcript and final results with enhanced animations
 */
const VoiceSearchDemo = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    error,
    isSupported,
    toggleListening,
    resetTranscript
  } = useVoiceSearch({
    lang: 'vi-VN',
    silenceTimeout: 2000,
    onResult: (finalText) => {
      if (finalText) {
        setSearchQuery(finalText);
        performSearch(finalText);
        toast.success('Đã nhận dạng: ' + finalText, {
          icon: '🎤',
          duration: 3000
        });
      }
    },
    onError: (errorMessage) => {
      toast.error(errorMessage, {
        icon: '❌'
      });
    }
  });

  const performSearch = (query) => {
    // Simulate search with animation
    setSearchResults([]);
    setTimeout(() => {
      const mockResults = [
        `Kết quả 1 cho "${query}"`,
        `Kết quả 2 cho "${query}"`,
        `Kết quả 3 cho "${query}"`
      ];
      setSearchResults(mockResults);
    }, 300);
  };

  const handleVoiceClick = () => {
    if (!isListening) {
      resetTranscript();
      setSearchQuery('');
      setSearchResults([]);
      toast.info('🎤 Hãy nói từ khóa tìm kiếm...', {
        duration: 2000
      });
    }
    toggleListening();
  };

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  if (!isSupported) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-2 border-destructive/20">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Không hỗ trợ
          </CardTitle>
          <CardDescription>
            Trình duyệt của bạn không hỗ trợ tính năng nhận dạng giọng nói.
            Vui lòng sử dụng Chrome, Edge hoặc Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 relative">
      {/* Backdrop blur overlay when listening */}
      {isListening && (
        <div className="fixed inset-0 bg-red-500/5 backdrop-blur-sm z-40 animate-fade-in pointer-events-none" />
      )}

      {/* Main Search Card */}
      <Card className={cn(
        "shadow-2xl border-2 transition-all duration-500 relative z-50",
        isListening 
          ? "border-red-500/50 shadow-red-500/20 scale-[1.02]" 
          : "border-border shadow-primary/5"
      )}>
        <CardHeader className={cn(
          "transition-all duration-500",
          isListening && "bg-gradient-to-br from-red-50 to-pink-50"
        )}>
          <CardTitle className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full transition-all duration-500",
              isListening 
                ? "bg-gradient-to-br from-red-500 to-pink-600 text-white animate-pulse" 
                : "bg-primary/10 text-primary"
            )}>
              <Mic className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Voice Search Demo
            </span>
            {isListening && (
              <Badge variant="destructive" className="ml-auto animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Nhấn vào nút microphone và nói từ khóa. Hệ thống sẽ tự động dừng sau 2 giây im lặng.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Search Input with Voice Button */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder={isListening ? "🎤 Đang nghe..." : "Nhập hoặc nói từ khóa tìm kiếm..."}
                value={isListening ? fullTranscript : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isListening}
                className={cn(
                  "pr-16 h-14 text-base transition-all duration-500 shadow-lg",
                  isListening && "bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-900 shadow-red-200/50 scale-[1.02]"
                )}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <VoiceSearchButton
                  isListening={isListening}
                  isSupported={isSupported}
                  onClick={handleVoiceClick}
                  size="default"
                />
              </div>
            </div>
            <Button 
              onClick={handleManualSearch}
              disabled={!searchQuery.trim() || isListening}
              className="h-14 px-6 btn-gradient text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Voice Status with Enhanced Animation */}
          {isListening && (
            <div className="relative overflow-hidden rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-pink-50 to-red-50 p-6 shadow-xl animate-slide-in">
              {/* Animated background waves */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-400 to-pink-400 animate-wave-1" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-400 to-red-400 animate-wave-2" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-red-700 font-semibold mb-3">
                  <div className="relative">
                    <Volume2 className="h-6 w-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  </div>
                  <span className="text-lg">Đang nghe...</span>
                </div>
                <div className="text-base text-red-800 font-medium min-h-[28px] flex items-center">
                  {fullTranscript ? (
                    <span className="animate-fade-in">{fullTranscript}</span>
                  ) : (
                    <span className="text-red-600/70 italic animate-pulse">
                      Hãy nói từ khóa tìm kiếm...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Transcript Display with Smooth Animation */}
          {(transcript || interimTranscript) && !isListening && (
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-2 border-primary/20 rounded-xl p-5 space-y-3 shadow-lg animate-slide-in">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Kết quả nhận dạng:
              </div>
              <div className="text-foreground text-lg">
                <span className="font-semibold">{transcript}</span>
                {interimTranscript && (
                  <span className="text-muted-foreground italic"> {interimTranscript}</span>
                )}
              </div>
            </div>
          )}

          {/* Error Display with Animation */}
          {error && (
            <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/30 rounded-xl p-5 shadow-lg animate-shake">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Search Results with Stagger Animation */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Kết quả tìm kiếm:
              </div>
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="bg-card border-2 border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-slide-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-600" />
                      <span className="text-foreground font-medium">{result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Hướng dẫn sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">1</Badge>
            <span>Nhấn vào nút microphone (hoặc nhấn vào ô input)</span>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">2</Badge>
            <span>Cho phép trình duyệt truy cập microphone nếu được yêu cầu</span>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">3</Badge>
            <span>Nói từ khóa tìm kiếm của bạn</span>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">4</Badge>
            <span>Hệ thống sẽ tự động dừng sau 2 giây im lặng</span>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5">5</Badge>
            <span>Kết quả sẽ được tự động tìm kiếm</span>
          </div>
          <div className="pt-3 text-xs border-t border-border">
            <strong className="text-foreground">Lưu ý:</strong> Tính năng này chỉ hoạt động trên Chrome, Edge, Safari và các trình duyệt hỗ trợ Web Speech API.
          </div>
        </CardContent>
      </Card>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes wave-1 {
          0%, 100% {
            transform: translateX(-100%) skewX(-15deg);
          }
          50% {
            transform: translateX(100%) skewX(15deg);
          }
        }

        @keyframes wave-2 {
          0%, 100% {
            transform: translateX(100%) skewX(15deg);
          }
          50% {
            transform: translateX(-100%) skewX(-15deg);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
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

        .animate-wave-1 {
          animation: wave-1 3s ease-in-out infinite;
        }

        .animate-wave-2 {
          animation: wave-2 4s ease-in-out infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VoiceSearchDemo;
