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
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Vị trí <span className="text-destructive">*</span></Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => onFormChange('position', e.target.value)}
            placeholder="VD: Senior Developer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Công ty <span className="text-destructive">*</span></Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => onFormChange('company', e.target.value)}
            placeholder="VD: ABC Company"
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
              className="rounded border-gray-300"
            />
            <Label htmlFor="isCurrentJob" className="text-sm font-normal cursor-pointer">
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
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm thành tựu
          </Button>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
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

  // Memoized handler to prevent re-render
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
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const handleDelete = async (expId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kinh nghiệm này?')) return;

    try {
      setIsUpdating(true);
      const updatedExperiences = experiences.filter(exp => exp._id !== expId);
      await onUpdate({ experiences: updatedExperiences });
      toast.success('Xóa kinh nghiệm thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Kinh nghiệm làm việc
            {experiences.length > 0 && (
              <Badge variant="outline">{calculateExperience(experiences)}</Badge>
            )}
          </div>
          {!isAdding && !editingId && (
            <Button size="sm" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && <ExperienceForm 
          formData={formData}
          onFormChange={handleFormChange}
          onCancel={handleCancel}
          onSave={handleSave}
          isUpdating={isUpdating}
        />}

        {experiences.length === 0 && !isAdding ? (
          <p className="text-muted-foreground text-center py-8">
            Chưa có kinh nghiệm làm việc. Nhấn "Thêm" để bắt đầu.
          </p>
        ) : (
          experiences.map((exp) => (
            <div key={exp._id} className="space-y-2">
              {editingId === exp._id ? (
                <ExperienceForm 
                  formData={formData}
                  onFormChange={handleFormChange}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  isUpdating={isUpdating}
                />
              ) : (
                <div className="border-l-2 border-primary/20 pl-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{exp.position}</h3>
                      <div className="flex items-center text-primary font-medium mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        {exp.company}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Hiện tại'}
                        </div>
                        {exp.isCurrentJob && (
                          <Badge variant="secondary" className="text-xs">
                            Hiện tại
                          </Badge>
                        )}
                      </div>
                      {exp.location && (
                        <p className="text-sm text-muted-foreground mb-2">📍 {exp.location}</p>
                      )}
                      {exp.description && (
                        <p className="text-muted-foreground mt-2">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">🎯 Thành tựu:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEdit(exp)}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
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
          ))
        )}
      </CardContent>
    </Card>
  );
};
