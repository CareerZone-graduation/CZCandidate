import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Briefcase, GraduationCap } from 'lucide-react';
import { experienceEducationSchema, experienceLevelEnum } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';

export const ExperienceEducationStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm({
    resolver: zodResolver(experienceEducationSchema),
    defaultValues: {
      experienceLevel: initialData.experienceLevel || '',
      experiences: initialData.experiences || [],
      educations: initialData.educations || []
    }
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experiences'
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'educations'
  });

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
      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle>Mức độ kinh nghiệm</CardTitle>
          <CardDescription>
            Chọn mức độ kinh nghiệm phù hợp với bạn (không bắt buộc)
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
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      field.value === level 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => field.onChange(level)}
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
          {errors.experienceLevel && (
            <InlineError message={errors.experienceLevel.message} />
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Kinh nghiệm làm việc
          </CardTitle>
          <CardDescription>
            Thêm kinh nghiệm làm việc của bạn (không bắt buộc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {experienceFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Kinh nghiệm {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Công ty *</Label>
                  <Input
                    {...register(`experiences.${index}.company`)}
                    placeholder="Tên công ty"
                  />
                  {errors.experiences?.[index]?.company && (
                    <InlineError message={errors.experiences[index].company.message} />
                  )}
                </div>

                <div>
                  <Label>Vị trí *</Label>
                  <Input
                    {...register(`experiences.${index}.position`)}
                    placeholder="Vị trí công việc"
                  />
                  {errors.experiences?.[index]?.position && (
                    <InlineError message={errors.experiences[index].position.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type="month"
                    {...register(`experiences.${index}.startDate`)}
                  />
                  {errors.experiences?.[index]?.startDate && (
                    <InlineError message={errors.experiences[index].startDate.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày kết thúc</Label>
                  <Input
                    type="month"
                    {...register(`experiences.${index}.endDate`)}
                    disabled={watch(`experiences.${index}.isCurrentJob`)}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Controller
                      name={`experiences.${index}.isCurrentJob`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id={`current-job-${index}`}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor={`current-job-${index}`} className="text-sm">
                      Đang làm việc tại đây
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Mô tả công việc</Label>
                <Textarea
                  {...register(`experiences.${index}.description`)}
                  placeholder="Mô tả về công việc, trách nhiệm, thành tích..."
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendExperience({
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              description: '',
              isCurrentJob: false
            })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm kinh nghiệm
          </Button>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Học vấn
          </CardTitle>
          <CardDescription>
            Thêm thông tin học vấn của bạn (không bắt buộc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Học vấn {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Trường *</Label>
                  <Input
                    {...register(`educations.${index}.school`)}
                    placeholder="Tên trường"
                  />
                  {errors.educations?.[index]?.school && (
                    <InlineError message={errors.educations[index].school.message} />
                  )}
                </div>

                <div>
                  <Label>Chuyên ngành *</Label>
                  <Input
                    {...register(`educations.${index}.major`)}
                    placeholder="Chuyên ngành học"
                  />
                  {errors.educations?.[index]?.major && (
                    <InlineError message={errors.educations[index].major.message} />
                  )}
                </div>

                <div>
                  <Label>Bằng cấp *</Label>
                  <Input
                    {...register(`educations.${index}.degree`)}
                    placeholder="Cử nhân, Thạc sĩ, Tiến sĩ..."
                  />
                  {errors.educations?.[index]?.degree && (
                    <InlineError message={errors.educations[index].degree.message} />
                  )}
                </div>

                <div>
                  <Label>GPA</Label>
                  <Input
                    {...register(`educations.${index}.gpa`)}
                    placeholder="3.5/4.0"
                  />
                </div>

                <div>
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type="month"
                    {...register(`educations.${index}.startDate`)}
                  />
                  {errors.educations?.[index]?.startDate && (
                    <InlineError message={errors.educations[index].startDate.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày kết thúc</Label>
                  <Input
                    type="month"
                    {...register(`educations.${index}.endDate`)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendEducation({
              school: '',
              major: '',
              degree: '',
              startDate: '',
              endDate: '',
              gpa: ''
            })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm học vấn
          </Button>
        </CardContent>
      </Card>

      {/* Hidden submit button - Form sẽ được submit từ footer của OnboardingWrapper */}
      <button type="submit" className="hidden" />
    </form>
  );
};