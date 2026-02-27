import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    transcribeAudio
} from '@/services/aiInterviewService';

// Initialize PIXI for pixi-live2d-display
import * as PIXI from 'pixi.js';
window.PIXI = PIXI;

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const MODEL_URLS = {
    haru: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',
    senko: 'https://cdn.jsdelivr.net/gh/Eikanya/Live2d-model/Live2D/Senko_Normals/senko.model3.json',
    shizuku: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json',
    koharu: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-koharu/assets/koharu.model.json',
    miku: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-miku/assets/miku.model.json',
    unitychan: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-unitychan/assets/unitychan.model.json',
    chitose: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-chitose/assets/chitose.model.json',
    hijiki: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-hijiki/assets/hijiki.model.json',
    tororo: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-tororo/assets/tororo.model.json',
    z16: 'https://cdn.jsdelivr.net/gh/xiazeyu/live2d-widget-models/packages/live2d-widget-model-z16/assets/z16.model.json',
};

const AnimeInterviewPage = () => {
    const navigate = useNavigate();

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState([]);
    const [manualInput, setManualInput] = useState('');
    const [status, setStatus] = useState('Nhấn "Bắt đầu phỏng vấn" để khởi động');
    const [error, setError] = useState(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [interviewTopic, setInterviewTopic] = useState('Frontend Developer');
    const [selectedModelKey, setSelectedModelKey] = useState('haru');

    // Refs
    const sessionIdRef = useRef(generateSessionId());
    const mediaRecorderRef = useRef(null);
    const canvasRef = useRef(null);
    const messagesEndRef = useRef(null);

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

    const cleanMessageContent = (text) => (text || '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            stopRecording();
            endInterviewCleanup();
            cancelAnimationFrame(animationFrameRef.current);
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
                appRef.current = null;
            }
        };
    }, []);

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
                const originalDefine = window.define;
                const originalExports = window.exports;
                window.define = undefined;
                window.exports = undefined;

                await loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js');
                await loadScript('https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js');

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

    const initLive2D = async () => {
        if (!canvasRef.current || !areScriptsLoaded) return false;

        setIsVideoReady(false);

        if (!appRef.current) {
            appRef.current = new PIXI.Application({
                view: canvasRef.current,
                autoStart: true,
                resizeTo: canvasRef.current.parentElement,
                backgroundAlpha: 0,
                antialias: true,
            });

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

            const { Live2DModel } = await import('pixi-live2d-display');
            const model = await Live2DModel.from(MODEL_URLS[selectedModelKey], { autoInteract: false });
            modelRef.current = model;
            appRef.current.stage.addChild(model);

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

            const stageW = appRef.current.screen.width;
            const stageH = appRef.current.screen.height;
            const scale = Math.min(stageW / model.width, stageH / model.height) * 1.6;
            model.scale.set(scale);
            model.anchor.set(0.5, 0.5);
            model.x = stageW / 2;
            model.y = stageH * 0.75;

            try { model.motion('Idle'); } catch (e) { }

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
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = new Audio();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        setIsConnected(false);
        live2dStateRef.current.isSpeaking = false;
        live2dStateRef.current.targetMouthOpen = 0;
        live2dStateRef.current.headPhase = 0;
        live2dStateRef.current.breathPhase = 0;
        if (modelRef.current) {
            try { modelRef.current.motion('Idle', 0); } catch (e) { }
        }
    };

    const startAudioAnalysis = async () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
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
        live2dStateRef.current.isSpeaking = true;

        try {
            if (modelRef.current) {
                try { modelRef.current.motion('Tap', 0); } catch (e) { }
            }

            // Đảm bảo AudioContext đã hoàn toàn wake-up trước khi ta lấy currentTime
            await startAudioAnalysis();

            const sampleRate = 16000;
            const audioContext = audioContextRef.current;
            const reader = audioStream.getReader();

            let nextPlayTime = 0;
            let isFirstChunk = true;

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

                // Chốt thời gian phát ngay khi nhận được chunk hợp lệ đầu tiên
                // Cộng thêm 150ms (0.15) làm buffer để loa không bị miss
                if (isFirstChunk) {
                    isFirstChunk = false;
                    nextPlayTime = audioContext.currentTime + 0.15;
                } else if (nextPlayTime < audioContext.currentTime) {
                    // Nếu mạng lag khiến luồng bị đứt đoạn, phải dời mốc nextPlayTime
                    // vượt lên trên currentTime hiện tại của loa để mảng không bị quăng đi
                    nextPlayTime = audioContext.currentTime + 0.01;
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
        } catch (err) {
            console.error('Audio play error:', err);
            setStatus('Lỗi AI nói: ' + err.message);
            if (onSpeakingStart) onSpeakingStart();
            live2dStateRef.current.isSpeaking = false;
        } finally {
            setIsSpeaking(false);
            setStatus('Nhấn giữ nút micro để nói (hoặc gõ vào hộp văn bản)');
        }
    };

    useEffect(() => {
        if (areScriptsLoaded && canvasRef.current) {
            initLive2D().catch(err => {
                console.error("Lỗi tải Live2D model:", err);
                setError("Lỗi tải Live2D model.");
            });
        }
    }, [areScriptsLoaded, selectedModelKey]);

    const startInterview = async () => {
        if (isStarting || !isVideoReady) return;
        setIsStarting(true);
        setError(null);
        setMessages([]);
        sessionIdRef.current = generateSessionId();
        setIsConnected(true);

        try {
            if (!audioContextRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContext();
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            // Tạo 1 âm thanh rỗng siêu ngắn (âm lượng = 0) để ép thiết bị mở luồng audio
            const osc = audioContextRef.current.createOscillator();
            const gainNode = audioContextRef.current.createGain();
            gainNode.gain.value = 0;
            osc.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            osc.start();
            osc.stop(audioContextRef.current.currentTime + 0.01);
        } catch (e) {
            console.warn("Lỗi warm-up audio:", e);
        }

        setIsProcessing(true);
        setStatus('AI đang chuẩn bị...');
        resumeInterview();
    };

    const resumeInterview = async () => {
        try {
            const data = await sendChatMessage(sessionIdRef.current, '', true, interviewTopic, 'live2d');
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
            const data = await sendChatMessage(sessionIdRef.current, text, false, null, 'live2d');
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
        <div className="min-h-screen bg-[#FFF0F5] dark:bg-[#2A1F4E] bg-gradient-to-br from-[#FFF0F5] via-background to-[#E6E6FA] dark:to-[#0c0f1a] flex flex-col">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/interviews/ai')}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Quay lại</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Anime Interview
                            </h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">Trải nghiệm tương tác với nhân vật 2D</p>
                        </div>
                    </div>
                    <div className="w-20" />
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
                    {/* Avatar Section */}
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden border-2 border-pink-200 dark:border-purple-800 shadow-xl rounded-2xl">
                            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-[url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366')] bg-cover bg-center">
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px]"></div>

                                <canvas
                                    ref={canvasRef}
                                    className={cn(
                                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none z-[5]",
                                        isVideoReady ? "opacity-100" : "opacity-0"
                                    )}
                                />

                                {isConnected && (
                                    <div className="absolute top-3 left-3 z-20">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "backdrop-blur-md shadow-sm",
                                                !isVideoReady && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                                isVideoReady && "bg-green-100 text-green-700 border-green-200",
                                                error && "bg-red-100 text-red-700 border-red-200"
                                            )}
                                        >
                                            <CircleDot className={cn(
                                                "h-3 w-3 mr-1",
                                                !isVideoReady && "animate-pulse",
                                                isVideoReady && "text-green-500"
                                            )} />
                                            {!isVideoReady ? 'Đang gọi Anime...' : error ? 'Lỗi' : 'Sẵn sàng'}
                                        </Badge>
                                    </div>
                                )}

                                {!isVideoReady && !error && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
                                        <Loader2 className="h-10 w-10 text-pink-500 animate-spin mb-4" />
                                        <p className="text-sm font-medium animate-pulse text-foreground/80">
                                            Đang tải nhân vật Live2D...
                                        </p>
                                    </div>
                                )}

                                {isConnected && isSpeaking && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                                            <div className="flex gap-1 h-3 items-center">
                                                {[0, 1, 2, 3, 4].map((i) => (
                                                    <div
                                                        key={i}
                                                        className="w-1 bg-pink-400 rounded-full animate-pulse"
                                                        style={{
                                                            height: `${40 + Math.random() * 60}%`,
                                                            animationDelay: `${i * 0.15}s`,
                                                            animationDuration: '0.5s'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs font-semibold text-white ml-1">Đang trò chuyện</span>
                                        </div>
                                    </div>
                                )}

                                {!isConnected && isVideoReady && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                        <div className="text-center p-3 sm:p-4 bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-pink-200 dark:border-purple-800">
                                            <p className="font-bold text-foreground">Bạn đã sẵn sàng?</p>
                                            <p className="text-xs sm:text-sm text-foreground/80 mt-1">Cùng trải nghiệm phỏng vấn thú vị!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {!isConnected && (
                            <Card className="border-pink-200 dark:border-purple-800 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-2xl shadow-sm">
                                <CardContent className="py-4 px-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-pink-500" />
                                                <Label htmlFor="interview-topic" className="text-sm font-bold cursor-pointer">
                                                    Chủ đề phỏng vấn
                                                </Label>
                                            </div>
                                            <Input
                                                id="interview-topic"
                                                type="text"
                                                placeholder="Ví dụ: Backend Developer..."
                                                value={interviewTopic}
                                                onChange={(e) => setInterviewTopic(e.target.value)}
                                                className="bg-white/80 dark:bg-background/80 border-pink-200 dark:border-purple-800 focus-visible:ring-pink-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-pink-500" />
                                                <Label htmlFor="model-select" className="text-sm font-bold cursor-pointer">
                                                    Biểu tượng Anime
                                                </Label>
                                            </div>
                                            <Select value={selectedModelKey} onValueChange={setSelectedModelKey}>
                                                <SelectTrigger className="bg-white/80 dark:bg-background/80 border-pink-200 dark:border-purple-800 focus-visible:ring-pink-500">
                                                    <SelectValue placeholder="Chọn nhân vật" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Cubism 4 (Hiện đại)</SelectLabel>
                                                        <SelectItem value="haru">Haru</SelectItem>
                                                        <SelectItem value="senko">Senko</SelectItem>
                                                    </SelectGroup>
                                                    <SelectGroup>
                                                        <SelectLabel>Cubism 2 (Cổ điển)</SelectLabel>
                                                        <SelectItem value="shizuku">Shizuku</SelectItem>
                                                        <SelectItem value="koharu">Koharu</SelectItem>
                                                        <SelectItem value="miku">Miku</SelectItem>
                                                        <SelectItem value="unitychan">Unity-chan</SelectItem>
                                                        <SelectItem value="chitose">Chitose</SelectItem>
                                                        <SelectItem value="hijiki">Hijiki (Mèo)</SelectItem>
                                                        <SelectItem value="tororo">Tororo (Mèo)</SelectItem>
                                                        <SelectItem value="z16">Z16</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={cn(
                            "transition-all duration-300 rounded-2xl shadow-sm border-pink-100 dark:border-purple-900",
                            error ? "border-destructive bg-destructive/10" : "bg-white/80 dark:bg-black/40 backdrop-blur-md"
                        )}>
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    {isProcessing ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-pink-500 shrink-0" />
                                    ) : error ? (
                                        <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                                            <span className="text-destructive font-bold text-xs">!</span>
                                        </div>
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-pink-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                                            <Mic className="h-3 w-3 text-pink-500" />
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
                    <Card className="flex flex-col h-[500px] lg:h-auto shadow-xl border-pink-200 dark:border-purple-800 rounded-2xl bg-white/90 dark:bg-background/90 backdrop-blur-md">
                        <CardHeader className="pb-3 border-b border-pink-100 dark:border-purple-900 bg-pink-50/50 dark:bg-purple-900/20 rounded-t-2xl">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-pink-500" />
                                Đoạn chat
                            </CardTitle>
                        </CardHeader>

                        <ScrollArea className="flex-1 p-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="h-16 w-16 rounded-full bg-pink-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                                        <MessageSquare className="h-8 w-8 text-pink-400" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        {isConnected ? "Haru đang chuẩn bị câu hỏi..." : "Trò chuyện sẽ hiển thị ở đây"}
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
                                                    <AvatarFallback className="bg-pink-100 text-pink-600 font-bold border-pink-200">
                                                        H
                                                    </AvatarFallback>
                                                ) : (
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 border-blue-200">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>

                                            <div className={cn(
                                                "max-w-[85%] space-y-1.5",
                                                msg.role === 'user' && "items-end"
                                            )}>
                                                <p className={cn(
                                                    "text-[11px] font-bold text-muted-foreground uppercase tracking-wider",
                                                    msg.role === 'user' && "text-right"
                                                )}>
                                                    {msg.role === 'ai' ? 'Haru' : 'Bạn'}
                                                </p>
                                                <div className={cn(
                                                    "rounded-2xl px-4 py-3 text-[14.5px] shadow-sm leading-relaxed",
                                                    msg.role === 'ai'
                                                        ? "bg-white dark:bg-muted border border-pink-100 dark:border-purple-900 rounded-tl-sm text-foreground"
                                                        : "bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-tr-sm"
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
                            <div className="border-t border-pink-100 dark:border-purple-900 px-4 py-3 bg-card animate-in fade-in fill-mode-both">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
                                    </span>
                                    <p className="text-sm text-foreground/90 italic truncate pr-2">
                                        "{transcript}"
                                    </p>
                                </div>
                            </div>
                        )}

                        {isConnected && (
                            <div className="border-t border-pink-100 dark:border-purple-900 px-4 py-3 bg-white/50 dark:bg-black/20 flex gap-2 rounded-b-2xl">
                                <Input
                                    value={manualInput}
                                    onChange={e => setManualInput(e.target.value)}
                                    disabled={isProcessing || isSpeaking}
                                    placeholder="Gõ tin nhắn..."
                                    className="bg-white dark:bg-background border-pink-200 dark:border-purple-800"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && manualInput.trim()) {
                                            setIsProcessing(true);
                                            processUserMessage(manualInput);
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="bg-pink-500 hover:bg-pink-600 text-white"
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
            <footer className="sticky bottom-0 border-t border-pink-200 dark:border-purple-800 bg-white/80 dark:bg-background/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
                <div className="container mx-auto px-4 py-4">
                    {isConnected && interviewTopic && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 mx-auto px-4">
                            <div className="flex items-center gap-2 bg-pink-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full border border-pink-100 dark:border-purple-800">
                                <Sparkles className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                                <span className="text-[13px] text-pink-700 dark:text-pink-300 font-medium truncate max-w-[200px]">
                                    Chủ đề: {interviewTopic}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-50 dark:bg-pink-900/30 px-3 py-1.5 rounded-full border border-purple-100 dark:border-pink-800">
                                <User className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                <span className="text-[13px] text-purple-700 dark:text-purple-300 font-medium truncate px-1">
                                    {selectedModelKey.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                        {!isConnected ? (
                            <Button
                                size="lg"
                                onClick={startInterview}
                                disabled={isStarting || !interviewTopic.trim() || !isVideoReady}
                                className="gap-2 px-8 shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all text-base rounded-full h-12"
                            >
                                {!isVideoReady ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang tải mô hình...
                                    </>
                                ) : isStarting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang bắt đầu...
                                    </>
                                ) : (
                                    <>
                                        <Bot className="h-5 w-5" />
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
                                        "gap-2 flex-1 sm:min-w-[200px] transition-all duration-200 rounded-full h-12 text-base font-bold",
                                        isRecording && "bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-[0.98]",
                                        !isRecording && !isProcessing && !isSpeaking && "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/20"
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
                                            Đang phân tích...
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
                                    className="gap-2 border-pink-200 dark:border-purple-800 text-pink-600 hover:bg-pink-50 dark:hover:bg-purple-900/30 rounded-full shrink-0 h-12 px-6 font-bold"
                                >
                                    <Phone className="h-5 w-5 rotate-[135deg]" />
                                    <span className="hidden sm:inline">Chạm chán</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AnimeInterviewPage;
