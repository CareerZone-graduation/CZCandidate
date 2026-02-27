/**
 * AI Interview Service
 * Handles all API calls for the AI virtual interview feature
 * Uses apiClient for JWT authentication
 */

import apiClient from './apiClient';
import { getAccessToken } from '@/utils/token'; // Import utils để lấy đúng token

// Base path for Python service directly bypassing node proxy
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000/api';

/**
 * Get AssemblyAI token for real-time transcription
 * @returns {Promise<{token: string}>}
 */
export const getAssemblyAIToken = async () => {
  try {
    const response = await apiClient.get('/ai-interview/assemblyai/token');
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
    const response = await apiClient.post('/ai-interview/transcribe', { audioData });
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
export const sendChatMessage = async (sessionId, message = '', isStart = false, topic = null, avatarType = 'live2d') => {
  try {
    const payload = {
      sessionId,
      message,
      isStart,
      avatarType
    };

    if (isStart && topic) {
      payload.topic = topic;
    }

    // Dùng apiClient (Axios) thay vì fetch gốc. 
    // Do endpoint trả stream audio, ta chỉ định adapter là 'fetch' để nhận đúng ReadableStream trên trình duyệt (hỗ trợ bởi Axios 1.7.0+)
    const response = await apiClient.post('/ai-interview/chat', payload, {
      responseType: 'stream',
      adapter: 'fetch'
    });

    // Axios trả về header dưới dạng lowercase hoặc thông qua hàm get()
    const aiResponseEnc = response.headers['x-ai-response'] || (typeof response.headers.get === 'function' ? response.headers.get('x-ai-response') : null);

    let aiResponseText = '';
    if (aiResponseEnc) {
      aiResponseText = decodeURIComponent(aiResponseEnc);
    } else {
      console.warn('X-AI-Response header missing in stream');
      aiResponseText = '...'; // fallback
    }

    return {
      response: aiResponseText,
      // Khi dùng adapter: 'fetch' với responseType: 'stream', response.data chính là ReadableStream
      audioStream: response.data
    };
  } catch (error) {
    console.error('Chat API Error:', error);
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
      '/ai-interview/tts',
      { text },
      {
        responseType: 'blob'
      }
    );
    return response.data;
  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
};

/**
 * Get Simli session token
 * @param {string} faceId - Simli Face ID
 * @returns {Promise<any>}
 */
export const getSimliSessionToken = async (faceId) => {
  try {
    const response = await apiClient.post('/ai-interview/simli/get-session-token', { faceId });
    return response.data;
  } catch (error) {
    console.error('Simli session token error:', error);
    throw error;
  }
};

/**
 * Get Simli ICE servers
 * @returns {Promise<any>}
 */
export const getSimliIceServers = async () => {
  try {
    const response = await apiClient.get('/ai-interview/simli/get-ice-servers');
    return response.data;
  } catch (error) {
    console.error('Simli ICE servers error:', error);
    throw error;
  }
};

// Removed D-ID functions

/**
 * Clear interview session (deprecated)
 * @param {string} sessionId - Interview session ID
 * @returns {Promise<{success: boolean}>}
 */
export const clearSession = async (sessionId) => {
  return { success: true };
};

export default {
  getAssemblyAIToken,
  transcribeAudio,
  sendChatMessage,
  generateTTS,
  clearSession,
  getSimliSessionToken,
  getSimliIceServers
};
