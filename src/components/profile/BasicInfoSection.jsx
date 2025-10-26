import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Edit3, Save, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const BasicInfoSection = ({ profile, onUpdate, onAvatarUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: profile?.fullname || '',
    phone: profile?.phone || '',
    bio: profile?.bio || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleEdit = () => {
    setFormData({
      fullname: profile?.fullname || '',
      phone: profile?.phone || '',
      bio: profile?.bio || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
  };

  // Memoized handler to prevent re-render
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    try {
      setIsUpdating(true);

      if (avatarFile) {
        setIsUploadingAvatar(true);
        toast.loading('Đang tải ảnh lên...', { id: 'avatar-upload' });
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatarFile);
        await onAvatarUpdate(avatarFormData);
        toast.success('Tải ảnh lên thành công', { id: 'avatar-upload' });
        setIsUploadingAvatar(false);
      }

      // Normalize phone number to match backend format
      const updateData = { ...formData };
      if (updateData.phone) {
        // Remove all spaces, dashes, parentheses
        updateData.phone = updateData.phone.replace(/[\s\-\(\)]/g, '');
      }

      await onUpdate(updateData);
      setIsEditing(false);
      setAvatarFile(null);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      if (isUploadingAvatar) {
        toast.error('Tải ảnh lên thất bại', { id: 'avatar-upload' });
      }
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
      setIsUploadingAvatar(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setAvatarFile(file);
    toast.success('Đã chọn ảnh. Nhấn "Lưu" để cập nhật.');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary-foreground shadow-lg">
              <AvatarImage
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar}
                alt={profile?.fullname} referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
              <AvatarFallback className="bg-primary-foreground text-primary text-2xl font-bold">
                {profile?.fullname?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Loading overlay khi đang upload avatar */}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-primary-foreground">
                <div className="text-center">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-2" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>
                  <span className="text-xs text-foreground font-semibold">Đang tải...</span>
                </div>
              </div>
            )}

            {/* Preview badge khi đã chọn ảnh mới */}
            {avatarFile && !isUploadingAvatar && isEditing && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg border-2 border-primary-foreground font-medium">
                Ảnh mới
              </div>
            )}

            {isEditing && !isUploadingAvatar && (
              <label className="absolute bottom-0 right-0 bg-background text-foreground p-2 rounded-full cursor-pointer hover:bg-card transition-colors shadow-lg border border-border">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={formData.fullname}
                      onChange={(e) => handleFormChange('fullname', e.target.value)}
                      placeholder="Họ và tên"
                      className="bg-primary-foreground text-primary"
                    />
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="Số điện thoại"
                      className="bg-primary-foreground text-primary"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile?.fullname}</h1>
                    <div className="flex items-center text-primary-foreground/80 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{profile?.email}</span>
                    </div>
                    <div className="flex items-center text-primary-foreground/80">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{profile?.phone || 'Chưa cập nhật số điện thoại'}</span>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="text-right">
                  <div className="text-primary-foreground/80 text-sm mb-1">Thành viên từ</div>
                  <div className="font-semibold">{formatDate(profile?.createdAt)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleSave}
                  disabled={isUpdating || isUploadingAvatar}
                >
                  {isUpdating || isUploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUploadingAvatar ? 'Đang tải ảnh...' : 'Đang lưu...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleCancel}
                  disabled={isUpdating || isUploadingAvatar}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                onClick={handleEdit}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {(profile?.bio || isEditing) && (
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <User className="w-4 h-4 mr-2 text-primary" />
              Giới thiệu
            </h3>
          </div>
          {isEditing ? (
            <Textarea
              value={formData.bio}
              onChange={(e) => handleFormChange('bio', e.target.value)}
              placeholder="Viết về bản thân..."
              rows={4}
              className="resize-none"
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">{profile?.bio}</p>
          )}
        </CardContent>
      )}
    </Card>
  );
};
