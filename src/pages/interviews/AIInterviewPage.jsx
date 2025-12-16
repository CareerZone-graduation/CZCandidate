import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mic,
  MicOff,
  Video,
  Phone,
  ArrowLeft,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Sparkles,
  CircleDot
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getDIDCredentials,
  submitDIDSDP,
  speakWithDID,
  closeDIDStream,
  sendChatMessage,
  transcribeAudio
} from '@/services/aiInterviewService';

// Generate unique session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * AI Interview Page Component
 * Virtual interview with AI avatar using D-ID, ElevenLabs, and Gemini
 */
const AIInterviewPage = () => {
  const navigate = useNavigate();

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStarting, setIsStarting] = useState(false); // Loading khi bắt đầu phỏng vấn
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Nhấn "Bắt đầu phỏng vấn" để khởi động');
  const [error, setError] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [didStatus, setDidStatus] = useState('idle');
  const [pendingAIMessage, setPendingAIMessage] = useState(null); // Chờ video bắt đầu nói mới hiện text

  // Helper function to remove text in square brackets like [haha], [friendly], etc.
  const cleanMessageContent = (text) => {
    return text.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
  };

  // Refs
  const sessionIdRef = useRef(generateSessionId());
  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const streamIdRef = useRef(null);
  const didSessionIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaStreamRef = useRef(new MediaStream());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ensure video stream is attached when video element mounts
  useEffect(() => {
    if (isConnected && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.muted = false; // Always unmuted
      videoRef.current.play()
        .then(() => {
          setIsVideoReady(true);
        })
        .catch(e => console.warn("Autoplay blocked:", e));
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      handleCloseDIDStream();
      // Cleanup AudioContext
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  // --- WEBRTC & D-ID LOGIC ---
  const onTrack = useCallback((event) => {
    if (!event.track) return;
    if (mediaStreamRef.current.getTrackById(event.track.id)) return;
    mediaStreamRef.current.addTrack(event.track);

    if (videoRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }
      videoRef.current.play()
        .then(() => setIsVideoReady(true))
        .catch(e => console.error("Video play failed:", e));
    }
  }, []);

  const initializeDIDStream = async () => {
    try {
      setDidStatus('connecting');
      setStatus('Đang kết nối với AI Avatar...');
      setIsVideoReady(false);
      mediaStreamRef.current = new MediaStream();

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const data = await getDIDCredentials();
      if (data.error) throw new Error(data.error);

      const { id, session_id, offer, ice_servers } = data;
      streamIdRef.current = id;
      didSessionIdRef.current = session_id;

      const pc = new RTCPeerConnection({
        iceServers: ice_servers || [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnectionRef.current = pc;
      pc.ontrack = onTrack;

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (state === 'connected' || state === 'completed') {
          setDidStatus('connected');
          setStatus('Đã kết nối AI Avatar!');
        } else if (state === 'failed' || state === 'disconnected') {
          setDidStatus('error');
          setError('Mất kết nối video.');
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await new Promise((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
          setTimeout(resolve, 4000);
        }
      });

      const localDesc = pc.localDescription;
      await submitDIDSDP(id, session_id, localDesc.type, localDesc.sdp);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsConnected(true);
      return true;
    } catch (err) {
      console.error('D-ID init error:', err);
      setDidStatus('error');
      setError('Lỗi kết nối AI Avatar: ' + err.message);
      toast.error('Không thể kết nối với AI Avatar');
      return false;
    }
  };

  const handleCloseDIDStream = async () => {
    const sId = streamIdRef.current;
    const sessId = didSessionIdRef.current;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (sId && sessId) {
      try {
        await closeDIDStream(sId, sessId);
      } catch (err) {
        console.error('Error closing stream:', err);
      }
    }

    streamIdRef.current = null;
    didSessionIdRef.current = null;
    setIsVideoReady(false);
    setDidStatus('idle');
  };

  /**
   * Phát hiện khi video bắt đầu có âm thanh (avatar đang nói)
   * Sử dụng AudioContext để phân tích audio stream
   */
  const waitForVideoSpeaking = useCallback(() => {
    return new Promise((resolve) => {
      // Nếu không có video stream, resolve ngay
      if (!mediaStreamRef.current || mediaStreamRef.current.getAudioTracks().length === 0) {
        setTimeout(resolve, 500); // Fallback delay
        return;
      }

      try {
        // Tạo AudioContext nếu chưa có
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        
        // Resume nếu bị suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let checkCount = 0;
        const maxChecks = 100; // Max 5 giây (50ms * 100)
        const threshold = 10; // Ngưỡng âm thanh

        const checkAudio = () => {
          checkCount++;
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

          if (average > threshold) {
            // Có âm thanh - video đang nói
            source.disconnect();
            resolve();
          } else if (checkCount >= maxChecks) {
            // Timeout - resolve anyway
            source.disconnect();
            resolve();
          } else {
            setTimeout(checkAudio, 50);
          }
        };

        checkAudio();
      } catch (err) {
        console.warn('Audio detection error:', err);
        setTimeout(resolve, 800); // Fallback delay
      }
    });
  }, []);

  const handleSpeakWithDID = async (text, onSpeakingStart) => {
    if (!streamIdRef.current || !didSessionIdRef.current) return;

    setIsSpeaking(true);
    setStatus('AI đang chuẩn bị nói...');
    
    try {
      // Gửi yêu cầu nói cho D-ID
      await speakWithDID(streamIdRef.current, didSessionIdRef.current, text);
      
      // Chờ video thực sự bắt đầu phát âm thanh
      await waitForVideoSpeaking();
      
      // Callback khi video bắt đầu nói - hiển thị text
      if (onSpeakingStart) {
        onSpeakingStart();
      }
      
      setStatus('AI đang nói...');
      
      // Ước tính thời gian nói
      const estimatedDuration = Math.max(2000, text.length * 80);
      await new Promise(resolve => setTimeout(resolve, estimatedDuration));
    } catch (err) {
      console.error('D-ID speak error:', err);
      setStatus('Lỗi AI nói: ' + err.message);
      // Vẫn hiển thị message nếu lỗi
      if (onSpeakingStart) {
        onSpeakingStart();
      }
    } finally {
      setIsSpeaking(false);
      setStatus('Nhấn giữ nút micro để nói');
    }
  };

  const startInterview = async () => {
    if (isStarting) return; // Ngăn click nhiều lần
    
    setIsStarting(true);
    setError(null);
    setMessages([]);
    sessionIdRef.current = generateSessionId();

    const didInitialized = await initializeDIDStream();
    if (!didInitialized) {
      setIsStarting(false);
      return;
    }

    setIsConnected(true);
    setIsStarting(false); // Tắt loading sau khi kết nối thành công
    setIsProcessing(true);
    setStatus('AI đang chuẩn bị...');

    try {
      const data = await sendChatMessage(sessionIdRef.current, '', true);
      if (data.error) throw new Error(data.error);

      const cleanedResponse = cleanMessageContent(data.response);
      
      // Thêm placeholder message "Đang suy nghĩ..."
      const placeholderId = Date.now();
      setMessages([{ 
        role: 'ai', 
        content: '💭 Đang suy nghĩ...', 
        timestamp: placeholderId,
        isPlaceholder: true 
      }]);
      
      // Khi video bắt đầu nói, thay placeholder bằng text thật
      await handleSpeakWithDID(data.response, () => {
        setMessages([{ 
          role: 'ai', 
          content: cleanedResponse, 
          timestamp: placeholderId 
        }]);
      });
    } catch (err) {
      console.error('Start error:', err);
      setError('Lỗi khởi động: ' + err.message);
      toast.error('Không thể bắt đầu phỏng vấn');
    } finally {
      setIsProcessing(false);
      setStatus('Nhấn giữ nút micro để nói');
    }
  };

  const addMessage = (role, content) => {
    // Clean content from square brackets for display
    const cleanedContent = role === 'ai' ? cleanMessageContent(content) : content;
    setMessages(prev => [...prev, { role, content: cleanedContent, timestamp: Date.now() }]);
  };

  const startRecording = async () => {
    if (isProcessing || isSpeaking) return;
    setError(null);
    setTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioChunks.length === 0) return;

        const audioBlob = new Blob(audioChunks, { type: mimeType });
        if (audioBlob.size < 3000) {
          setStatus('Nói quá ngắn. Hãy thử lại!');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          setIsProcessing(true);
          setStatus('Đang nhận diện giọng nói...');

          try {
            const data = await transcribeAudio(base64Audio);
            const transcribedText = data.text?.trim();

            if (!transcribedText) {
              setStatus('Không nghe rõ. Vui lòng nói lại.');
              setIsProcessing(false);
              return;
            }

            setTranscript(transcribedText);
            await processUserMessage(transcribedText);
          } catch (err) {
            console.error('Transcribe error:', err);
            setStatus('Lỗi nhận diện.');
            toast.error('Không thể nhận diện giọng nói');
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setStatus('🔴 Đang ghi âm... (thả nút để gửi)');
    } catch (err) {
      console.error('Mic error:', err);
      setError('Không thể truy cập Microphone.');
      toast.error('Vui lòng cấp quyền microphone');
    }
  };

  const processUserMessage = async (text) => {
    addMessage('user', text);
    setTranscript('');
    setStatus('AI đang suy nghĩ...');

    try {
      const data = await sendChatMessage(sessionIdRef.current, text);
      if (data.error) throw new Error(data.error);

      const cleanedResponse = cleanMessageContent(data.response);
      
      // Thêm placeholder message "Đang suy nghĩ..."
      const placeholderId = Date.now();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '💭 Đang suy nghĩ...', 
        timestamp: placeholderId,
        isPlaceholder: true 
      }]);
      
      // Khi video bắt đầu nói, thay placeholder bằng text thật
      await handleSpeakWithDID(data.response, () => {
        setMessages(prev => prev.map(msg => 
          msg.timestamp === placeholderId 
            ? { role: 'ai', content: cleanedResponse, timestamp: placeholderId }
            : msg
        ));
      });
    } catch (err) {
      console.error('Chat error:', err);
      setError('Lỗi phản hồi AI.');
      toast.error('Không thể nhận phản hồi từ AI');
      // Xóa placeholder nếu lỗi
      setMessages(prev => prev.filter(msg => !msg.isPlaceholder));
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    setStatus('Đang xử lý...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const endInterview = async () => {
    stopRecording();
    await handleCloseDIDStream();
    setIsConnected(false);
    setStatus('Phỏng vấn đã kết thúc.');
    toast.success('Phỏng vấn đã kết thúc');
  };

  const handleManualPlay = () => {
    const video = videoRef.current;
    if (video) {
      const tracks = mediaStreamRef.current?.getTracks() || [];
      if (tracks.length === 0) {
        toast.warning("Chưa nhận được video stream từ AI. Vui lòng đợi...");
      }
      if (video.srcObject !== mediaStreamRef.current) {
        video.srcObject = mediaStreamRef.current;
      }
      video.play()
        .then(() => setIsVideoReady(true))
        .catch(e => toast.error("Không thể phát video: " + e.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CareerZone AI
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Phỏng vấn ảo với AI</p>
            </div>
          </div>

          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
                {isConnected ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                        isVideoReady ? "opacity-100" : "opacity-0"
                      )}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "backdrop-blur-sm",
                          didStatus === 'connecting' && "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                          didStatus === 'connected' && "bg-green-500/20 text-green-600 border-green-500/30",
                          didStatus === 'error' && "bg-red-500/20 text-red-600 border-red-500/30"
                        )}
                      >
                        <CircleDot className={cn(
                          "h-3 w-3 mr-1",
                          didStatus === 'connecting' && "animate-pulse",
                          didStatus === 'connected' && "text-green-500"
                        )} />
                        {didStatus === 'connecting' && 'Đang kết nối...'}
                        {didStatus === 'connected' && 'Trực tuyến'}
                        {didStatus === 'error' && 'Lỗi kết nối'}
                      </Badge>
                    </div>

                    {/* Loading Overlay */}
                    {!isVideoReady && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 z-10">
                        <div className="relative mb-4">
                          <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Bot className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground animate-pulse">Đang tải video...</p>
                      </div>
                    )}

                    {/* Fallback Image */}
                    {!isVideoReady && (
                      <img
                        src="https://clips-presenters.d-id.com/amy/image.png"
                        alt="AI Interviewer"
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                      />
                    )}

                    {/* Speaking Indicator */}
                    {isSpeaking && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                                style={{ animationDelay: `${i * 0.15}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-white ml-2">Đang nói...</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Bot className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">AI Interviewer</p>
                      <p className="text-sm text-muted-foreground">Sẵn sàng phỏng vấn</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Status Card */}
            <Card className={cn(
              "transition-colors",
              error && "border-destructive bg-destructive/5"
            )}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : error ? (
                    <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                      <span className="text-destructive text-xs">!</span>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <p className={cn(
                    "text-sm",
                    error ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {error || status}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="flex flex-col h-[500px] lg:h-auto">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Cuộc trò chuyện
              </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Cuộc phỏng vấn sẽ hiển thị ở đây
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3 animate-in slide-in-from-bottom-2",
                        msg.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {msg.role === 'ai' ? (
                          <>
                            <AvatarImage src="https://clips-presenters.d-id.com/amy/image.png" />
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-secondary">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className={cn(
                        "max-w-[80%] space-y-1",
                        msg.role === 'user' && "items-end"
                      )}>
                        <p className={cn(
                          "text-xs text-muted-foreground",
                          msg.role === 'user' && "text-right"
                        )}>
                          {msg.role === 'ai' ? 'AI Interviewer' : 'Bạn'}
                        </p>
                        <div className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          msg.role === 'ai'
                            ? "bg-muted rounded-tl-sm"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Live Transcript */}
            {transcript && (
              <div className="border-t px-4 py-3 bg-primary/5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                  </span>
                  <p className="text-sm text-muted-foreground italic truncate">
                    {transcript}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Controls Footer */}
      <footer className="sticky bottom-0 border-t bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={startInterview}
                disabled={isStarting}
                className="gap-2 px-8 shadow-lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    Bắt đầu phỏng vấn
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant={isRecording ? "destructive" : "secondary"}
                  size="lg"
                  className={cn(
                    "gap-2 min-w-[180px] transition-all",
                    isRecording && "animate-pulse shadow-lg shadow-destructive/25"
                  )}
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={isProcessing || isSpeaking}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-5 w-5" />
                      Đang ghi...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5" />
                      Nhấn giữ để nói
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={endInterview}
                  className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Phone className="h-5 w-5 rotate-[135deg]" />
                  <span className="hidden sm:inline">Kết thúc</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIInterviewPage;
