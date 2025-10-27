import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { DollarSign, Briefcase, FileText } from 'lucide-react';
import { salaryPreferencesSchema, workTypeEnum, contractTypeEnum } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

export const SalaryPreferencesStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  const [selectedWorkTypes, setSelectedWorkTypes] = useState(initialData.workTypes || []);
  const [selectedContractTypes, setSelectedContractTypes] = useState(initialData.contractTypes || []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(salaryPreferencesSchema),
    defaultValues: {
      expectedSalary: {
        min: initialData.expectedSalary?.min || 5000000,
        max: initialData.expectedSalary?.max || 20000000,
        currency: 'VND'
      },
      workTypes: initialData.workTypes || [],
      contractTypes: initialData.contractTypes || []
    }
  });

  const minSalary = watch('expectedSalary.min');
  const maxSalary = watch('expectedSalary.max');

  const toggleWorkType = (type) => {
    let updated;
    if (selectedWorkTypes.includes(type)) {
      updated = selectedWorkTypes.filter(t => t !== type);
    } else {
      updated = [...selectedWorkTypes, type];
    }
    setSelectedWorkTypes(updated);
    setValue('workTypes', updated);
  };

  const toggleContractType = (type) => {
    let updated;
    if (selectedContractTypes.includes(type)) {
      updated = selectedContractTypes.filter(t => t !== type);
    } else {
      updated = [...selectedContractTypes, type];
    }
    setSelectedContractTypes(updated);
    setValue('contractTypes', updated);
  };

  const onSubmit = (data) => {
    onNext(data);
  };

  const workTypeDescriptions = {
    'Full-time': 'Làm việc toàn thời gian, 8 giờ/ngày',
    'Part-time': 'Làm việc bán thời gian, linh hoạt giờ giấc',
    'Remote': 'Làm việc từ xa, không cần đến văn phòng',
    'Hybrid': 'Kết hợp làm việc tại văn phòng và từ xa'
  };

  const contractTypeDescriptions = {
    'Chính thức': 'Hợp đồng lao động chính thức, đầy đủ quyền lợi',
    'Thực tập': 'Hợp đồng thực tập sinh',
    'Freelance': 'Làm việc tự do, theo dự án'
  };

  const salaryRanges = [
    { label: 'Dưới 10 triệu', min: 0, max: 10000000 },
    { label: '10-20 triệu', min: 10000000, max: 20000000 },
    { label: '20-30 triệu', min: 20000000, max: 30000000 },
    { label: '30-50 triệu', min: 30000000, max: 50000000 },
    { label: 'Trên 50 triệu', min: 50000000, max: 100000000 }
  ];

  const setSalaryRange = (range) => {
    setValue('expectedSalary.min', range.min);
    setValue('expectedSalary.max', range.max);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Expected Salary */}
      <Card>
        <CardHeader>
          <CardTitle>Mức lương mong muốn</CardTitle>
          <CardDescription>
            Chọn khoảng lương bạn mong muốn nhận được
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Salary Ranges */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Khoảng lương phổ biến</Label>
            <div className="flex flex-wrap gap-2">
              {salaryRanges.map((range) => (
                <Badge
                  key={range.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSalaryRange(range)}
                >
                  {range.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Min Salary */}
          <div className="space-y-2">
            <Label htmlFor="minSalary">
              Mức lương tối thiểu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="minSalary"
                type="number"
                {...register('expectedSalary.min', { valueAsNumber: true })}
                placeholder="5000000"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(minSalary || 0)}
            </p>
            <InlineError message={errors.expectedSalary?.min?.message} />
          </div>

          {/* Max Salary */}
          <div className="space-y-2">
            <Label htmlFor="maxSalary">
              Mức lương tối đa <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="maxSalary"
                type="number"
                {...register('expectedSalary.max', { valueAsNumber: true })}
                placeholder="20000000"
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(maxSalary || 0)}
            </p>
            <InlineError message={errors.expectedSalary?.max?.message} />
          </div>

          {/* Salary Range Display */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-1">
              Khoảng lương của bạn:
            </p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(minSalary || 0)} - {formatCurrency(maxSalary || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Work Types */}
      <Card>
        <CardHeader>
          <CardTitle>Hình thức làm việc</CardTitle>
          <CardDescription>
            Chọn các hình thức làm việc bạn quan tâm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workTypeEnum.map((type) => (
              <div
                key={type}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedWorkTypes.includes(type)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleWorkType(type)}
              >
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className={`text-xs mt-1 ${
                      selectedWorkTypes.includes(type)
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      {workTypeDescriptions[type]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <InlineError message={errors.workTypes?.message} />
        </CardContent>
      </Card>

      {/* Contract Types */}
      <Card>
        <CardHeader>
          <CardTitle>Loại hợp đồng</CardTitle>
          <CardDescription>
            Chọn các loại hợp đồng bạn quan tâm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {contractTypeEnum.map((type) => (
              <div
                key={type}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedContractTypes.includes(type)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleContractType(type)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className={`text-xs mt-1 ${
                      selectedContractTypes.includes(type)
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      {contractTypeDescriptions[type]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <InlineError message={errors.contractTypes?.message} />
        </CardContent>
      </Card>

      {/* Hidden submit button - Form sẽ được submit từ footer của OnboardingWrapper */}
      <button type="submit" className="hidden" />
    </form>
  );
};
