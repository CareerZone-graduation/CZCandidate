/**
 * WebRTC Service (Native) for Candidate - WITHOUT simple-peer
 * Pure WebRTC implementation for video call interviews
 * Candidate is the ANSWERER (receives offer, creates answer)
 */

class WebRTCNativeService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.connectionState = 'disconnected';
    this.eventHandlers = new Map();
    this.iceCandidatesQueue = [];
    this.isAnswerCreated = false;
    
    // ICE servers configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    };
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Trigger event handlers
   * @private
   */
  _triggerHandler(event, data) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WebRTC Native] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Get user media (camera and microphone)
   */
  async getUserMedia(constraints = { video: true, audio: true }) {
    try {
      console.log('[WebRTC Native] Requesting user media:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        console.log('[WebRTC Native] Video device:', videoTrack.label);
      }
      if (audioTrack) {
        console.log('[WebRTC Native] Audio device:', audioTrack.label);
      }
      
      console.log('[WebRTC Native] Got local stream successfully');
      return stream;
    } catch (error) {
      console.error('[WebRTC Native] Failed to get user media:', error);
      
      // Fallback to minimal constraints
      if (error.name === 'OverconstrainedError') {
        try {
          const minimalConstraints = { video: true, audio: true };
          const stream = await navigator.mediaDevices.getUserMedia(minimalConstraints);
          this.localStream = stream;
          console.log('[WebRTC Native] Got stream with minimal constraints');
          return stream;
        } catch (fallbackError) {
          console.error('[WebRTC Native] Fallback also failed:', fallbackError);
        }
      }
      
      this._triggerHandler('onError', {
        type: 'media-access',
        error,
        message: 'Không thể truy cập camera/microphone'
      });
      throw error;
    }
  }

  /**
   * Initialize peer connection as ANSWERER (Candidate receives offer)
   */
  async initializePeerConnection(stream) {
    try {
      console.log('[WebRTC Native] Initializing peer connection as ANSWERER (Candidate)');
      
      // Close existing connection if any
      if (this.peerConnection) {
        console.log('[WebRTC Native] Closing existing peer connection');
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.localStream = stream;
      this.connectionState = 'connecting';
      this.isAnswerCreated = false;
      this.iceCandidatesQueue = [];

      // Create RTCPeerConnection
      this.peerConnection = new RTCPeerConnection(this.config);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log('[WebRTC Native] Adding track:', track.kind);
        this.peerConnection.addTrack(track, stream);
      });

      // Setup event handlers
      this._setupPeerConnectionHandlers();

      console.log('[WebRTC Native] Peer connection initialized');
      this._triggerHandler('onConnectionInitialized');

      return this.peerConnection;
    } catch (error) {
      console.error('[WebRTC Native] Failed to initialize peer connection:', error);
      this.connectionState = 'failed';
      this._triggerHandler('onError', {
        type: 'initialization',
        error,
        message: 'Không thể khởi tạo kết nối WebRTC'
      });
      throw error;
    }
  }

  /**
   * Setup RTCPeerConnection event handlers
   * @private
   */
  _setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC Native] New ICE candidate:', event.candidate.type);
        this._triggerHandler('onIceCandidate', event.candidate);
      } else {
        console.log('[WebRTC Native] ICE gathering completed');
      }
    };

    // Track event - remote stream received
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC Native] Remote track received:', event.track.kind);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
      
      console.log('[WebRTC Native] Remote stream tracks:', this.remoteStream.getTracks().length);
      this._triggerHandler('onRemoteStream', this.remoteStream);
    };

    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      console.log('[WebRTC Native] Connection state:', state);
      this.connectionState = state;
      
      if (state === 'connected') {
        this._triggerHandler('onConnectionEstablished');
      } else if (state === 'failed' || state === 'closed') {
        this._triggerHandler('onConnectionClosed');
      }
    };

    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState;
      console.log('[WebRTC Native] ICE connection state:', state);
      
      if (state === 'failed') {
        console.error('[WebRTC Native] ICE connection failed');
        this._triggerHandler('onError', {
          type: 'ice-failed',
          message: 'Kết nối ICE thất bại'
        });
      }
    };

    // Signaling state change
    this.peerConnection.onsignalingstatechange = () => {
      console.log('[WebRTC Native] Signaling state:', this.peerConnection.signalingState);
    };
  }

  /**
   * Handle offer from remote peer (Recruiter's offer)
   */
  async handleOffer(offer) {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      console.log('[WebRTC Native] Handling offer from recruiter');

      const remoteDesc = new RTCSessionDescription(offer);
      await this.peerConnection.setRemoteDescription(remoteDesc);

      console.log('[WebRTC Native] Offer set as remote description');

      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.isAnswerCreated = true;

      console.log('[WebRTC Native] Answer created and set as local description');

      // Trigger event to send answer via signaling
      this._triggerHandler('onAnswer', answer);

      // Process queued ICE candidates
      if (this.iceCandidatesQueue.length > 0) {
        console.log(`[WebRTC Native] Processing ${this.iceCandidatesQueue.length} queued ICE candidates`);
        for (const candidate of this.iceCandidatesQueue) {
          await this.addIceCandidate(candidate);
        }
        this.iceCandidatesQueue = [];
      }

      return answer;
    } catch (error) {
      console.error('[WebRTC Native] Failed to handle offer:', error);
      this._triggerHandler('onError', {
        type: 'offer-handling',
        error,
        message: 'Không thể xử lý offer'
      });
      throw error;
    }
  }

  /**
   * Add ICE candidate from remote peer
   */
  async addIceCandidate(candidate) {
    try {
      if (!this.peerConnection) {
        console.warn('[WebRTC Native] Peer connection not ready, queuing ICE candidate');
        this.iceCandidatesQueue.push(candidate);
        return;
      }

      if (!this.peerConnection.remoteDescription) {
        console.warn('[WebRTC Native] Remote description not set, queuing ICE candidate');
        this.iceCandidatesQueue.push(candidate);
        return;
      }

      const iceCandidate = new RTCIceCandidate(candidate);
      await this.peerConnection.addIceCandidate(iceCandidate);
      console.log('[WebRTC Native] ICE candidate added successfully');

    } catch (error) {
      console.error('[WebRTC Native] Failed to add ICE candidate:', error);
      // Don't throw - ICE candidates can fail without breaking the connection
    }
  }

  /**
   * Toggle audio track
   */
  async toggleAudio(enabled) {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];

    if (enabled) {
      if (audioTrack && audioTrack.readyState === 'live') {
        audioTrack.enabled = true;
        console.log('[WebRTC Native] Audio enabled');
        return true;
      }
      
      // Get new audio track
      try {
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
        
        const audioConstraints = deviceSettings.audioDeviceId 
          ? { 
              deviceId: { exact: deviceSettings.audioDeviceId },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          : { 
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            };
        
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        const newTrack = newStream.getAudioTracks()[0];
        
        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'audio');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
        
        if (audioTrack) {
          audioTrack.stop();
          this.localStream.removeTrack(audioTrack);
        }
        this.localStream.addTrack(newTrack);
        
        console.log('[WebRTC Native] Audio enabled with new track');
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
        return true;
      } catch (error) {
        console.error('[WebRTC Native] Failed to enable audio:', error);
        return false;
      }
    } else {
      if (audioTrack) {
        audioTrack.enabled = false;
      }
      console.log('[WebRTC Native] Audio disabled');
      return true;
    }
  }

  /**
   * Toggle video track
   */
  async toggleVideo(enabled) {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];

    if (enabled) {
      try {
        const savedSettings = localStorage.getItem('interviewDeviceSettings');
        const deviceSettings = savedSettings ? JSON.parse(savedSettings) : {};
        
        const videoConstraints = deviceSettings.videoDeviceId
          ? { deviceId: { exact: deviceSettings.videoDeviceId } }
          : true;
        
        const newStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
        const newTrack = newStream.getVideoTracks()[0];
        
        // Replace track in peer connection
        if (this.peerConnection) {
          const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
        
        if (videoTrack) {
          videoTrack.stop();
          this.localStream.removeTrack(videoTrack);
        }
        this.localStream.addTrack(newTrack);
        
        console.log('[WebRTC Native] Video enabled with new track');
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
        return true;
      } catch (error) {
        console.error('[WebRTC Native] Failed to enable video:', error);
        return false;
      }
    } else {
      if (videoTrack) {
        videoTrack.enabled = false;
        this._triggerHandler('onLocalStreamUpdate', this.localStream);
      }
      console.log('[WebRTC Native] Video disabled');
      return true;
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId) {
    try {
      const videoTrack = this.localStream?.getVideoTracks()[0];
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      
      const newTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }
      
      if (videoTrack) {
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
      }
      this.localStream.addTrack(newTrack);
      
      this._triggerHandler('onLocalStreamUpdate', this.localStream);
      console.log('[WebRTC Native] Camera switched successfully');
      
      return true;
    } catch (error) {
      console.error('[WebRTC Native] Failed to switch camera:', error);
      return false;
    }
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId) {
    try {
      const audioTrack = this.localStream?.getAudioTracks()[0];
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          deviceId: { exact: deviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const newTrack = newStream.getAudioTracks()[0];
      
      // Replace track in peer connection
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'audio');
        if (sender) {
          await sender.replaceTrack(newTrack);
        }
      }
      
      if (audioTrack) {
        audioTrack.stop();
        this.localStream.removeTrack(audioTrack);
      }
      this.localStream.addTrack(newTrack);
      
      this._triggerHandler('onLocalStreamUpdate', this.localStream);
      console.log('[WebRTC Native] Microphone switched successfully');
      
      return true;
    } catch (error) {
      console.error('[WebRTC Native] Failed to switch microphone:', error);
      return false;
    }
  }

  /**
   * Get available media devices
   */
  async getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      
      console.log('[WebRTC Native] Available devices:', {
        video: videoDevices.length,
        audio: audioDevices.length
      });
      
      return {
        videoDevices,
        audioDevices
      };
    } catch (error) {
      console.error('[WebRTC Native] Failed to get devices:', error);
      return {
        videoDevices: [],
        audioDevices: []
      };
    }
  }

  /**
   * Close peer connection and cleanup
   */
  destroy() {
    console.log('[WebRTC Native] Destroying peer connection');

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.connectionState = 'disconnected';
    this.isAnswerCreated = false;
    this.iceCandidatesQueue = [];

    console.log('[WebRTC Native] Peer connection destroyed');
    this._triggerHandler('onConnectionClosed');
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connectionState === 'connected';
  }

  /**
   * Get local stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream() {
    return this.remoteStream;
  }

  // Compatibility methods
  closePeerConnection() {
    this.destroy();
  }
}

// Create singleton instance
const webrtcNativeService = new WebRTCNativeService();

export default webrtcNativeService;
