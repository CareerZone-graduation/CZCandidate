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
import { useEffect } from 'react';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
};

// Mappings between Frontend Display Values and Backend Enum Values
const WORK_TYPE_MAPPING = {
  // FE (Location) -> BE (WorkType)
  'Tại văn phòng': 'ON_SITE',
  'Từ xa': 'REMOTE',
  'Kết hợp': 'HYBRID'
};

const CONTRACT_TYPE_MAPPING = {
  // FE (Employment) -> BE (Type)
  'Toàn thời gian': 'FULL_TIME',
  'Bán thời gian': 'PART_TIME',
  'Thực tập': 'INTERNSHIP',
  'Freelance': 'FREELANCE',
  'Hợp đồng': 'CONTRACT',
  'Thời vụ': 'TEMPORARY'
};

// Reverse Mappings for loading data from Backend to Frontend
// Note: We need to handle potential legacy values if any, but mainly map standard BE enums
const BE_TO_FE_WORK_TYPE = {
  'ON_SITE': 'Tại văn phòng',
  'REMOTE': 'Từ xa',
  'HYBRID': 'Kết hợp'
};

const BE_TO_FE_CONTRACT_TYPE = {
  'FULL_TIME': 'Toàn thời gian',
  'PART_TIME': 'Bán thời gian',
  'INTERNSHIP': 'Thực tập',
  'FREELANCE': 'Freelance',
  'CONTRACT': 'Hợp đồng',
  'TEMPORARY': 'Thời vụ',
  'VOLUNTEER': 'Thời vụ' // Mapping VOLUNTEER to Temporary as closest match if needed
};

