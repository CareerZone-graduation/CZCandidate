import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { skillsSchema } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';
import { popularSkills } from '@/constants/skills';

export const SkillsStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  const [selectedSkills, setSelectedSkills] = useState(initialData.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  const {
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: initialData.skills || [],
      customSkills: initialData.customSkills || []
    }
  });

  const toggleSkill = (skill) => {
    let updated;
    if (selectedSkills.includes(skill)) {
      updated = selectedSkills.filter(s => s !== skill);
    } else {
      if (selectedSkills.length >= 20) return;
      updated = [...selectedSkills, skill];
    }
    setSelectedSkills(updated);
    setValue('skills', updated);
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (selectedSkills.length >= 20) return;
    if (selectedSkills.includes(customSkill.trim())) return;

    const updated = [...selectedSkills, customSkill.trim()];
    setSelectedSkills(updated);
    setValue('skills', updated);
    setCustomSkill('');
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Skills Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Kỹ năng của bạn</CardTitle>
          <CardDescription>
            Chọn ít nhất 3 kỹ năng chuyên môn của bạn (tối đa 20)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              {selectedSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Skills Counter */}
          <div className="text-sm text-muted-foreground">
            Đã chọn: {selectedSkills.length}/20 kỹ năng
            {selectedSkills.length < 3 && (
              <span className="text-destructive ml-2">
                (Cần thêm {3 - selectedSkills.length} kỹ năng)
              </span>
            )}
          </div>

          {/* Popular Skills */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Kỹ năng phổ biến</Label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="space-y-2">
            <Label>Thêm kỹ năng khác</Label>
            <div className="flex gap-2">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Nhập kỹ năng..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomSkill}
                disabled={!customSkill.trim() || selectedSkills.length >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Nhấn Enter hoặc click nút + để thêm kỹ năng
            </p>
          </div>

          <InlineError message={errors.skills?.message} />
        </CardContent>
      </Card>

      {/* Hidden submit button - Form sẽ được submit từ footer của OnboardingWrapper */}
      <button type="submit" className="hidden" />
    </form>
  );
};