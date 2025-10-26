import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

const EducationFormItem = ({ edu, index, onChange, onDelete }) => {
  const handleFieldChange = useCallback((field, value) => {
    onChange(index, field, value);
  }, [index, onChange]);

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index, onDelete]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Học vấn {index + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`edu-school-${index}`}>Trường học</Label>
          <Input
            id={`edu-school-${index}`}
            value={edu.school || ''}
            onChange={(e) => handleFieldChange('school', e.target.value)}
            placeholder="Tên trường học"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-major-${index}`}>Chuyên ngành</Label>
          <Input
            id={`edu-major-${index}`}
            value={edu.major || ''}
            onChange={(e) => handleFieldChange('major', e.target.value)}
            placeholder="Chuyên ngành học"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-degree-${index}`}>Bằng cấp</Label>
          <Input
            id={`edu-degree-${index}`}
            value={edu.degree || ''}
            onChange={(e) => handleFieldChange('degree', e.target.value)}
            placeholder="Ví dụ: Cử nhân, Thạc sĩ"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-type-${index}`}>Loại hình</Label>
          <Input
            id={`edu-type-${index}`}
            value={edu.type || ''}
            onChange={(e) => handleFieldChange('type', e.target.value)}
            placeholder="Ví dụ: Đại học, Cao đẳng"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-start-${index}`}>Ngày bắt đầu</Label>
          <Input
            id={`edu-start-${index}`}
            type="date"
            value={edu.startDate ? edu.startDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-end-${index}`}>Ngày kết thúc</Label>
          <Input
            id={`edu-end-${index}`}
            type="date"
            value={edu.endDate ? edu.endDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edu-gpa-${index}`}>Điểm GPA</Label>
          <Input
            id={`edu-gpa-${index}`}
            value={edu.gpa || ''}
            onChange={(e) => handleFieldChange('gpa', e.target.value)}
            placeholder="Ví dụ: 3.5"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`edu-desc-${index}`}>Mô tả</Label>
        <Textarea
          id={`edu-desc-${index}`}
          value={edu.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Mô tả về quá trình học tập..."
          rows={3}
        />
      </div>
    </div>
  );
};

EducationFormItem.displayName = 'EducationFormItem';

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.edu === nextProps.edu &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onDelete === nextProps.onDelete
  );
};

export default memo(EducationFormItem, areEqual);
