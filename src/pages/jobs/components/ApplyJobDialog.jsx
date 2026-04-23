import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { applyJob, reapplyJob } from '@/services/jobService';
import { getCurrentUserProfile, uploadCV } from '@/services/profileService';
import { getCvs } from '@/services/api';
import apiClient from '@/services/apiClient';
import { AlertCircle, Loader2, FileUp, FileText, RefreshCw, Upload, BarChart3, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';
import { scoreCVForApplication } from '@/services/applicationService';

/**
 * @param {{
 *  jobId: string | null;
 *  jobTitle: string;
 *  open: boolean;
 *  onOpenChange: (open: boolean) => void;
 *  onSuccess: () => void;
 *  isReapply?: boolean;
 *  source?: string;
 * }} props
 */
export const ApplyJobDialog = ({ jobId, jobTitle, open, onOpenChange, onSuccess, isReapply = false, source = 'DIRECT_APPLY' }) => {
  const [cvSource, setCvSource] = useState('uploaded'); // 'uploaded' or 'template'
  const [selectedCv, setSelectedCv] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringResult, setScoringResult] = useState(null);

  // File upload ref
  const fileInputRef = useRef(null);

  // Fetch user profile (includes uploaded CVs)
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    error: profileQueryError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: getCurrentUserProfile,
    enabled: open,
  });

  // Fetch template CVs
  const {
    data: templateCvsData,
    isLoading: isLoadingTemplateCvs,
    isError: isTemplateCvsError,
  } = useQuery({
    queryKey: ['templateCvs'],
    queryFn: getCvs,
    enabled: open,
  });

  const userProfile = profileData?.data?.profile;
  const user = profileData?.data?.user;
  const uploadedCvs = useMemo(() => userProfile?.cvs || [], [userProfile?.cvs]);
  const templateCvs = useMemo(() => templateCvsData?.data || [], [templateCvsData?.data]);

  const isLoading = isLoadingProfile || isLoadingTemplateCvs;
  const isError = isProfileError;

  // Reset selected CV when source changes
  useEffect(() => {
    setSelectedCv('');
  }, [cvSource]);

  useEffect(() => {
    if (open && userProfile) {
      setCandidateName(userProfile.fullname || '');
      setCandidateEmail(user.email || '');
      setCandidatePhone(userProfile.phone || '');

      // Auto-select default CV based on available options
      if (cvSource === 'uploaded') {
        // Only auto-select if no CV is currently selected
        if (!selectedCv) {
          const defaultCv = uploadedCvs.find(cv => cv.isDefault) || uploadedCvs[0];
          if (defaultCv) {
            setSelectedCv(defaultCv._id);
          }
        }
      } else if (cvSource === 'template' && templateCvs.length > 0) {
        if (!selectedCv) {
          setSelectedCv(templateCvs[0]._id);
        }
      }

      setCoverLetter(`Kính gửi Quý công ty,\n\nTôi viết đơn này để bày tỏ sự quan tâm sâu sắc đến vị trí ${jobTitle} được đăng trên CareerZone. Với nền tảng, kỹ năng và kinh nghiệm của mình, tôi tin rằng mình là một ứng viên phù hợp cho vai trò này.\n\nTôi rất mong có cơ hội được thảo luận thêm về việc làm thế nào tôi có thể đóng góp cho đội ngũ của quý vị.\n\nXin chân thành cảm ơn.\n\nTrân trọng,\n${userProfile.fullname || ''}`);
    }
    if (!open) {
      // Reset state when dialog closes
      setSubmitError(null);
      setIsSubmitting(false);
      setCvSource('uploaded');
      setSelectedCv('');
      setScoringResult(null);
      setIsScoring(false);
    }
  }, [open, userProfile, user, jobTitle, uploadedCvs, templateCvs, cvSource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) return;

    if (!selectedCv) {
      setSubmitError("Vui lòng chọn một CV để ứng tuyển.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Gửi cvId hoặc cvTemplateId tùy theo nguồn CV được chọn
    const applicationData = {
      ...(cvSource === 'uploaded' ? { cvId: selectedCv } : { cvTemplateId: selectedCv }),
      coverLetter,
      candidateName,
      candidateEmail,
      candidatePhone,
      source,
    };

    try {
      // Gọi API tương ứng: reapplyJob nếu là ứng tuyển lại, applyJob nếu là ứng tuyển mới
      if (isReapply) {
        await reapplyJob(jobId, applicationData);
        toast.success('Nộp đơn ứng tuyển lại thành công!');
      } else {
        await applyJob(jobId, applicationData);
        toast.success('Nộp đơn ứng tuyển thành công!');
      }
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      return;
    }

    // Validate file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng tải lên file nhỏ hơn 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('name', file.name);

    try {
      const response = await uploadCV(formData);
      toast.success('Tải lên CV thành công');

      // Refetch profile to update CV list and get the fresh data immediately
      const { data: newProfileData } = await refetchProfile();

      // Attempt to find the new CV ID
      // Strategy: Take the last CV in the list as it is the most recently added
      let newCvId = null;
      if (newProfileData?.data?.profile?.cvs && newProfileData.data.profile.cvs.length > 0) {
        const newCvs = newProfileData.data.profile.cvs;
        const lastCv = newCvs[newCvs.length - 1];
        newCvId = lastCv._id;
      }

      if (newCvId) {
        // Use timeout to allow the UI to update with the new CV list first
        setTimeout(() => {
          setSelectedCv(newCvId);
        }, 100);
      }

    } catch (error) {
      console.error('Upload CV error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải lên CV');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle CV Scoring - use preview API without creating application
  const handleScoreCV = async () => {
    if (!selectedCv) {
      toast.error('Vui lòng chọn CV trước khi chấm điểm');
      return;
    }

    if (!jobId) {
      toast.error('Không tìm thấy thông tin công việc');
      return;
    }

    setIsScoring(true);

    try {
      // Call preview API (no application created)
      const requestData = cvSource === 'uploaded' 
        ? { cvId: selectedCv } 
        : { cvTemplateId: selectedCv };

      const response = await apiClient.post(`/jobs/${jobId}/preview-cv-score`, requestData);
      const scoreData = response.data;
      
      if (scoreData?.success && scoreData?.data) {
        // Navigate to cv-score page (existing page) with state data
        // Wrap data in format that CVScoreDetail expects
        
        // Convert radar chart data to proper format
        // Priority: Use category_scores as it's more reliable than visualization.radar_chart
        let radarMetrics = null;
        
        console.log('=== RADAR METRICS DEBUG ===');
        console.log('Category scores:', scoreData.data.category_scores);
        console.log('Visualization:', scoreData.data.visualization);
        console.log('Radar chart:', scoreData.data.visualization?.radar_chart);
        
        if (scoreData.data.category_scores && Array.isArray(scoreData.data.category_scores) && scoreData.data.category_scores.length > 0) {
          // Use category_scores - most reliable source
          radarMetrics = scoreData.data.category_scores.map(cat => ({
            metric: cat.name || cat.category || 'Unknown',
            score: cat.score || 0
          }));
          console.log('Using category_scores for radar');
        } else if (scoreData.data.visualization?.radar_chart) {
          // Fallback to radar_chart if category_scores not available
          const radarChart = scoreData.data.visualization.radar_chart;
          console.log('Radar chart structure:', radarChart);
          
          if (radarChart.labels && radarChart.values && 
              Array.isArray(radarChart.labels) && Array.isArray(radarChart.values) &&
              radarChart.labels.length === radarChart.values.length &&
              radarChart.labels.length > 0) {
            radarMetrics = radarChart.labels.map((label, idx) => ({
              metric: label,
              score: radarChart.values[idx]
            }));
            console.log('Using radar_chart for radar');
          } else {
            console.log('Radar chart format invalid:', {
              hasLabels: !!radarChart.labels,
              hasValues: !!radarChart.values,
              labelsIsArray: Array.isArray(radarChart.labels),
              valuesIsArray: Array.isArray(radarChart.values),
              labelsLength: radarChart.labels?.length,
              valuesLength: radarChart.values?.length
            });
          }
        } else if (scoreData.data.breakdown && typeof scoreData.data.breakdown === 'object') {
          // Last fallback: use breakdown scores
          radarMetrics = Object.entries(scoreData.data.breakdown).map(([key, value]) => ({
            metric: key,
            score: value
          }));
          console.log('Using breakdown for radar');
        }
        
        console.log('Final radarMetrics:', radarMetrics);
        
        const scoringResult = {
          overall_score: scoreData.data.overall_score || 0,
          breakdown: scoreData.data.breakdown || {},
          suggestions: scoreData.data.suggestions || [],
          category_scores: scoreData.data.category_scores || [],
          summary: scoreData.data.summary || '',
          strengths: scoreData.data.strengths || [],
          weaknesses: scoreData.data.weaknesses || [],
          critical_gaps: scoreData.data.critical_gaps || [],
          keyword_analysis: scoreData.data.keyword_analysis || {},
          gaps: scoreData.data.gaps || {},
          visualization: scoreData.data.visualization || {},
          graph: scoreData.data.graph || [],
          improvements: scoreData.data.improvements || {},
          suggested_keywords: scoreData.data.suggested_keywords || [],
          rewrite_examples: scoreData.data.rewrite_examples || [],
          // Enhanced data for advanced visualizations
          enhanced: {
            career_paths: scoreData.data.career_paths || [],
            recommended_projects: scoreData.data.recommended_projects || [],
            skill_gaps: scoreData.data.skill_gaps || [],
            radar_metrics: radarMetrics
          },
          jobId: jobId, // Pass jobId to navigate back
          cvId: requestData.cvId, // Pass CV info for optimization
          cvTemplateId: requestData.cvTemplateId,
          isPreview: true // Flag to indicate this is preview mode
        };
        
        // Navigate to existing cv-score page with query params
        window.location.href = `/cv-score?data=${encodeURIComponent(JSON.stringify(scoringResult))}`;
        toast.success('Đang chuyển đến trang phân tích chi tiết...');
      } else {
        toast.error('Không thể chấm điểm CV');
      }
    } catch (error) {
      console.error('Error scoring CV:', error);
      const errorMsg = error.response?.data?.message || 'Không thể chấm điểm CV. Vui lòng thử lại.';
      toast.error(errorMsg);
    } finally {
      setIsScoring(false);
    }
  };

  const handleViewDetailedScore = async () => {
    try {
      // Create temporary application for detailed view
      const applicationData = {
        ...(cvSource === 'uploaded' ? { cvId: selectedCv } : { cvTemplateId: selectedCv }),
        coverLetter: coverLetter || 'Temporary application for CV scoring preview',
        candidateName,
        candidateEmail,
        candidatePhone,
        source: 'CV_SCORING_PREVIEW'
      };

      console.log('Creating preview application...', applicationData);
      const applyResponse = await applyJob(jobId, applicationData);
      console.log('Apply response:', applyResponse);
      
      // fe-candidate returns full Axios response
      const responseData = applyResponse.data;
      console.log('Response data:', responseData);
      
      if (responseData?.success && responseData?.data?._id) {
        const applicationId = responseData.data._id;
        console.log('Opening cv-score page for application:', applicationId);
        
        // Wait for scoring to complete (backend processes async)
        toast.info('Đang chuẩn bị trang phân tích chi tiết...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Open detailed score page in new tab
        window.open(`/dashboard/applications/${applicationId}/cv-score`, '_blank');
      } else {
        console.error('Invalid response structure:', responseData);
        toast.error('Không thể tạo bản xem trước');
      }
    } catch (error) {
      console.error('Error creating preview application:', error);
      toast.error('Không thể mở trang chi tiết');
    }
  };

  const currentCvList = cvSource === 'uploaded' ? uploadedCvs : templateCvs;
  const hasAnyCv = uploadedCvs.length > 0 || templateCvs.length > 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (isError) {
      return (
        <ErrorState
          onRetry={refetchProfile}
          message={profileQueryError.response?.data?.message || "Không thể tải thông tin của bạn."}
        />
      );
    }

    const previewUrl = selectedCv
      ? (cvSource === 'uploaded'
        ? uploadedCvs.find(c => c._id === selectedCv)?.path
        : `/render/${selectedCv}`)
      : null;

    return (
      <form onSubmit={handleSubmit} className="flex flex-col h-full pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Input Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="candidateName">Họ và tên</Label>
                <Input
                  id="candidateName"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  required
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidatePhone">Số điện thoại</Label>
                <Input
                  id="candidatePhone"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  required
                  className="border-gray-300 focus:border-green-600 focus:ring-green-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">Email</Label>
              <Input
                id="candidateEmail"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-green-600 focus:ring-green-600"
              />
            </div>

            {/* CV Source Selection */}
            <div className="space-y-3">
              <Label>Chọn nguồn CV</Label>
              <RadioGroup
                value={cvSource}
                onValueChange={setCvSource}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uploaded" id="cv-uploaded" />
                  <Label htmlFor="cv-uploaded" className="flex items-center gap-2 cursor-pointer font-normal">
                    <FileUp className="h-4 w-4 text-blue-600" />
                    CV đã tải lên ({uploadedCvs.length})
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="template" id="cv-template" />
                  <Label htmlFor="cv-template" className="flex items-center gap-2 cursor-pointer font-normal">
                    <FileText className="h-4 w-4 text-green-600" />
                    CV tạo từ mẫu ({templateCvs.length})
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* CV Selection Dropdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="cv">
                  {cvSource === 'uploaded' ? 'Chọn CV đã tải lên' : 'Chọn CV mẫu đã tạo'}
                </Label>
                {cvSource === 'uploaded' && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileUpload}
                    />
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-blue-600 font-normal"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Đang tải...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Upload className="h-3 w-3" /> Tải lên mới
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <Select onValueChange={setSelectedCv} value={selectedCv} required>
                <SelectTrigger id="cv" className="w-full border-gray-300 focus:border-green-600 focus:ring-green-600">
                  <SelectValue placeholder="Chọn CV để ứng tuyển..." />
                </SelectTrigger>
                <SelectContent className="z-9999 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto" container={document.body}>
                  {currentCvList.length > 0 ? (
                    currentCvList.map((cv) => (
                      <SelectItem key={cv._id} value={cv._id} className="hover:bg-gray-50 focus:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {cvSource === 'uploaded' ? (
                            <FileUp className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-green-500" />
                          )}
                          {cv.name || cv.title || 'Untitled CV'}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-600">
                      {cvSource === 'uploaded'
                        ? 'Bạn chưa tải lên CV nào. Vui lòng vào trang cá nhân để tải lên.'
                        : 'Bạn chưa tạo CV mẫu nào. Vui lòng vào trang tạo CV để thiết kế.'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Thư giới thiệu (Cover Letter)</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                placeholder="Viết một vài lời giới thiệu về bản thân và tại sao bạn phù hợp với vị trí này..."
                className="border-gray-300 focus:border-green-600 focus:ring-green-600"
              />
            </div>

            {/* CV Scoring Section */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900">
                    Kiểm tra độ phù hợp CV
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Xem trước điểm số CV với công việc này
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleScoreCV}
                  disabled={!selectedCv || isScoring || isSubmitting}
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  {isScoring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang chấm điểm...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Chấm điểm CV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-2 flex flex-col h-full min-h-[500px] lg:min-h-0">
            <Label>Xem trước CV</Label>
            <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
              {previewUrl ? (
                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  className="absolute inset-0 w-full h-full"
                  title="CV Preview"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-2">
                  <FileText className="h-10 w-10 text-gray-300" />
                  <p>Vui lòng chọn CV để xem trước</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {submitError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-gray-300 hover:bg-gray-50"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !hasAnyCv || isLoading || !selectedCv}
            className={isReapply
              ? "bg-orange-600 hover:bg-orange-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isReapply && !isSubmitting && <RefreshCw className="mr-2 h-4 w-4" />}
            {isSubmitting
              ? 'Đang nộp đơn...'
              : isReapply
                ? 'Xác nhận ứng tuyển lại'
                : 'Xác nhận ứng tuyển'
            }
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1100px] w-[95vw] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            {isReapply ? 'Ứng tuyển lại vị trí' : 'Ứng tuyển vị trí'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isReapply && (
              <span className="text-orange-600 font-medium">Bạn đang ứng tuyển lại • </span>
            )}
            {jobTitle}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};