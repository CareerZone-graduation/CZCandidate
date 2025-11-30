import { useState, useEffect, useMemo } from 'react';
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
import { getCurrentUserProfile } from '@/services/profileService';
import { getCvs } from '@/services/api';
import { AlertCircle, Loader2, FileUp, FileText, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';

/**
 * @param {{
 *  jobId: string | null;
 *  jobTitle: string;
 *  open: boolean;
 *  onOpenChange: (open: boolean) => void;
 *  onSuccess: () => void;
 *  isReapply?: boolean;
 * }} props
 */
export const ApplyJobDialog = ({ jobId, jobTitle, open, onOpenChange, onSuccess, isReapply = false }) => {
  const [cvSource, setCvSource] = useState('uploaded'); // 'uploaded' or 'template'
  const [selectedCv, setSelectedCv] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
        const defaultCv = uploadedCvs.find(cv => cv.isDefault) || uploadedCvs[0];
        if (defaultCv) {
          setSelectedCv(defaultCv._id);
        }
      } else if (cvSource === 'template' && templateCvs.length > 0) {
        setSelectedCv(templateCvs[0]._id);
      }

      setCoverLetter(`Kính gửi Quý công ty,\n\nTôi viết đơn này để bày tỏ sự quan tâm sâu sắc đến vị trí ${jobTitle} được đăng trên CareerZone. Với nền tảng, kỹ năng và kinh nghiệm của mình, tôi tin rằng mình là một ứng viên phù hợp cho vai trò này.\n\nTôi rất mong có cơ hội được thảo luận thêm về việc làm thế nào tôi có thể đóng góp cho đội ngũ của quý vị.\n\nXin chân thành cảm ơn.\n\nTrân trọng,\n${userProfile.fullname || ''}`);
    }
    if (!open) {
      // Reset state when dialog closes
      setSubmitError(null);
      setIsSubmitting(false);
      setCvSource('uploaded');
      setSelectedCv('');
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

    return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
          <Label htmlFor="cv">
            {cvSource === 'uploaded' ? 'Chọn CV đã tải lên' : 'Chọn CV mẫu đã tạo'}
          </Label>
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
            rows={10}
            placeholder="Viết một vài lời giới thiệu về bản thân và tại sao bạn phù hợp với vị trí này..."
            className="border-gray-300 focus:border-green-600 focus:ring-green-600"
          />
        </div>

        {submitError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-3">
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
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