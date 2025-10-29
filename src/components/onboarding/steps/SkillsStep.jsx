import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Briefcase } from 'lucide-react';
import { skillsSchema } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';
import { popularSkills } from '@/constants/skills';
import { JOB_CATEGORIES, POPULAR_CATEGORIES } from '@/constants/jobCategories';

export const SkillsStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  const [selectedSkills, setSelectedSkills] = useState(initialData.skills || []);
  const [selectedCategories, setSelectedCategories] = useState(initialData.preferredCategories || []);
  const [customSkill, setCustomSkill] = useState('');

  const {
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: initialData.skills || [],
      preferredCategories: initialData.preferredCategories || [],
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

  const toggleCategory = (categoryValue) => {
    let updated;
    if (selectedCategories.includes(categoryValue)) {
      updated = selectedCategories.filter(c => c !== categoryValue);
    } else {
      if (selectedCategories.length >= 5) return; // Max 5 categories
      updated = [...selectedCategories, categoryValue];
    }
    setSelectedCategories(updated);
    setValue('preferredCategories', updated);
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
      {/* Preferred Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Ngành nghề mong muốn
          </CardTitle>
          <CardDescription>
            Chọn ít nhất 1 ngành nghề bạn quan tâm (tối đa 5)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
              {selectedCategories.map((catValue) => {
                const category = JOB_CATEGORIES.find(c => c.value === catValue);
                return (
                  <Badge
                    key={catValue}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => toggleCategory(catValue)}
                  >
                    <span className="mr-1">{category?.icon}</span>
                    {category?.label}
                    <X className="w-3 h-3 ml-1.5" />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Categories Counter */}
          <div className="text-sm text-muted-foreground">
            Đã chọn: {selectedCategories.length}/5 ngành nghề
            {selectedCategories.length < 1 && (
              <span className="text-destructive ml-2">
                (Cần chọn ít nhất 1 ngành nghề)
              </span>
            )}
          </div>

          {/* Popular Categories */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Ngành nghề phổ biến</Label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CATEGORIES.map((catValue) => {
                const category = JOB_CATEGORIES.find(c => c.value === catValue);
                return (
                  <Badge
                    key={catValue}
                    variant={selectedCategories.includes(catValue) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground px-3 py-1.5"
                    onClick={() => toggleCategory(catValue)}
                  >
                    <span className="mr-1">{category?.icon}</span>
                    {category?.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* All Categories Grid */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Tất cả ngành nghề</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
              {JOB_CATEGORIES.map((category) => (
                <Badge
                  key={category.value}
                  variant={selectedCategories.includes(category.value) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground justify-start text-left px-3 py-2"
                  onClick={() => toggleCategory(category.value)}
                >
                  <span className="mr-2">{category.icon}</span>
                  <span className="text-xs">{category.label}</span>
                </Badge>
              ))}
            </div>
          </div>

          <InlineError message={errors.preferredCategories?.message} />
        </CardContent>
      </Card>

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