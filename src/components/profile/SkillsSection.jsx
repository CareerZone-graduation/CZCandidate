import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export const SkillsSection = ({ skills = [], onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editSkills, setEditSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = () => {
    setEditSkills([...skills]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewSkillName('');
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Vui lòng nhập tên kỹ năng');
      return;
    }

    if (editSkills.some(skill => skill.name.toLowerCase() === newSkillName.toLowerCase())) {
      toast.error('Kỹ năng này đã tồn tại');
      return;
    }

    setEditSkills([...editSkills, { name: newSkillName.trim() }]);
    setNewSkillName('');
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
            <div className="flex gap-2">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tên kỹ năng..."
              />
              <Button onClick={handleAddSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {editSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editSkills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-primary/10 text-primary pr-1"
                  >
                    {skill.name}
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="ml-2 hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
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
