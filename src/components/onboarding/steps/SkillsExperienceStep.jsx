import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Briefcase } from 'lucide-react';
import { skillsExperienceSchema, experienceLevelEnum } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';
import { popularSkills, jobFields } from '@/constants/skills';

export const SkillsExperienceStep = ({ initialData = {}, onNext, isLoading }) => {
  const [selectedSkills, setSelectedSkills] = useState(initialData.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedFields, setSelectedFields] = useState(initialData.jobFields || []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(skillsExperienceSchema),
    defaultValues: {
      skills: initialData.skills || [],
      customSkills: initialData.customSkills || [],
      experienceLevel: initialData.experienceLevel || '',
      jobFields: initialData.jobFields || []
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

  const toggleField = (field) => {
    let updated;
    if (selectedFields.includes(field)) {
      updated = selectedFields.filter(f => f !== field);
    } else {
      if (selectedFields.length >= 5) return;
      updated = [...selectedFields, field];
    }
    setSelectedFields(updated);
    setValue('jobFields', updated);
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  const experienceLevelDescriptions = {
    'Fresher': 'Mới tốt nghiệp, chưa có kinh nghiệm làm việc',
    'Junior': '1-2 năm kinh nghiệm',
    'Mid-level': '3-5 năm kinh nghiệm',
    'Senior': 'Trên 5 năm kinh nghiệm'
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Skills Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Kỹ năng của bạn</CardTitle>
          <CardDescription>
            Chọn ít nhất 3 kỹ năng (tối đa 20)
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
          </div>

          <InlineError message={errors.skills?.message} />
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle>Mức độ kinh nghiệm</CardTitle>
          <CardDescription>
            Chọn mức độ kinh nghiệm phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            name="experienceLevel"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="space-y-3"
              >
                {experienceLevelEnum.map((level) => (
                  <div
                    key={level}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                  >
                    <RadioGroupItem value={level} id={level} />
                    <div className="flex-1">
                      <Label htmlFor={level} className="cursor-pointer font-medium">
                        {level}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {experienceLevelDescriptions[level]}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          <InlineError message={errors.experienceLevel?.message} />
        </CardContent>
      </Card>

      {/* Job Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Lĩnh vực công việc quan tâm</CardTitle>
          <CardDescription>
            Chọn 1-5 lĩnh vực bạn muốn làm việc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Fields */}
          {selectedFields.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              {selectedFields.map((field) => (
                <Badge
                  key={field}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => toggleField(field)}
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {field}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Job Fields Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {jobFields.map((field) => (
              <div
                key={field}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedFields.includes(field)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleField(field)}
              >
                <p className="text-sm font-medium">{field}</p>
              </div>
            ))}
          </div>

          <InlineError message={errors.jobFields?.message} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          Tiếp tục
        </Button>
      </div>
    </form>
  );
};
