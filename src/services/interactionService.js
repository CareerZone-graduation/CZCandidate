import apiClient from './apiClient';

/**
 * Service to track user interactions with jobs (view, click, save, apply)
 */
class InteractionService {
    /**
     * Track a single interaction
     * @param {Object} data 
     * @param {string} data.jobId - Required 
     * @param {string} data.type - Required ('VIEW', 'SAVE', 'APPLY')
     * @param {Object} [data.context] - Optional context info { sourcePage, deviceType, durationSeconds }
     * @returns {Promise<any>}
     */
    async trackEvent(data) {
        try {
            const response = await apiClient.post('/interactions', data);
            return response.data;
        } catch (error) {
            // Fail silently to not impact user experience
            console.warn('Failed to track interaction:', error.message);
            return null;
        }
    }

    /**
     * Helper method for common VIEW event
     */
    async trackJobView(jobId, context = {}) {
        return this.trackEvent({
            jobId,
            type: 'VIEW',
            context
        });
    }

    /**
     * Helper method for common SAVE event
     */
    async trackJobSave(jobId, context = {}) {
        return this.trackEvent({
            jobId,
            type: 'SAVE',
            context
        });
    }

    /**
     * Helper method for common APPLY event
     */
    async trackJobApply(jobId, context = {}) {
        return this.trackEvent({
            jobId,
            type: 'APPLY',
            context
        });
    }

}

export const interactionService = new InteractionService();
export default interactionService;
