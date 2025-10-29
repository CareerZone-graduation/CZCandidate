import { z } from 'zod';

// Experience level enum
export const experienceLevelEnum = [
  'Fresher',
  'Junior',
  'Mid-level',
  'Senior'
];

// Work type enum
export const workTypeEnum = [
  'Full-time',
  'Part-time',
  'Remote',
  'Hybrid'
];

// Contract type enum
export const contractTypeEnum = [
  'Chính thức',
  'Thực tập',
  'Freelance'
];

// Custom error messages for better UX
const errorMessages = {
  required: 'Trường này là bắt buộc',
  invalidFormat: 'Định dạng không hợp lệ',
  tooShort: (min) => `Phải có ít nhất ${min} ký tự`,
  tooLong: (max) => `Không được vượt quá ${max} ký tự`,
  invalidPhone: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (VD: 0912345678)',
  invalidName: 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dấu tiếng Việt',
  minItems: (min) => `Vui lòng chọn ít nhất ${min} mục`,
  maxItems: (max) => `Chỉ được chọn tối đa ${max} mục`,
  invalidNumber: 'Vui lòng nhập số hợp lệ',
  minValue: (min) => `Giá trị phải lớn hơn hoặc bằng ${min}`,
  maxValue: (max) => `Giá trị không được vượt quá ${max}`
};

