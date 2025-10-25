import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfile, uploadAvatar } from '@/services/profileService';

export const BasicInfoStep = ({ profile, onComplete }) => {
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    bio: profile?.bio || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['myProfile']);
      toast.success('Cập nhật thông tin thành công!');
      if (onComplete) onComplete(formData);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      setAvatarPreview(data.data.avatar);
      queryClient.invalidateQueries(['myProfile']);
      toast.success('Cập nhật avatar thành công!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể upload avatar');
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn! Vui lòng chọn ảnh dưới 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);
      uploadAvatarMutation.mutate(formData);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Validate
    if (!formData.phone) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    updateMutation.mutate(formData);
  };

  const isFormValid = formData.phone && formData.phone.length >= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2 text-foreground">Chào mừng bạn! 👋</h3>
        <p className="text-muted-foreground text-lg">
          Hãy cho chúng tôi biết thêm về bạn
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Avatar Upload */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-border">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-3xl">
                  {profile?.fullname?.charAt(0)?.toUpperCase() || <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg group-hover:scale-110"
              >
                <Camera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploadAvatarMutation.isPending}
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name (read-only) */}
            <div>
              <Label htmlFor="fullname">Họ và tên</Label>
              <Input
                id="fullname"
                type="text"
                value={profile?.fullname || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Bạn có thể đổi tên trong phần cài đặt tài khoản
              </p>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0912345678"
                required
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nhà tuyển dụng sẽ liên hệ với bạn qua số này
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">
                Giới thiệu bản thân
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm, mục tiêu nghề nghiệp của bạn..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>Viết vài dòng để nhà tuyển dụng hiểu rõ hơn về bạn</span>
                <span className={formData.bio.length > 900 ? 'text-warning' : ''}>
                  {formData.bio.length}/1000
                </span>
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>💡 Mẹo:</strong> Một hồ sơ có ảnh và thông tin đầy đủ sẽ tăng 70% cơ hội được nhà tuyển dụng chú ý!
            </p>
          </div>

          {/* Submit indicator */}
          {!isFormValid && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Vui lòng điền đầy đủ thông tin bắt buộc (*)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
