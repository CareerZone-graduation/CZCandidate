import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Award, Code, Linkedin, Github, Globe } from 'lucide-react';
import { certificatesProjectsSchema } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';

export const CertificatesProjectsStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(certificatesProjectsSchema),
    defaultValues: {
      certificates: initialData.certificates || [],
      projects: initialData.projects || [],
      linkedin: initialData.linkedin || '',
      github: initialData.github || '',
      website: initialData.website || ''
    }
  });

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control,
    name: 'certificates'
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Chứng chỉ chuyên môn
          </CardTitle>
          <CardDescription>
            Thêm các chứng chỉ, giấy chứng nhận của bạn (không bắt buộc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificateFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Chứng chỉ {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertificate(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên chứng chỉ *</Label>
                  <Input
                    {...register(`certificates.${index}.name`)}
                    placeholder="AWS Certified Solutions Architect"
                  />
                  {errors.certificates?.[index]?.name && (
                    <InlineError message={errors.certificates[index].name.message} />
                  )}
                </div>

                <div>
                  <Label>Tổ chức cấp *</Label>
                  <Input
                    {...register(`certificates.${index}.issuer`)}
                    placeholder="Amazon Web Services"
                  />
                  {errors.certificates?.[index]?.issuer && (
                    <InlineError message={errors.certificates[index].issuer.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày cấp *</Label>
                  <Input
                    type="month"
                    {...register(`certificates.${index}.issueDate`)}
                  />
                  {errors.certificates?.[index]?.issueDate && (
                    <InlineError message={errors.certificates[index].issueDate.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày hết hạn</Label>
                  <Input
                    type="month"
                    {...register(`certificates.${index}.expiryDate`)}
                  />
                </div>

                <div>
                  <Label>Mã chứng chỉ</Label>
                  <Input
                    {...register(`certificates.${index}.credentialId`)}
                    placeholder="ABC123456"
                  />
                </div>

                <div>
                  <Label>URL xác minh</Label>
                  <Input
                    {...register(`certificates.${index}.url`)}
                    placeholder="https://..."
                  />
                  {errors.certificates?.[index]?.url && (
                    <InlineError message={errors.certificates[index].url.message} />
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendCertificate({
              name: '',
              issuer: '',
              issueDate: '',
              expiryDate: '',
              credentialId: '',
              url: ''
            })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm chứng chỉ
          </Button>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Dự án đã thực hiện
          </CardTitle>
          <CardDescription>
            Thêm các dự án bạn đã tham gia hoặc thực hiện (không bắt buộc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Dự án {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Tên dự án *</Label>
                  <Input
                    {...register(`projects.${index}.name`)}
                    placeholder="E-commerce Website"
                  />
                  {errors.projects?.[index]?.name && (
                    <InlineError message={errors.projects[index].name.message} />
                  )}
                </div>

                <div>
                  <Label>Ngày bắt đầu</Label>
                  <Input
                    type="month"
                    {...register(`projects.${index}.startDate`)}
                  />
                </div>

                <div>
                  <Label>Ngày kết thúc</Label>
                  <Input
                    type="month"
                    {...register(`projects.${index}.endDate`)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>URL dự án</Label>
                  <Input
                    {...register(`projects.${index}.url`)}
                    placeholder="https://github.com/username/project"
                  />
                  {errors.projects?.[index]?.url && (
                    <InlineError message={errors.projects[index].url.message} />
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>Mô tả dự án</Label>
                  <Textarea
                    {...register(`projects.${index}.description`)}
                    placeholder="Mô tả về dự án, vai trò của bạn, công nghệ sử dụng..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Công nghệ sử dụng</Label>
                  <Input
                    {...register(`projects.${index}.technologies`)}
                    placeholder="React, Node.js, MongoDB (phân cách bằng dấu phẩy)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nhập các công nghệ, phân cách bằng dấu phẩy
                  </p>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => appendProject({
              name: '',
              description: '',
              url: '',
              startDate: '',
              endDate: '',
              technologies: []
            })}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm dự án
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liên kết mạng xã hội</CardTitle>
          <CardDescription>
            Thêm các liên kết để nhà tuyển dụng tìm hiểu thêm về bạn (không bắt buộc)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Label>
              <Input
                {...register('linkedin')}
                placeholder="https://linkedin.com/in/your-profile"
              />
              {errors.linkedin && (
                <InlineError message={errors.linkedin.message} />
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                Github
              </Label>
              <Input
                {...register('github')}
                placeholder="https://github.com/your-username"
              />
              {errors.github && (
                <InlineError message={errors.github.message} />
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website cá nhân
              </Label>
              <Input
                {...register('website')}
                placeholder="https://your-website.com"
              />
              {errors.website && (
                <InlineError message={errors.website.message} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden submit button - Form sẽ được submit từ footer của OnboardingWrapper */}
      <button type="submit" className="hidden" />
    </form>
  );
};