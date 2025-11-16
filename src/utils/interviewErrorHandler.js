/**
 * Interview Error Handler Utility
 * Provides user-friendly error messages and handling for interview-related errors
 * Requirements: 8.1, 8.2, 8.3, 8.4, 10.1, 10.2, 10.3, 10.4, 10.5
 */

export const ERROR_CODES = {
  // WebRTC Errors
  WEBRTC_NOT_SUPPORTED: 'WEBRTC_NOT_SUPPORTED',
  MEDIA_PERMISSION_DENIED: 'MEDIA_PERMISSION_DENIED',
  MEDIA_DEVICE_NOT_FOUND: 'MEDIA_DEVICE_NOT_FOUND',
  PEER_CONNECTION_FAILED: 'PEER_CONNECTION_FAILED',
  ICE_CONNECTION_FAILED: 'ICE_CONNECTION_FAILED',
  SIGNALING_ERROR: 'SIGNALING_ERROR',
  
  // Recording Errors
  RECORDING_NOT_SUPPORTED: 'RECORDING_NOT_SUPPORTED',
  RECORDING_START_FAILED: 'RECORDING_START_FAILED',
  RECORDING_UPLOAD_FAILED: 'RECORDING_UPLOAD_FAILED',
  
  // Network Errors
  SOCKET_CONNECTION_FAILED: 'SOCKET_CONNECTION_FAILED',
  SOCKET_DISCONNECTED: 'SOCKET_DISCONNECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Interview Errors
  INTERVIEW_NOT_FOUND: 'INTERVIEW_NOT_FOUND',
  INTERVIEW_ACCESS_DENIED: 'INTERVIEW_ACCESS_DENIED',
  INTERVIEW_TIME_WINDOW_INVALID: 'INTERVIEW_TIME_WINDOW_INVALID',
  INTERVIEW_ALREADY_ENDED: 'INTERVIEW_ALREADY_ENDED',
};

export const ERROR_MESSAGES = {
  // WebRTC Errors
  [ERROR_CODES.WEBRTC_NOT_SUPPORTED]: {
    title: 'Trình duyệt không hỗ trợ',
    message: 'Trình duyệt của bạn không hỗ trợ WebRTC. Vui lòng sử dụng Chrome, Firefox, Safari hoặc Edge phiên bản mới nhất.',
    action: 'Cập nhật trình duyệt',
    actionUrl: 'https://www.google.com/chrome/'
  },
  [ERROR_CODES.MEDIA_PERMISSION_DENIED]: {
    title: 'Quyền truy cập bị từ chối',
    message: 'Vui lòng cấp quyền truy cập camera và microphone để tham gia phỏng vấn.',
    action: 'Hướng dẫn cấp quyền',
    instructions: [
      'Nhấp vào biểu tượng khóa/camera trên thanh địa chỉ',
      'Chọn "Cho phép" cho Camera và Microphone',
      'Tải lại trang và thử lại'
    ]
  },
  [ERROR_CODES.MEDIA_DEVICE_NOT_FOUND]: {
    title: 'Không tìm thấy thiết bị',
    message: 'Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra kết nối thiết bị.',
    action: 'Kiểm tra lại',
    instructions: [
      'Đảm bảo camera/microphone đã được kết nối',
      'Kiểm tra xem thiết bị có hoạt động với ứng dụng khác không',
      'Thử rút và cắm lại thiết bị'
    ]
  },
  [ERROR_CODES.PEER_CONNECTION_FAILED]: {
    title: 'Kết nối thất bại',
    message: 'Không thể kết nối với người phỏng vấn. Vui lòng kiểm tra kết nối mạng.',
    action: 'Thử lại',
    instructions: [
      'Kiểm tra kết nối internet của bạn',
      'Tắt VPN nếu đang sử dụng',
      'Thử kết nối lại'
    ]
  },
  [ERROR_CODES.ICE_CONNECTION_FAILED]: {
    title: 'Kết nối mạng gặp sự cố',
    message: 'Không thể thiết lập kết nối. Có thể do tường lửa hoặc cấu hình mạng.',
    action: 'Khắc phục',
    instructions: [
      'Kiểm tra firewall/tường lửa',
      'Tắt phần mềm chặn quảng cáo',
      'Liên hệ IT nếu đang ở mạng công ty'
    ]
  },
  [ERROR_CODES.SIGNALING_ERROR]: {
    title: 'Lỗi kết nối server',
    message: 'Không thể giao tiếp với server. Vui lòng thử lại.',
    action: 'Thử lại'
  },
  
  // Recording Errors
  [ERROR_CODES.RECORDING_NOT_SUPPORTED]: {
    title: 'Không hỗ trợ ghi hình',
    message: 'Trình duyệt của bạn không hỗ trợ tính năng ghi hình.',
    action: 'Cập nhật trình duyệt'
  },
  [ERROR_CODES.RECORDING_START_FAILED]: {
    title: 'Không thể bắt đầu ghi hình',
    message: 'Đã xảy ra lỗi khi bắt đầu ghi hình. Vui lòng thử lại.',
    action: 'Thử lại'
  },
  [ERROR_CODES.RECORDING_UPLOAD_FAILED]: {
    title: 'Tải lên thất bại',
    message: 'Không thể tải video lên server. Vui lòng kiểm tra kết nối.',
    action: 'Thử lại'
  },
  
  // Network Errors
  [ERROR_CODES.SOCKET_CONNECTION_FAILED]: {
    title: 'Mất kết nối',
    message: 'Không thể kết nối với server. Vui lòng kiểm tra internet.',
    action: 'Kết nối lại'
  },
  [ERROR_CODES.SOCKET_DISCONNECTED]: {
    title: 'Mất kết nối',
    message: 'Kết nối với server bị gián đoạn. Đang thử kết nối lại...',
    action: 'Đang kết nối lại'
  },
  
  // Interview Errors
  [ERROR_CODES.INTERVIEW_NOT_FOUND]: {
    title: 'Không tìm thấy phỏng vấn',
    message: 'Phỏng vấn không tồn tại hoặc đã bị xóa.',
    action: 'Quay lại'
  },
  [ERROR_CODES.INTERVIEW_ACCESS_DENIED]: {
    title: 'Không có quyền truy cập',
    message: 'Bạn không có quyền tham gia phỏng vấn này.',
    action: 'Quay lại'
  },
  [ERROR_CODES.INTERVIEW_TIME_WINDOW_INVALID]: {
    title: 'Chưa đến giờ phỏng vấn',
    message: 'Bạn chỉ có thể tham gia phỏng vấn trong khoảng thời gian cho phép.',
    action: 'Đồng ý'
  },
  [ERROR_CODES.INTERVIEW_ALREADY_ENDED]: {
    title: 'Phỏng vấn đã kết thúc',
    message: 'Phỏng vấn này đã kết thúc.',
    action: 'Xem chi tiết'
  },
};

