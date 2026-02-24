import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CircleDot,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  sendChatMessage,
  transcribeAudio,
  generateTTS,
  getSimliSessionToken,
  getSimliIceServers
} from '@/services/aiInterviewService';
import { SimliClient, LogLevel } from 'simli-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Initialize PIXI for pixi-live2d-display
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const MODEL_URLS = {
  haru: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',
};

const SIMLI_FACE_ID = "0c2b8b04-5274-41f1-a21c-d5c98322efa9";

const AIInterviewPage = () => {
  const navigate = useNavigate();

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const [manualInput, setManualInput] = useState(''); // Text input
  const [status, setStatus] = useState('Nhấn "Bắt đầu phỏng vấn" để khởi động');
  const [error, setError] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false); // Used for canvas load
  const [interviewTopic, setInterviewTopic] = useState('Frontend Developer');
  const [avatarType, setAvatarType] = useState('simli'); // 'live2d' or 'simli'

  // Refs
  const sessionIdRef = useRef(generateSessionId());
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Simli Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);

  // Audio playback and analysis
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioElementRef = useRef(new Audio());
  const animationFrameRef = useRef(null);

  // Live2D State
  const appRef = useRef(null);
  const modelRef = useRef(null);
  const [areScriptsLoaded, setAreScriptsLoaded] = useState(false);
  const live2dStateRef = useRef({
    mouthOpenValue: 0,
    targetMouthOpen: 0,
    headPhase: 0,
    breathPhase: 0,
    isSpeaking: false,
    currentVolume: 0
  });

  // Helper function to clean text
  const cleanMessageContent = (text) => (text || '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      endInterviewCleanup();
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Dynamically load Live2D Core scripts
  useEffect(() => {
    const loadScripts = async () => {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      };

      try {
        // Hide AMD define to prevent Facebook SDK conflicts
        const originalDefine = window.define;
        const originalExports = window.exports;
        window.define = undefined;
        window.exports = undefined;

        await loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js');

        // Restore
        window.define = originalDefine;
        window.exports = originalExports;

        setAreScriptsLoaded(true);
      } catch (err) {
        console.error('Failed to load Live2D core scripts', err);
        setError('Không thể tải tài nguyên Live2D.');
      }
    };

    loadScripts();
  }, []);