export const SalaryPreferencesStep = ({ initialData = {}, onNext, isLoading, onLoadingChange }) => {
  // Handle initial data which might be nested or flat depending on where it comes from
  // Handle initial data which might be nested or flat depending on where it comes from
  const getInitialWorkTypes = () => {
    let types = [];
    if (initialData.workPreferences?.workTypes) {
      // Data from Backend or persisted clean payload
      types = initialData.workPreferences.workTypes.map(item => {
        const type = typeof item === 'object' ? item.type : item;
        return BE_TO_FE_WORK_TYPE[type];
      }).filter(Boolean);
    } else if (initialData.workTypes) {
      // Data from LocalStorage/Old State (Flat strings)
      types = initialData.workTypes.map(t => {
        if (workTypeEnum.includes(t)) return t;
        // Legacy support
        if (t === 'Full-time') return 'Tại văn phòng';
        if (t === 'Remote') return 'Từ xa';
        if (t === 'Hybrid') return 'Kết hợp';
        return null; // or keep t if it makes sense?
      }).filter(Boolean);
    }
    return [...new Set(types)];
  };

  const getInitialContractTypes = () => {
    let types = [];
    if (initialData.workPreferences?.contractTypes) {
      // Data from Backend or persisted clean payload
      types = initialData.workPreferences.contractTypes.map(item => {
        const type = typeof item === 'object' ? item.type : item;
        return BE_TO_FE_CONTRACT_TYPE[type];
      }).filter(Boolean);
    } else if (initialData.contractTypes) {
      // Data from LocalStorage/Old State
      types = initialData.contractTypes.map(t => {
        if (contractTypeEnum.includes(t)) return t;
        // Legacy support
        if (t === 'Chính thức') return 'Toàn thời gian';
        if (t === 'Thực tập') return 'Thực tập';
        if (t === 'Freelance') return 'Freelance';
        return null;
      }).filter(Boolean);
    }
    return [...new Set(types)];
  };

  const [selectedWorkTypes, setSelectedWorkTypes] = useState(getInitialWorkTypes());
  const [selectedContractTypes, setSelectedContractTypes] = useState(getInitialContractTypes());

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
        min: initialData.expectedSalary?.min ?? 5000000,
        max: initialData.expectedSalary?.max ?? 20000000,
        currency: 'VND'
      },
      workTypes: getInitialWorkTypes(),
      contractTypes: getInitialContractTypes()
    }
  });

  // Update state when initialData changes (async load)
  useEffect(() => {
    const workTypes = getInitialWorkTypes();
    const contractTypes = getInitialContractTypes();

    setSelectedWorkTypes(workTypes);
    setSelectedContractTypes(contractTypes);

    // Update form values
    setValue('workTypes', workTypes);
    setValue('contractTypes', contractTypes);

    if (initialData.expectedSalary) {
      setValue('expectedSalary.min', initialData.expectedSalary.min ?? 5000000);
      setValue('expectedSalary.max', initialData.expectedSalary.max ?? 20000000);
    }
    // eslint-disable-next-line
  }, [initialData, setValue]);

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
    setValue('workTypes', updated, { shouldValidate: true });
  };

  const toggleContractType = (type) => {
    let updated;
    if (selectedContractTypes.includes(type)) {
      updated = selectedContractTypes.filter(t => t !== type);
    } else {
      updated = [...selectedContractTypes, type];
    }
    setSelectedContractTypes(updated);
    setValue('contractTypes', updated, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    // Construct clean payload first by removing form-specific fields
    const { workTypes, contractTypes, ...restData } = data;

    // Transform Work Types for Backend
    const backendWorkTypes = data.workTypes
      .map(t => WORK_TYPE_MAPPING[t])
      .filter(Boolean);

    // Send as simple array of strings
    const uniqueWorkTypes = [...new Set(backendWorkTypes)];

    // Transform Contract Types for Backend
    const backendContractTypes = data.contractTypes
      .map(t => CONTRACT_TYPE_MAPPING[t])
      .filter(Boolean);

    // Send as simple array of strings
    const uniqueContractTypes = [...new Set(backendContractTypes)];

    const payload = {
      ...restData,
      workPreferences: {
        workTypes: uniqueWorkTypes,
        contractTypes: uniqueContractTypes,
        // Preserve experienceLevel if exists
        experienceLevel: initialData.workPreferences?.experienceLevel
      }
    };

    onNext(payload);
  };

  const workTypeDescriptions = {
    'Tại văn phòng': 'Làm việc trực tiếp tại văn phòng công ty',
    'Từ xa': 'Làm việc online từ bất cứ đâu',
    'Kết hợp': 'Linh hoạt giữa làm việc tại văn phòng và từ xa'
  };

  const contractTypeDescriptions = {
    'Toàn thời gian': 'Làm việc 8 giờ/ngày, 5-6 ngày/tuần',
    'Bán thời gian': 'Làm việc theo ca hoặc số giờ linh hoạt',
    'Thực tập': 'Dành cho sinh viên hoặc người mới ra trường',
    'Freelance': 'Làm việc tự do theo dự án',
    'Hợp đồng': 'Làm việc theo hợp đồng có thời hạn',
    'Thời vụ': 'Làm việc ngắn hạn, thời vụ'
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

      {/* Work Types (Location) */}
      <Card>
        <CardHeader>
          <CardTitle>Hình thức làm việc (Địa điểm)</CardTitle>
          <CardDescription>
            Bạn muốn làm việc ở đâu?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {workTypeEnum.map((type) => (
              <div
                key={type}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedWorkTypes.includes(type)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
                  }`}
                onClick={() => toggleWorkType(type)}
              >
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className={`text-xs mt-1 ${selectedWorkTypes.includes(type)
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

      {/* Contract Types (Employment) */}
      <Card>
        <CardHeader>
          <CardTitle>Loại hình công việc</CardTitle>
          <CardDescription>
            Bạn tìm kiếm loại hợp đồng nào?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contractTypeEnum.map((type) => (
              <div
                key={type}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedContractTypes.includes(type)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
                  }`}
                onClick={() => toggleContractType(type)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className={`text-xs mt-1 ${selectedContractTypes.includes(type)
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
