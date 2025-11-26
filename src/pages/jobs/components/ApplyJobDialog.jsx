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
import { toast } from 'sonner';
import { applyJob } from '@/services/jobService';
import { getCurrentUserProfile } from '@/services/profileService';
import { AlertCircle, Loader2 } from 'lucide-react';
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
 * }} props
 */
export const ApplyJobDialog = ({ jobId, jobTitle, open, onOpenChange, onSuccess }) => {
  const [selectedCv, setSelectedCv] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    data: profileData,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: getCurrentUserProfile,
    enabled: open, // Chỉ fetch khi dialog được mở
  });

  const userProfile = profileData?.data?.profile;
  const user = profileData?.data?.user;
  const cvs = useMemo(() => userProfile?.cvs || [], [userProfile?.cvs]);

  useEffect(() => {
    if (open && userProfile) {
      setCandidateName(userProfile.fullname || '');
      setCandidateEmail(user.email || '');
      setCandidatePhone(userProfile.phone || '');

      const defaultCv = cvs.find(cv => cv.isDefault) || cvs[0];
      if (defaultCv) {
        setSelectedCv(defaultCv._id);
      }

      setCoverLetter(`Kính gửi Quý công ty,\n\nTôi viết đơn này để bày tỏ sự quan tâm sâu sắc đến vị trí ${jobTitle} được đăng trên CareerZone. Với nền tảng, kỹ năng và kinh nghiệm của mình, tôi tin rằng mình là một ứng viên phù hợp cho vai trò này.\n\nTôi rất mong có cơ hội được thảo luận thêm về việc làm thế nào tôi có thể đóng góp cho đội ngũ của quý vị.\n\nXin chân thành cảm ơn.\n\nTrân trọng,\n${userProfile.fullname || ''}`);
    }
    if (!open) {
      // Reset state when dialog closes
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open, userProfile, user, jobTitle, cvs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobId) return;

    if (!selectedCv) {
      setSubmitError("Vui lòng chọn một CV để ứng tuyển.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const applicationData = {
      cvId: selectedCv,
      coverLetter,
      candidateName,
      candidateEmail,
      candidatePhone,
    };

    try {
      await applyJob(jobId, applicationData);
      toast.success('Nộp đơn ứng tuyển thành công!');
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi ứng tuyển.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onRetry={refetch}
          message={queryError.response?.data?.message || "Không thể tải thông tin của bạn."}
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
        <div className="space-y-2">
          <Label htmlFor="cv">Chọn CV (đã tải lên)</Label>
          <Select onValueChange={setSelectedCv} value={selectedCv} required>
            <SelectTrigger id="cv" className="w-full border-gray-300 focus:border-green-600 focus:ring-green-600">
              <SelectValue placeholder="Chọn CV để ứng tuyển..." />
            </SelectTrigger>
            <SelectContent className="z-9999 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto" container={document.body}>
              {cvs.length > 0 ? (
                cvs.map((cv) => (
                  <SelectItem key={cv._id} value={cv._id} className="hover:bg-gray-50 focus:bg-gray-50">
                    {cv.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-600">
                  Bạn chưa có CV nào. Vui lòng vào trang cá nhân để tải lên.
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
            disabled={isSubmitting || cvs.length === 0 || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Đang nộp đơn...' : 'Xác nhận ứng tuyển'}
          </Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">Ứng tuyển vị trí</DialogTitle>
          <DialogDescription className="text-gray-600">{jobTitle}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};