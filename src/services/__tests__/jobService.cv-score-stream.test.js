import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../apiClient';
import { startCVScoreAnalysis, buildCVScoreStreamUrl } from '../jobService';

vi.mock('../apiClient');

describe('jobService - CV Score Stream APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls start analysis endpoint', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { success: true, data: { analysisId: 'anl_1' } } });
    
    const result = await startCVScoreAnalysis('app123');
    
    expect(apiClient.post).toHaveBeenCalledWith('/applications/app123/cv-score/analysis');
    expect(result).toEqual({ success: true, data: { analysisId: 'anl_1' } });
  });

  it('builds stream URL from analysisId', () => {
    // import.meta.env is handled by vitest config, but if not we still test the suffix
    const url = buildCVScoreStreamUrl('anl_1');
    expect(url).toContain('/api/applications/cv-score/stream/anl_1');
  });
});
