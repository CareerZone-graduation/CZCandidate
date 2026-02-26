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
    getSimliSessionToken,
    getSimliIceServers
} from '@/services/aiInterviewService';
import { SimliClient, LogLevel } from 'simli-client';

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const SIMLI_FACE_ID = "0c2b8b04-5274-41f1-a21c-d5c98322efa9";

const AIAssistantInterview = () => {
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
    const [interviewTopic, setInterviewTopic] = useState('Business Analyst');

    // Refs
    const sessionIdRef = useRef(generateSessionId());
    const mediaRecorderRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Simli Refs
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const simliClientRef = useRef(null);

    const cleanMessageContent = (text) => (text || '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        return () => {
            stopRecording();
            endInterviewCleanup();
        };
    }, []);

    const endInterviewCleanup = () => {
        if (simliClientRef.current) {
            simliClientRef.current.stop();
            simliClientRef.current = null;
        }
        setIsConnected(false);
        setIsVideoReady(false);
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

    const speakAI = async (audioStream, text, onSpeakingStart) => {
        setIsSpeaking(true);
        setStatus('AI đang nói...');

        try {
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

            // Allow some time for Simli to finish lip-sync animation
            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error('Audio play error:', err);
            setStatus('Lỗi AI nói: ' + err.message);
            if (onSpeakingStart) onSpeakingStart();
        } finally {
            setIsSpeaking(false);
            setStatus('Nhấn giữ nút micro để nói (hoặc gõ vào hộp văn bản)');
        }
    };

    const startInterview = async () => {
        if (isStarting) return;
        setIsStarting(true);
        setError(null);
        setMessages([]);
        sessionIdRef.current = generateSessionId();
        setIsConnected(true);
    };

    useEffect(() => {
        if (isConnected) {
            setStatus('Đang kết nối Assistant...');
            startSimli().then(success => {
                if (!success) {
                    setError("Lỗi kết nối Simli WebRTC.");
                    setIsStarting(false);
                    setIsConnected(false);
                    return;
                }
                setIsProcessing(true);
                setStatus('Assistant đang chuẩn bị...');
                resumeInterview();
            });
        }
    }, [isConnected]);

    const resumeInterview = async () => {
        try {
            const data = await sendChatMessage(sessionIdRef.current, '', true, interviewTopic, 'simli');
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
            const data = await sendChatMessage(sessionIdRef.current, text, false, null, 'simli');
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-gradient-to-br from-slate-100 via-background to-blue-50 dark:to-[#0c1424] flex flex-col">
            <header className="sticky top-0 z-50 border-b border-blue-100 dark:border-blue-900 bg-background/80 backdrop-blur-lg">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/interviews/ai')}
                        className="gap-2 text-slate-600 dark:text-slate-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Quay lại</span>
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                AI Assistant
                            </h1>
                            <p className="text-xs text-slate-500 hidden sm:block">Chuyên gia tuyển dụng ảo</p>
                        </div>
                    </div>
                    <div className="w-20" />
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full max-w-6xl mx-auto">
                    {/* Avatar Section */}
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl">
                            <div className="relative aspect-square sm:aspect-video lg:aspect-square bg-slate-900">
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
                                        <audio ref={audioRef} autoPlay />

                                        <div className="absolute top-3 left-3 z-20">
                                            <Badge
                                                variant="secondary"
                                                className={cn(
                                                    "backdrop-blur-md shadow-sm border",
                                                    !isVideoReady && "bg-slate-800/80 text-yellow-400 border-slate-700/50",
                                                    isVideoReady && "bg-slate-800/80 text-emerald-400 border-slate-700/50",
                                                    error && "bg-red-900/80 text-red-400 border-red-800/50"
                                                )}
                                            >
                                                <CircleDot className={cn(
                                                    "h-3 w-3 mr-1",
                                                    !isVideoReady && "animate-pulse",
                                                    isVideoReady && "text-emerald-500",
                                                    error && "text-red-500"
                                                )} />
                                                {!isVideoReady ? 'Connecting...' : error ? 'Error' : 'Connected'}
                                            </Badge>
                                        </div>

                                        {!isVideoReady && !error && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10 backdrop-blur-sm">
                                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                                                <p className="text-sm font-medium animate-pulse text-slate-300">
                                                    Đang kết nối luồng video bảo mật...
                                                </p>
                                            </div>
                                        )}

                                        {isSpeaking && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700">
                                                    <div className="flex gap-1 h-3 items-center">
                                                        {[0, 1, 2, 3, 4].map((i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1 bg-blue-500 rounded-full animate-pulse"
                                                                style={{
                                                                    height: `${40 + Math.random() * 60}%`,
                                                                    animationDelay: `${i * 0.15}s`,
                                                                    animationDuration: '0.5s'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs font-semibold text-white ml-1">AI Speaking</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-800">
                                        <div className="relative">
                                            <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center shadow-lg border-2 border-slate-600">
                                                <Video className="h-10 w-10 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="text-center z-10 p-4">
                                            <p className="font-semibold text-slate-200">Video Call Interview</p>
                                            <p className="text-sm text-slate-400 mt-1">Giao diện phỏng vấn giả lập người thật qua kết nối WebRTC bảo mật.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {!isConnected && (
                            <Card className="border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-sm">
                                <CardContent className="py-4 px-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <Label htmlFor="interview-topic" className="text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300">
                                                    Vị trí ứng tuyển
                                                </Label>
                                            </div>
                                            <Input
                                                id="interview-topic"
                                                type="text"
                                                placeholder="Ví dụ: Project Manager, Marketing Executive..."
                                                value={interviewTopic}
                                                onChange={(e) => setInterviewTopic(e.target.value)}
                                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-600"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className={cn(
                            "transition-all duration-300 rounded-xl shadow-sm border-slate-200 dark:border-slate-800",
                            error ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "bg-white dark:bg-slate-900/80 backdrop-blur-md"
                        )}>
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    {isProcessing ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
                                    ) : error ? (
                                        <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                            <span className="text-red-600 dark:text-red-400 font-bold text-xs">!</span>
                                        </div>
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                            <Mic className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                    <p className={cn(
                                        "text-sm font-medium",
                                        error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        {error || status}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat Section */}
                    <Card className="flex flex-col h-[500px] lg:h-auto shadow-xl border-slate-200 dark:border-slate-800 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md overflow-hidden">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Transcript
                            </CardTitle>
                        </CardHeader>

                        <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/30">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                                        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        {isConnected ? "Đang chuẩn bị phiên phỏng vấn..." : "Nội dung cuộc gọi hội nghị"}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                msg.role === 'user' && "flex-row-reverse"
                                            )}
                                        >
                                            <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
                                                {msg.role === 'ai' ? (
                                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                                                        AI
                                                    </AvatarFallback>
                                                ) : (
                                                    <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>

                                            <div className={cn(
                                                "max-w-[85%] space-y-1",
                                                msg.role === 'user' && "items-end text-right"
                                            )}>
                                                <p className={cn(
                                                    "text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider",
                                                )}>
                                                    {msg.role === 'ai' ? 'Trợ lý tuyển dụng' : 'Ứng viên'}
                                                </p>
                                                <div className={cn(
                                                    "px-4 py-2.5 text-[14px] leading-relaxed rounded-2xl shadow-sm border",
                                                    msg.role === 'ai'
                                                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-tl-sm text-slate-800 dark:text-slate-200"
                                                        : "bg-blue-600 border-blue-600 text-white rounded-tr-sm"
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
                            <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 animate-in fade-in fill-mode-both">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                                    </span>
                                    <p className="text-[13px] text-slate-600 dark:text-slate-400 font-mono truncate pr-2">
                                        {transcript}
                                    </p>
                                </div>
                            </div>
                        )}

                        {isConnected && (
                            <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-900 flex gap-2">
                                <Input
                                    value={manualInput}
                                    onChange={e => setManualInput(e.target.value)}
                                    disabled={isProcessing || isSpeaking}
                                    placeholder="Gõ văn bản..."
                                    className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && manualInput.trim()) {
                                            setIsProcessing(true);
                                            processUserMessage(manualInput);
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 shrink-0"
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
            <footer className="sticky bottom-0 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-40">
                <div className="container mx-auto px-4 py-4">
                    {isConnected && interviewTopic && (
                        <div className="flex items-center justify-center gap-2 mb-3 max-w-md mx-auto truncate">
                            <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-normal">
                                Subject: <span className="font-semibold text-slate-900 dark:text-slate-100 ml-1">{interviewTopic}</span>
                            </Badge>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        {!isConnected ? (
                            <Button
                                size="lg"
                                onClick={startInterview}
                                disabled={isStarting || !interviewTopic.trim()}
                                className="gap-2 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium h-12"
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Video className="h-4 w-4" />
                                        Tham gia phỏng vấn
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0 px-2 sm:px-0">
                                <Button
                                    variant={isRecording ? "destructive" : "default"}
                                    size="lg"
                                    className={cn(
                                        "gap-2 flex-1 sm:min-w-[220px] transition-all duration-200 h-12 text-sm font-semibold rounded-lg",
                                        isRecording && "bg-red-600 hover:bg-red-700 shadow-inner",
                                        !isRecording && !isProcessing && !isSpeaking && "bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
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
                                            <MicOff className="h-4 w-4" />
                                            Nhả ra để kết thúc nói
                                        </>
                                    ) : isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="h-4 w-4" />
                                            Giữ nút để trả lời
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={endInterview}
                                    className="gap-2 shrink-0 h-12 px-6 rounded-lg font-semibold bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border-0"
                                >
                                    <Phone className="h-4 w-4 rotate-[135deg]" />
                                    <span className="hidden sm:inline">Rời khỏi</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AIAssistantInterview;
