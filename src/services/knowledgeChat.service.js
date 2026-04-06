import apiClient from './apiClient';
import { getAccessToken } from '@/utils/token';

export const chatWithJob = async (jobId, data) => {
  const res = await apiClient.post(`/candidate/chat/job/${jobId}`, data);
  return res.data; // fe/ unwraps .data in component
};

export const chatWithCompany = async (recruiterId, data) => {
  const res = await apiClient.post(`/candidate/chat/company/${recruiterId}`, data);
  return res.data;
};

export const chatWithJobStream = async (jobId, data, onChunk) => {
  const token = getAccessToken();

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/candidate/chat/job/${jobId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...data, stream: true })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Stream error:', response.status, error);
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      if (!block.trim()) continue;

      const eventMatch = block.match(/^event: (.+)$/m);
      const dataMatch = block.match(/^data: (.+)$/m);

      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1];
        const eventData = JSON.parse(dataMatch[1]);

        if (eventType === 'text_delta') {
          onChunk({ type: 'content', content: eventData.delta });
        } else if (eventType === 'sources') {
          onChunk({ type: 'sources', sources: eventData.sources });
        } else if (eventType === 'done') {
          onChunk({ type: 'done' });
        } else if (eventType === 'error') {
          onChunk({ type: 'error', message: eventData.message });
        }
      }
    }
  }
};

export const chatWithCompanyStream = async (recruiterId, data, onChunk) => {
  const token = getAccessToken();

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/candidate/chat/company/${recruiterId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...data, stream: true })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Stream error:', response.status, error);
    throw new Error(`Stream request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const block of lines) {
      if (!block.trim()) continue;

      const eventMatch = block.match(/^event: (.+)$/m);
      const dataMatch = block.match(/^data: (.+)$/m);

      if (eventMatch && dataMatch) {
        const eventType = eventMatch[1];
        const eventData = JSON.parse(dataMatch[1]);

        if (eventType === 'text_delta') {
          onChunk({ type: 'content', content: eventData.delta });
        } else if (eventType === 'sources') {
          onChunk({ type: 'sources', sources: eventData.sources });
        } else if (eventType === 'done') {
          onChunk({ type: 'done' });
        } else if (eventType === 'error') {
          onChunk({ type: 'error', message: eventData.message });
        }
      }
    }
  }
};