/**
 * Get user-friendly error message for error code
 */
export const getErrorMessage = (errorCode, defaultMessage = null) => {
  const errorInfo = ERROR_MESSAGES[errorCode];
  
  if (!errorInfo) {
    return {
      title: 'Đã xảy ra lỗi',
      message: defaultMessage || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
      action: 'Đóng'
    };
  }
  
  return errorInfo;
};

/**
 * Handle camera/microphone permission errors
 */
export const handleMediaPermissionError = (error) => {
  console.error('[ErrorHandler] Media permission error:', error);
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return ERROR_CODES.MEDIA_PERMISSION_DENIED;
  }
  
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return ERROR_CODES.MEDIA_DEVICE_NOT_FOUND;
  }
  
  if (error.name === 'NotSupportedError') {
    return ERROR_CODES.WEBRTC_NOT_SUPPORTED;
  }
  
  return ERROR_CODES.PEER_CONNECTION_FAILED;
};

/**
 * Handle WebRTC connection errors
 */
export const handleWebRTCError = (error, connectionState) => {
  console.error('[ErrorHandler] WebRTC error:', error, connectionState);
  
  if (connectionState?.iceConnectionState === 'failed') {
    return ERROR_CODES.ICE_CONNECTION_FAILED;
  }
  
  if (connectionState?.connectionState === 'failed') {
    return ERROR_CODES.PEER_CONNECTION_FAILED;
  }
  
  return ERROR_CODES.PEER_CONNECTION_FAILED;
};

/**
 * Handle socket connection errors
 */
export const handleSocketError = (error) => {
  console.error('[ErrorHandler] Socket error:', error);
  
  if (error.message?.includes('timeout')) {
    return ERROR_CODES.NETWORK_ERROR;
  }
  
  return ERROR_CODES.SOCKET_CONNECTION_FAILED;
};

/**
 * Handle recording errors
 */
export const handleRecordingError = (error, phase = 'start') => {
  console.error('[ErrorHandler] Recording error:', error, phase);
  
  if (error.name === 'NotSupportedError') {
    return ERROR_CODES.RECORDING_NOT_SUPPORTED;
  }
  
  if (phase === 'upload') {
    return ERROR_CODES.RECORDING_UPLOAD_FAILED;
  }
  
  return ERROR_CODES.RECORDING_START_FAILED;
};

/**
 * Check browser compatibility for WebRTC
 */
export const checkBrowserCompatibility = () => {
  const hasGetUserMedia = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );
  
  const hasRTCPeerConnection = !!(
    window.RTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection
  );
  
  const hasMediaRecorder = !!window.MediaRecorder;
  
  return {
    isCompatible: hasGetUserMedia && hasRTCPeerConnection,
    hasGetUserMedia,
    hasRTCPeerConnection,
    hasMediaRecorder,
    recommendedBrowsers: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+']
  };
};

/**
 * Get troubleshooting steps for an error
 */
export const getTroubleshootingSteps = (errorCode) => {
  const errorInfo = ERROR_MESSAGES[errorCode];
  return errorInfo?.instructions || [];
};

/**
 * Log error for analytics
 */
export const logError = (errorCode, context = {}) => {
  console.error('[Interview Error]', {
    code: errorCode,
    message: ERROR_MESSAGES[errorCode]?.message,
    ...context,
    timestamp: new Date().toISOString()
  });
  
  // Send to analytics service if available
  if (window.gtag) {
    window.gtag('event', 'interview_error', {
      error_code: errorCode,
      error_context: JSON.stringify(context)
    });
  }
};
