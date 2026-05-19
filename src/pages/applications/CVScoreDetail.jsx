import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ArrowLeft,
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  BarChart3,
  Loader2,
  Zap,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

// Import services
import { getApplicationDetail } from '../../services/applicationService';
import { getJobById, buildCVScoreStreamUrl, startCVScoreAnalysis } from '../../services/jobService';
import apiClient from '../../services/apiClient';
import { getAccessToken } from '../../utils/token';

// Import CV Analysis Components
import CVRadarChart from '../../components/cv-analysis/CVRadarChart';
import CareerPathTimeline from '../../components/cv-analysis/CareerPathTimeline';
import ProjectRecommendations from '../../components/cv-analysis/ProjectRecommendations';
import AIImprovementPanel from '../../components/cv-analysis/AIImprovementPanel';

const CV_SCORE_PREVIEW_STORAGE_KEY = 'careerzone.cvScorePreview';
const STREAM_REPLAY_DELAY_MS = 450;

const formatSkillLevel = (level) => {
  if (!level) return 'Chưa xác định';

  const normalizedLevel = String(level).trim().toLowerCase();
  const levelLabels = {
    none: 'Chưa có nền tảng',
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    expert: 'Chuyên gia'
  };

  return levelLabels[normalizedLevel] || level;
};

const renderTextValue = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (Array.isArray(value)) return value.map(renderTextValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    return value.skill || value.name || value.title || value.label || value.description || JSON.stringify(value);
  }
  return String(value);
};

const getGapCurrentLevel = (gap) => gap?.current_level ?? gap?.current;
const getGapRequiredLevel = (gap) => gap?.required_level ?? gap?.required;
const getGapEstimatedTime = (gap) => gap?.estimated_time ?? gap?.time;

