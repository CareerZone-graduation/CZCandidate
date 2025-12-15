/**
 * InterviewSocketService for Candidate - Manages Socket.io connections for interview features
 * Handles WebRTC signaling, chat messages, and room management
 */
import { io } from 'socket.io-client';

class InterviewSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.currentInterviewId = null;
    this.eventHandlers = new Map();
    this.connectionPromise = null;
    this.currentUser = null;
    this.currentUserId = null;

    // Get Socket.io URL from environment
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    this.socketUrl = apiUrl.replace(/\/api$/, '');
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
   * Remove all listeners for an event or all events
   * @param {string} event - Event name (optional)
   */
  removeAllListeners(event = null) {
    if (event) {
      this.eventHandlers.delete(event);
    } else {
      this.eventHandlers.clear();
    }
  }

  /**
   * Trigger event handlers
   * @private
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  _triggerHandler(event, data) {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[InterviewSocket] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Connect to Socket.io server with JWT authentication
   */
  async connect(token) {
    if (this.socket && this.isConnected) {
      console.log('[InterviewSocket] Already connected');
      return Promise.resolve();
    }

    if (this.isConnecting && this.connectionPromise) {
      console.log('[InterviewSocket] Connection in progress');
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      if (!token) {
        console.error('[InterviewSocket] No authentication token');
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(new Error('No authentication token'));
        return;
      }

      console.log('[InterviewSocket] Connecting to:', this.socketUrl);

      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.error('[InterviewSocket] Connection timeout');
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      this.socket = io(this.socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000,
        timeout: 20000,
        path: '/socket.io',
      });

      this.socket.on('connect', () => {
        console.log('[InterviewSocket] Connected, socket ID:', this.socket.id);
        clearTimeout(connectionTimeout);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this._triggerHandler('onConnect', { socketId: this.socket.id });

        // Debug: Log all socket events
        this.socket.onAny((eventName, ...args) => {
          console.log('[InterviewSocket] 🔔 Event received:', eventName, args);
        });

        resolve();
      });

      // Listen for authentication success
      this.socket.on('auth:success', (data) => {
        console.log('[InterviewSocket] Auth success:', data);
        this.currentUserId = data.userId;
        this.currentUser = data.user;
        this._triggerHandler('onAuthSuccess', data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[InterviewSocket] Connection error:', error.message);
        this.isConnected = false;
        this.reconnectAttempts++;

        this._triggerHandler('onConnectionError', {
          error,
          attempt: this.reconnectAttempts
        });

        if (this.reconnectAttempts === 1) {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.connectionPromise = null;
          reject(error);
        }
      });

      this.socket.io.on('reconnect', (attemptNumber) => {
        console.log(`[InterviewSocket] Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;

        if (this.currentInterviewId) {
          console.log('[InterviewSocket] Rejoining interview after reconnect');
          this.joinInterview(this.currentInterviewId, { role: 'candidate' });
        }

        this._triggerHandler('onReconnect', attemptNumber);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[InterviewSocket] Disconnected:', reason);
        this.isConnected = false;
        this._triggerHandler('onDisconnect', reason);
      });

      this._setupInterviewListeners();
    });

    return this.connectionPromise;
  }

  /**
   * Setup listeners for interview events
   * @private
   */
  _setupInterviewListeners() {
    if (!this.socket) return;

    // User joined
    this.socket.on('interview:user-joined', (data) => {
      console.log('[InterviewSocket] User joined:', data);
      this._triggerHandler('onUserJoined', data);
    });

    // User left
    this.socket.on('interview:user-left', (data) => {
      console.log('[InterviewSocket] User left:', data);
      this._triggerHandler('onUserLeft', data);
    });

    // Peer disconnected abruptly
    this.socket.on('interview:peer-disconnected', (data) => {
      console.log('[InterviewSocket] Peer disconnected abruptly:', data);
      this._triggerHandler('onPeerDisconnected', data);
    });

    // WebRTC signaling - Offer
    this.socket.on('interview:offer', (data) => {
      console.log('[InterviewSocket] Offer received');
      this._triggerHandler('onOffer', data);
    });

    // WebRTC signaling - Answer
    this.socket.on('interview:answer', (data) => {
      console.log('[InterviewSocket] Answer received');
      this._triggerHandler('onAnswer', data);
    });

    // WebRTC signaling - ICE candidate
    this.socket.on('interview:ice-candidate', (data) => {
      console.log('[InterviewSocket] ICE candidate received');
      this._triggerHandler('onIceCandidate', data);
    });

    // WebRTC signaling - Generic signal
    this.socket.on('interview:signal', (data) => {
      console.log('[InterviewSocket] ===== Signal received from socket =====');
      console.log('[InterviewSocket] Signal from:', data.from || data.fromUserId);
      console.log('[InterviewSocket] Signal type:', data.signal?.type);
      console.log('[InterviewSocket] Full data:', data);
      this._triggerHandler('onSignal', data);
      console.log('[InterviewSocket] Signal handler triggered');
    });

    // Chat message
    this.socket.on('interview:chat-message', (data) => {
      console.log('[InterviewSocket] Chat message received');
      this._triggerHandler('onChatMessage', data);
    });

    // Received emoji
    this.socket.on('interview:emoji', (data) => {
      console.log('[InterviewSocket] Emoji received:', data);
      this._triggerHandler('onEmoji', data);
    });

    // Media state changed
    this.socket.on('interview:media-state', (data) => {
      console.log('[InterviewSocket] Media state changed:', data);
      this._triggerHandler('onMediaStateChanged', data);
    });

    // Screen share stopped
    this.socket.on('interview:screen-share-stopped', (data) => {
      console.log('[InterviewSocket] Screen share stopped:', data);
      this._triggerHandler('onRemoteScreenShareStopped', data);
    });

    // Recording started
    this.socket.on('interview:recording-started', (data) => {
      console.log('[InterviewSocket] Recording started');
      this._triggerHandler('onRecordingStarted', data);
    });

    // Recording stopped
    this.socket.on('interview:recording-stopped', (data) => {
      console.log('[InterviewSocket] Recording stopped');
      this._triggerHandler('onRecordingStopped', data);
    });

    // Interview ended
    this.socket.on('interview:ended', (data) => {
      console.log('[InterviewSocket] Interview ended');
      this._triggerHandler('onInterviewEnded', data);
    });

    // Interview started
    this.socket.on('interview:started', (data) => {
      console.log('[InterviewSocket] Interview started');
      this._triggerHandler('onInterviewStarted', data);
    });

    // Error
    this.socket.on('interview:error', (data) => {
      console.error('[InterviewSocket] Interview error:', data);
      this._triggerHandler('onError', data);
    });
  }

  /**
   * Join interview room
   */
  async joinInterview(interviewId, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[InterviewSocket] Joining interview:', interviewId);

      this.socket.emit('interview:join', {
        roomId: interviewId, // Backend expects both roomId and interviewId
        interviewId,
        role: 'candidate',
        ...data
      }, (response) => {
        if (response?.success) {
          console.log('[InterviewSocket] Joined interview successfully');
          this.currentInterviewId = interviewId;
          resolve(response);
        } else {
          console.error('[InterviewSocket] Failed to join interview:', response?.error);
          reject(new Error(response?.error || 'Failed to join interview'));
        }
      });
    });
  }

  /**
   * Leave interview room
   */
  leaveInterview(interviewId) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot leave - socket not connected');
      return;
    }

    console.log('[InterviewSocket] Leaving interview:', interviewId);

    this.socket.emit('interview:leave', {
      interviewId,
      roomId: interviewId // Backend expects roomId
    });
    this.currentInterviewId = null;
  }

  /**
   * Send answer (Native WebRTC)
   */
  sendAnswer(interviewId, answer, to) {
    if (!this.socket || !this.isConnected) {
      console.error('[InterviewSocket] Cannot send answer - socket not connected');
      return;
    }

    console.log('[InterviewSocket] Sending answer');

    this.socket.emit('interview:answer', {
      interviewId,
      roomId: interviewId,
      answer,
      to
    });
  }

  /**
   * Send ICE candidate (Native WebRTC)
   */
  sendIceCandidate(interviewId, candidate, to) {
    if (!this.socket || !this.isConnected) {
      return;
    }

    console.log('[InterviewSocket] Sending ICE candidate');

    this.socket.emit('interview:ice-candidate', {
      interviewId,
      roomId: interviewId,
      candidate,
      to
    });
  }

  /**
   * Send WebRTC signal (for simple-peer)
   * Signal can be offer, answer, or ICE candidate
   */
  sendSignal(interviewId, signal, to) {
    if (!this.socket || !this.isConnected) {
      console.error('[InterviewSocket] Cannot send signal - socket not connected');
      return;
    }

    console.log('[InterviewSocket] Sending signal:', signal.type || 'candidate', to ? `to ${to}` : 'to room');

    // Use unified interview:signal event for all signal types
    this.socket.emit('interview:signal', {
      interviewId,
      signal,
      to
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(interviewId, message) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        console.error('[InterviewSocket] Cannot send message - socket not connected');
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('[InterviewSocket] Sending chat message');

      this.socket.emit('interview:chat-message', {
        roomId: interviewId, // Backend expects both roomId and interviewId
        interviewId,
        message
      }, (response) => {
        if (response?.success) {
          console.log('[InterviewSocket] Message sent successfully');
          resolve(response);
        } else {
          console.error('[InterviewSocket] Failed to send message:', response?.error);
          reject(new Error(response?.error || 'Failed to send message'));
        }
      });
    });
  }

  /**
   * Send emoji reaction
   * @param {string} interviewId - Interview ID
   * @param {string} emoji - Emoji character
   */
  sendEmoji(interviewId, emoji) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot send emoji: not connected');
      return;
    }

    this.socket.emit('interview:emoji', {
      roomId: interviewId, // Use interviewId as roomId
      interviewId,
      emoji
    });
  }

  /**
   * Notify media state changed (audio/video toggle)
   */
  notifyMediaStateChanged(interviewId, isAudioEnabled, isVideoEnabled) {
    if (!this.socket || !this.isConnected) {
      console.warn('[InterviewSocket] Cannot notify media state - socket not connected');
      return;
    }

    console.log('[InterviewSocket] Notifying media state changed:', { isAudioEnabled, isVideoEnabled });

    this.socket.emit('interview:media-state', {
      roomId: interviewId,
      isAudioEnabled,
      isVideoEnabled
    });
  }

  /**
   * Notify screen share stopped
   */
  notifyScreenShareStopped(interviewId) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('interview:screen-share-stopped', {
      roomId: interviewId,
      interviewId
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log('[InterviewSocket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.currentInterviewId = null;
    this.connectionPromise = null;
  }

  /**
   * Get current user ID (from JWT decode)
   */
  getCurrentUserId() {
    return this.currentUserId;
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      socketId: this.socket?.id,
      currentInterviewId: this.currentInterviewId,
      reconnectAttempts: this.reconnectAttempts,
      currentUserId: this.currentUserId
    };
  }
  /**
   * Reset the service
   */
  reset() {
    this.disconnect();
    this.eventHandlers.clear();
    this.connectionPromise = null;
    this.isConnecting = false;
  }
}

// Export singleton instance
const interviewSocketService = new InterviewSocketService();
export default interviewSocketService;