// Basic Info Step Schema with enhanced validation
export const basicInfoSchema = z.object({
  fullName: z.string({
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .trim()
    .min(2, { message: errorMessages.tooShort(2) })
    .max(100, { message: errorMessages.tooLong(100) })
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, { message: errorMessages.invalidName })
    .refine((val) => val.split(' ').filter(Boolean).length >= 2, {
      message: 'Vui lòng nhập họ và tên đầy đủ (ít nhất 2 từ)'
    }),
  phone: z.string({
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, { message: errorMessages.invalidPhone })
    .refine((val) => {
      // Additional validation for Vietnamese phone numbers
      const cleaned = val.replace(/\+84/, '0');
      return cleaned.length === 10 || cleaned.length === 11;
    }, {
      message: 'Số điện thoại phải có 10-11 chữ số'
    }),
  avatar: z.any().optional(),
  preferredLocations: z.array(z.object({
    province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    district: z.string().nullable().optional() // null = tất cả quận/huyện
  }), {
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .min(1, { message: errorMessages.minItems(1) })
    .max(5, { message: errorMessages.maxItems(5) })
});

// Skills Step Schema (Bước 2)
export const skillsSchema = z.object({
  preferredCategories: z.array(z.string(), {
    required_error: 'Vui lòng chọn ít nhất 1 ngành nghề',
    invalid_type_error: errorMessages.invalidFormat
  })
    .min(1, { message: 'Vui lòng chọn ít nhất 1 ngành nghề' })
    .max(5, { message: errorMessages.maxItems(5) + ' ngành nghề' }),
  skills: z.array(z.string().trim().min(1, 'Kỹ năng không được để trống'), {
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .min(3, { message: errorMessages.minItems(3) + ' kỹ năng' })
    .max(20, { message: errorMessages.maxItems(20) + ' kỹ năng' })
    .refine((skills) => {
      // Check for duplicate skills (case-insensitive)
      const uniqueSkills = new Set(skills.map(s => s.toLowerCase()));
      return uniqueSkills.size === skills.length;
    }, {
      message: 'Không được chọn kỹ năng trùng lặp'
    }),
  customSkills: z.array(z.string()).optional()
});

// Salary & Preferences Step Schema (Bước 3)
export const salaryPreferencesSchema = z.object({
  expectedSalary: z.object({
    min: z.coerce.number({
      required_error: errorMessages.required,
      invalid_type_error: errorMessages.invalidNumber
    })
      .min(1000000, { message: 'Mức lương tối thiểu phải từ 1 triệu VNĐ trở lên' })
      .max(1000000000, { message: errorMessages.maxValue('1 tỷ VNĐ') })
      .int('Mức lương phải là số nguyên'),
    max: z.coerce.number({
      required_error: errorMessages.required,
      invalid_type_error: errorMessages.invalidNumber
    })
      .min(1000000, { message: 'Mức lương tối đa phải từ 1 triệu VNĐ trở lên' })
      .max(1000000000, { message: errorMessages.maxValue('1 tỷ VNĐ') })
      .int('Mức lương phải là số nguyên'),
    currency: z.string().default('VND')
  }).refine(data => data.max >= data.min, {
    message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
    path: ['max']
  }).refine(data => {
    // Check if salary range is reasonable (max should not be more than 10x min)
    return data.max <= data.min * 10;
  }, {
    message: 'Khoảng lương quá rộng. Mức tối đa không nên vượt quá 10 lần mức tối thiểu',
    path: ['max']
  }),
  workTypes: z.array(z.enum(workTypeEnum), {
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .min(1, { message: errorMessages.minItems(1) + ' hình thức làm việc' })
    .max(4, { message: 'Không nên chọn quá nhiều hình thức làm việc' }),
  contractTypes: z.array(z.enum(contractTypeEnum), {
    required_error: errorMessages.required,
    invalid_type_error: errorMessages.invalidFormat
  })
    .min(1, { message: errorMessages.minItems(1) + ' loại hợp đồng' })
    .max(3, { message: 'Không nên chọn quá nhiều loại hợp đồng' })
});

// Experience & Education Step Schema (Bước 4 - Optional)
export const experienceEducationSchema = z.object({
  experienceLevel: z.enum(experienceLevelEnum, {
    required_error: 'Vui lòng chọn mức độ kinh nghiệm',
    invalid_type_error: 'Mức độ kinh nghiệm không hợp lệ'
  }).optional(),
  experiences: z.array(z.object({
    company: z.string().min(1, 'Tên công ty là bắt buộc'),
    position: z.string().min(1, 'Vị trí là bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().optional(),
    description: z.string().optional(),
    isCurrentJob: z.boolean().optional()
  })).optional(),
  educations: z.array(z.object({
    school: z.string().min(1, 'Tên trường là bắt buộc'),
    major: z.string().min(1, 'Chuyên ngành là bắt buộc'),
    degree: z.string().min(1, 'Bằng cấp là bắt buộc'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().optional(),
    gpa: z.string().optional()
  })).optional()
});

// Certificates & Projects Step Schema (Bước 5 - Optional)
export const certificatesProjectsSchema = z.object({
  certificates: z.array(z.object({
    name: z.string().min(1, 'Tên chứng chỉ là bắt buộc'),
    issuer: z.string().min(1, 'Tổ chức cấp là bắt buộc'),
    issueDate: z.string().min(1, 'Ngày cấp là bắt buộc'),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    url: z.string().url('URL không hợp lệ').optional().or(z.literal(''))
  })).optional(),
  projects: z.array(z.object({
    name: z.string().min(1, 'Tên dự án là bắt buộc'),
    description: z.string().optional(),
    url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    technologies: z.array(z.string()).optional()
  })).optional(),
  linkedin: z.string().url('URL LinkedIn không hợp lệ').optional().or(z.literal('')),
  github: z.string().url('URL Github không hợp lệ').optional().or(z.literal('')),
  website: z.string().url('URL Website không hợp lệ').optional().or(z.literal(''))
});

// Validation helper functions
export const validateBasicInfo = (data) => {
  try {
    return {
      success: true,
      data: basicInfoSchema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateSkills = (data) => {
  try {
    return {
      success: true,
      data: skillsSchema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateExperienceEducation = (data) => {
  try {
    return {
      success: true,
      data: experienceEducationSchema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateCertificatesProjects = (data) => {
  try {
    return {
      success: true,
      data: certificatesProjectsSchema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateSalaryPreferences = (data) => {
  try {
    return {
      success: true,
      data: salaryPreferencesSchema.parse(data),
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};
