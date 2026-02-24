/**
 * AI Interview Service
 * Handles all API calls for the AI virtual interview feature
 * Uses apiClient for JWT authentication
 */

import apiClient from './apiClient';

// Base path for Python service directly bypassing node proxy
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000/api';

/**
 * Get AssemblyAI token for real-time transcription
 * @returns {Promise<{token: string}>}
 */
export const getAssemblyAIToken = async () => {
  try {
    const response = await apiClient.get('/assemblyai/token', { baseURL: PYTHON_API_URL });
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
    const response = await apiClient.post('/transcribe', { audioData }, { baseURL: PYTHON_API_URL });
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

    if (isStart && topic) {
      payload.topic = topic;
    }

    const token = localStorage.getItem('token') || '';

    const fetchUrl = `${PYTHON_API_URL}/chat`;

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Chat API failed: ${response.statusText}`);
    }

    // AI Response is injected into custom header by Backend
    const aiResponseEnc = response.headers.get('X-AI-Response');
    let aiResponseText = '';
    if (aiResponseEnc) {
      aiResponseText = decodeURIComponent(aiResponseEnc);
    } else {
      console.warn('X-AI-Response header missing in stream');
      aiResponseText = '...'; // fallback
    }

    return {
      response: aiResponseText,
      audioStream: response.body
    };
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
      '/tts',
      { text },
      {
        responseType: 'blob',
        baseURL: PYTHON_API_URL
      }
    );
    return response.data;
  } catch (error) {
    console.error('TTS error:', error);
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
  clearSession
};