const CVScoreDetail = () => {
  const { applicationId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if this is preview mode (data from router state/session storage)
  const [previewData, setPreviewData] = useState(null);
  const isPreviewMode = !applicationId && (location.pathname === '/cv-score' || searchParams.has('data'));

  // --- SSE Realtime Stream State ---
  const initialAnalysisId = location.state?.analysisId || location.state?.previewScore?.analysisId;
  const [analysisId, setAnalysisId] = useState(initialAnalysisId);
  const [streamStatus, setStreamStatus] = useState(initialAnalysisId ? 'CONNECTING' : 'IDLE'); // IDLE | CONNECTING | ANALYZING | DONE | ERROR
  const [streamData, setStreamData] = useState({});
  const [streamProgress, setStreamProgress] = useState(0);
  const [streamPhaseLabel, setStreamPhaseLabel] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [displayMatchScore, setDisplayMatchScore] = useState(null);

  const animateMatchScore = (nextScore) => {
    if (!Number.isFinite(nextScore)) return;

    setDisplayMatchScore((currentScore) => {
      const startScore = Number.isFinite(currentScore) ? currentScore : 0;
      const distance = nextScore - startScore;
      const steps = 20;
      let step = 0;

      const timer = setInterval(() => {
        step += 1;
        const progress = step / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(startScore + distance * easedProgress);

        setDisplayMatchScore(value);
        if (step >= steps) {
          clearInterval(timer);
          setDisplayMatchScore(nextScore);
        }
      }, 25);

      return startScore;
    });
  };

  const buildRadarMetrics = (scoreData) => {
    if (scoreData?.category_scores && Array.isArray(scoreData.category_scores) && scoreData.category_scores.length > 0) {
      return scoreData.category_scores.map((cat) => ({
        metric: cat.name || cat.category || 'Unknown',
        score: cat.score || 0
      }));
    }

    const radarChart = scoreData?.visualization?.radar_chart;
    if (radarChart?.labels && radarChart?.values && Array.isArray(radarChart.labels) && Array.isArray(radarChart.values)) {
      return radarChart.labels.map((label, idx) => ({
        metric: label,
        score: radarChart.values[idx] || 0
      }));
    }

    return scoreData?.breakdown
      ? Object.entries(scoreData.breakdown).map(([key, value]) => ({ metric: key, score: value || 0 }))
      : [];
  };

  const mergePreviewScore = (previousData, scoreData) => ({
    ...previousData,
    ...scoreData,
    enhanced: {
      ...(previousData?.enhanced || {}),
      ...(scoreData.enhanced || {}),
      career_paths: scoreData.career_paths || scoreData.enhanced?.career_paths || previousData?.enhanced?.career_paths || [],
      recommended_projects: scoreData.recommended_projects || scoreData.enhanced?.recommended_projects || previousData?.enhanced?.recommended_projects || [],
      skill_gaps: scoreData.skill_gaps || scoreData.enhanced?.skill_gaps || previousData?.enhanced?.skill_gaps || [],
      radar_metrics: buildRadarMetrics(scoreData)
    },
    isPreview: true
  });

  // Parse preview data from router state/session storage.
  // Query param support is kept only for old links, then the URL is cleaned.
  useEffect(() => {
    if (!isPreviewMode) return;

    try {
      let parsedData = location.state?.previewScore || null;

      if (!parsedData) {
        const storedData = sessionStorage.getItem(CV_SCORE_PREVIEW_STORAGE_KEY);
        if (storedData) {
          parsedData = JSON.parse(storedData);
        }
      }

      if (!parsedData && searchParams.has('data')) {
        const dataParam = searchParams.get('data');
        parsedData = JSON.parse(decodeURIComponent(dataParam));
      }

      if (!parsedData) {
        toast.error('Không tìm thấy dữ liệu chấm điểm CV');
        navigate(-1);
        return;
      }

      if (parsedData.analysisId && !analysisId) {
        setAnalysisId(parsedData.analysisId);
        setStreamStatus('CONNECTING');
      }

      setPreviewData(parsedData);

      try {
        sessionStorage.setItem(CV_SCORE_PREVIEW_STORAGE_KEY, JSON.stringify(parsedData));
      } catch (storageError) {
        console.warn('Could not persist CV scoring preview data', storageError);
      }

      if (searchParams.has('data')) {
        navigate('/cv-score', {
          replace: true,
          state: { previewScore: parsedData }
        });
      }
    } catch (error) {
      console.error('Error parsing preview data:', error);
      toast.error('Dữ liệu không hợp lệ');
      navigate(-1);
    }
  }, [isPreviewMode, location.state, searchParams, navigate, analysisId]);

  // Fetch application detail (only in application mode)
  const { data: applicationData, isLoading, refetch: refetchApplication } = useQuery({
    queryKey: ['applicationDetail', applicationId],
    queryFn: () => getApplicationDetail(applicationId),
    enabled: !!applicationId && !isPreviewMode,
  });

  // --- SSE Stream Effect ---
  useEffect(() => {
    if (!analysisId) return;

    let abortController;
    let retryCount = 0;
    let isCancelled = false;
    let isProcessingEventQueue = false;
    const eventQueue = [];
    const MAX_RETRIES = 3;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const connectSSE = () => {
      setStreamStatus('CONNECTING');
      const url = buildCVScoreStreamUrl(analysisId);
      abortController = new AbortController();

      const handleEvent = (eventType, data) => {
        if (eventType === 'progress_update') {
          if (data.analysisProgress != null) setStreamProgress(data.analysisProgress);
          if (data.phaseLabel) setStreamPhaseLabel(data.phaseLabel);
          return;
        }

        if (eventType === 'score_update') {
          const nextMatchScore = Number(data.matchScore ?? data.overall_score);
          const normalizedData = Number.isFinite(nextMatchScore)
            ? { ...data, overall_score: nextMatchScore }
            : data;
          setStreamData(prev => ({ ...prev, ...normalizedData }));
          animateMatchScore(nextMatchScore);

          if (isPreviewMode) {
            setPreviewData(prev => mergePreviewScore(prev || {}, normalizedData));
          }
          return;
        }

        if (eventType === 'section_update') {
          setStreamData(prev => ({ ...prev, ...(data.sections || {}) }));
          return;
        }

        if (eventType === 'completed' || eventType === 'analysis_complete') {
          if (data.finalResult) {
            const finalMatchScore = Number(data.finalResult.matchScore ?? data.finalResult.overall_score);
            const normalizedResult = Number.isFinite(finalMatchScore)
              ? { ...data.finalResult, overall_score: finalMatchScore }
              : data.finalResult;
            setStreamData(prev => ({ ...prev, ...normalizedResult }));
            animateMatchScore(finalMatchScore);
          }

          setStreamStatus('DONE');
          setStreamProgress(100);

          if (!isPreviewMode) {
            setTimeout(() => {
              refetchApplication();
              queryClient.invalidateQueries(['myApplications']);
            }, 1000);
          }
          return;
        }

        if (eventType === 'analysis_error') {
          toast.error(data.message || 'Lỗi phân tích CV');
          setStreamStatus('ERROR');
        }
      };

      const processEventQueue = async () => {
        if (isProcessingEventQueue) return;
        isProcessingEventQueue = true;

        while (!isCancelled && eventQueue.length > 0) {
          const { eventType, data } = eventQueue.shift();
          handleEvent(eventType, data);

          // When the server replays buffered SSE events, give React a frame to render each progress step.
          if (eventType === 'progress_update' && data.analysisProgress < 100) {
            await wait(STREAM_REPLAY_DELAY_MS);
          }
        }

        isProcessingEventQueue = false;
      };

      const enqueueEvent = (eventType, data) => {
        eventQueue.push({ eventType, data });
        processEventQueue();
      };

      const handleStreamFailure = () => {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const backoff = Math.pow(2, retryCount - 1) * 1000;
          setTimeout(connectSSE, backoff);
        } else {
          if (isPreviewMode) {
            toast.error('Mất kết nối stream. Không thể hoàn tất chấm điểm xem trước.');
            setStreamStatus('ERROR');
          } else {
            toast.error('Mất kết nối stream. Vui lòng chấm điểm lại.');
            setStreamStatus('ERROR');
          }
        }
      };

      fetch(url, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
          Accept: 'text/event-stream',
        },
        signal: abortController.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            throw new Error(`Stream request failed: ${response.status}`);
          }

          setStreamStatus('ANALYZING');
          retryCount = 0;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let currentEvent = 'message';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                enqueueEvent(currentEvent, data);
              }
            }
          }
        })
        .catch((error) => {
          if (error.name === 'AbortError') return;
          handleStreamFailure();
        });
    };

    connectSSE();
    return () => {
      isCancelled = true;
      if (abortController) abortController.abort();
    };
  }, [analysisId, isPreviewMode, refetchApplication, queryClient]);

  // --- Polling Fallback ---
  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      refetchApplication().then((res) => {
        const score = res.data?.data?.cvScore || res.data?.cvScore;
        if (score && score.overall_score) {
          setIsPolling(false);
          setStreamStatus('DONE');
          setStreamProgress(100);
          toast.success('Đã tải xong kết quả chấm điểm!');
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isPolling, refetchApplication]);

  // Fetch job detail (in preview mode when we have jobId)
  const { data: jobData, isLoading: isLoadingJob } = useQuery({
    queryKey: ['jobDetail', previewData?.jobId],
    queryFn: () => getJobById(previewData.jobId),
    enabled: isPreviewMode && !!previewData?.jobId,
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      if (isPreviewMode) {
        const requestData = previewData?.cvId
          ? { cvId: previewData.cvId }
          : { cvTemplateId: previewData?.cvTemplateId };

        const response = await apiClient.post(`/jobs/${previewData.jobId}/preview-cv-score`, {
          ...requestData,
          forceRefresh: true,
        });
        return response.data;
      }

      return startCVScoreAnalysis(applicationId, { forceRefresh: true });
    },
    onSuccess: (response) => {
      const nextAnalysisId = response?.data?.analysisId || response?.analysisId;
      if (nextAnalysisId) {
        setStreamData({});
        setStreamProgress(0);
        setStreamPhaseLabel('Đang khởi tạo...');
        setDisplayMatchScore(null);
        setIsPolling(false);
        setAnalysisId(nextAnalysisId);
        setStreamStatus('CONNECTING');
        toast.success('Đang chấm điểm lại CV...');
        return;
      }

      const nextScore = response?.data;
      if (!nextScore) {
        toast.error('Không nhận được kết quả phân tích mới');
        return;
      }

      if (isPreviewMode) {
        setPreviewData((current) => {
          const nextPreviewScore = mergePreviewScore(current, nextScore);
          try {
            sessionStorage.setItem(CV_SCORE_PREVIEW_STORAGE_KEY, JSON.stringify(nextPreviewScore));
          } catch (storageError) {
            console.warn('Could not persist CV scoring preview data', storageError);
          }
          return nextPreviewScore;
        });
      } else {
        queryClient.setQueryData(['applicationDetail', applicationId], (oldData) => {
          if (!oldData?.data) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              cvScore: nextScore
            }
          };
        });
      }

      toast.success('Đã chấm điểm lại CV');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể chấm điểm lại CV');
    }
  });

  // Use preview data or application data
  const application = isPreviewMode ? null : applicationData?.data;
  const isStreaming = streamStatus === 'CONNECTING' || streamStatus === 'ANALYZING';
  const isReanalyzing = isStreaming || reanalyzeMutation.isPending;
  const restCvScore = isPreviewMode ? previewData : null;
  // Merge SSE streamed data on top of REST data when streaming
  let cvScore = (isStreaming || streamStatus === 'DONE') && Object.keys(streamData).length > 0
    ? { ...(restCvScore || {}), ...streamData }
    : restCvScore;
  // Safe defaults so render never crashes on undefined.breakdown during streaming
  const hasRealScore = cvScore && cvScore.overall_score != null;
  if (isStreaming || streamStatus === 'DONE') {
    if (!cvScore) cvScore = {};
    if (!cvScore.breakdown) cvScore.breakdown = {};
  }
  const matchScoreValue = Number(cvScore?.matchScore ?? cvScore?.overall_score);
  const effectiveMatchScore = Number.isFinite(matchScoreValue) ? matchScoreValue : null;
  const heroMatchScore = isReanalyzing ? null : (displayMatchScore ?? effectiveMatchScore);
  const job = isPreviewMode ? jobData?.data?.data : application?.job;
  const scoreTimestamp = cvScore?.scoredAt
    ? new Date(cvScore.scoredAt).toLocaleString('vi-VN')
    : null;
  const showCachedScoreNotice = Boolean(cvScore?.isCached || scoreTimestamp);
  const canReanalyzeScore = Boolean(effectiveMatchScore != null && ((!isPreviewMode && applicationId) || (isPreviewMode && previewData?.jobId)));

  // Fix radar_metrics if it's in wrong format (has labels/values keys instead of array)
  if (cvScore?.enhanced?.radar_metrics && typeof cvScore.enhanced.radar_metrics === 'object' && !Array.isArray(cvScore.enhanced.radar_metrics)) {
    const radarData = cvScore.enhanced.radar_metrics;
    if (radarData.labels && radarData.values && Array.isArray(radarData.labels) && Array.isArray(radarData.values)) {
      // Convert from {labels: [...], values: [...]} to [{metric: ..., score: ...}, ...]
      cvScore = {
        ...cvScore,
        enhanced: {
          ...cvScore.enhanced,
          radar_metrics: radarData.labels.map((label, idx) => ({
            metric: label,
            score: radarData.values[idx]
          }))
        }
      };
      console.log('Fixed radar_metrics format:', cvScore.enhanced.radar_metrics);
    }
  }

  // Debug logs
  useEffect(() => {
    if (isPreviewMode && previewData) {
      console.log('=== PREVIEW MODE ===');
      console.log('Preview data:', previewData);
    } else if (application) {
      console.log('Application:', application);
      console.log('Job:', job);
      console.log('Job description:', job?.description);
      console.log('CV:', application?.cv);
      console.log('CV Score:', cvScore);
      console.log('=== ENHANCED DEBUG ===');
      console.log('Has enhanced?', !!cvScore?.enhanced);
      console.log('Enhanced data:', cvScore?.enhanced);
      console.log('Radar metrics:', cvScore?.enhanced?.radar_metrics);
      console.log('Career paths:', cvScore?.enhanced?.career_paths);
      console.log('Skill gaps:', cvScore?.enhanced?.skill_gaps);
      console.log('Projects:', cvScore?.enhanced?.recommended_projects);
    }
  }, [isPreviewMode, previewData, application, job, cvScore]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (isLoading || isLoadingJob || (isPreviewMode && !previewData)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show error only when NOT streaming AND no data at all
  if (!isStreaming && !isPolling && streamStatus !== 'DONE') {
    if ((!isPreviewMode && (!application || !cvScore || !cvScore.breakdown)) ||
        (isPreviewMode && (!previewData || (!previewData.breakdown && !previewData.analysisId)))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {!cvScore && !previewData ? 'Không tìm thấy kết quả chấm điểm' : 'Đang xử lý chấm điểm...'}
              </h2>
              <p className="text-gray-600 mb-4">
                {!cvScore && !previewData
                  ? 'Vui lòng chấm điểm CV trước khi xem chi tiết.'
                  : 'Hệ thống đang phân tích CV. Vui lòng đợi 30 giây và refresh lại trang.'}
              </p>
              <Button onClick={() => navigate(isPreviewMode && job?._id ? `/jobs/${job._id}` : '/dashboard/applications')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(isPreviewMode && job?._id ? `/jobs/${job._id}` : '/dashboard/applications')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Quay lại trang ứng tuyển' : 'Quay lại danh sách'}
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isPreviewMode ? 'Xem trước điểm CV' : 'Phân tích CV chi tiết'}
              </h1>
              <p className="text-gray-600">
                Vị trí: <span className="font-semibold">{job?.title}</span>
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-3">
              {heroMatchScore != null ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-700 mb-2">
                    Độ khớp CV-JD
                  </p>
                  <div className={cn('text-5xl font-bold mb-1 transition-all duration-700', getScoreColor(heroMatchScore))}>
                    {heroMatchScore}%
                  </div>
                  <Badge
                    className={cn(
                      'text-sm',
                      heroMatchScore >= 80
                        ? 'bg-green-100 text-green-700'
                        : heroMatchScore >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {heroMatchScore >= 80
                      ? 'Xuất sắc'
                      : heroMatchScore >= 60
                      ? 'Khá tốt'
                      : 'Cần cải thiện'}
                  </Badge>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="h-12 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-20 bg-gray-200 rounded ml-auto" />
                </div>
              )}
              
        
            </div>
          </div>
        </div>

        {/* Streaming Progress Banner */}
        {isReanalyzing && (
          <Card className="mb-6 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 animate-pulse-subtle overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-purple-900 mb-1">
                    AI đang phân tích CV của bạn...
                  </p>
                  <p className="text-sm text-purple-700 mb-2">
                    {streamPhaseLabel || 'Đang khởi tạo...'}
                  </p>
                  <div className="relative">
                    <Progress value={streamProgress} className="h-2" />
                    <span className="text-xs text-purple-600 mt-1 block text-right">
                      Tiến trình phân tích: {streamProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {canReanalyzeScore && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
                  <div>
                    <p className="font-medium text-amber-900">
                      {showCachedScoreNotice ? 'Đang hiển thị kết quả đã lưu' : 'Muốn cập nhật độ khớp CV-JD?'}
                    </p>
                    <p className="text-sm text-amber-800">
                      {scoreTimestamp
                        ? `Kết quả được chấm lúc ${scoreTimestamp}. Nếu CV hoặc JD đã thay đổi, hãy chấm điểm lại để cập nhật.`
                        : 'Nếu CV hoặc JD đã thay đổi, hãy chấm điểm lại để cập nhật kết quả mới nhất.'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reanalyzeMutation.mutate()}
                  disabled={isReanalyzing || (isPreviewMode && !previewData?.jobId)}
                  className="border-amber-600 text-amber-800 hover:bg-amber-100"
                >
                  {isReanalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isReanalyzing ? 'Đang chấm điểm...' : 'Chấm điểm lại'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation - Move before optimized CV */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex flex-col items-center gap-1 py-3">
              <Target className="h-5 w-5" />
              <span className="text-xs">Phân tích chi tiết</span>
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex flex-col items-center gap-1 py-3">
              <Lightbulb className="h-5 w-5" />
              <span className="text-xs">Gợi ý cải thiện</span>
            </TabsTrigger>
            <TabsTrigger value="ai-improved" className="flex flex-col items-center gap-1 py-3 relative">
              <Wand2 className="h-5 w-5" />
              <span className="text-xs">Cải thiện văn bản</span>
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-purple-500" />
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Tổng quan (So sánh CV & JD) */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overall Match Score */}
            {cvScore.overall_score != null && !isReanalyzing ? (
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Độ phù hợp CV với Job</h2>
                    <div className="relative mx-auto mb-5 flex h-48 w-48 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-white/80 shadow-[0_22px_80px_rgba(126,34,206,0.24)]" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-100 via-white to-indigo-100" />
                      <div className="absolute inset-0 rounded-full border-[5px] border-purple-200/70" />
                      <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-purple-600 border-r-fuchsia-500 animate-spin" />
                      <div className="absolute -inset-2 rounded-full border border-dashed border-purple-300/70 animate-[spin_7s_linear_infinite_reverse]" />
                      <div className={cn(
                        'relative z-10 text-6xl font-bold transition-all duration-700',
                        cvScore.overall_score >= 75 ? 'text-green-600' :
                        cvScore.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {cvScore.overall_score}%
                      </div>
                    </div>
                    <Badge className={cn(
                      'text-lg px-4 py-2',
                      cvScore.overall_score >= 75 ? 'bg-green-100 text-green-700 border-green-300' :
                      cvScore.overall_score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-red-100 text-red-700 border-red-300'
                    )}>
                      {cvScore.overall_score >= 75 ? '🟢 High Match - Rất phù hợp!' :
                       cvScore.overall_score >= 50 ? '🟡 Medium Match - Khá phù hợp' :
                       '🔴 Low Match - Cần cải thiện'}
                    </Badge>
                  </div>
                  <p className="text-center text-gray-600 max-w-2xl mx-auto">
                  {cvScore.overall_score >= 75 
                    ? 'CV của bạn rất phù hợp với vị trí này! Hãy apply ngay.'
                    : cvScore.overall_score >= 50
                    ? 'CV của bạn khá phù hợp. Cải thiện thêm một chút để tăng cơ hội.'
                    : 'CV của bạn cần cải thiện để phù hợp hơn với vị trí này.'}
                </p>
              </CardContent>
            </Card>
            ) : (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Độ phù hợp CV với Job</h2>
                    <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                      <div className="absolute -inset-4 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(124,58,237,0)_35deg,rgba(124,58,237,0.95)_92deg,rgba(236,72,153,0.9)_145deg,rgba(99,102,241,0)_230deg,transparent_360deg)] opacity-80 blur-[1px] animate-spin" />
                      <div className="absolute -inset-3 rounded-full bg-purple-50" />
                      <div className="absolute -inset-2 rounded-full border border-dashed border-purple-300/80 animate-[spin_7s_linear_infinite_reverse]" />
                      <div className="absolute inset-0 rounded-full bg-white/70 shadow-[0_22px_80px_rgba(126,34,206,0.18)]" />
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-100 via-white to-indigo-100" />
                      <div className="absolute inset-0 rounded-full border-[5px] border-purple-200/70" />
                      <div className="absolute inset-0 rounded-full border-[5px] border-transparent border-t-purple-600 border-r-fuchsia-500 animate-[spin_1.1s_linear_infinite]" />
                      <div className="relative z-10 h-16 w-28 rounded-xl bg-gray-200/90 animate-pulse" />
                    </div>
                    <div className="h-8 w-48 bg-gray-200 rounded-full mx-auto animate-pulse" />
                    <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Breakdown Scores */}
            {cvScore.breakdown && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Chi tiết điểm số
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Thông tin cá nhân', value: cvScore.breakdown.personal_info || 0, max: 5, icon: '👤' },
                      { label: 'Kỹ năng', value: cvScore.breakdown.skills, max: 20, icon: '💻' },
                      { label: 'Kinh nghiệm', value: cvScore.breakdown.experience, max: 20, icon: '💼' },
                      { label: 'Học vấn', value: cvScore.breakdown.education, max: 10, icon: '🎓' },
                      { label: 'Từ khóa/ATS', value: cvScore.breakdown.keywords_ats, max: 15, icon: '🔑' },
                      { label: 'Thành tích', value: cvScore.breakdown.achievements, max: 15, icon: '🏆' },
                      { label: 'Trình bày', value: cvScore.breakdown.presentation, max: 15, icon: '📄' },
                    ].map((item, index) => {
                      const clampedValue = Math.min(item.value, item.max);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium flex items-center gap-2">
                              <span>{item.icon}</span>
                              {item.label}
                            </span>
                            <span className="text-gray-600">
                              {clampedValue}/{item.max}
                            </span>
                          </div>
                          <Progress value={(clampedValue / item.max) * 100} className="h-3" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Strengths */}
              {cvScore.strengths && cvScore.strengths.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Điểm mạnh ({cvScore.strengths.length})
                    </h3>
                    <ul className="space-y-2">
                      {cvScore.strengths.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {cvScore.weaknesses && cvScore.weaknesses.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Điểm yếu ({cvScore.weaknesses.length})
                    </h3>
                    <ul className="space-y-2">
                      {cvScore.weaknesses.slice(0, 3).map((weakness, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Critical Gaps */}
              {cvScore.critical_gaps && cvScore.critical_gaps.length > 0 && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Thiếu sót ({cvScore.critical_gaps.length})
                    </h3>
                    <ul className="space-y-2">
                      {cvScore.critical_gaps.slice(0, 3).map((gap, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span>{renderTextValue(gap)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* What-if CV Improvement Simulator */}
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-2xl mb-2 flex items-center gap-2 text-orange-700">
                  <Zap className="h-7 w-7" />
                  🔥 Cải thiện CV - Tăng điểm nhanh
                </h3>
                <p className="text-gray-600 mb-6">
                  Mô phỏng: Nếu bạn cải thiện những điểm sau, điểm CV sẽ tăng bao nhiêu?
                </p>

                <div className="space-y-3">
                  {/* Generate suggestions from missing keywords */}
                  {cvScore.analysis?.keyword_match?.missing?.slice(0, 5).map((skill, idx) => {
                    const impact = Math.max(5, Math.min(20, 20 - idx * 3));
                    const skillText = renderTextValue(skill);
                    const newScore = Math.min(100, cvScore.overall_score + impact);
                    const priority = idx + 1;
                    const effort = priority <= 2 ? 3 : priority <= 4 ? 2 : 1;
                    
                    return (
                      <div 
                        key={idx} 
                        className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-orange-600 text-white px-2 py-1 text-sm">
                                #{priority}
                              </Badge>
                              <span className="font-semibold text-gray-900">
                                Thêm kỹ năng: <span className="text-orange-600">{skillText}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                Loại: <span className="font-medium">Kỹ năng</span>
                              </span>
                              <span className="text-gray-600">
                                Impact: {'🔥'.repeat(Math.ceil(impact / 5))}
                              </span>
                              <span className="text-gray-600">
                                Effort: {'🔥'.repeat(effort)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              +{impact}
                            </div>
                            <div className="text-sm text-gray-600">
                              {cvScore.overall_score} → <span className="font-semibold text-green-600">{newScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add project suggestion if low project score */}
                  {cvScore?.breakdown?.achievements !== undefined && cvScore.breakdown.achievements < 10 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-md cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-purple-600 text-white px-2 py-1 text-sm">
                              #LONG-TERM
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              Làm dự án thực tế về <span className="text-purple-600">{job?.title}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Loại: <span className="font-medium">Dự án</span>
                            </span>
                            <span className="text-gray-600">
                              Impact: 🔥🔥🔥
                            </span>
                            <span className="text-gray-600">
                              Effort: 🔥🔥🔥🔥
                            </span>
                            <span className="text-gray-600">
                              Thời gian: <span className="font-medium">2-4 tuần</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            +15
                          </div>
                          <div className="text-sm text-gray-600">
                            {cvScore.overall_score} → <span className="font-semibold text-green-600">{Math.min(100, cvScore.overall_score + 15)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add experience suggestion if low experience score */}
                  {cvScore.breakdown.experience < 15 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-600 text-white px-2 py-1 text-sm">
                              #LONG-TERM
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              Tích lũy thêm <span className="text-blue-600">6-12 tháng kinh nghiệm</span> liên quan
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Loại: <span className="font-medium">Kinh nghiệm</span>
                            </span>
                            <span className="text-gray-600">
                              Impact: 🔥🔥🔥🔥
                            </span>
                            <span className="text-gray-600">
                              Effort: 🔥🔥🔥🔥🔥
                            </span>
                            <span className="text-gray-600">
                              Thời gian: <span className="font-medium">6-12 tháng</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            +20
                          </div>
                          <div className="text-sm text-gray-600">
                            {cvScore.overall_score} → <span className="font-semibold text-green-600">{Math.min(100, cvScore.overall_score + 20)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-1 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        💡 Gợi ý tối ưu
                      </h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Quick Fix:</span> Thêm top 3 kỹ năng (2-4 tuần) → +{Math.min(45, (cvScore.analysis?.keyword_match?.missing?.length || 0) * 3)} điểm
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Long-term:</span> Làm dự án + tích lũy kinh nghiệm (6-12 tháng) → +35 điểm
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Điểm tối đa có thể đạt:</div>
                      <div className="text-3xl font-bold text-green-600">
                        {Math.min(100, cvScore.overall_score + 
                          Math.min(45, (cvScore.analysis?.keyword_match?.missing?.length || 0) * 3) +
                          (cvScore.breakdown.achievements < 10 ? 15 : 0) +
                          (cvScore.breakdown.experience < 15 ? 20 : 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Phân tích chi tiết */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Job Details */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-blue-700">
                  <Briefcase className="h-6 w-6" />
                  Thông tin công việc
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Vị trí:</h4>
                    <p className="text-gray-700">{job?.title}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Mô tả công việc:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{job?.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Yêu cầu:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{job?.requirements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JD vs CV Comparison Graph */}
            {cvScore.graph && cvScore.graph.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                    <Target className="h-6 w-6 text-purple-600" />
                    So sánh yêu cầu JD và CV
                  </h3>
                  <div className="space-y-4">
                    {cvScore.graph.map((item, idx) => (
                      <div key={idx} className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-2 text-sm">Yêu cầu từ JD</h4>
                          <p className="text-sm text-gray-700">{item.jd_requirement}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-green-700 text-sm">Bằng chứng từ CV</h4>
                            <Badge className={cn(
                              'text-xs',
                              item.match_level === 'high' && 'bg-green-100 text-green-700',
                              item.match_level === 'medium' && 'bg-yellow-100 text-yellow-700',
                              item.match_level === 'low' && 'bg-red-100 text-red-700'
                            )}>
                              {item.match_level === 'high' && '✓ Phù hợp cao'}
                              {item.match_level === 'medium' && '~ Phù hợp trung bình'}
                              {item.match_level === 'low' && '✗ Phù hợp thấp'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{item.cv_evidence}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keyword Analysis */}
            {cvScore.keyword_analysis && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    Phân tích từ khóa (ATS)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-3">
                        Từ khóa đã có ({cvScore.keyword_analysis.matched?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cvScore.keyword_analysis.matched?.map((keyword, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-700 border-green-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-3">
                        Từ khóa còn thiếu ({cvScore.keyword_analysis.missing?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cvScore.keyword_analysis.missing?.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-300"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {cvScore.keyword_analysis.coverage_ratio !== undefined && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tỷ lệ phủ từ khóa</span>
                        <span className="text-lg font-bold text-purple-600">
                          {(() => {
                            // Recalculate coverage ratio from matched/total
                            const matched = cvScore.keyword_analysis.matched?.length || 0;
                            const missing = cvScore.keyword_analysis.missing?.length || 0;
                            const total = matched + missing;
                            const ratio = total > 0 ? (matched / total) * 100 : 0;
                            return Math.round(ratio);
                          })()}%
                        </span>
                      </div>
                      <Progress value={(() => {
                        const matched = cvScore.keyword_analysis.matched?.length || 0;
                        const missing = cvScore.keyword_analysis.missing?.length || 0;
                        const total = matched + missing;
                        return total > 0 ? (matched / total) * 100 : 0;
                      })()} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gap Analysis */}
            {cvScore.gaps && (
              <Card className="border-2 border-orange-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-6 w-6" />
                    Phân tích khoảng cách
                  </h3>
                  
                  {/* Critical Gaps */}
                  {cvScore.gaps.critical && cvScore.gaps.critical.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Thiếu sót nghiêm trọng
                      </h4>
                      <ul className="space-y-2">
                        {cvScore.gaps.critical.map((gap, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                          >
                            <span className="text-red-600 font-bold">{idx + 1}.</span>
                            <span className="text-gray-700">{renderTextValue(gap)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Moderate Gaps */}
                  {cvScore.gaps.moderate && cvScore.gaps.moderate.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Điểm yếu cần cải thiện
                      </h4>
                      <ul className="space-y-2">
                        {cvScore.gaps.moderate.map((gap, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <span className="text-yellow-600 font-bold">{idx + 1}.</span>
                            <span className="text-gray-700">{renderTextValue(gap)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Minor Gaps */}
                  {cvScore.gaps.minor && cvScore.gaps.minor.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Cần cải thiện nhỏ
                      </h4>
                      <ul className="space-y-2">
                        {cvScore.gaps.minor.map((gap, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <span className="text-blue-600 font-bold">{idx + 1}.</span>
                            <span className="text-gray-700">{renderTextValue(gap)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ===== NEW COMPONENTS START HERE ===== */}
            
            {/* Radar Chart - Sơ đồ Năng Lực */}
            {(() => {
              console.log('=== RADAR CHART RENDER CHECK ===');
              console.log('cvScore:', cvScore);
              console.log('cvScore.enhanced:', cvScore?.enhanced);
              console.log('cvScore.enhanced.radar_metrics:', cvScore?.enhanced?.radar_metrics);
              console.log('Has radar_metrics?', !!cvScore?.enhanced?.radar_metrics);
              return null;
            })()}
            {cvScore?.enhanced?.radar_metrics && (
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-6 flex items-center gap-2 text-purple-700">
                    <BarChart3 className="h-6 w-6" />
                    📊 Sơ đồ Năng Lực
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Biểu đồ hình sao thể hiện điểm mạnh và điểm yếu của bạn trên 8 khía cạnh
                  </p>
                  <CVRadarChart data={cvScore.enhanced.radar_metrics} />
                </CardContent>
              </Card>
            )}

            {/* Career Path - Lộ Trình Nghề Nghiệp */}
            {cvScore?.enhanced?.career_paths && cvScore.enhanced.career_paths.length > 0 && (
              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-blue-700">
                    <Target className="h-6 w-6" />
                    🛤️ Lộ Trình Nghề Nghiệp (3-5 năm)
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Các con đường phát triển nghề nghiệp phù hợp với profile của bạn
                  </p>
                  <CareerPathTimeline paths={cvScore.enhanced.career_paths} />
                </CardContent>
              </Card>
            )}

            {/* Skill Gaps */}
            {cvScore?.enhanced?.skill_gaps && cvScore.enhanced.skill_gaps.length > 0 && (
              <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-orange-700">
                    <TrendingUp className="h-6 w-6" />
                    📈 Kỹ Năng Cần Cải Thiện
                  </h3>
                  <div className="space-y-4">
                    {cvScore.enhanced.skill_gaps.map((gap, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border-2 border-orange-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-lg text-gray-900">{renderTextValue(gap.skill || gap)}</h4>
                          <Badge
                            className={cn(
                              'px-3 py-1',
                              gap.priority === 'High' && 'bg-red-100 text-red-700 border-red-300',
                              gap.priority === 'Medium' && 'bg-yellow-100 text-yellow-700 border-yellow-300',
                              gap.priority === 'Low' && 'bg-gray-100 text-gray-700 border-gray-300'
                            )}
                          >
                            {gap.priority === 'High' && '🔥 Ưu tiên cao'}
                            {gap.priority === 'Medium' && '⚡ Ưu tiên trung bình'}
                            {gap.priority === 'Low' && '💡 Ưu tiên thấp'}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Trình độ hiện tại:</span>
                            <span className="ml-2 font-semibold text-gray-900">{formatSkillLevel(getGapCurrentLevel(gap))}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Trình độ cần đạt:</span>
                            <span className="ml-2 font-semibold text-gray-900">{formatSkillLevel(getGapRequiredLevel(gap))}</span>
                          </div>
                        </div>
                        {gap.learning_path && gap.learning_path.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-gray-700">Lộ trình học:</span>
                            <ul className="mt-2 space-y-1">
                              {gap.learning_path.map((step, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-orange-600">{i + 1}.</span>
                                  {renderTextValue(step)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-gray-600">
                            Thời gian: <span className="font-semibold">{renderTextValue(getGapEstimatedTime(gap))}</span>
                          </span>
                          <span className="text-sm font-semibold text-green-600">{gap.impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 3: So sánh CV & JD - REDESIGNED */}
          <TabsContent value="comparison" className="space-y-6">
            {/* Overall Match Score */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Độ phù hợp CV với Job</h2>
                  <div className={cn(
                    'text-6xl font-bold mb-3',
                    cvScore.overall_score >= 75 ? 'text-green-600' :
                    cvScore.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {cvScore.overall_score}%
                  </div>
                  <Badge className={cn(
                    'text-lg px-4 py-2',
                    cvScore.overall_score >= 75 ? 'bg-green-100 text-green-700 border-green-300' :
                    cvScore.overall_score >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    'bg-red-100 text-red-700 border-red-300'
                  )}>
                    {cvScore.overall_score >= 75 ? '🟢 High Match - Rất phù hợp!' :
                     cvScore.overall_score >= 50 ? '🟡 Medium Match - Khá phù hợp' :
                     '🔴 Low Match - Cần cải thiện'}
                  </Badge>
                </div>
                <p className="text-center text-gray-600 max-w-2xl mx-auto">
                  {cvScore.overall_score >= 75 
                    ? 'CV của bạn rất phù hợp với vị trí này! Hãy apply ngay.'
                    : cvScore.overall_score >= 50
                    ? 'CV của bạn khá phù hợp. Cải thiện thêm một chút để tăng cơ hội.'
                    : 'CV của bạn cần cải thiện để phù hợp hơn với vị trí này.'}
                </p>
              </CardContent>
            </Card>

            {/* Breakdown Scores */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Chi tiết độ phù hợp
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Skills Match */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                        💻 Kỹ năng
                      </h4>
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round((cvScore.breakdown.skills / 20) * 100)}%
                      </span>
                    </div>
                    <Progress value={(cvScore.breakdown.skills / 20) * 100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">{cvScore.breakdown.skills}/20 điểm</p>
                  </div>

                  {/* Experience Match */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-700 flex items-center gap-2">
                        💼 Kinh nghiệm
                      </h4>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round((cvScore.breakdown.experience / 20) * 100)}%
                      </span>
                    </div>
                    <Progress value={(cvScore.breakdown.experience / 20) * 100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">{cvScore.breakdown.experience}/20 điểm</p>
                  </div>

                  {/* Education Match */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-purple-700 flex items-center gap-2">
                        🎓 Học vấn
                      </h4>
                      <span className="text-2xl font-bold text-purple-600">
                        {Math.round((cvScore.breakdown.education / 10) * 100)}%
                      </span>
                    </div>
                    <Progress value={(cvScore.breakdown.education / 10) * 100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">{cvScore.breakdown.education}/10 điểm</p>
                  </div>

                  {/* Keyword Match */}
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-5 border-2 border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                        🔑 Từ khóa (ATS)
                      </h4>
                      <span className="text-2xl font-bold text-orange-600">
                        {Math.round((cvScore.breakdown.keywords_ats / 15) * 100)}%
                      </span>
                    </div>
                    <Progress value={(cvScore.breakdown.keywords_ats / 15) * 100} className="h-3 mb-2" />
                    <p className="text-sm text-gray-600">{cvScore.breakdown.keywords_ats}/15 điểm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Comparison */}
            {cvScore.analysis?.keyword_match && (
              <Card className="border-2 border-indigo-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                    So sánh kỹ năng & từ khóa
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Matched Skills */}
                    <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200">
                      <h4 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        ✅ Bạn đã có ({cvScore.analysis.keyword_match.matched?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cvScore.analysis.keyword_match.matched?.map((keyword, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-700 border-green-300 text-sm px-3 py-1">
                            ✓ {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-red-50 rounded-lg p-5 border-2 border-red-200">
                      <h4 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        ❌ Bạn đang thiếu ({cvScore.analysis.keyword_match.missing?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {cvScore.analysis.keyword_match.missing?.map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-300 text-sm px-3 py-1">
                            ✗ {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {cvScore.strengths && cvScore.strengths.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl text-green-700 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      💪 Điểm mạnh của bạn
                    </h3>
                    <ul className="space-y-3">
                      {cvScore.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                          <span className="text-green-600 font-bold mt-0.5">✓</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {cvScore.weaknesses && cvScore.weaknesses.length > 0 && (
                <Card className="border-2 border-yellow-200 bg-yellow-50/50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl text-yellow-700 mb-4 flex items-center gap-2">
                      <AlertCircle className="h-6 w-6" />
                      ⚠️ Điểm cần cải thiện
                    </h3>
                    <ul className="space-y-3">
                      {cvScore.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                          <span className="text-yellow-600 font-bold mt-0.5">!</span>
                          <span className="text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* What-if CV Improvement Simulator */}
            <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-2xl mb-2 flex items-center gap-2 text-orange-700">
                  <Zap className="h-7 w-7" />
                  🔥 Cải thiện CV - Tăng điểm nhanh
                </h3>
                <p className="text-gray-600 mb-6">
                  Mô phỏng: Nếu bạn cải thiện những điểm sau, điểm CV sẽ tăng bao nhiêu?
                </p>

                <div className="space-y-3">
                  {/* Generate suggestions from missing keywords */}
                  {cvScore.analysis?.keyword_match?.missing?.slice(0, 5).map((skill, idx) => {
                    // Calculate simulated impact (mock data - can be replaced with real backend calculation)
                    const impact = Math.max(5, Math.min(20, 20 - idx * 3));
                    const skillText = renderTextValue(skill);
                    const newScore = Math.min(100, cvScore.overall_score + impact);
                    const priority = idx + 1;
                    
                    return (
                      <div 
                        key={idx} 
                        className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-orange-600 text-white px-2 py-1">
                                #{priority}
                              </Badge>
                              <span className="font-semibold text-gray-900">
                                Thêm kỹ năng: <span className="text-orange-600">{skillText}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                Loại: <span className="font-medium">Kỹ năng</span>
                              </span>
                              <span className="text-gray-600">
                                Độ khó: {priority <= 2 ? '🔥🔥🔥' : priority <= 4 ? '🔥🔥' : '🔥'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              +{impact}
                            </div>
                            <div className="text-sm text-gray-600">
                              {cvScore.overall_score} → <span className="font-semibold text-green-600">{newScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add project suggestion if low project score */}
                  {cvScore.breakdown.achievements < 10 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-purple-600 text-white px-2 py-1">
                              #HOT
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              Làm dự án thực tế liên quan đến <span className="text-purple-600">{job?.title}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Loại: <span className="font-medium">Dự án</span>
                            </span>
                            <span className="text-gray-600">
                              Thời gian: <span className="font-medium">2-4 tuần</span>
                            </span>
                            <span className="text-gray-600">
                              Độ khó: 🔥🔥🔥🔥
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            +15
                          </div>
                          <div className="text-sm text-gray-600">
                            {cvScore.overall_score} → <span className="font-semibold text-green-600">{Math.min(100, cvScore.overall_score + 15)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add experience suggestion if low experience score */}
                  {cvScore.breakdown.experience < 15 && (
                    <div className="bg-white rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-blue-600 text-white px-2 py-1">
                              #LONG-TERM
                            </Badge>
                            <span className="font-semibold text-gray-900">
                              Tích lũy thêm <span className="text-blue-600">6-12 tháng kinh nghiệm</span> liên quan
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Loại: <span className="font-medium">Kinh nghiệm</span>
                            </span>
                            <span className="text-gray-600">
                              Thời gian: <span className="font-medium">6-12 tháng</span>
                            </span>
                            <span className="text-gray-600">
                              Độ khó: 🔥🔥🔥🔥🔥
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            +20
                          </div>
                          <div className="text-sm text-gray-600">
                            {cvScore.overall_score} → <span className="font-semibold text-green-600">{Math.min(100, cvScore.overall_score + 20)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-1">💡 Gợi ý tối ưu</h4>
                      <p className="text-sm text-gray-600">
                        Ưu tiên cải thiện <span className="font-semibold">top 3 kỹ năng</span> để tăng điểm nhanh nhất
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Điểm tối đa có thể đạt:</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.min(100, cvScore.overall_score + 
                          (cvScore.analysis?.keyword_match?.missing?.length > 0 ? 15 : 0) +
                          (cvScore.breakdown.achievements < 10 ? 15 : 0) +
                          (cvScore.breakdown.experience < 15 ? 20 : 0)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action CTA */}
            <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xl text-gray-900 mb-2">Bước tiếp theo?</h3>
                    <p className="text-gray-600">
                      {cvScore.overall_score >= 75 
                        ? 'CV của bạn rất phù hợp! Đừng bỏ lỡ cơ hội này.'
                        : 'Cải thiện CV theo gợi ý ở Tab "Gợi ý cải thiện" để tăng cơ hội.'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    {cvScore.overall_score >= 50 && (
                      <Button 
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Đã Apply rồi
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => setActiveTab('ai-improved')}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Xem cải thiện dạng văn bản
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Gợi ý cải thiện */}
          <TabsContent value="suggestions" className="space-y-6">
            {/* AI Improvement Panel - Interactive suggestions */}
            <AIImprovementPanel cvScore={cvScore} />

            {/* Project Recommendations - NEW COMPONENT */}
            {cvScore?.enhanced?.recommended_projects && cvScore.enhanced.recommended_projects.length > 0 && (
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2 text-purple-700">
                    <Lightbulb className="h-6 w-6" />
                    💼 Dự Án Nên Làm
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Các dự án được AI gợi ý dựa trên khoảng cách giữa CV của bạn và yêu cầu công việc
                  </p>
                  <ProjectRecommendations projects={cvScore.enhanced.recommended_projects} />
                </CardContent>
              </Card>
            )}

            {/* Detailed Suggestions */}
            {cvScore.detailed_suggestions && (
              <Card className="border-2 border-indigo-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-xl mb-4">Gợi ý chi tiết</h3>
                  {cvScore.detailed_suggestions.summary && (
                    <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Phần Giới thiệu</h4>
                      {cvScore.detailed_suggestions.summary.suggestions?.map((s, i) => (
                        <p key={i} className="text-sm text-gray-700">• {s}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 5: Cải thiện dạng văn bản */}
          <TabsContent value="ai-improved" className="space-y-6">
            {/* Important Disclaimer */}
            <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg text-yellow-800 mb-2">⚠️ Lưu ý quan trọng</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      AI sẽ gợi ý viết lại CV để <span className="font-semibold">phù hợp hơn với JD</span>, giúp tỉ lệ match cao hơn và có thể <span className="font-semibold text-green-600">pass vòng CV</span>.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Tuy nhiên, điều này <span className="font-semibold text-red-600">KHÔNG có nghĩa</span> bạn không cần học thêm, cải thiện skill, hay làm thêm project. 
                      <span className="font-semibold"> Vòng phỏng vấn phụ thuộc vào kinh nghiệm thực tế của bạn!</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chỉ hiển thị cải thiện dạng văn bản, không preview CV */}
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-2xl text-purple-700 flex items-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6" />
                  Cải thiện CV dạng văn bản
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Hệ thống chỉ hiển thị các nội dung cần chỉnh sửa, không render bản preview CV mới.
                </p>

                <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tóm tắt cải thiện
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        +{Math.min(30, (cvScore?.suggested_keywords?.length || 0) * 2)}
                      </div>
                      <div className="text-xs text-gray-600">Điểm tiềm năng tăng</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {(cvScore?.improvements?.content?.length || 0) + (cvScore?.improvements?.formatting?.length || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Mục cần chỉnh sửa</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{cvScore?.suggested_keywords?.length || 0}</div>
                      <div className="text-xs text-gray-600">Từ khóa nên bổ sung</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Nội dung nên chỉnh sửa</h4>
                    {cvScore?.improvements?.content?.length ? (
                      <ul className="space-y-2">
                        {cvScore.improvements.content.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">Hiện chưa có gợi ý nội dung chi tiết.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Trình bày nên chỉnh sửa</h4>
                    {cvScore?.improvements?.formatting?.length ? (
                      <ul className="space-y-2">
                        {cvScore.improvements.formatting.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">Hiện chưa có gợi ý trình bày chi tiết.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Ví dụ viết lại</h4>
                    {cvScore?.rewrite_examples?.length ? (
                      <div className="space-y-3">
                        {cvScore.rewrite_examples.map((example, idx) => (
                          <div key={idx} className="rounded-lg border border-gray-200 overflow-hidden">
                            <div className="bg-red-50 px-3 py-2 text-sm text-red-800">
                              <span className="font-semibold">Trước:</span> {example.original}
                            </div>
                            <div className="bg-green-50 px-3 py-2 text-sm text-green-800">
                              <span className="font-semibold">Sau:</span> {example.improved}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Chưa có ví dụ viết lại cụ thể.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CVScoreDetail;
