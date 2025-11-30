import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Calendar, Plus, Edit3, Trash2, Save, X, MapPin, Award } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

const EducationForm = ({ formData, onFormChange, onCancel, onSave, isUpdating }) => {
  return (
    <div className="space-y-4 p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school">Trường <span className="text-destructive">*</span></Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => onFormChange('school', e.target.value)}
            placeholder="VD: Đại học Bách Khoa"
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Chuyên ngành <span className="text-destructive">*</span></Label>
          <Input
            id="major"
            value={formData.major}
            onChange={(e) => onFormChange('major', e.target.value)}
            placeholder="VD: Công nghệ thông tin"
            className="bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree">Bằng cấp <span className="text-destructive">*</span></Label>
          <Input
            id="degree"
            value={formData.degree}
            onChange={(e) => onFormChange('degree', e.target.value)}
            placeholder="VD: Cử nhân"
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            value={formData.gpa}
            onChange={(e) => onFormChange('gpa', e.target.value)}
            placeholder="VD: 3.5/4.0"
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
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
          placeholder="Mô tả về quá trình học tập..."
          rows={3}
          className="bg-background resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="honors">Giải thưởng / Danh hiệu</Label>
        <Textarea
          id="honors"
          value={formData.honors || ''}
          onChange={(e) => onFormChange('honors', e.target.value)}
          placeholder="VD: Học bổng xuất sắc, Sinh viên 5 tốt..."
          rows={2}
          className="bg-background resize-none"
        />
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

export const EducationSection = ({ educations = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: '',
    gpa: '',
    type: '',
    location: '',
    honors: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [eduToDelete, setEduToDelete] = useState(null);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  const handleAdd = () => {
    setFormData({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
      gpa: '',
      type: '',
      location: '',
      honors: ''
    });
    setIsAdding(true);
  };

  const handleEdit = (edu) => {
    setFormData({
      ...edu,
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''
    });
    setEditingId(edu._id);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.school || !formData.major || !formData.degree || !formData.startDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsUpdating(true);
      let updatedEducations;

      if (isAdding) {
        updatedEducations = [...educations, formData];
      } else {
        updatedEducations = educations.map(edu =>
          edu._id === editingId ? { ...edu, ...formData } : edu
        );
      }

      await onUpdate({ educations: updatedEducations });
      setIsAdding(false);
      setEditingId(null);
      toast.success(isAdding ? 'Thêm học vấn thành công' : 'Cập nhật học vấn thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (eduId) => {
    setEduToDelete(eduId);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!eduToDelete) return;

    try {
      setIsUpdating(true);
      const updatedEducations = educations.filter(edu => edu._id !== eduToDelete);
      await onUpdate({ educations: updatedEducations });
      toast.success('Xóa học vấn thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
      setConfirmDeleteOpen(false);
      setEduToDelete(null);
    }
  };

  return (
    <Card className="card-hover border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Học vấn</h3>
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
        {isAdding && <EducationForm
          formData={formData}
          onFormChange={handleFormChange}
          onCancel={handleCancel}
          onSave={handleSave}
          isUpdating={isUpdating}
        />}

        {educations.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <GraduationCap className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Chưa có thông tin học vấn
            </p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Thêm học vấn để nhà tuyển dụng biết về trình độ của bạn
            </p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Thêm học vấn
            </Button>
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border/60"></div>

            <div className="space-y-8">
              {educations.map((edu, index) => (
                <div key={edu._id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 group-hover:scale-110 transition-transform"></div>

                  {editingId === edu._id ? (
                    <EducationForm
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
                              {edu.school}
                            </h3>
                            <div className="text-base font-medium text-primary mt-1">
                              {edu.major}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center bg-muted px-2 py-1 rounded">
                              <span className="font-medium mr-1.5">Bằng cấp:</span>
                              {edu.degree}
                            </div>
                            {edu.gpa && (
                              <div className="flex items-center bg-muted px-2 py-1 rounded">
                                <span className="font-medium mr-1.5">GPA:</span>
                                {edu.gpa}
                              </div>
                            )}
                            <div className="flex items-center bg-muted px-2 py-1 rounded">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Hiện tại'}
                            </div>
                            {edu.location && (
                              <div className="flex items-center bg-muted px-2 py-1 rounded">
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {edu.location}
                              </div>
                            )}
                          </div>

                          {edu.description && (
                            <p className="text-muted-foreground leading-relaxed text-sm mt-3">
                              {edu.description}
                            </p>
                          )}

                          {edu.honors && (
                            <div className="mt-4 bg-muted/30 p-3 rounded-lg border border-border/50">
                              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 flex items-center">
                                <Award className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                                Giải thưởng & Danh hiệu
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {edu.honors}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(edu)}
                            disabled={isUpdating}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(edu._id)}
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
        title="Xóa học vấn?"
        description="Bạn có chắc chắn muốn xóa thông tin học vấn này? Hành động này không thể hoàn tác."
        onConfirm={executeDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </Card >
  );
};
