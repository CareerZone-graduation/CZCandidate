import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Building, Plus, Edit3, Trash2, Save, X, MapPin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

const ExperienceForm = ({ formData, onFormChange, onCancel, onSave, isUpdating }) => {
  const handleAddAchievement = () => {
    const achievements = formData.achievements || [];
    onFormChange('achievements', [...achievements, '']);
  };

  const handleRemoveAchievement = (index) => {
    const achievements = formData.achievements || [];
    onFormChange('achievements', achievements.filter((_, i) => i !== index));
  };

  const handleAchievementChange = (index, value) => {
    const achievements = formData.achievements || [];
    const newAchievements = [...achievements];
    newAchievements[index] = value;
    onFormChange('achievements', newAchievements);
  };

  return (
    <div className="space-y-4 p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Vị trí <span className="text-destructive">*</span></Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => onFormChange('position', e.target.value)}
            placeholder="VD: Senior Developer"
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Công ty <span className="text-destructive">*</span></Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => onFormChange('company', e.target.value)}
            placeholder="VD: ABC Company"
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Địa điểm</Label>
        <Input
          id="location"
          value={formData.location || ''}
          onChange={(e) => onFormChange('location', e.target.value)}
          placeholder="VD: TP. Hồ Chí Minh"
          className="bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Ngày bắt đầu <span className="text-destructive">*</span></Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onFormChange('startDate', e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onFormChange('endDate', e.target.value)}
            disabled={formData.isCurrentJob}
            className="bg-background"
          />
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              id="isCurrentJob"
              checked={formData.isCurrentJob || false}
              onChange={(e) => {
                onFormChange('isCurrentJob', e.target.checked);
                if (e.target.checked) {
                  onFormChange('endDate', '');
                }
              }}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isCurrentJob" className="text-sm font-normal cursor-pointer select-none">
              Đây là công việc hiện tại
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả công việc</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Mô tả về công việc và trách nhiệm..."
          rows={3}
          className="bg-background resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label>Thành tựu nổi bật</Label>
        <div className="space-y-2">
          {(formData.achievements || []).map((achievement, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={achievement}
                onChange={(e) => handleAchievementChange(index, e.target.value)}
                placeholder="VD: Tăng doanh thu 30%"
                className="bg-background"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAchievement(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAchievement}
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm thành tựu
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button onClick={onSave} disabled={isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
};

export const ExperienceSection = ({ experiences = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    responsibilities: [],
    location: '',
    isCurrentJob: false,
    achievements: []
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [expToDelete, setExpToDelete] = useState(null);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateExperience = (experiences) => {
    if (!experiences || experiences.length === 0) return '0 năm';

    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) return `${months} tháng`;
    if (months === 0) return `${years} năm`;
    return `${years} năm ${months} tháng`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  const handleAdd = () => {
    setFormData({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      responsibilities: [],
      location: '',
      isCurrentJob: false,
      achievements: []
    });
    setIsAdding(true);
  };

  const handleEdit = (exp) => {
    setFormData({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''
    });
    setEditingId(exp._id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.position || !formData.startDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsUpdating(true);
      let updatedExperiences;

      if (isAdding) {
        updatedExperiences = [...experiences, formData];
      } else {
        updatedExperiences = experiences.map(exp =>
          exp._id === editingId ? { ...exp, ...formData } : exp
        );
      }

      await onUpdate({ experiences: updatedExperiences });
      setIsAdding(false);
      setEditingId(null);
      toast.success(isAdding ? 'Thêm kinh nghiệm thành công' : 'Cập nhật kinh nghiệm thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (expId) => {
    setExpToDelete(expId);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!expToDelete) return;

    try {
      setIsUpdating(true);
      const updatedExperiences = experiences.filter(exp => exp._id !== expToDelete);
      await onUpdate({ experiences: updatedExperiences });
      toast.success('Xóa kinh nghiệm thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
      setConfirmDeleteOpen(false);
      setExpToDelete(null);
    }
  };

  return (
    <Card className="card-hover border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Kinh nghiệm làm việc</h3>
              {experiences.length > 0 && (
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Tổng thời gian: {calculateExperience(experiences)}
                </p>
              )}
            </div>
          </div>
          {!isAdding && !editingId && (
            <Button size="sm" onClick={handleAdd} variant="outline" className="hover:bg-primary hover:text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdding && <ExperienceForm
          formData={formData}
          onFormChange={handleFormChange}
          onCancel={handleCancel}
          onSave={handleSave}
          isUpdating={isUpdating}
        />}

        {experiences.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Briefcase className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Chưa có kinh nghiệm làm việc
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Thêm kinh nghiệm để hồ sơ của bạn ấn tượng hơn
            </p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Thêm kinh nghiệm
            </Button>
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border/60"></div>

            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <div key={exp._id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 group-hover:scale-110 transition-transform"></div>

                  {editingId === exp._id ? (
                    <ExperienceForm
                      formData={formData}
                      onFormChange={handleFormChange}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      isUpdating={isUpdating}
                    />
                  ) : (
                    <div className="group/item relative rounded-xl p-4 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-bold text-lg text-foreground group-hover/item:text-primary transition-colors">
                              {exp.position}
                            </h3>
                            <div className="flex items-center text-base font-medium text-muted-foreground mt-1">
                              <Building className="w-4 h-4 mr-2" />
                              {exp.company}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center bg-muted px-2 py-1 rounded">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Hiện tại'}
                            </div>
                            {exp.location && (
                              <div className="flex items-center bg-muted px-2 py-1 rounded">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {exp.location}
                              </div>
                            )}
                            {exp.isCurrentJob && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                Công việc hiện tại
                              </Badge>
                            )}
                          </div>

                          {exp.description && (
                            <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                              {exp.description}
                            </p>
                          )}

                          {exp.achievements && exp.achievements.length > 0 && (
                            <div className="mt-4 bg-muted/30 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center">
                                🎯 Thành tựu chính
                              </p>
                              <ul className="space-y-1.5">
                                {exp.achievements.map((achievement, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-start">
                                    <span className="mr-2 text-primary">•</span>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(exp)}
                            disabled={isUpdating}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(exp._id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Xóa kinh nghiệm?"
        description="Bạn có chắc chắn muốn xóa kinh nghiệm làm việc này? Hành động này không thể hoàn tác."
        onConfirm={executeDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </Card >
  );
};
