import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ChatPanel from '@/components/interviews/ChatPanel';
import HelpPanel from '@/components/interviews/HelpPanel';
import webrtcService from '@/services/webrtc.service';
import interviewSocketService from '@/services/interviewSocket.service';
import { getInterviewById } from '@/services/interviewService';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import VideoFrame from '@/components/interviews/VideoFrame';
import ControlBar from '@/components/interviews/ControlBar';
import ParticipantList from '@/components/interviews/ParticipantList';
import { cn } from '@/lib/utils';

/**
 * InterviewRoom Component for Candidate
 * Main interview interface for candidates
 */
const InterviewRoom = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  // Video refs
  const localVideoRef = useRef(null); // Keep ref for direct stream access if needed, but VideoFrame handles it mostly
  const remoteVideoRef = useRef(null);

  // State management
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
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
  const [remoteStream, setRemoteStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [confirmEndCallOpen, setConfirmEndCallOpen] = useState(false);

  // Remote peer state (for UI)
  const [remotePeerState, setRemotePeerState] = useState({
    isMuted: false,
    isCameraOff: false,
    name: 'Nhà tuyển dụng',
    avatar: null
  });
  const [remoteScreenStream, setRemoteScreenStream] = useState(null);
  const [localScreenPreview, setLocalScreenPreview] = useState(null); // For previewing own screen
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Helper to add floating emoji
  const addFloatingEmoji = (emoji, isLocal) => {
    const id = Date.now() + Math.random();

    // Position based on sender
    // Local (Right side): 60-90%
    // Remote (Left side): 10-40%
    let min, max;
    if (isLocal) {
      min = 60;
      max = 90;
    } else {
      min = 10;
      max = 40;
    }

    const left = min + Math.random() * (max - min);

    setFloatingEmojis(prev => [...prev, { id, emoji, left, isLocal }]);

    // Remove after animation (2s)
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const handleSendEmoji = (emoji) => {
    interviewSocketService.sendEmoji(interviewId, emoji);
    addFloatingEmoji(emoji, true); // Local
  };

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
          setCurrentUserId(userId);
          console.log('[InterviewRoom] Current user ID from JWT:', userId);
        }

        // Setup socket event handlers FIRST to ensure we don't miss any events (like Offers)
        setupSocketEventHandlers(userId);
        console.log('[InterviewRoom] Socket event handlers setup completed');

        // Setup WebRTC to get local media stream
        console.log('[InterviewRoom] Starting WebRTC setup...');
        await setupWebRTC();
        console.log('[InterviewRoom] WebRTC setup completed');

        // Join interview room
        const joinResponse = await interviewSocketService.joinInterview(interviewId, {
          role: 'candidate'
        });

        if (joinResponse.interview) {
          setInterviewData(joinResponse.interview);
        }
        console.log('[InterviewRoom] Joined interview room, response:', joinResponse);

        // Check if there are existing users in the room
        if (joinResponse.existingUsers && joinResponse.existingUsers.length > 0) {
          console.log('[InterviewRoom] Found existing users:', joinResponse.existingUsers);
          setIsRemoteUserJoined(true);
          const remoteUser = joinResponse.existingUsers.find(u => u.userRole !== 'candidate');
          if (remoteUser) {
            setRemotePeerState(prev => ({
              ...prev,
              name: remoteUser.userName || 'Nhà tuyển dụng',
              avatar: remoteUser.userAvatar || null
            }));
          }
        }

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

  const setupSocketEventHandlers = (userId) => {
    // User joined
    interviewSocketService.on('onUserJoined', (data) => {
      console.log('[InterviewRoom] User joined:', data);
      setIsRemoteUserJoined(true);
      setRemotePeerState(prev => ({
        ...prev,
        name: data.userName || 'Nhà tuyển dụng',
        avatar: data.userAvatar || null
      }));
    });

    // User left
    interviewSocketService.on('onUserLeft', (data) => {
      console.log('[InterviewRoom] User left:', data);
      setIsRemoteUserJoined(false);
      setRemoteStream(null); // Clear remote stream
      toast.warning(`${data.userName || 'Nhà tuyển dụng'} đã rời khỏi phỏng vấn`);

      // Clean up peer connection but keep local stream
      if (webrtcService.peerConnection && webrtcService.peerConnection.connectionState !== 'closed') {
        webrtcService.closePeerConnection();
      }
    });

    // Peer disconnected
    interviewSocketService.on('onPeerDisconnected', (data) => {
      console.log('[InterviewRoom] Peer disconnected abruptly:', data);
      setIsRemoteUserJoined(false);
      setRemoteStream(null);
      if (webrtcService.peerConnection) {
        webrtcService.closePeerConnection();
      }
    });

    // Auth success
    interviewSocketService.on('onAuthSuccess', (data) => {
      if (!userId) setCurrentUserId(data.userId);
    });

    // Signaling
    interviewSocketService.on('onSignal', async (data) => {
      // Ignore signals from self
      const signalFrom = data.from || data.fromUserId;
      if (signalFrom && signalFrom === userId) return;

      // Candidate logic: create peer only when receiving the first offer signal
      if (!webrtcService.peerConnection && data.signal?.type === 'offer') {
        try {
          const streamToUse = webrtcService.localStream || localStream;
          if (!streamToUse) {
            console.error('[InterviewRoom] No local stream available.');
            return;
          }

          webrtcService.initializePeerConnection(streamToUse);
          await webrtcService.handleSignal(data.signal);
        } catch (error) {
          console.error('[InterviewRoom] Failed to initialize peer on-the-fly:', error);
        }
        return;
      }

      // Handle signal if peer already exists
      if (webrtcService.peerConnection) {
        await webrtcService.handleSignal(data.signal);
      }
    });

    // Chat message
    interviewSocketService.on('onChatMessage', (data) => {
      if (String(data.senderId) === String(userId)) return;

      const newMessage = {
        id: data._id || data.messageId || Date.now(),
        senderId: data.senderId,
        senderName: 'Nhà tuyển dụng',
        message: data.message,
        timestamp: new Date(data.timestamp)
      };
      setChatMessages(prev => [...prev, newMessage]);

      // Auto-open chat if closed and new message arrives
      if (!isChatOpen) {
        toast('Tin nhắn mới', {
          description: `Nhà tuyển dụng: ${data.message}`,
          action: {
            label: 'Xem',
            onClick: () => setIsChatOpen(true)
          }
        });
      }
    });

    interviewSocketService.on('onEmoji', (data) => {
      addFloatingEmoji(data.emoji, false); // Remote
    });

    // Media State Updates (Mute/Camera Off from remote)
    interviewSocketService.on('onMediaStateChanged', (data) => {
      if (data.userId !== userId) {
        setRemotePeerState(prev => ({
          ...prev,
          isMuted: data.isAudioEnabled !== undefined ? !data.isAudioEnabled : prev.isMuted,
          isCameraOff: data.isVideoEnabled !== undefined ? !data.isVideoEnabled : prev.isCameraOff
        }));
      }
    });

    // Remote screen share stopped
    interviewSocketService.on('onRemoteScreenShareStopped', () => {
      setRemoteScreenStream(null);
      toast.info('Nhà tuyển dụng đã dừng chia sẻ màn hình');
    });

    // Recording notifications
    interviewSocketService.on('onRecordingStarted', () => {
      setIsRecording(true);
      toast.info('Nhà tuyển dụng đã bắt đầu ghi hình');
    });

    interviewSocketService.on('onRecordingStopped', () => {
      setIsRecording(false);
      toast.info('Nhà tuyển dụng đã dừng ghi hình');
    });

    // Interview ended
    interviewSocketService.on('onInterviewEnded', () => {
      toast.info('Phỏng vấn đã kết thúc');
      setTimeout(() => navigate('/interviews'), 3000);
    });

    // Interview started
    interviewSocketService.on('onInterviewStarted', (data) => {
      console.log('[InterviewRoom] Interview started:', data);
      toast.success('Buổi phỏng vấn đã bắt đầu');
      setInterviewData(prev => ({
        ...prev,
        status: 'STARTED',
        startTime: data.startTime
      }));
    });
  };

  const setupWebRTC = async () => {
    try {
      // Load device settings
      const savedSettings = localStorage.getItem('interviewDeviceSettings');
      const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};

      const constraints = {
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

      let stream;
      try {
        stream = await webrtcService.getUserMedia(constraints);
      } catch (error) {
        console.warn('Failed with exact devices, trying fallback');
        stream = await webrtcService.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled
        });
      }

      setLocalStream(stream);

      // Setup WebRTC event handlers
      webrtcService.eventHandlers.clear();

      webrtcService.on('onSignal', (signal) => {
        interviewSocketService.sendSignal(interviewId, signal);
      });

      webrtcService.on('onRemoteStream', (stream) => {
        console.log('[InterviewRoom] Remote stream received');
        setRemoteStream(stream);
        setHasReceivedRemoteStream(true);
      });

      webrtcService.on('onRemoteScreenStream', (stream) => {
        console.log('[InterviewRoom] Remote SCREEN stream received');
        setRemoteScreenStream(stream);
      });

      webrtcService.on('onLocalScreenShareStarted', (stream) => {
        setLocalScreenPreview(stream);
      });

      webrtcService.on('onQualityUpdate', ({ metrics }) => {
        setConnectionQuality(metrics.quality);
        setQualityDetails(metrics.details);
      });

      webrtcService.on('onLocalStreamUpdate', (stream) => {
        setLocalStream(stream);
      });

      webrtcService.on('onScreenShareStopped', () => {
        setIsScreenSharing(false);
        setLocalScreenPreview(null);
        toast.info('Đã dừng chia sẻ màn hình');
        interviewSocketService.notifyScreenShareStopped(interviewId);
      });

      // Let's add a listener for generally refreshing streams if needed.

    } catch (error) {
      console.error('WebRTC setup failed:', error);
      toast.error('Không thể thiết lập kết nối video: ' + error.message);
      throw error;
    }
  };

  const cleanupInterview = () => {
    interviewSocketService.reset(); // Disconnects and clears listeners
    webrtcService.closePeerConnection();
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleAudio = async () => {
    const enabled = !isAudioEnabled;
    setIsAudioEnabled(enabled);
    await webrtcService.toggleAudio(enabled);

    // Notify remote peer about media state change
    interviewSocketService.notifyMediaStateChanged(interviewId, enabled, isVideoEnabled);
  };

  const toggleVideo = async () => {
    const enabled = !isVideoEnabled;
    setIsVideoEnabled(enabled);
    await webrtcService.toggleVideo(enabled);

    // Update local stream state
    const updatedStream = webrtcService.getLocalStream();
    if (updatedStream) setLocalStream(updatedStream);

    // Notify remote peer
    interviewSocketService.notifyMediaStateChanged(interviewId, isAudioEnabled, enabled);
  };

  const handleToggleScreenShare = async () => {
    if (remoteScreenStream) {
      toast.warning('Người khác đang chia sẻ màn hình. Vui lòng đợi họ kết thúc.');
      return;
    }
    if (isScreenSharing) {
      const success = await webrtcService.stopScreenShare();
      if (success) {
        setIsScreenSharing(false);
      }
    } else {
      const success = await webrtcService.startScreenShare();
      if (success) {
        setIsScreenSharing(true);
        toast.success('Đang chia sẻ màn hình');
      }
    }
  };

  const handleEndCall = () => {
    setConfirmEndCallOpen(true);
  };

  const executeEndCall = () => {
    cleanupInterview();
    navigate('/interviews');
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await interviewSocketService.sendChatMessage(interviewId, message);
      const newMessage = {
        id: response.message?._id || Date.now(),
        senderId: currentUserId,
        senderName: 'Bạn',
        message,
        timestamp: response.message?.timestamp || new Date()
      };
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      toast.error('Không thể gửi tin nhắn');
    }
  };

  // Construct participants list for the sidebar
  const participants = [
    {
      id: 'local',
      name: interviewData?.candidateId?.fullName || 'Bạn',
      isLocal: true,
      isMuted: !isAudioEnabled,
      isCameraOff: !isVideoEnabled,
      isActiveSpeaker: false, // TODO: Implement active speaker detection
      avatar: interviewData?.candidateId?.avatar || null
    },
    ...(isRemoteUserJoined ? [{
      id: 'remote',
      name: remotePeerState.name,
      isLocal: false,
      isMuted: remotePeerState.isMuted,
      isCameraOff: remotePeerState.isCameraOff || !remoteStream,
      isActiveSpeaker: false, // TODO
      avatar: remotePeerState.avatar
    }] : [])
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Đang chuẩn bị phòng họp...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 p-4">
        <Card className="max-w-md p-6 bg-slate-900 border-slate-800">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi kết nối</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="w-full mt-4" onClick={() => navigate('/interviews')}>
            Quay lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col overflow-hidden text-slate-100 font-sans relative">
      {/* Floating Emojis Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            className="absolute bottom-20 text-4xl animate-float-up"
            style={{ left: `${item.left}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative bg-[#202124]">

        {/* Video Grid */}
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out flex items-center justify-center overflow-auto", // overflow-auto for smaller screens
          (isChatOpen || isParticipantsOpen) ? "p-2" : "p-4"
        )}>

          <div className={cn(
            "w-full h-full transition-all duration-500",
            // Dynamic Grid Layout
            (remoteScreenStream || localScreenPreview)
              ? "grid grid-cols-1 md:grid-cols-3 gap-4 p-4" // 3 columns when screen share active? Or specific layout
              : isRemoteUserJoined
                ? "grid grid-cols-1 md:grid-cols-2 gap-4 items-center content-center"
                : "flex justify-center items-center",
            // Layout for screen share: Main screen share + small list of cameras?
            // Or just a grid. Let's try a grid where screen share takes priority if possible, or just standard grid.
            // If we use grid-cols-3, it might be too small.
            // Better: If screen sharing, use a specialized layout.
            (remoteScreenStream || localScreenPreview)
              ? "flex flex-col md:flex-row gap-4 h-full"
              : "",
            (isRemoteUserJoined && !isChatOpen && !isParticipantsOpen && !remoteScreenStream && !localScreenPreview) && "max-w-6xl mx-auto"
          )}>

            {/* Screen Share View (Dominant if active) */}
            {(remoteScreenStream || localScreenPreview) && (
              <div className="flex-1 min-h-0 bg-black rounded-xl overflow-hidden shadow-xl border border-white/10 relative order-first md:order-none">
                <VideoFrame
                  stream={remoteScreenStream || localScreenPreview}
                  isMuted={true} // Screen share audio usually muted or separate
                  isCameraOff={false}
                  userName={remoteScreenStream ? remotePeerState.name + " (Màn hình)" : "Bạn (Màn hình)"}
                  isLocal={!!localScreenPreview}
                  connectionQuality="good"
                  className="w-full h-full object-contain"
                  isScreenShare={true}
                />
              </div>
            )}

            {/* Camera Grid (Sidebar or Bottom bar when screen sharing) */}
            <div className={cn(
              "flex gap-4 transition-all",
              (remoteScreenStream || localScreenPreview)
                ? "flex-row md:flex-col w-full md:w-64 h-32 md:h-full justify-center"
                : "w-full h-full contents" // Use contents to let grid take over
            )}>

              {/* Remote Video */}
              {isRemoteUserJoined && (
                <VideoFrame
                  stream={remoteStream}
                  isMuted={remotePeerState.isMuted}
                  isCameraOff={remotePeerState.isCameraOff}
                  userName={remotePeerState.name}
                  isLocal={false}
                  connectionQuality={connectionQuality}
                  className={cn(
                    "rounded-xl video-frame",
                    (remoteScreenStream || localScreenPreview) ? "w-full h-full object-cover" : "w-full h-full max-h-[calc(100vh-100px)] object-cover"
                  )}
                />
              )}

              {/* Local Video */}
              <VideoFrame
                stream={localStream}
                isMuted={!isAudioEnabled}
                isCameraOff={!isVideoEnabled}
                userName="Bạn"
                isLocal={true}
                className={cn(
                  "transition-all duration-500 rounded-xl overflow-hidden bg-[#3c4043]",
                  !isRemoteUserJoined && !(remoteScreenStream || localScreenPreview)
                    ? cn(
                      "aspect-video shadow-lg",
                      (isChatOpen || isParticipantsOpen)
                        ? "w-full max-h-[calc(100vh-100px)]"
                        : "w-full max-w-4xl max-h-[calc(100vh-100px)]"
                    )
                    : (remoteScreenStream || localScreenPreview)
                      ? "w-full h-full object-cover"
                      : "w-full h-full max-h-[calc(100vh-100px)] object-cover"
                )}
              />
            </div>

            {/* Waiting State Overlay */}
            {!isRemoteUserJoined && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 bg-[#202124]/90 backdrop-blur px-6 py-3 rounded-full border border-gray-700 flex items-center gap-3 shadow-lg z-10">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <span className="text-gray-200">Đang chờ nhà tuyển dụng tham gia...</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebars */}
        {isParticipantsOpen && (
          <ParticipantList
            participants={participants}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}

        {isChatOpen && (
          <div className="w-80 border-l border-gray-800 bg-[#202124] flex flex-col h-full z-20 shadow-xl">
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              onClose={() => setIsChatOpen(false)}
              currentUserId={currentUserId}
              className="flex-1"
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar - Fixed at bottom */}
      <div className="w-full z-50 bg-[#202124] border-t border-gray-800">
        <ControlBar
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleChat={() => {
            setIsChatOpen(!isChatOpen);
            if (isParticipantsOpen) setIsParticipantsOpen(false);
          }}
          onToggleParticipants={() => {
            setIsParticipantsOpen(!isParticipantsOpen);
            if (isChatOpen) setIsChatOpen(false);
          }}
          onEndCall={handleEndCall}
          interviewId={interviewId}
          interviewTitle={interviewData?.jobTitle}
          onSendEmoji={handleSendEmoji}
          disableScreenShare={!!remoteScreenStream}
        />
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        open={confirmEndCallOpen}
        onOpenChange={setConfirmEndCallOpen}
        title="Rời khỏi phỏng vấn?"
        description="Bạn có chắc chắn muốn rời khỏi cuộc phỏng vấn này?"
        onConfirm={executeEndCall}
        confirmText="Rời khỏi"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
};

export default InterviewRoom;
