import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for voice search using Web Speech API
 * Automatically stops recording after silence is detected
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'vi-VN')
 * @param {number} options.silenceTimeout - Milliseconds of silence before auto-stop (default: 2000)
 * @param {boolean} options.continuous - Continue listening after results (default: false)
 * @param {Function} options.onResult - Callback when final result is received
 * @param {Function} options.onError - Callback when error occurs
 * @returns {Object} Voice search state and controls
 */
export const useVoiceSearch = ({
  lang = 'vi-VN',
  silenceTimeout = 2000,
  continuous = false,
  onResult,
  onError
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasReceivedSpeechRef = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Trình duyệt không hỗ trợ nhận dạng giọng nói');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Handle results
    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalText += text;
          hasReceivedSpeechRef.current = true;
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText);
        setInterimTranscript('');
        
        // Reset silence timer when we get final results
        clearTimeout(silenceTimerRef.current);
        
        // Start silence timer to auto-stop after silence
        silenceTimerRef.current = setTimeout(() => {
          if (hasReceivedSpeechRef.current) {
            stopListening();
          }
        }, silenceTimeout);
      } else if (interimText) {
        setInterimTranscript(interimText);
        
        // Reset silence timer on interim results
        clearTimeout(silenceTimerRef.current);
      }
    };

    // Handle errors
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Có lỗi xảy ra khi nhận dạng giọng nói';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Không phát hiện giọng nói';
          break;
        case 'audio-capture':
          errorMessage = 'Không thể truy cập microphone';
          break;
        case 'not-allowed':
          errorMessage = 'Quyền truy cập microphone bị từ chối';
          break;
        case 'network':
          errorMessage = 'Lỗi kết nối mạng';
          break;
        case 'aborted':
          // User stopped manually, not an error
          return;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      if (onError) {
        onError(errorMessage);
      }
    };

    // Handle end
    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
      
      // Call onResult with final transcript if we received speech
      if (hasReceivedSpeechRef.current && transcript && onResult) {
        onResult(transcript.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      clearTimeout(silenceTimerRef.current);
    };
  }, [lang, continuous, silenceTimeout, onResult, onError, transcript]);

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      return;
    }

    try {
      // Reset state
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      hasReceivedSpeechRef.current = false;
      
      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Không thể bắt đầu nhận dạng giọng nói');
    }
  }, [isSupported]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      clearTimeout(silenceTimerRef.current);
    }
  }, [isListening]);

  /**
   * Toggle listening state
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Reset transcript
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    hasReceivedSpeechRef.current = false;
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: transcript + interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
};