=  const initLive2D = async () => {
    if (!canvasRef.current || !areScriptsLoaded) return false;

    setIsVideoReady(false);

    // Setup Pixi App
    if (!appRef.current) {
      appRef.current = new PIXI.Application({
        view: canvasRef.current,
        autoStart: true,
        resizeTo: canvasRef.current.parentElement,
        backgroundAlpha: 0,
        antialias: true,
      });

      // Ticker for smooth animation
      PIXI.Ticker.shared.add((dt) => {
        const state = live2dStateRef.current;
        const lerpSpeed = 0.25;
        state.mouthOpenValue += (state.targetMouthOpen - state.mouthOpenValue) * lerpSpeed;

        if (state.isSpeaking) {
          state.headPhase += 0.02 * dt;
        }
        state.breathPhase += 0.015 * dt;
      });
    }

    try {
      if (modelRef.current) {
        appRef.current.stage.removeChild(modelRef.current);
        modelRef.current.destroy();
      }

      const { Live2DModel } = await import('pixi-live2d-display/cubism4');
      const model = await Live2DModel.from(MODEL_URLS.haru, { autoInteract: false });
      modelRef.current = model;
      appRef.current.stage.addChild(model);

      // Disable built-in sound
      try {
        if (PIXI.live2d && PIXI.live2d.SoundManager) {
          PIXI.live2d.SoundManager.volume = 0;
          PIXI.live2d.SoundManager.play = () => Promise.resolve();
        }
        const settings = model.internalModel?.settings;
        if (settings?.motions) {
          Object.values(settings.motions).forEach(group => {
            group.forEach(m => {
              if (m.Sound) m.Sound = undefined;
              if (m.sound) m.sound = undefined;
            });
          });
        }
      } catch (e) { }

      // Scale and position precisely to fit the Haru model face
      const stageW = appRef.current.screen.width;
      const stageH = appRef.current.screen.height;
      const scale = Math.min(stageW / model.width, stageH / model.height) * 1.6;
      model.scale.set(scale);
      model.anchor.set(0.5, 0.5);
      model.x = stageW / 2;
      model.y = stageH * 0.75;

      // Make Idle loop
      try { model.motion('Idle'); } catch (e) { }

      // Manual parameter hook
      model.internalModel.on('beforeModelUpdate', () => {
        const coreModel = model.internalModel?.coreModel;
        if (!coreModel) return;
        const state = live2dStateRef.current;

        const setParam = (id2, id4, value) => {
          try {
            if (coreModel.setParameterValueById) coreModel.setParameterValueById(id4, value);
            else if (coreModel.setParamFloat) coreModel.setParamFloat(id2, value);
          } catch (e) { }
        };

        setParam('PARAM_MOUTH_OPEN_Y', 'ParamMouthOpenY', state.mouthOpenValue);

        if (state.isSpeaking) {
          setParam('PARAM_ANGLE_X', 'ParamAngleX', Math.sin(state.headPhase * 1.3) * 5);
          setParam('PARAM_ANGLE_Y', 'ParamAngleY', Math.sin(state.headPhase * 0.9) * 3);
          setParam('PARAM_ANGLE_Z', 'ParamAngleZ', Math.sin(state.headPhase * 0.7) * 2);
          setParam('PARAM_BODY_ANGLE_X', 'ParamBodyAngleX', Math.sin(state.headPhase * 0.5) * 2);
        }
        setParam('PARAM_BREATH', 'ParamBreath', 0.5 + 0.5 * Math.sin(state.breathPhase));
      });

      setIsVideoReady(true);
      return true;
    } catch (err) {
      console.error('Failed to load model', err);
      return false;
    }
  };

  const endInterviewCleanup = () => {
    if (appRef.current) {
      appRef.current.ticker.stop();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => { });
      audioContextRef.current = null;
    }
    if (simliClientRef.current) {
      simliClientRef.current.stop();
      simliClientRef.current = null;
    }
    setIsConnected(false);
    setIsVideoReady(false);
  };

  // --- Audio Output and Lip Sync Analysis ---
  const startAudioAnalysis = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (!analyserRef.current) {
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      source.connect(analyser);
      analyser.connect(audioContextRef.current.destination);
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const analyze = () => {
      const state = live2dStateRef.current;
      if (state.isSpeaking) {
        analyser.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128.0;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        let targetVolume = Math.min(1.0, rms * 5.0);

        const smoothing = targetVolume > state.currentVolume ? 0.6 : 0.4;
        state.currentVolume += (targetVolume - state.currentVolume) * smoothing;
        if (state.currentVolume < 0.05) state.currentVolume = 0;

        state.targetMouthOpen = state.currentVolume;
      }
      animationFrameRef.current = requestAnimationFrame(analyze);
    };
    analyze();
  };

  const speakAI = async (audioStream, text, onSpeakingStart) => {
    setIsSpeaking(true);
    setStatus('AI đang nói...');
    if (avatarType === 'live2d') live2dStateRef.current.isSpeaking = true;

    try {
      if (avatarType === 'simli') {
        if (onSpeakingStart) onSpeakingStart();
        const reader = audioStream.getReader();
        let audioBuffer = new Uint8Array(0);
        let isSimliPlaying = false;
        const PRE_BUFFER_SIZE = 16000;

        while (true) {
          const { done, value } = await reader.read();

          if (value && value.length > 0) {
            const combined = new Uint8Array(audioBuffer.length + value.length);
            combined.set(audioBuffer);
            combined.set(value, audioBuffer.length);
            audioBuffer = combined;
          }

          if (!isSimliPlaying && audioBuffer.length >= PRE_BUFFER_SIZE) {
            isSimliPlaying = true;
          }

          if (isSimliPlaying || done) {
            const evenLength = audioBuffer.length - (audioBuffer.length % 2);
            if (evenLength > 0) {
              const chunkToSend = audioBuffer.slice(0, evenLength);
              audioBuffer = audioBuffer.slice(evenLength);

              if (simliClientRef.current) {
                simliClientRef.current.sendAudioData(chunkToSend);
              }
            }
          }

          if (done) break;
        }

      } else {
        // LIVE2D LOGIC
        if (modelRef.current) {
          try { modelRef.current.motion('Tap', 0); } catch (e) { }
        }
        startAudioAnalysis();

        if (!audioContextRef.current) {
          startAudioAnalysis();
        }

        const sampleRate = 16000;
        const audioContext = audioContextRef.current;
        const reader = audioStream.getReader();

        const startTime = audioContext.currentTime;
        let nextPlayTime = startTime;

        if (onSpeakingStart) onSpeakingStart();

        let bufferResidue = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const currentChunk = new Uint8Array(bufferResidue.length + value.length);
          currentChunk.set(bufferResidue);
          currentChunk.set(value, bufferResidue.length);

          let processChunk;
          if (currentChunk.length % 2 !== 0) {
            bufferResidue = currentChunk.slice(currentChunk.length - 1);
            processChunk = currentChunk.slice(0, currentChunk.length - 1);
          } else {
            bufferResidue = new Uint8Array(0);
            processChunk = currentChunk;
          }

          if (processChunk.length === 0) continue;

          const raw16 = new Int16Array(processChunk.buffer, processChunk.byteOffset, processChunk.byteLength / 2);
          const float32Array = new Float32Array(raw16.length);
          for (let i = 0; i < raw16.length; i++) {
            float32Array[i] = raw16[i] / 32768.0;
          }

          const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
          audioBuffer.getChannelData(0).set(float32Array);

          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          if (analyserRef.current) {
            source.connect(analyserRef.current);
            analyserRef.current.connect(audioContext.destination);
          } else {
            source.connect(audioContext.destination);
          }

          if (nextPlayTime < audioContext.currentTime) {
            nextPlayTime = audioContext.currentTime;
          }

          source.start(nextPlayTime);
          nextPlayTime += audioBuffer.duration;
        }

        const waitTime = nextPlayTime - audioContext.currentTime;
        if (waitTime > 0) {
          await new Promise(r => setTimeout(r, waitTime * 1000));
        }

        if (modelRef.current) {
          try { modelRef.current.motion('Idle', 0); } catch (e) { }
        }
        live2dStateRef.current.isSpeaking = false;
        live2dStateRef.current.targetMouthOpen = 0;
      }
    } catch (err) {
      console.error('Audio play error:', err);
      setStatus('Lỗi AI nói: ' + err.message);
      if (onSpeakingStart) onSpeakingStart();
      if (avatarType === 'live2d') live2dStateRef.current.isSpeaking = false;
    } finally {
      setIsSpeaking(false);
      setStatus('Nhấn giữ nút micro để nói (hoặc gõ vào hộp văn bản)');
    }
  };

  // --- Core Interview Flow ---
  const startInterview = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setError(null);
    setMessages([]);
    sessionIdRef.current = generateSessionId();
    setIsConnected(true); // Mounts the avatar panel content
  };

  const startSimli = async () => {
    try {
      const { session_token } = await getSimliSessionToken(SIMLI_FACE_ID);
      const iceServers = await getSimliIceServers();

      if (simliClientRef.current) {
        simliClientRef.current.stop();
        simliClientRef.current = null;
      }

      const simliClient = new SimliClient(
        session_token,
        videoRef.current,
        audioRef.current,
        iceServers,
        LogLevel.DEBUG,
        "p2p"
      );

      await simliClient.start();
      simliClientRef.current = simliClient;
      setIsVideoReady(true);
      return true;
    } catch (err) {
      console.error("Simli error:", err);
      return false;
    }
  };

  // Effect to load Live2D or Simli after canvas/video connects
  useEffect(() => {
    if (isConnected) {
      if (avatarType === 'simli') {
        setStatus('Đang kết nối Simli WebRTC...');
        startSimli().then(success => {
          if (!success) {
            setError("Lỗi kết nối Simli.");
            setIsStarting(false);
            setIsConnected(false);
            return;
          }
          setIsProcessing(true);
          setStatus('AI đang chuẩn bị...');
          resumeInterview();
        });
      } else {
        if (canvasRef.current && areScriptsLoaded) {
          setStatus('Đang tải Live2D model...');
          initLive2D().then(success => {
            if (!success) {
              setError("Lỗi tải Live2D model.");
              setIsStarting(false);
              setIsConnected(false);
              return;
            }
            setIsProcessing(true);
            setStatus('AI đang chuẩn bị...');
            resumeInterview();
          });
        }
      }
    }
  }, [isConnected, areScriptsLoaded, avatarType]);

  const resumeInterview = async () => {
    try {
      const data = await sendChatMessage(sessionIdRef.current, '', true, interviewTopic, avatarType);
      const cleanedResponse = cleanMessageContent(data.response);

      const placeholderId = Date.now();
      setMessages([{
        role: 'ai',
        content: '💭 Đang suy nghĩ...',
        timestamp: placeholderId,
        isPlaceholder: true
      }]);

      await speakAI(data.audioStream, data.response, () => {
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
      setIsStarting(false);
      setStatus('Nhấn giữ nút micro để nói (hoặc gõ vào hộp văn bản)');
    }
  };

  const addMessage = (role, content) => {
    if (!content.trim()) return;
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
    if (!text || !text.trim()) return;
    setManualInput('');
    addMessage('user', text);
    setTranscript('');
    setStatus('AI đang suy nghĩ...');

    try {
      const data = await sendChatMessage(sessionIdRef.current, text, false, null, avatarType);
      const cleanedResponse = cleanMessageContent(data.response);

      const placeholderId = Date.now();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '💭 Đang suy nghĩ...',
        timestamp: placeholderId,
        isPlaceholder: true
      }]);

      await speakAI(data.audioStream, data.response, () => {
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
    endInterviewCleanup();
    setMessages([]);
    setStatus('Cài đặt chủ đề và nhấn bắt đầu để phỏng vấn');
    toast.success('Phỏng vấn đã kết thúc');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
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
              <p className="text-xs text-muted-foreground hidden sm:block">Phỏng vấn ảo với AI (Live2D)</p>
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-gradient-to-br from-[#1a1f35] via-[#0c0f1a] to-[#2a1f4e]">
                {isConnected ? (
                  <>
                    {avatarType === 'live2d' ? (
                      <canvas
                        ref={canvasRef}
                        className={cn(
                          "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                          isVideoReady ? "opacity-100" : "opacity-0"
                        )}
                      />
                    ) : (
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
                        <audio ref={audioRef} autoPlay />
                      </>
                    )}

                    <div className="absolute top-3 left-3 z-20">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "backdrop-blur-sm",
                          !isVideoReady && "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                          isVideoReady && "bg-green-500/20 text-green-600 border-green-500/30",
                          error && "bg-red-500/20 text-red-600 border-red-500/30"
                        )}
                      >
                        <CircleDot className={cn(
                          "h-3 w-3 mr-1",
                          !isVideoReady && "animate-pulse",
                          isVideoReady && "text-green-500"
                        )} />
                        {!isVideoReady ? 'Đang chuẩn bị...' : error ? 'Lỗi' : 'Sẵn sàng'}
                      </Badge>
                    </div>

                    {!isVideoReady && !error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted/80 to-muted z-10">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-sm font-medium animate-pulse">
                          {avatarType === 'live2d' ? 'Đang tải Live2D model...' : 'Đang kết nối Simli...'}
                        </p>
                      </div>
                    )}

                    {isSpeaking && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                          <div className="flex gap-1 h-3 items-center">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="w-1 bg-primary rounded-full animate-pulse"
                                style={{
                                  height: `${40 + Math.random() * 60}%`,
                                  animationDelay: `${i * 0.15}s`,
                                  animationDuration: '0.5s'
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-white ml-1">AI đang phản hồi</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/20">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner">
                        <Bot className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">AI Phỏng vấn viên</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-xs text-balance">Mô hình AI tương tác trực quan qua hình đại diện 2D</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {!isConnected && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-4 px-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <Label htmlFor="interview-topic" className="text-sm font-medium cursor-pointer">
                          Chủ đề phỏng vấn
                        </Label>
                      </div>
                      <Input
                        id="interview-topic"
                        type="text"
                        placeholder="Ví dụ: Backend Developer, Data Analyst, Marketing..."
                        value={interviewTopic}
                        onChange={(e) => setInterviewTopic(e.target.value)}
                        className="bg-background focus-visible:ring-primary/50"
                      />
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <Label htmlFor="avatar-type" className="text-sm font-medium cursor-pointer">
                          Loại Avatar
                        </Label>
                      </div>
                      <Select value={avatarType} onValueChange={setAvatarType}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Chọn loại Avatar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simli">Simli (Real-video, Phù hợp cấu hình cao)</SelectItem>
                          <SelectItem value="live2d">Live2D (Hoạt hình 2D, Nhẹ & Nhanh)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Simli dùng WebRTC tạo video người thật. Live2D dùng mô hình Anime nhẹ.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={cn(
              "transition-all duration-300",
              error ? "border-destructive bg-destructive/10" : "bg-card shadow-sm"
            )}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                  ) : error ? (
                    <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                      <span className="text-destructive font-bold text-xs">!</span>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <p className={cn(
                    "text-sm font-medium",
                    error ? "text-destructive" : "text-foreground/80"
                  )}>
                    {error || status}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="flex flex-col h-[500px] lg:h-auto shadow-md border-border/60">
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Nội dung trò chuyện
              </CardTitle>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-primary/60" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {isConnected ? "Chuẩn bị câu hỏi..." : "Bắt đầu phỏng vấn để trò chuyện"}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                        msg.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-border">
                        {msg.role === 'ai' ? (
                          <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            AI
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className={cn(
                        "max-w-[85%] space-y-1.5",
                        msg.role === 'user' && "items-end"
                      )}>
                        <p className={cn(
                          "text-[11px] font-medium text-muted-foreground uppercase tracking-wider",
                          msg.role === 'user' && "text-right"
                        )}>
                          {msg.role === 'ai' ? 'Haru AI' : 'Bạn'}
                        </p>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 text-[14.5px] shadow-sm leading-relaxed",
                          msg.role === 'ai'
                            ? "bg-muted/80 rounded-tl-sm text-foreground"
                            : "bg-primary text-primary-foreground rounded-tr-sm"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} className="h-2" />
                </div>
              )}
            </ScrollArea>

            {transcript && (
              <div className="border-t px-4 py-3 bg-card animate-in fade-in fill-mode-both">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                  </span>
                  <p className="text-sm text-foreground/90 italic truncate pr-2">
                    "{transcript}"
                  </p>
                </div>
              </div>
            )}

            {/* Thêm input text phụ nếu user không có mic hoặc lười nói */}
            {isConnected && (
              <div className="border-t px-4 py-3 bg-card flex gap-2">
                <Input
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  disabled={isProcessing || isSpeaking}
                  placeholder="Hoặc bạn có thể gõ nội dung chat vào đây..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && manualInput.trim()) {
                      setIsProcessing(true);
                      processUserMessage(manualInput);
                    }
                  }}
                />
                <Button
                  size="icon"
                  disabled={!manualInput.trim() || isProcessing || isSpeaking}
                  onClick={() => {
                    setIsProcessing(true);
                    processUserMessage(manualInput);
                  }}
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Controls Footer */}
      <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div className="container mx-auto px-4 py-4">
          {isConnected && interviewTopic && (
            <div className="flex items-center justify-center gap-2 mb-3 max-w-md mx-auto truncate">
              <Target className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[13px] text-muted-foreground truncate">
                Chủ đề: <span className="font-semibold text-foreground">{interviewTopic}</span>
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={startInterview}
                disabled={isStarting || !interviewTopic.trim()}
                className="gap-2 px-8 shadow-lg hover:shadow-primary/25 transition-all text-base rounded-full h-12"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang thiết lập...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" />
                    Bắt đầu phỏng vấn
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-4 w-full sm:w-auto mt-2 sm:mt-0 px-2 sm:px-0">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className={cn(
                    "gap-2 flex-1 sm:min-w-[200px] transition-all duration-200 rounded-full h-12 text-base font-medium",
                    isRecording && "animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-[0.98]",
                    !isRecording && !isProcessing && !isSpeaking && "hover:shadow-lg shadow-primary/20"
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
                      Đang ghi âm...
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
                  className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full shrink-0 h-12 px-6"
                >
                  <Phone className="h-5 w-5 rotate-[135deg]" />
                  <span className="hidden sm:inline font-medium">Kết thúc</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AIInterviewPage;
