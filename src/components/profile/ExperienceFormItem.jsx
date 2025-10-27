import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

const ExperienceFormItem = ({ exp, index, onChange, onDelete }) => {
  const handleFieldChange = useCallback((field, value) => {
    onChange(index, field, value);
  }, [index, onChange]);

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index, onDelete]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Kinh nghiệm {index + 1}</h4>
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
          <Label htmlFor={`exp-company-${index}`}>Công ty</Label>
          <Input
            id={`exp-company-${index}`}
            value={exp.company || ''}
            onChange={(e) => handleFieldChange('company', e.target.value)}
            placeholder="Tên công ty"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`exp-position-${index}`}>Vị trí</Label>
          <Input
            id={`exp-position-${index}`}
            value={exp.position || ''}
            onChange={(e) => handleFieldChange('position', e.target.value)}
            placeholder="Vị trí công việc"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`exp-start-${index}`}>Ngày bắt đầu</Label>
          <Input
            id={`exp-start-${index}`}
            type="date"
            value={exp.startDate ? exp.startDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`exp-end-${index}`}>Ngày kết thúc</Label>
          <Input
            id={`exp-end-${index}`}
            type="date"
            value={exp.endDate ? exp.endDate.split('T')[0] : ''}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`exp-desc-${index}`}>Mô tả công việc</Label>
        <Textarea
          id={`exp-desc-${index}`}
          value={exp.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Mô tả về công việc..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`exp-resp-${index}`}>Trách nhiệm (mỗi dòng một trách nhiệm)</Label>
        <Textarea
          id={`exp-resp-${index}`}
          value={exp.responsibilities ? exp.responsibilities.join('\n') : ''}
          onChange={(e) => handleFieldChange('responsibilities', e.target.value.split('\n').filter(r => r.trim()))}
          placeholder="Liệt kê các trách nhiệm..."
          rows={3}
        />
      </div>
    </div>
  );
};

ExperienceFormItem.displayName = 'ExperienceFormItem';

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.index === nextProps.index &&
    prevProps.exp === nextProps.exp &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onDelete === nextProps.onDelete
  );
};

export default memo(ExperienceFormItem, areEqual);
