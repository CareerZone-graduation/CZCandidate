/**
 * Voice Search Integration Examples
 * 
 * File này chứa các ví dụ về cách tích hợp voice search vào các component khác
 * Copy và modify theo nhu cầu của bạn
 */

import { useState, useEffect } from 'react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import VoiceSearchButton from '@/components/common/VoiceSearchButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Example 1: Simple Voice Search Input
// ============================================================================

export function SimpleVoiceSearchInput() {
  const [query, setQuery] = useState('');

  const { isListening, fullTranscript, isSupported, toggleListening } = useVoiceSearch({
    lang: 'vi-VN',
    onResult: (text) => {
      setQuery(text);
      toast.success('Đã nhận dạng: ' + text);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
        disabled={isListening}
        className="pr-14"
      />
      {isSupported && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <VoiceSearchButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={toggleListening}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: Voice Search with Search Button
// ============================================================================

export function VoiceSearchWithButton() {
  const [query, setQuery] = useState('');

  const { isListening, fullTranscript, isSupported, toggleListening, resetTranscript } = useVoiceSearch({
    lang: 'vi-VN',
    onResult: (text) => {
      setQuery(text);
      handleSearch(text);
    },
    onError: (error) => toast.error(error)
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  const handleSearch = (searchQuery = query) => {
    console.log('Searching for:', searchQuery);
    toast.success('Đang tìm kiếm: ' + searchQuery);
  };

  const handleVoiceClick = () => {
    if (!isListening) {
      resetTranscript();
    }
    toggleListening();
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
          disabled={isListening}
          className={cn(
            "pl-10 pr-14",
            isListening && "bg-red-50 border-red-300"
          )}
        />
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              onClick={handleVoiceClick}
            />
          </div>
        )}
      </div>
      <Button onClick={() => handleSearch()} disabled={isListening}>
        Tìm kiếm
      </Button>
    </div>
  );
}

// ============================================================================
// Example 3: Voice Search with Language Selector
// ============================================================================

export function VoiceSearchWithLanguage() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('vi-VN');

  const { isListening, fullTranscript, isSupported, toggleListening } = useVoiceSearch({
    lang: language,
    onResult: (text) => {
      setQuery(text);
      toast.success('Recognized: ' + text);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="vi-VN">🇻🇳 Tiếng Việt</option>
          <option value="en-US">🇺🇸 English</option>
          <option value="zh-CN">🇨🇳 中文</option>
          <option value="ja-JP">🇯🇵 日本語</option>
        </select>
      </div>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Listening..." : "Search..."}
          disabled={isListening}
          className="pr-14"
        />
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              onClick={toggleListening}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Voice Search with Transcript Display
// ============================================================================

export function VoiceSearchWithTranscript() {
  const [query, setQuery] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript,
    isSupported,
    toggleListening
  } = useVoiceSearch({
    lang: 'vi-VN',
    onResult: (text) => {
      setQuery(text);
      toast.success('Đã nhận dạng: ' + text);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
          disabled={isListening}
          className="pr-14"
        />
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              onClick={toggleListening}
            />
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-muted rounded-lg p-3 text-sm">
          <div className="text-muted-foreground mb-1">Transcript:</div>
          <div>
            <span className="font-medium text-foreground">{transcript}</span>
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Voice Search with Custom Timeout
// ============================================================================

export function VoiceSearchWithCustomTimeout() {
  const [query, setQuery] = useState('');
  const [timeout, setTimeout] = useState(2000);

  const { isListening, fullTranscript, isSupported, toggleListening } = useVoiceSearch({
    lang: 'vi-VN',
    silenceTimeout: timeout,
    onResult: (text) => {
      setQuery(text);
      toast.success(`Đã nhận dạng (${timeout}ms): ${text}`);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <label className="text-sm text-muted-foreground">Silence timeout:</label>
        <select
          value={timeout}
          onChange={(e) => setTimeout(Number(e.target.value))}
          disabled={isListening}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          <option value={1000}>1 giây</option>
          <option value={2000}>2 giây</option>
          <option value={3000}>3 giây</option>
          <option value={5000}>5 giây</option>
        </select>
      </div>

      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
          disabled={isListening}
          className="pr-14"
        />
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              onClick={toggleListening}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 6: Voice Search with Manual Control
// ============================================================================

export function VoiceSearchManualControl() {
  const [query, setQuery] = useState('');

  const {
    isListening,
    fullTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceSearch({
    lang: 'vi-VN',
    continuous: true, // Don't auto-stop
    silenceTimeout: 0,
    onResult: (text) => {
      setQuery(text);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  const handleStart = () => {
    resetTranscript();
    startListening();
    toast.info('Bắt đầu nghe...');
  };

  const handleStop = () => {
    stopListening();
    toast.success('Đã dừng');
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
          disabled={isListening}
          className="pr-14"
        />
        {isSupported && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VoiceSearchButton
              isListening={isListening}
              isSupported={isSupported}
              onClick={isListening ? handleStop : handleStart}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStart}
          disabled={isListening || !isSupported}
          size="sm"
          variant="outline"
        >
          Bắt đầu
        </Button>
        <Button
          onClick={handleStop}
          disabled={!isListening}
          size="sm"
          variant="outline"
        >
          Dừng
        </Button>
        <Button
          onClick={() => {
            resetTranscript();
            setQuery('');
          }}
          disabled={isListening}
          size="sm"
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Voice Search in Modal/Dialog
// ============================================================================

export function VoiceSearchInModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const { isListening, fullTranscript, isSupported, toggleListening, resetTranscript } = useVoiceSearch({
    lang: 'vi-VN',
    onResult: (text) => {
      setQuery(text);
      handleSearch(text);
    }
  });

  useEffect(() => {
    if (isListening) setQuery(fullTranscript);
  }, [fullTranscript, isListening]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      toggleListening();
    }
  }, [isOpen]);

  const handleSearch = (searchQuery) => {
    console.log('Searching:', searchQuery);
    toast.success('Tìm kiếm: ' + searchQuery);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Voice Search</h2>
        
        <div className="relative mb-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "Đang nghe..." : "Tìm kiếm..."}
            disabled={isListening}
            className="pr-14"
          />
          {isSupported && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearchButton
                isListening={isListening}
                isSupported={isSupported}
                onClick={() => {
                  if (!isListening) resetTranscript();
                  toggleListening();
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={() => handleSearch(query)}>
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Usage Example
// ============================================================================

/*
import {
  SimpleVoiceSearchInput,
  VoiceSearchWithButton,
  VoiceSearchWithLanguage,
  VoiceSearchWithTranscript,
  VoiceSearchWithCustomTimeout,
  VoiceSearchManualControl,
  VoiceSearchInModal
} from '@/examples/VoiceSearchExamples';

function MyPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h3>Simple Input</h3>
        <SimpleVoiceSearchInput />
      </div>

      <div>
        <h3>With Search Button</h3>
        <VoiceSearchWithButton />
      </div>

      <div>
        <h3>With Language Selector</h3>
        <VoiceSearchWithLanguage />
      </div>

      <div>
        <h3>With Transcript Display</h3>
        <VoiceSearchWithTranscript />
      </div>

      <div>
        <h3>Custom Timeout</h3>
        <VoiceSearchWithCustomTimeout />
      </div>

      <div>
        <h3>Manual Control</h3>
        <VoiceSearchManualControl />
      </div>
    </div>
  );
}
*/
