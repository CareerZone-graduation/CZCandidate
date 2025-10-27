import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, Linkedin, Github, Globe, MapPin, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export const SocialLinksSection = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: profile?.address || '',
    website: profile?.website || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || ''
  });

  const handleEdit = () => {
    setFormData({
      address: profile?.address || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onUpdate(formData);
      toast.success('Đã cập nhật thông tin liên hệ');
      setIsEditing(false);
    } catch (error) {
      toast.error('Không thể cập nhật thông tin');
    }
  };

  const hasAnyLink = profile?.address || profile?.website || profile?.linkedin || profile?.github;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Thông tin liên hệ & Mạng xã hội
        </CardTitle>
        {!isEditing && (
          <Button onClick={handleEdit} size="sm" variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-3">
            {!hasAnyLink ? (
              <div className="text-center py-6 text-muted-foreground">
                <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Chưa có thông tin liên hệ</p>
                <p className="text-sm mt-1">Thêm thông tin để nhà tuyển dụng dễ dàng liên hệ</p>
              </div>
            ) : (
              <>
                {profile?.address && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Địa chỉ</p>
                      <p className="text-sm text-muted-foreground">{profile.address}</p>
                    </div>
                  </div>
                )}
                
                {profile?.website && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
                
                {profile?.linkedin && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <Linkedin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">LinkedIn</p>
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.linkedin}
                      </a>
                    </div>
                  </div>
                )}
                
                {profile?.github && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <Github className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Github</p>
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {profile.github}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
              />
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website/Portfolio
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://myportfolio.com"
              />
            </div>

            <div>
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                Github
              </Label>
              <Input
                id="github"
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button type="submit">
                <Check className="w-4 h-4 mr-2" />
                Lưu
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
