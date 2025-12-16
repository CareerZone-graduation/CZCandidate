/**
 * AI Interview Service
 * Handles all API calls for the AI virtual interview feature
 * Uses apiClient for JWT authentication
 */

import apiClient from './apiClient';

// Base path for Python proxy (relative to apiClient baseURL)
const PYTHON_API_PATH = '/python';

/**
 * Get AssemblyAI token for real-time transcription
 * @returns {Promise<{token: string}>}
 */
export const getAssemblyAIToken = async () => {
  try {
    const response = await apiClient.get(`${PYTHON_API_PATH}/api/assemblyai/token`);
    return response.data;
  } catch (error) {
    console.error('AssemblyAI token error:', error);
    throw error;
  }
};

/**
 * Transcribe audio using AssemblyAI
 * @param {string} audioData - Base64 encoded audio data
 * @returns {Promise<{text: string}>}
 */
export const transcribeAudio = async (audioData) => {
  try {
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/transcribe`, { audioData });
    return response.data;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Send message to AI chat (Gemini)
 * @param {string} sessionId - Unique session identifier
 * @param {string} message - User message (optional if isStart is true)
 * @param {boolean} isStart - Whether this is the start of the interview
 * @param {string} topic - Interview topic for focused questions (optional)
 * @returns {Promise<{response: string}>}
 */
export const sendChatMessage = async (sessionId, message = '', isStart = false, topic = null) => {
  try {
    const payload = { 
      sessionId, 
      message, 
      isStart 
    };
    
    // Only include topic when starting the interview
    if (isStart && topic) {
      payload.topic = topic;
    }
    
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/chat`, payload);
    return response.data;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};

/**
 * Generate text-to-speech audio
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Blob>}
 */
export const generateTTS = async (text) => {
  try {
    const response = await apiClient.post(
      `${PYTHON_API_PATH}/api/tts`, 
      { text },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
};

/**
 * Get D-ID streaming credentials
 * @returns {Promise<{id: string, session_id: string, offer: RTCSessionDescriptionInit, ice_servers: RTCIceServer[]}>}
 */
export const getDIDCredentials = async () => {
  try {
    const response = await apiClient.get(`${PYTHON_API_PATH}/api/did/credentials`);
    return response.data;
  } catch (error) {
    console.error('D-ID credentials error:', error);
    throw error;
  }
};

/**
 * Submit SDP answer to D-ID
 * @param {string} streamId - D-ID stream ID
 * @param {string} sessionId - D-ID session ID
 * @param {string} sdpType - SDP type (answer)
 * @param {string} sdpSdp - SDP content
 * @returns {Promise<Object>}
 */
export const submitDIDSDP = async (streamId, sessionId, sdpType, sdpSdp) => {
  try {
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/did/sdp`, { 
      streamId, 
      sessionId, 
      sdpType, 
      sdpSdp 
    });
    return response.data;
  } catch (error) {
    console.error('D-ID SDP error:', error);
    throw error;
  }
};

/**
 * Submit ICE candidate to D-ID
 * @param {string} streamId - D-ID stream ID
 * @param {string} sessionId - D-ID session ID
 * @param {string} candidate - ICE candidate
 * @param {string} sdpMid - SDP mid
 * @param {number} sdpMLineIndex - SDP M-Line index
 * @returns {Promise<Object>}
 */
export const submitDIDICE = async (streamId, sessionId, candidate, sdpMid, sdpMLineIndex) => {
  try {
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/did/ice`, { 
      streamId, 
      sessionId, 
      candidate, 
      sdpMid, 
      sdpMLineIndex 
    });
    return response.data;
  } catch (error) {
    console.error('D-ID ICE error:', error);
    throw error;
  }
};

/**
 * Make D-ID avatar speak
 * @param {string} streamId - D-ID stream ID
 * @param {string} sessionId - D-ID session ID
 * @param {string} text - Text for the avatar to speak
 * @returns {Promise<Object>}
 */
export const speakWithDID = async (streamId, sessionId, text) => {
  try {
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/did/speak`, { 
      streamId, 
      sessionId, 
      text 
    });
    return response.data;
  } catch (error) {
    console.error('D-ID speak error:', error);
    throw error;
  }
};

/**
 * Close D-ID stream and clear session
 * @param {string} streamId - D-ID stream ID
 * @param {string} sessionId - D-ID session ID
 * @returns {Promise<{success: boolean}>}
 */
export const closeDIDStream = async (streamId, sessionId) => {
  try {
    const response = await apiClient.post(`${PYTHON_API_PATH}/api/did/close`, { 
      streamId, 
      sessionId 
    });
    return response.data;
  } catch (error) {
    console.error('Close stream error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear interview session (deprecated - use closeDIDStream instead)
 * @param {string} sessionId - Interview session ID
 * @returns {Promise<{success: boolean}>}
 */
export const clearSession = async (sessionId) => {
  // This function is now handled by closeDIDStream
  return { success: true };
};

export default {
  getAssemblyAIToken,
  transcribeAudio,
  sendChatMessage,
  generateTTS,
  getDIDCredentials,
  submitDIDSDP,
  submitDIDICE,
  speakWithDID,
  closeDIDStream,
  clearSession
};
