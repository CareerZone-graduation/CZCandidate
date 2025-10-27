import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkillLevelIndicator } from './SkillLevelIndicator';

const SKILL_LEVELS = [
  { value: 'Beginner', label: 'Cơ bản' },
  { value: 'Intermediate', label: 'Trung cấp' },
  { value: 'Advanced', label: 'Nâng cao' },
  { value: 'Expert', label: 'Chuyên gia' }
];

const SKILL_CATEGORIES = [
  { value: 'Technical', label: 'Kỹ thuật' },
  { value: 'Soft Skills', label: 'Kỹ năng mềm' },
  { value: 'Language', label: 'Ngoại ngữ' },
  { value: 'Other', label: 'Khác' }
];

export const SkillsSection = ({ skills = [], onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSkills, setEditSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: null, category: null });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setEditSkills(skills.map(skill => ({ ...skill }))); // Deep copy to avoid direct mutation
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewSkill({ name: '', level: null, category: null });
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
    setNewSkill({ name: '', level: null, category: null });
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
            <div className="grid gap-3">
              <div>
                <Label htmlFor="newSkillName">Tên kỹ năng</Label>
                <Input
                  id="newSkillName"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Ví dụ: JavaScript, React, Communication..."
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="newSkillLevel">Mức độ</Label>
                  <Select
                    value={newSkill.level || ''}
                    onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: value || null }))}
                  >
                    <SelectTrigger id="newSkillLevel" className="mt-1">
                      <SelectValue placeholder="Chọn mức độ" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_LEVELS.map(level => (
                        <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="newSkillCategory">Danh mục</Label>
                  <Select
                    value={newSkill.category || ''}
                    onValueChange={(value) => setNewSkill(prev => ({ ...prev, category: value || null }))}
                  >
                    <SelectTrigger id="newSkillCategory" className="mt-1">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddSkill} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Thêm kỹ năng
              </Button>
            </div>

            {editSkills.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Danh sách kỹ năng ({editSkills.length})
                </p>
                {editSkills.map((skill, index) => (
                  <div key={index} className="group relative bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Input
                          value={skill.name}
                          onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                          placeholder="Tên kỹ năng..."
                          className="mb-2 font-medium"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={skill.level || ''}
                            onValueChange={(value) => handleSkillChange(index, 'level', value || null)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Mức độ" />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_LEVELS.map(level => (
                                <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={skill.category || ''}
                            onValueChange={(value) => handleSkillChange(index, 'category', value || null)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_CATEGORIES.map(category => (
                                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSkill(index)}
                        className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {skills.length > 0 ? (
              <div className="space-y-4">
                {/* Group skills by category */}
                {['Technical', 'Soft Skills', 'Language', 'Other'].map(categoryValue => {
                  const categorySkills = skills.filter(skill => skill.category === categoryValue);
                  if (categorySkills.length === 0) return null;
                  
                  const categoryLabel = SKILL_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;
                  
                  return (
                    <div key={categoryValue} className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {categoryLabel}
                      </h4>
                      <div className="space-y-2">
                        {categorySkills.map((skill, index) => (
                          <div 
                            key={skill._id || index}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <span className="font-medium text-sm">{skill.name}</span>
                            <SkillLevelIndicator level={skill.level} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Skills without category */}
                {skills.filter(skill => !skill.category).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Khác
                    </h4>
                    <div className="space-y-2">
                      {skills.filter(skill => !skill.category).map((skill, index) => (
                        <div 
                          key={skill._id || index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="font-medium text-sm">{skill.name}</span>
                          <SkillLevelIndicator level={skill.level} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Chưa có kỹ năng nào
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Thêm kỹ năng để tăng cơ hội được tuyển dụng
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
