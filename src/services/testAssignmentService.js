import apiClient from '@/services/apiClient';

export const getAssignment = (assignmentId) => apiClient.get(`/test-assignments/${assignmentId}`);
export const startAssignment = (assignmentId) => apiClient.post(`/test-assignments/${assignmentId}/start`);
export const saveAnswer = (assignmentId, payload) => apiClient.put(`/test-assignments/${assignmentId}/answer`, payload);
export const submitAssignment = (assignmentId, payload) => apiClient.post(`/test-assignments/${assignmentId}/submit`, payload);
export const getAssignmentResult = (assignmentId) => apiClient.get(`/test-assignments/${assignmentId}/result`);
