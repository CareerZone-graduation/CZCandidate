import { useState, useEffect, useRef, useCallback } from 'react';
import { SonioxClient } from '@soniox/speech-to-text-web';
import { toast } from 'sonner';
import { getTemporarySonioxApiKey, refreshSonioxApiKeyIfNeeded } from '@/services/sonioxService';

/**
 * Custom hook cho tìm kiếm bằng giọng nói sử dụng Soniox.
 * @param {object} options - Tùy chọn cấu hình.
 * @param {string} [options.lang='vi'] - Mã ngôn ngữ (ví dụ: 'vi', 'en').
 * @param {function} options.onResult - Callback được gọi khi có kết quả cuối cùng.
 * @returns {object} - Trạng thái và các hàm điều khiển voice search.
 */
export const useSonioxSearch = ({ lang = 'vi', onResult }) => {
  const sonioxClient = useRef(null);
  const [state, setState] = useState("Idle");
  
  // Transcript for real-time display in the input
  const [displayTranscript, setDisplayTranscript] = useState('');
  
  // Ref to accumulate final text parts
  const finalTranscriptRef = useRef('');

  const [error, setError] = useState(null);
  
  // Store API key and expiration
  const apiKeyRef = useRef(null);
  const expiresAtRef = useRef(null);

  // Initialize SonioxClient with API key from backend
  useEffect(() => {
    const initializeSoniox = async () => {
      try {
        // Get API key from backend
        const { apiKey, expiresAt } = await getTemporarySonioxApiKey();
        apiKeyRef.current = apiKey;
        expiresAtRef.current = expiresAt;

        // Initialize Soniox client
        if (!sonioxClient.current) {
          sonioxClient.current = new SonioxClient({
            apiKey: apiKey,
          });
        }
      } catch (error) {
        console.error('Failed to initialize Soniox:', error);
        setError('Không thể khởi tạo tìm kiếm bằng giọng nói');
        toast.error('Không thể khởi tạo tìm kiếm bằng giọng nói');
      }
    };

    initializeSoniox();

    // Cleanup on unmount
    return () => {
      sonioxClient.current?.cancel();
    };
  }, []);

  const startSearch = useCallback(async () => {
    // Reset states for a new search
    setDisplayTranscript('');
    finalTranscriptRef.current = '';
    setError(null);

    if (!sonioxClient.current) return;

    try {
      // Refresh API key if needed (less than 5 minutes until expiry)
      const refreshedKey = await refreshSonioxApiKeyIfNeeded(expiresAtRef.current);
      if (refreshedKey) {
        apiKeyRef.current = refreshedKey.apiKey;
        expiresAtRef.current = refreshedKey.expiresAt;
        
        // Reinitialize client with new key
        sonioxClient.current = new SonioxClient({
          apiKey: refreshedKey.apiKey,
        });
        
        console.log('Soniox API key refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh API key:', error);
      toast.error('Không thể làm mới API key');
      return;
    }

    sonioxClient.current.start({
      model: 'stt-rt-preview-v2',
      language_hints: [lang],
      enableEndpointDetection: true,
      
      onStarted: () => {
        toast.info('Hãy nói từ khóa tìm kiếm...');
      },

      onStateChange: ({ newState }) => {
        setState(newState);
      },

      onError: (status, message) => {
        const errorMessage = `Lỗi Soniox: ${message}`;
        setError(errorMessage);
        toast.error(errorMessage);
      },

      onPartialResult: (result) => {
        // Append new final text to our ref
        const newFinalText = result.tokens
            .filter(t => t.is_final)
            .map(t => t.text)
            .join("");
        
        if (newFinalText) {
            finalTranscriptRef.current += newFinalText;
        }

        // Get current non-final text for display
        const nonFinalText = result.tokens
            .filter(t => !t.is_final)
            .map(t => t.text)
            .join("");

        // Update the display transcript, filtering out the <end> token
        setDisplayTranscript((finalTranscriptRef.current + nonFinalText).replace(/<end>/g, ''));
      },

      onFinished: () => {
        // Use the accumulated final transcript as the definitive result
        const finalTranscript = finalTranscriptRef.current.replace(/<end>/g, '').trim();
        
        // Final update for display
        setDisplayTranscript(finalTranscript);

        if (finalTranscript && onResult) {
          onResult(finalTranscript);
          toast.success(`Đã nhận dạng: ${finalTranscript}`);
        }
      },
    });
  }, [lang, onResult]);

  const stopSearch = useCallback(() => {
    sonioxClient.current?.stop();
  }, []);

  const toggleSearch = useCallback(() => {
    if (state === "Running") {
      stopSearch();
    } else {
      startSearch();
    }
  }, [state, startSearch, stopSearch]);

  return {
    state,
    isListening: state === "Running",
    fullTranscript: displayTranscript, // This is sent to the JobSearchBar input
    error,
    isSupported: !!sonioxClient.current,
    toggleSearch,
  };
};