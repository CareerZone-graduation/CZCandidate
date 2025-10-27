import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const SKILL_LEVELS = [
  { value: 'Beginner', label: 'Cơ bản' },
  { value: 'Intermediate', label: 'Trung cấp' },
  { value: 'Advanced', label: 'Nâng cao' },
  { value: 'Expert', label: 'Chuyên gia' },
  { value: '', label: 'Chưa xác định' }
];

const SKILL_CATEGORIES = [
  { value: 'Technical', label: 'Kỹ thuật' },
  { value: 'Soft Skills', label: 'Kỹ năng mềm' },
  { value: 'Language', label: 'Ngoại ngữ' },
  { value: 'Other', label: 'Khác' },
  { value: '', label: 'Chưa xác định' }
];

export const SkillsSection = ({ skills = [], onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSkills, setEditSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: '', category: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setEditSkills(skills.map(skill => ({ ...skill }))); // Deep copy to avoid direct mutation
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewSkill({ name: '', level: '', category: '' });
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error('Vui lòng nhập tên kỹ năng');
      return;
    }

    if (editSkills.some(skill => skill.name.toLowerCase() === newSkill.name.toLowerCase())) {
      toast.error('Kỹ năng này đã tồn tại');
      return;
    }

    setEditSkills([...editSkills, { ...newSkill, name: newSkill.name.trim() }]);
    setNewSkill({ name: '', level: '', category: '' });
  };

  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...editSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setEditSkills(updatedSkills);
  };

  const handleRemoveSkill = (index) => {
    setEditSkills(editSkills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (editSkills.length === 0) {
      toast.error('Vui lòng thêm ít nhất một kỹ năng');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate({ skills: editSkills });
      setIsEditing(false);
      setNewSkillName('');
      toast.success('Cập nhật kỹ năng thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-primary" />
            Kỹ năng
          </div>
          {!isEditing ? (
            <Button size="sm" onClick={handleEdit}>
              <Plus className="w-4 h-4 mr-2" />
              {skills.length === 0 ? 'Thêm' : 'Chỉnh sửa'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="newSkillName">Tên kỹ năng</Label>
                <Input
                  id="newSkillName"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tên kỹ năng..."
                />
              </div>
              <div className="w-1/4">
                <Label htmlFor="newSkillLevel">Mức độ</Label>
                <Select
                  value={newSkill.level}
                  onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger id="newSkillLevel">
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/4">
                <Label htmlFor="newSkillCategory">Danh mục</Label>
                <Select
                  value={newSkill.category}
                  onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="newSkillCategory">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddSkill} className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {editSkills.length > 0 ? (
              <div className="space-y-3">
                {editSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`skillName-${index}`}>Tên kỹ năng</Label>
                      <Input
                        id={`skillName-${index}`}
                        value={skill.name}
                        onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                        placeholder="Tên kỹ năng..."
                      />
                    </div>
                    <div className="w-1/4">
                      <Label htmlFor={`skillLevel-${index}`}>Mức độ</Label>
                      <Select
                        value={skill.level}
                        onValueChange={(value) => handleSkillChange(index, 'level', value)}
                      >
                        <SelectTrigger id={`skillLevel-${index}`}>
                          <SelectValue placeholder="Mức độ" />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map(level => (
                            <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/4">
                      <Label htmlFor={`skillCategory-${index}`}>Danh mục</Label>
                      <Select
                        value={skill.category}
                        onValueChange={(value) => handleSkillChange(index, 'category', value)}
                      >
                        <SelectTrigger id={`skillCategory-${index}`}>
                          <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSkill(index)}
                      className="shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                Chưa có kỹ năng nào. Nhập tên kỹ năng và nhấn Enter hoặc nút + để thêm.
              </p>
            )}
          </div>
        ) : (
          <>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={skill._id || index}
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Chưa có kỹ năng. Nhấn "Thêm" để bắt đầu.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
