import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ChatPanel from '@/components/interviews/ChatPanel';
import ConnectionQualityIndicator from '@/components/interviews/ConnectionQualityIndicator';
import HelpPanel from '@/components/interviews/HelpPanel';
import webrtcService from '@/services/webrtc.service';
import interviewSocketService from '@/services/interviewSocket.service';
import { getInterviewById } from '@/services/interviewService';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

/**
 * InterviewRoom Component for Candidate
 * Main interview interface for candidates
 */
const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // State management
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [qualityDetails, setQualityDetails] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRemoteUserJoined, setIsRemoteUserJoined] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasReceivedRemoteStream, setHasReceivedRemoteStream] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [confirmEndCallOpen, setConfirmEndCallOpen] = useState(false);

  // Load interview data
  useEffect(() => {
    const loadInterviewData = async () => {
      try {
        setIsLoading(true);
        const data = await getInterviewById(interviewId);
        setInterviewData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('[InterviewRoom] Failed to load interview:', err);
        setError('Không thể tải thông tin phỏng vấn');
        toast.error('Không thể tải thông tin phỏng vấn');
        setIsLoading(false);
      }
    };

    if (interviewId) {
      loadInterviewData();
    }
  }, [interviewId]);

  // Setup socket connection and event handlers
  useEffect(() => {
    const setupInterview = async () => {
      try {
        // Get token
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        // Connect socket
        await interviewSocketService.connect(token);
        console.log('[InterviewRoom] Socket connected');

        // Get user ID from JWT decode (via socket service)
        const userId = interviewSocketService.getCurrentUserId();
        if (userId) {
          setCurrentUserId(userId); // Still set state for other parts of the UI
          console.log('[InterviewRoom] Current user ID from JWT:', userId);
        } else {
          console.warn('[InterviewRoom] Could not get user ID immediately after connect.');
        }

        // Setup WebRTC FIRST to get local media stream
        console.log('[InterviewRoom] Starting WebRTC setup...');
        await setupWebRTC();
        console.log('[InterviewRoom] WebRTC setup completed, now setting up socket handlers...');

        // Join interview room
        const joinResponse = await interviewSocketService.joinInterview(interviewId, {
          role: 'candidate'
        });
        console.log('[InterviewRoom] Joined interview room, response:', joinResponse);

        // Check if there are existing users in the room
        if (joinResponse.existingUsers && joinResponse.existingUsers.length > 0) {
          console.log('[InterviewRoom] Found existing users:', joinResponse.existingUsers);
          setIsRemoteUserJoined(true);
        } else {
          console.log('[InterviewRoom] No existing users found, waiting for recruiter to join');
        }

        // Setup socket event handlers, passing the stable userId
        setupSocketEventHandlers(userId);
        console.log('[InterviewRoom] Socket event handlers setup completed');

        setIsConnected(true);
      } catch (err) {
        console.error('[InterviewRoom] Setup failed:', err);
        toast.error('Không thể kết nối đến phòng phỏng vấn: ' + err.message);
        setError(err.message);
      }
    };

    if (interviewId && !isLoading) {
      setupInterview();
    }

    // Cleanup
    return () => {
      cleanupInterview();
    };
  }, [interviewId, isLoading]);

  // Debug: Monitor isRemoteUserJoined state changes
  useEffect(() => {
    console.log('[InterviewRoom] isRemoteUserJoined state changed to:', isRemoteUserJoined);
  }, [isRemoteUserJoined]);

  // Effect to update local video when stream or video state changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log('[InterviewRoom] Effect: Updating local video element');
      console.log('[InterviewRoom] Video enabled:', isVideoEnabled);
      console.log('[InterviewRoom] Stream active:', localStream.active);

      localVideoRef.current.srcObject = localStream;

      if (isVideoEnabled) {
        localVideoRef.current.play().catch(e => {
          console.log('[InterviewRoom] Effect: Play failed:', e);
        });
      }
    }
  }, [isVideoEnabled, localStream]);

  const setupSocketEventHandlers = (userId) => {
    // User joined
    interviewSocketService.on('onUserJoined', (data) => {
      console.log('[InterviewRoom] ===== User joined event =====');
      console.log('[InterviewRoom] User data:', data);
      console.log('[InterviewRoom] Setting isRemoteUserJoined to TRUE (user joined event)');
      setIsRemoteUserJoined(true);
      toast.success(`${data.userName || 'Nhà tuyển dụng'} đã tham gia phỏng vấn`);

      // Candidate doesn't initiate - waits for offer from recruiter
      console.log('[InterviewRoom] Candidate waiting for offer from recruiter...');
    });

    // User left
    interviewSocketService.on('onUserLeft', (data) => {
      console.log('[InterviewRoom] User left event received:', data);
      console.log('[InterviewRoom] Setting isRemoteUserJoined to FALSE (user left)');
      setIsRemoteUserJoined(false);
      toast.warning(`${data.userName || 'Nhà tuyển dụng'} đã rời khỏi phỏng vấn`);

      // Clean up WebRTC peer connection when remote user leaves
      if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
        console.log('[InterviewRoom] Cleaning up peer connection due to user leaving');
        webrtcService.closePeerConnection(); // Only close peer, keep local stream
      }

      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // IMPORTANT: Keep local stream active - don't destroy it
      // Local video should remain visible even when peer disconnects
      console.log('[InterviewRoom] Local stream preserved after peer disconnect');
    });

    // Handle peer disconnected event (for abrupt disconnections)
    interviewSocketService.on('onPeerDisconnected', (data) => {
      console.log('[InterviewRoom] Peer disconnected abruptly:', data);
      setIsRemoteUserJoined(false);

      // Clean up peer connection
      if (webrtcService.peerConnection) {
        console.log('[InterviewRoom] Cleaning up peer connection after abrupt disconnect');
        webrtcService.closePeerConnection();
      }

      // Clear remote video
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      // Keep local stream active
      console.log('[InterviewRoom] Local stream preserved after abrupt disconnect');
    });

    // Auth success - get user ID from JWT
    interviewSocketService.on('onAuthSuccess', (data) => {
      console.log('[InterviewRoom] Auth success, user ID:', data.userId);
      // This is a fallback, as we already pass userId to the handler setup
      if (!userId) {
        setCurrentUserId(data.userId);
      }
    });

    // WebRTC signaling - Unified signal handler for native WebRTC
    // Handles offer, answer, and ICE candidates in one event
    interviewSocketService.on('onSignal', async (data) => {
      console.log('[InterviewRoom] ===== Signal received =====');
      console.log('[InterviewRoom] Signal from:', data.from || data.fromUserId || 'remote peer');
      console.log('[InterviewRoom] Current user ID:', userId);
      console.log('[InterviewRoom] Signal type:', data.signal?.type || 'candidate');
      console.log('[InterviewRoom] Peer initialized:', !!webrtcService.peerConnection);

      // Ignore signals from ourselves (avoid self-signaling loop)
      const signalFrom = data.from || data.fromUserId;
      if (signalFrom && signalFrom === userId) {
        console.log('[InterviewRoom] Ignoring signal from self');
        return;
      }

      // Candidate logic: create peer only when receiving the first offer signal
      if (!webrtcService.peerConnection && data.signal?.type === 'offer') {
        console.log('[InterviewRoom] First signal (offer) received, creating peer as answerer');
        try {
          // Ensure we have a valid stream before initializing peer
          const streamToUse = webrtcService.localStream || localStream;
          if (!streamToUse) {
            console.error('[InterviewRoom] No local stream available to create peer. Cannot proceed.');
            toast.error('Không có tín hiệu camera/mic để bắt đầu cuộc gọi.');
            return;
          }

          // Verify stream has tracks
          const hasVideoTrack = streamToUse.getVideoTracks().length > 0;
          const hasAudioTrack = streamToUse.getAudioTracks().length > 0;
          console.log('[InterviewRoom] Stream validation - Video:', hasVideoTrack, 'Audio:', hasAudioTrack);

          if (!hasVideoTrack && !hasAudioTrack) {
            console.error('[InterviewRoom] Stream has no tracks!');
            toast.error('Không thể khởi tạo kết nối - không có audio/video track');
            return;
          }

          console.log('[InterviewRoom] Initializing peer connection as answerer');
          webrtcService.initializePeerConnection(streamToUse);
          console.log('[InterviewRoom] Peer initialized successfully');

          // Process the offer signal immediately
          console.log('[InterviewRoom] Processing offer signal');
          await webrtcService.handleSignal(data.signal);
          return;
        } catch (error) {
          console.error('[InterviewRoom] Failed to initialize peer on-the-fly:', error);
          toast.error('Lỗi khởi tạo kết nối: ' + error.message);
          return;
        }
      }

      // Handle signal if peer already exists
      if (webrtcService.peerConnection) {
        console.log('[InterviewRoom] Handling signal with existing peer. Signal data:', data.signal);
        await webrtcService.handleSignal(data.signal);
      } else if (data.signal?.type !== 'offer') {
        console.warn('[InterviewRoom] Peer not ready for non-offer signal');
      }
    });

    // Chat message
    interviewSocketService.on('onChatMessage', (data) => {
      console.log('[InterviewRoom] Chat message received:', data);
      console.log('[InterviewRoom] Comparing senderId:', data.senderId, 'with userId:', userId);

      // Skip if this is our own message (shouldn't happen with socket.to(), but just in case)
      // Convert both to string for comparison
      if (String(data.senderId) === String(userId)) {
        console.log('[InterviewRoom] Skipping own message from socket event');
        return;
      }

      const newMessage = {
        id: data._id || data.messageId || Date.now(),
        senderId: data.senderId,
        senderName: data.senderName || 'Nhà tuyển dụng',
        message: data.message,
        timestamp: new Date(data.timestamp)
      };
      setChatMessages(prev => [...prev, newMessage]);
    });

    // Recording notifications
    interviewSocketService.on('onRecordingStarted', (data) => {
      console.log('[InterviewRoom] Recording started:', data);
      setIsRecording(true);
      toast.info('Nhà tuyển dụng đã bắt đầu ghi hình', {
        description: 'Cuộc phỏng vấn đang được ghi lại.'
      });
    });

    interviewSocketService.on('onRecordingStopped', (data) => {
      console.log('[InterviewRoom] Recording stopped:', data);
      setIsRecording(false);
      toast.info('Nhà tuyển dụng đã dừng ghi hình');
    });

    // Interview ended
    interviewSocketService.on('onInterviewEnded', (data) => {
      console.log('[InterviewRoom] Interview ended:', data);
      toast.info('Phỏng vấn đã kết thúc', {
        description: 'Cảm ơn bạn đã tham gia!'
      });
      setTimeout(() => {
        navigate('/interviews');
      }, 3000);
    });

    // Socket disconnect/reconnect
    interviewSocketService.on('onDisconnect', (reason) => {
      console.warn('[InterviewRoom] Socket disconnected:', reason);
      setIsConnected(false);
      toast.warning('Mất kết nối. Đang thử kết nối lại...');
    });

    interviewSocketService.on('onReconnect', () => {
      console.log('[InterviewRoom] Socket reconnected');
      setIsConnected(true);
      toast.success('Đã kết nối lại');
    });
  };

  const setupWebRTC = async () => {
    try {
      console.log('[InterviewRoom] Setting up WebRTC');

      // Load device settings from localStorage
      const savedSettings = localStorage.getItem('interviewDeviceSettings');
      const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
      console.log('[InterviewRoom] Using device settings:', deviceSettings);

      // Build constraints with specific device IDs using EXACT match
      let constraints = {
        video: isVideoEnabled ? {
          deviceId: deviceSettings.videoDeviceId ? { exact: deviceSettings.videoDeviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: isAudioEnabled ? {
          deviceId: deviceSettings.audioDeviceId ? { exact: deviceSettings.audioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      // Try to get user media with specific device constraints
      let stream;
      try {
        console.log('[InterviewRoom] Requesting media with exact device IDs:', {
          video: deviceSettings.videoDeviceId,
          audio: deviceSettings.audioDeviceId
        });
        stream = await webrtcService.getUserMedia(constraints);
        console.log('[InterviewRoom] Successfully got media with selected devices');
      } catch (error) {
        console.warn('[InterviewRoom] Failed with exact device IDs, trying fallback:', error);

        // Fallback to basic constraints without specific device IDs
        const fallbackConstraints = {
          video: isVideoEnabled ? {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } : false,
          audio: isAudioEnabled ? {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } : false
        };

        stream = await webrtcService.getUserMedia(fallbackConstraints);
        console.log('[InterviewRoom] Using fallback default devices');
        toast.warning('Không thể sử dụng thiết bị đã chọn, đang dùng thiết bị mặc định');
      }

      // Log which devices are actually being used
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log('[InterviewRoom] ✓ Using video device:', videoTrack.label, 'ID:', settings.deviceId);
      }
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('[InterviewRoom] ✓ Using audio device:', audioTrack.label, 'ID:', settings.deviceId);
      }

      // Attach to local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup WebRTC event handlers BEFORE initializing peer connection
      // Clear any existing handlers first to avoid duplicates
      webrtcService.eventHandlers.clear();

      // With simple-peer, all signaling (offer/answer/ICE) goes through onSignal
      webrtcService.on('onSignal', (signal) => {
        console.log('[InterviewRoom] Sending signal:', signal.type || 'candidate');
        interviewSocketService.sendSignal(interviewId, signal);
      });

      webrtcService.on('onRemoteStream', (remoteStream) => {
        console.log('[InterviewRoom] ===== Remote stream received =====');
        console.log('[InterviewRoom] Stream ID:', remoteStream.id);

        if (remoteVideoRef.current) {
          console.log('[InterviewRoom] Remote video ref available, setting stream directly.');
          // To be safe, check if we're trying to set the same stream object
          if (remoteVideoRef.current.srcObject !== remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setHasReceivedRemoteStream(true);

            // Attempt to play, catching any errors
            remoteVideoRef.current.play().catch(e => {
              console.error('[InterviewRoom] Remote video auto-play failed.', e);
            });
          }
        } else {
          // This case is highly unlikely, but good to have a log for.
          console.error('[InterviewRoom] CRITICAL: Remote stream received but remoteVideoRef is not available!');
        }
      });

      webrtcService.on('onQualityUpdate', ({ metrics }) => {
        console.log('[InterviewRoom] Quality update:', metrics);
        setConnectionQuality(metrics.quality);
        setQualityDetails(metrics.details);

        if (metrics.quality === 'poor') {
          toast.warning('Chất lượng kết nối kém', {
            id: 'poor-quality',
            description: 'Hãy kiểm tra kết nối mạng của bạn.',
            duration: 5000
          });
        }
      });

      webrtcService.on('onConnectionFailed', ({ reason }) => {
        console.error('[InterviewRoom] Connection failed:', reason);
        toast.error('Mất kết nối', {
          description: 'Không thể kết nối với nhà tuyển dụng. Vui lòng thử lại.'
        });
      });

      webrtcService.on('onError', ({ message }) => {
        toast.error(message);
      });

      webrtcService.on('onLocalStreamUpdate', (stream) => {
        console.log('[InterviewRoom] ===== Local stream updated =====');
        console.log('[InterviewRoom] Stream active:', stream.active);
        // Update state to trigger effect
        setLocalStream(stream);
      });

      // Store stream for peer initialization when receiving signal
      console.log('[InterviewRoom] Stream ready for candidate, waiting for signal from recruiter');
      setLocalStream(stream); // Store stream in component state as backup
      console.log('[InterviewRoom] Candidate ready - will create peer when receiving first signal (offer)');

      // Debug: Check video elements after a short delay
      setTimeout(() => {
        console.log('[InterviewRoom] ===== Video Elements Debug =====');
        if (localVideoRef.current) {
          console.log('[InterviewRoom] Local video srcObject:', localVideoRef.current.srcObject);
          console.log('[InterviewRoom] Local video readyState:', localVideoRef.current.readyState);
          console.log('[InterviewRoom] Local video paused:', localVideoRef.current.paused);
        }
        if (remoteVideoRef.current) {
          console.log('[InterviewRoom] Remote video srcObject:', remoteVideoRef.current.srcObject);
          console.log('[InterviewRoom] Remote video readyState:', remoteVideoRef.current.readyState);
          console.log('[InterviewRoom] Remote video paused:', remoteVideoRef.current.paused);
        }
      }, 2000);

      console.log('[InterviewRoom] WebRTC setup complete');
    } catch (error) {
      console.error('[InterviewRoom] WebRTC setup failed:', error);
      toast.error('Không thể thiết lập kết nối video: ' + error.message);
      throw error;
    }
  };

  const cleanupInterview = () => {
    console.log('[InterviewRoom] Cleaning up');

    // Remove event handlers
    interviewSocketService.off('onAuthSuccess');
    interviewSocketService.off('onUserJoined');
    interviewSocketService.off('onUserLeft');
    interviewSocketService.off('onPeerDisconnected');
    interviewSocketService.off('onSignal');
    interviewSocketService.off('onChatMessage');
    interviewSocketService.off('onRecordingStarted');
    interviewSocketService.off('onRecordingStopped');
    interviewSocketService.off('onInterviewEnded');
    interviewSocketService.off('onDisconnect');
    interviewSocketService.off('onReconnect');

    webrtcService.off('onSignal');
    webrtcService.off('onRemoteStream');
    webrtcService.off('onConnectionEstablished');
    webrtcService.off('onConnectionFailed');
    webrtcService.off('onError');
    webrtcService.off('onLocalStreamUpdate');

    // Leave interview and disconnect
    interviewSocketService.leaveInterview(interviewId);
    webrtcService.closePeerConnection();
  };

  const toggleAudio = async () => {
    const enabled = !isAudioEnabled;
    setIsAudioEnabled(enabled);
    const success = await webrtcService.toggleAudio(enabled);
    if (success) {
      // toast.info(enabled ? 'Đã bật microphone' : 'Đã tắt microphone');
    } else {
      setIsAudioEnabled(!enabled);
    }
  };

  const toggleVideo = async () => {
    const enabled = !isVideoEnabled;
    console.log('[InterviewRoom] Toggling video to:', enabled);

    const success = await webrtcService.toggleVideo(enabled);
    if (success) {
      console.log('[InterviewRoom] Video toggle successful');
      setIsVideoEnabled(enabled);

      // Update local stream state to trigger effect
      const updatedStream = webrtcService.getLocalStream();
      if (updatedStream) {
        setLocalStream(updatedStream);
      }

      // toast.info(enabled ? 'Đã bật camera' : 'Đã tắt camera');
    } else {
      console.error('[InterviewRoom] Video toggle failed');
      setIsVideoEnabled(!enabled);
    }
  };

  const handleEndCall = () => {
    setConfirmEndCallOpen(true);
  };

  const executeEndCall = () => {
    cleanupInterview();
    navigate('/interviews');
    setConfirmEndCallOpen(false);
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await interviewSocketService.sendChatMessage(interviewId, message);

      // Add message to local state immediately for better UX
      const newMessage = {
        id: response.message?._id || Date.now(),
        senderId: currentUserId,
        senderName: 'Bạn',
        message,
        timestamp: response.message?.timestamp || new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('[InterviewRoom] Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Đang tải phỏng vấn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 p-4">
        <Card className="max-w-md p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            className="w-full mt-4"
            onClick={() => navigate('/interviews')}
          >
            Quay lại danh sách phỏng vấn
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-xl font-semibold">
              {interviewData?.jobTitle || 'Phỏng vấn trực tuyến'}
            </h1>
            <p className="text-gray-400 text-sm">
              {interviewData?.companyName || 'Công ty'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRecording && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                Đang ghi hình
              </Badge>
            )}
            <ConnectionQualityIndicator
              quality={connectionQuality}
              details={qualityDetails}
            />
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Remote Video (Recruiter) */}
        <Card className="relative bg-gray-800 overflow-hidden h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isRemoteUserJoined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
              <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
              <p className="text-white text-lg">Đang chờ nhà tuyển dụng tham gia...</p>
              <p className="text-gray-400 text-sm mt-2">Vui lòng đợi trong giây lát</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-gray-900/80 text-white">
              Nhà tuyển dụng
            </Badge>
          </div>
        </Card>

        {/* Local Video (Self) */}
        <Card className="relative bg-gray-800 overflow-hidden h-full">
          {isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
              <VideoOff className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-white">Camera đã tắt</p>
            </div>
          )}
          <div className="absolute bottom-4 left-4">
            <Badge className="bg-gray-900/80 text-white">Bạn</Badge>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Audio Toggle */}
          <Button
            size="lg"
            variant={isAudioEnabled ? 'default' : 'destructive'}
            onClick={toggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {/* Video Toggle */}
          <Button
            size="lg"
            variant={isVideoEnabled ? 'default' : 'destructive'}
            onClick={toggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* Chat Toggle */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="rounded-full w-14 h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          {/* Help Button */}
          <HelpPanel />
        </div>
      </div>

      {/* Chat Panel */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-800 border-l border-gray-700 shadow-xl z-50">
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClose={() => setIsChatOpen(false)}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <Alert variant="destructive" className="shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mất kết nối</AlertTitle>
            <AlertDescription>
              Đang cố gắng kết nối lại...
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ConfirmationDialog
        open={confirmEndCallOpen}
        onOpenChange={setConfirmEndCallOpen}
        title="Rời khỏi phỏng vấn?"
        description="Bạn có chắc chắn muốn rời khỏi cuộc phỏng vấn này? Hành động này sẽ ngắt kết nối với nhà tuyển dụng."
        onConfirm={executeEndCall}
        confirmText="Rời khỏi"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
};

export default InterviewRoom;
