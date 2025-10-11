import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VoiceSearchButton from '@/components/common/VoiceSearchButton';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Showcase component to demonstrate all VoiceSearchButton states
 * Perfect for testing and documentation
 */
const VoiceSearchShowcase = () => {
  const [demoState, setDemoState] = useState('Idle');
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  // Auto-play through states
  React.useEffect(() => {
    if (!isAutoPlay) return;

    const states = ['Idle', 'Starting', 'Listening', 'FinishingProcessing'];
    let currentIndex = states.indexOf(demoState);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setDemoState(states[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlay, demoState]);

  const states = [
    {
      name: 'Idle',
      description: 'Trạng thái mặc định, chờ người dùng click',
      color: 'bg-muted',
      features: ['Gradient background', 'Hover effects', 'Scale animation']
    },
    {
      name: 'Starting',
      description: 'Đang khởi động microphone',
      color: 'bg-blue-500',
      features: ['Transition animation', 'Loading state']
    },
    {
      name: 'Listening',
      description: 'Đang nghe và ghi âm giọng nói',
      color: 'bg-red-500',
      features: ['Sound waves (3 layers)', 'Backdrop blur', 'Glow effect', 'Status dot', 'Voice pulse']
    },
    {
      name: 'FinishingProcessing',
      description: 'Đang xử lý kết quả nhận dạng',
      color: 'bg-purple-500',
      features: ['Spinner animation', 'Processing indicator']
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Voice Search Button Showcase
        </h2>
        <p className="text-muted-foreground">
          Xem tất cả các trạng thái và hiệu ứng của VoiceSearchButton
        </p>
      </div>

      {/* Live Demo */}
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-br from-primary/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Demo</CardTitle>
              <CardDescription>
                Trạng thái hiện tại: <Badge variant="outline">{demoState}</Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={isAutoPlay ? "destructive" : "default"}
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Dừng
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Auto Play
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDemoState('Idle')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Large demo button */}
          <div className="flex flex-col items-center gap-6">
            <div className={cn(
              "relative p-12 rounded-2xl transition-all duration-500",
              demoState === 'Listening' && "bg-red-500/5"
            )}>
              <VoiceSearchButton
                state={demoState}
                isSupported={true}
                onClick={() => {}}
                size="lg"
              />
            </div>

            {/* State info */}
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-semibold text-foreground">
                {states.find(s => s.name === demoState)?.description}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {states.find(s => s.name === demoState)?.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {states.map((state) => (
          <Card
            key={state.name}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
              demoState === state.name && "border-2 border-primary shadow-xl"
            )}
            onClick={() => setDemoState(state.name)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{state.name}</CardTitle>
                <div className={cn("w-3 h-3 rounded-full", state.color)} />
              </div>
              <CardDescription>{state.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini demo */}
              <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                <VoiceSearchButton
                  state={state.name}
                  isSupported={true}
                  onClick={() => {}}
                  size="default"
                />
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {state.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Size Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
          <CardDescription>
            VoiceSearchButton có 3 kích thước: small, default, large
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-8 p-8">
            <div className="text-center space-y-3">
              <VoiceSearchButton
                state="Idle"
                isSupported={true}
                onClick={() => {}}
                size="sm"
              />
              <p className="text-xs text-muted-foreground">Small (36px)</p>
            </div>
            <div className="text-center space-y-3">
              <VoiceSearchButton
                state="Idle"
                isSupported={true}
                onClick={() => {}}
                size="default"
              />
              <p className="text-xs text-muted-foreground">Default (40px)</p>
            </div>
            <div className="text-center space-y-3">
              <VoiceSearchButton
                state="Idle"
                isSupported={true}
                onClick={() => {}}
                size="lg"
              />
              <p className="text-xs text-muted-foreground">Large (48px)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Not Supported State */}
      <Card>
        <CardHeader>
          <CardTitle>Not Supported State</CardTitle>
          <CardDescription>
            Hiển thị khi trình duyệt không hỗ trợ Web Speech API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <VoiceSearchButton
              state="Idle"
              isSupported={false}
              onClick={() => {}}
              size="default"
            />
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Code Example</CardTitle>
          <CardDescription>
            Cách sử dụng VoiceSearchButton trong component của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
            <code>{`import VoiceSearchButton from '@/components/common/VoiceSearchButton';
import { useSonioxSearch } from '@/hooks/useSonioxSearch';

const MyComponent = () => {
  const { state, isSupported, toggleSearch } = useSonioxSearch({
    onResult: (text) => {
      console.log('Recognized:', text);
    }
  });

  return (
    <VoiceSearchButton
      state={state}
      isSupported={isSupported}
      onClick={toggleSearch}
      size="default"
    />
  );
};`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceSearchShowcase;