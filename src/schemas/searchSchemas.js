import { z } from 'zod';

// Job category enum values
export const jobCategoryEnum = [
  'IT',
  'SOFTWARE_DEVELOPMENT',
  'DATA_SCIENCE',
  'MACHINE_LEARNING',
  'WEB_DEVELOPMENT',
  'SALES',
  'MARKETING',
  'ACCOUNTING',
  'GRAPHIC_DESIGN',
  'CONTENT_WRITING',
  'MEDICAL',
  'TEACHING',
  'ENGINEERING',
  'PRODUCTION',
  'LOGISTICS',
  'HOSPITALITY',
  'REAL_ESTATE',
  'LAW',
  'FINANCE',
  'HUMAN_RESOURCES',
  'CUSTOMER_SERVICE',
  'ADMINISTRATION',
  'MANAGEMENT',
  'OTHER'
];

// Job type enum values
export const jobTypeEnum = [
  'FULL_TIME',
  'PART_TIME', 
  'CONTRACT',
  'TEMPORARY',
  'INTERNSHIP',
  'FREELANCE'
];

// Work type enum values
export const workTypeEnum = [
  'ON_SITE',
  'REMOTE',
  'HYBRID'
];

// Experience level enum values
export const experienceEnum = [
  'ENTRY_LEVEL',
  'MID_LEVEL',
  'SENIOR_LEVEL',
  'EXECUTIVE',
  'NO_EXPERIENCE',
  'INTERN',
  'FRESHER'
];


// User location schema (flexible)
export const userLocationFlexible = z.array(z.number()).length(2).optional();

// Schema for hybrid search request
export const hybridSearchJobSchema = z.object({
  query: z.string().max(200, 'Query không được vượt quá 200 ký tự').default(''),
  page: z.coerce.number().int().min(1, 'Trang phải lớn hơn 0').default(1),
  size: z.coerce.number().int().min(1, 'Kích thước trang phải lớn hơn 0').max(50, 'Kích thước trang không được vượt quá 50').default(10),
  // Filters cho tìm kiếm
  category: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(jobCategoryEnum).optional()),
  type: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(jobTypeEnum).optional()),
  workType: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(workTypeEnum).optional()),
  experience: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(experienceEnum).optional()),
  province: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.string().optional()),
  district: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.string().optional()),
  // Salary range filters
  minSalary: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.coerce.number().min(0, 'Mức lương tối thiểu không thể âm').optional()),
  maxSalary: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.coerce.number().min(0, 'Mức lương tối đa không thể âm').optional()),

  // Weight parameters for RRF
  textWeight: z.coerce.number().min(0).max(1).default(0.4),
  vectorWeight: z.coerce.number().min(0).max(1).default(0.6),
  userLocation: z.string().optional(),
})
  .refine(data => !data.minSalary || !data.maxSalary || data.maxSalary >= data.minSalary, {
    message: 'Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu',
    path: ['maxSalary'],
  })
  .refine(data => Math.abs((data.textWeight + data.vectorWeight) - 1) < 0.001, {
    message: 'Tổng trọng số text và vector phải bằng 1',
    path: ['vectorWeight'],
  })
  .refine(data => {
    // Nếu có district nhưng không có province, thì không hợp lệ
    if (data.district && !data.province) {
      return false;
    }
    return true;
  }, {
    message: 'Quận/Huyện phải có Tỉnh/Thành phố đi kèm',
    path: ['district'],
  });

// Schema for autocomplete request
export const autocompleteJobSchema = z.object({
  query: z.string({
    required_error: 'Query là bắt buộc cho autocomplete'
  }).trim().min(1, 'Query không được để trống').max(100, 'Query không được vượt quá 100 ký tự'),
  limit: z.coerce.number().int().min(1, 'Limit phải lớn hơn 0').max(20, 'Limit không được vượt quá 20').default(10),
});

// Schema for search URL parameters (more flexible for frontend)
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  size: z.coerce.number().int().min(1).max(50).default(10).optional(),
  category: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(jobCategoryEnum).optional()),
  type: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(jobTypeEnum).optional()),
  workType: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(workTypeEnum).optional()),
  experience: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.enum(experienceEnum).optional()),
  province: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.string().optional()),
  district: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.string().optional()),
  minSalary: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.coerce.number().min(0).optional()),
  maxSalary: z.preprocess((val) => val === '' || val === null || val === undefined ? undefined : val, z.coerce.number().min(0).optional()),
  userLocation: z.string().optional(),
});

// Validation helper functions
export const validateSearchParams = (params) => {
  try {
    return {
      success: true,
      data: searchParamsSchema.parse(params),
      errors: null
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateHybridSearchRequest = (params) => {
  try {
    console.log('Input params to validate:', params);
    const result = hybridSearchJobSchema.parse(params);
    console.log('Validated result:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: error.errors
    };
  }
};

export const validateAutocompleteRequest = (params) => {
  try {
    return {
      success: true,
      data: autocompleteJobSchema.parse(params),
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
