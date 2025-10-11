import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Calendar, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

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
    type: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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
      type: ''
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

  const handleDelete = async (eduId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học vấn này?')) return;

    try {
      setIsUpdating(true);
      const updatedEducations = educations.filter(edu => edu._id !== eduId);
      await onUpdate({ educations: updatedEducations });
      toast.success('Xóa học vấn thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const EducationForm = () => (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="school">Trường <span className="text-destructive">*</span></Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            placeholder="VD: Đại học Bách Khoa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="major">Chuyên ngành <span className="text-destructive">*</span></Label>
          <Input
            id="major"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            placeholder="VD: Công nghệ thông tin"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree">Bằng cấp <span className="text-destructive">*</span></Label>
          <Input
            id="degree"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            placeholder="VD: Cử nhân"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            placeholder="VD: 3.5/4.0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Ngày bắt đầu <span className="text-destructive">*</span></Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả về quá trình học tập..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button onClick={handleSave} disabled={isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-primary" />
            Học vấn
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
        {isAdding && <EducationForm />}

        {educations.length === 0 && !isAdding ? (
          <p className="text-muted-foreground text-center py-8">
            Chưa có thông tin học vấn. Nhấn "Thêm" để bắt đầu.
          </p>
        ) : (
          educations.map((edu) => (
            <div key={edu._id} className="space-y-2">
              {editingId === edu._id ? (
                <EducationForm />
              ) : (
                <div className="border-l-2 border-primary/20 pl-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{edu.school}</h3>
                      <div className="text-primary font-medium mb-1">{edu.major}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>{edu.degree}</span>
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Hiện tại'}
                      </div>
                      {edu.description && (
                        <p className="text-muted-foreground mt-2">{edu.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEdit(edu)}
                        disabled={isUpdating}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive"
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
          ))
        )}
      </CardContent>
    </Card>
  );
};
