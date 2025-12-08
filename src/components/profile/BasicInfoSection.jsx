import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Edit3, Save, X, Upload, Loader2, MapPin, Globe, Linkedin, Github, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const BasicInfoSection = ({ profile, onUpdate, onAvatarUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: profile?.fullname || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    address: profile?.address || '',
    website: profile?.website || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleEdit = () => {
    setFormData({
      fullname: profile?.fullname || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      address: profile?.address || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
  };

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

      // Remove avatar from updateData (avatar is updated separately)
      delete updateData.avatar;

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
    <Card className="overflow-hidden border-none shadow-lg bg-card/50 backdrop-blur-sm group">
      {/* Cover Image Area */}
      <div className="h-32 md:h-48 relative overflow-hidden group/cover">
        {profile?.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {isEditing && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 opacity-0 group-hover/cover:opacity-100 transition-opacity"
            onClick={() => toast.info("Tính năng cập nhật ảnh bìa đang được phát triển")}
          >
            <Camera className="w-4 h-4 mr-2" />
            Thay ảnh bìa
          </Button>
        )}
      </div>

      <CardContent className="relative pt-0 pb-8 px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 md:-mt-20">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl bg-background">
              <AvatarImage
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar}
                alt={profile?.fullname}
                referrerPolicy="no-referrer"
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                {profile?.fullname?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Avatar Upload Overlay */}
            {(isEditing || isUploadingAvatar) && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100 z-10">
                {isUploadingAvatar ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            )}

            {/* New Avatar Badge */}
            {avatarFile && !isUploadingAvatar && isEditing && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg border-2 border-white font-bold z-20">
                Mới
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 pt-16 md:pt-20 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2 flex-1 w-full">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Họ và tên</Label>
                      <Input
                        id="fullname"
                        value={formData.fullname}
                        onChange={(e) => handleFormChange('fullname', e.target.value)}
                        placeholder="Họ và tên"
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Giới thiệu ngắn (Bio)</Label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => handleFormChange('bio', e.target.value)}
                        placeholder="Viết giới thiệu ngắn về bản thân..."
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{profile?.fullname}</h1>
                    <p className="text-lg text-muted-foreground mt-1">{profile?.bio || "Chưa có giới thiệu"}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                      {profile?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile?.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Thành viên từ {formatDate(profile?.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 self-start md:self-center mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={isUpdating || isUploadingAvatar} className="bg-green-600 hover:bg-green-700 text-white">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Lưu
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isUpdating || isUploadingAvatar}>
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleEdit} className="hover:bg-primary/5 border-primary/20">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            {/* Social Links & Additional Info (Edit Mode) */}
            {isEditing && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Thông tin liên hệ
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Địa chỉ</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="Địa chỉ"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Mạng xã hội
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Website / Portfolio</Label>
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={formData.website}
                          onChange={(e) => handleFormChange('website', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={formData.linkedin}
                          onChange={(e) => handleFormChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Github</Label>
                      <div className="relative">
                        <Github className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          className="pl-9"
                          value={formData.github}
                          onChange={(e) => handleFormChange('github', e.target.value)}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links Display (View Mode) */}
            {!isEditing && (
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border/50">
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1.5 rounded-full">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors bg-muted/50 px-3 py-1.5 rounded-full">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-muted/50 px-3 py-1.5 rounded-full">
                    <Github className="w-4 h-4" />
                    Github
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
