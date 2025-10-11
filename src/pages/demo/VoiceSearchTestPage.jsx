import React from 'react';
import VoiceSearchDemo from '@/components/demo/VoiceSearchDemo';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Mic, Sparkles, Waves, Zap } from 'lucide-react';

/**
 * Test page for Voice Search feature with enhanced UI
 * Navigate to this page to test the voice search functionality
 */
const VoiceSearchTestPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with gradient */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
            <Mic className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Voice Search Test
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trải nghiệm tính năng tìm kiếm bằng giọng nói với giao diện chuyên nghiệp và hiệu ứng mượt mà
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Backdrop Blur
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Waves className="h-3 w-3" />
              Sound Waves
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Smooth Animations
            </Badge>
          </div>
        </div>

        {/* Demo Component */}
        <VoiceSearchDemo />

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <EnhancedCard variant="glass" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Hiệu ứng làm mờ</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Backdrop blur toàn màn hình khi đang nghe, giúp tập trung vào voice search
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="glass" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Waves className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground">Sóng âm thanh</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                3 vòng sóng animation xung quanh microphone với tốc độ khác nhau
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="glass" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <Zap className="h-5 w-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-foreground">Gradient Effects</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Màu sắc gradient đẹp mắt với glow effect khi đang hoạt động
              </p>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="glass" className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Mic className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-foreground">Live Indicator</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Chỉ báo trạng thái trực quan với badge LIVE và status dot
              </p>
            </div>
          </EnhancedCard>
        </div>

        {/* Quick Guide */}
        <EnhancedCard variant="interactive" className="border-2 border-primary/20">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Hướng dẫn nhanh
            </h2>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium text-foreground">Nhấn vào icon microphone</p>
                  <p className="text-sm text-muted-foreground">Button sẽ chuyển sang màu đỏ với hiệu ứng sóng</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium text-foreground">Cho phép truy cập microphone</p>
                  <p className="text-sm text-muted-foreground">Trình duyệt sẽ yêu cầu quyền lần đầu tiên</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium text-foreground">Nói từ khóa tìm kiếm</p>
                  <p className="text-sm text-muted-foreground">Ví dụ: "lập trình viên", "kế toán", "marketing"</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium text-foreground">Hệ thống tự động dừng</p>
                  <p className="text-sm text-muted-foreground">Sau 2 giây im lặng, kết quả sẽ được xử lý</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Lưu ý:</strong> Tính năng này hoạt động tốt nhất trên Chrome, Edge, Safari.
                Firefox chưa hỗ trợ Web Speech API.
              </p>
            </div>
          </div>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default VoiceSearchTestPage;
