import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * DeviceTest Component for Candidate
 * Allows candidates to test their camera, microphone, and speaker before joining interview
 */
const DeviceTest = ({ interviewId: propInterviewId, onComplete }) => {
  const navigate = useNavigate();
  const { interviewId: paramInterviewId } = useParams();
  const interviewId = propInterviewId || paramInterviewId;
  
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const testAudioRef = useRef(null);

  // Device lists
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  
  // Selected devices
  const [selectedVideoDevice, setSelectedVideoDevice] = useState(undefined);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(undefined);
  const [selectedAudioOutput, setSelectedAudioOutput] = useState(undefined);
  
  // Device states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Speaker test
  const [isSpeakerTestPlaying, setIsSpeakerTestPlaying] = useState(false);
  
  // Stream
  const [localStream, setLocalStream] = useState(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'checking', // 'checking', 'granted', 'denied'
    microphone: 'checking'
  });
  
  // Browser compatibility
  const [browserCompatibility, setBrowserCompatibility] = useState({
    isCompatible: true,
    issues: []
  });

  // Check browser compatibility
  useEffect(() => {
    checkBrowserCompatibility();
  }, []);

  const checkBrowserCompatibility = () => {
    const issues = [];
    
    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      issues.push('Trình duyệt không hỗ trợ truy cập camera/microphone');
    }
    
    // Check for WebRTC support
    if (!window.RTCPeerConnection) {
      issues.push('Trình duyệt không hỗ trợ WebRTC');
    }
    
    // Check for secure context (HTTPS)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Yêu cầu kết nối HTTPS để sử dụng camera/microphone');
    }
    
    // Browser recommendations
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
    const isFirefox = userAgent.includes('firefox');
    const isEdge = userAgent.includes('edge');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    
    if (!isChrome && !isFirefox && !isEdge && !isSafari) {
      issues.push('Khuyến nghị sử dụng Chrome, Firefox, Edge hoặc Safari để có trải nghiệm tốt nhất');
    }
    
    setBrowserCompatibility({
      isCompatible: issues.length === 0 || issues.length === 1 && issues[0].includes('Khuyến nghị'),
      issues
    });
  };

  // Request permissions first, then get available devices
  useEffect(() => {
    const requestPermissionsAndGetDevices = async () => {
      try {
        setIsLoading(true);
        
        // Request permissions first to get full device list with labels
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        // Stop the temporary stream immediately
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices with permissions granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        
        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);
        setAudioOutputDevices(audioOutputs);
        
        // Set default devices
        if (videoInputs.length > 0 && !selectedVideoDevice) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }
        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
        if (audioOutputs.length > 0 && !selectedAudioOutput) {
          setSelectedAudioOutput(audioOutputs[0].deviceId);
        }
        
        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error requesting permissions or enumerating devices:', error);
        
        // Handle specific errors
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
          toast.error('Vui lòng cấp quyền truy cập camera và microphone để tiếp tục');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          toast.error('Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra thiết bị của bạn.');
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
        } else {
          toast.error('Không thể truy cập thiết bị: ' + error.message);
        }
        
        setIsLoading(false);
      }
    };

    requestPermissionsAndGetDevices();
  }, []);

  // Request permissions and start stream
  useEffect(() => {
    if (selectedVideoDevice && selectedAudioDevice) {
      startMediaStream();
    }
    
    return () => {
      stopMediaStream();
    };
  }, [selectedVideoDevice, selectedAudioDevice, isVideoEnabled, isAudioEnabled]);

  const startMediaStream = async () => {
    try {
      setIsLoading(true);
      
      // Stop existing stream
      stopMediaStream();
      
      const constraints = {
        video: isVideoEnabled ? {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: isAudioEnabled ? {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      
      // Set video element
      if (videoRef.current && isVideoEnabled) {
        videoRef.current.srcObject = stream;
      }
      
      // Setup audio level monitoring
      if (isAudioEnabled) {
        setupAudioMonitoring(stream);
      }
      
      // Update permission status
      setPermissionStatus({
        camera: isVideoEnabled ? 'granted' : 'checking',
        microphone: isAudioEnabled ? 'granted' : 'checking'
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      
      // Handle specific errors
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus({
          camera: isVideoEnabled ? 'denied' : 'checking',
          microphone: isAudioEnabled ? 'denied' : 'checking'
        });
        toast.error('Vui lòng cấp quyền truy cập camera và microphone');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast.error('Không tìm thấy camera hoặc microphone');
      } else {
        toast.error('Không thể truy cập thiết bị: ' + error.message);
      }
      
      setIsLoading(false);
    }
  };

  const stopMediaStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const setupAudioMonitoring = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio monitoring:', error);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 255) * 100);
    
    setAudioLevel(normalizedLevel);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const handleVideoDeviceChange = (deviceId) => {
    setSelectedVideoDevice(deviceId);
  };

  const handleAudioDeviceChange = (deviceId) => {
    setSelectedAudioDevice(deviceId);
  };

  const handleAudioOutputChange = async (deviceId) => {
    setSelectedAudioOutput(deviceId);
    
    // Update audio output for test audio if supported
    if (testAudioRef.current && typeof testAudioRef.current.setSinkId === 'function') {
      try {
        await testAudioRef.current.setSinkId(deviceId);
      } catch (error) {
        console.error('Error setting audio output device:', error);
      }
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
  };

  const testSpeaker = () => {
    if (isSpeakerTestPlaying) {
      testAudioRef.current?.pause();
      setIsSpeakerTestPlaying(false);
    } else {
      // Play test audio (simple tone or notification sound)
      const audio = new Audio('https://onlinetestcase.com/wp-content/uploads/2023/06/100-KB-MP3.mp3'); // You'll need to add a test audio file
      testAudioRef.current = audio;
      
      // Set output device if supported
      if (selectedAudioOutput && typeof audio.setSinkId === 'function') {
        audio.setSinkId(selectedAudioOutput).catch(console.error);
      }
      
      audio.play().then(() => {
        setIsSpeakerTestPlaying(true);
      }).catch(() => {
        toast.error('Không thể phát âm thanh kiểm tra');
      });
      
      audio.onended = () => {
        setIsSpeakerTestPlaying(false);
      };
    }
  };

  const handleJoinInterview = () => {
    // Save device settings to localStorage
    const deviceSettings = {
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      audioOutputDeviceId: selectedAudioOutput,
      isVideoEnabled,
      isAudioEnabled
    };
    localStorage.setItem('interviewDeviceSettings', JSON.stringify(deviceSettings));
    console.log('[DeviceTest] Saved device settings:', deviceSettings);
    
    if (onComplete) {
      onComplete(deviceSettings);
    } else if (interviewId) {
      navigate(`/interviews/${interviewId}/room`);
    } else {
      toast.error('Không tìm thấy ID phỏng vấn');
    }
  };

  const getPermissionIcon = (status) => {
    switch (status) {
      case 'granted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  const canJoinInterview = 
    permissionStatus.camera === 'granted' && 
    permissionStatus.microphone === 'granted' &&
    browserCompatibility.isCompatible;

  if (!browserCompatibility.isCompatible) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-6 w-6" />
              Trình duyệt không tương thích
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Không thể tham gia phỏng vấn</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {browserCompatibility.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="font-semibold">Khuyến nghị:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Sử dụng trình duyệt Chrome, Firefox, Edge hoặc Safari phiên bản mới nhất</li>
                <li>Đảm bảo kết nối HTTPS</li>
                <li>Cấp quyền truy cập camera và microphone</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kiểm tra thiết bị</h1>
        <p className="text-muted-foreground mt-1">
          Vui lòng kiểm tra camera, microphone và loa của bạn trước khi tham gia phỏng vấn
        </p>
      </div>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trạng thái quyền truy cập</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-muted-foreground" />
              <span>Camera</span>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionIcon(permissionStatus.camera)}
              <Badge variant={permissionStatus.camera === 'granted' ? 'success' : permissionStatus.camera === 'denied' ? 'destructive' : 'secondary'}>
                {permissionStatus.camera === 'granted' ? 'Đã cấp quyền' : permissionStatus.camera === 'denied' ? 'Bị từ chối' : 'Đang kiểm tra'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-muted-foreground" />
              <span>Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionIcon(permissionStatus.microphone)}
              <Badge variant={permissionStatus.microphone === 'granted' ? 'success' : permissionStatus.microphone === 'denied' ? 'destructive' : 'secondary'}>
                {permissionStatus.microphone === 'granted' ? 'Đã cấp quyền' : permissionStatus.microphone === 'denied' ? 'Bị từ chối' : 'Đang kiểm tra'}
              </Badge>
            </div>
          </div>

          {(permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied') && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Quyền truy cập bị từ chối</AlertTitle>
              <AlertDescription>
                Vui lòng cấp quyền truy cập camera và microphone trong cài đặt trình duyệt để tham gia phỏng vấn.
                <br />
                <span className="text-sm">
                  Thường ở thanh địa chỉ, click vào biểu tượng khóa và chọn &quot;Cho phép&quot; cho camera và microphone.
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Xem trước camera</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <>
                  <VideoOff className="h-4 w-4 mr-2" />
                  Tắt camera
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Bật camera
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isVideoEnabled ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <VideoOff className="h-12 w-12 mb-2" />
                <p>Camera đã tắt</p>
              </div>
            )}
          </div>

          {/* Camera Selection */}
          <div className="space-y-2">
            <Label htmlFor="video-device">Chọn camera</Label>
            <Select value={selectedVideoDevice} onValueChange={handleVideoDeviceChange}>
              <SelectTrigger id="video-device">
                <SelectValue placeholder="Chọn camera" />
              </SelectTrigger>
              <SelectContent>
                {videoDevices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Microphone Test */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Kiểm tra microphone</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Tắt micro
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Bật micro
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Level Indicator */}
          {isAudioEnabled ? (
            <div className="space-y-2">
              <Label>Mức âm thanh</Label>
              <div className="flex items-center gap-3">
                <Mic className={cn(
                  "h-5 w-5",
                  audioLevel > 10 ? "text-green-500" : "text-muted-foreground"
                )} />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-100",
                      audioLevel > 70 ? "bg-green-500" : audioLevel > 40 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12">
                  {Math.round(audioLevel)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hãy nói thử để kiểm tra microphone
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <div className="text-center">
                <MicOff className="h-8 w-8 mx-auto mb-2" />
                <p>Microphone đã tắt</p>
              </div>
            </div>
          )}

          {/* Microphone Selection */}
          <div className="space-y-2">
            <Label htmlFor="audio-device">Chọn microphone</Label>
            <Select value={selectedAudioDevice} onValueChange={handleAudioDeviceChange}>
              <SelectTrigger id="audio-device">
                <SelectValue placeholder="Chọn microphone" />
              </SelectTrigger>
              <SelectContent>
                {audioDevices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Speaker Test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kiểm tra loa</CardTitle>
          <CardDescription>
            Nhấn nút bên dưới để phát âm thanh kiểm tra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={testSpeaker}
            className="w-full"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {isSpeakerTestPlaying ? 'Dừng kiểm tra' : 'Kiểm tra loa'}
          </Button>

          {/* Speaker Selection */}
          {audioOutputDevices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="audio-output">Chọn loa</Label>
              <Select value={selectedAudioOutput} onValueChange={handleAudioOutputChange}>
                <SelectTrigger id="audio-output">
                  <SelectValue placeholder="Chọn loa" />
                </SelectTrigger>
                <SelectContent>
                  {audioOutputDevices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Loa ${audioOutputDevices.indexOf(device) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browser Compatibility Info */}
      {browserCompatibility.issues.length > 0 && (
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Lưu ý</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {browserCompatibility.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Button
          onClick={handleJoinInterview}
          disabled={!canJoinInterview || isLoading}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang tải...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Tham gia phỏng vấn
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeviceTest;
