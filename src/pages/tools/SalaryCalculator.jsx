import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Calculator, 
  ArrowRight, 
  ArrowLeft,
  Info,
  DollarSign,
  Users,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Các mức quy định theo pháp luật 2025
const REGULATIONS = {
  // Lương cơ sở từ 01/07/2024 (Nghị định 73/2024/NĐ-CP)
  BASE_SALARY: 2340000,
  
  // Lương tối thiểu vùng từ 01/07/2025 (Nghị định 128/2025/NĐ-CP)
  MIN_WAGE: {
    REGION_1: 5110000,
    REGION_2: 4540000,
    REGION_3: 3970000,
    REGION_4: 3530000
  },
  
  // Giảm trừ gia cảnh (Nghị quyết 954/2020/UBTVQH14)
  PERSONAL_DEDUCTION: 11000000, // 11 triệu/tháng
  DEPENDENT_DEDUCTION: 4400000, // 4.4 triệu/người phụ thuộc/tháng
  
  // Tỷ lệ BHXH, BHYT, BHTN (người lao động đóng)
  SOCIAL_INSURANCE_RATE: 0.08, // 8%
  HEALTH_INSURANCE_RATE: 0.015, // 1.5%
  UNEMPLOYMENT_INSURANCE_RATE: 0.01, // 1%
  
  // Tỷ lệ BHXH, BHYT, BHTN (người sử dụng lao động đóng)
  EMPLOYER_SOCIAL_INSURANCE_RATE: 0.175, // 17.5%
  EMPLOYER_HEALTH_INSURANCE_RATE: 0.03, // 3%
  EMPLOYER_UNEMPLOYMENT_INSURANCE_RATE: 0.01, // 1%
  
  // Mức trần đóng BHXH (20 lần lương cơ sở)
  MAX_SOCIAL_INSURANCE_BASE: 20 * 2340000, // 46,800,000
  
  // Mức trần đóng BHTN (20 lần lương tối thiểu vùng 1)
  MAX_UNEMPLOYMENT_INSURANCE_BASE: 20 * 5110000 // 102,200,000
};

// Biểu thuế TNCN lũy tiến từng phần
const TAX_BRACKETS = [
  { min: 0, max: 5000000, rate: 0.05 },
  { min: 5000000, max: 10000000, rate: 0.10 },
  { min: 10000000, max: 18000000, rate: 0.15 },
  { min: 18000000, max: 32000000, rate: 0.20 },
  { min: 32000000, max: 52000000, rate: 0.25 },
  { min: 52000000, max: 80000000, rate: 0.30 },
  { min: 80000000, max: Infinity, rate: 0.35 }
];

const SalaryCalculator = () => {
  const [calculationType, setCalculationType] = useState('gross-to-net');
  const [salary, setSalary] = useState('');
  const [dependents, setDependents] = useState(0);
  const [region, setRegion] = useState('REGION_1');
  const [insuranceBase, setInsuranceBase] = useState('full'); // full | custom
  const [customInsuranceBase, setCustomInsuranceBase] = useState('');

  // Tính toán các khoản bảo hiểm
  const calculateInsurance = (grossSalary) => {
    const base = insuranceBase === 'custom' && customInsuranceBase 
      ? parseFloat(customInsuranceBase) 
      : grossSalary;
    
    // Áp dụng mức trần
    const socialInsuranceBase = Math.min(base, REGULATIONS.MAX_SOCIAL_INSURANCE_BASE);
    const unemploymentInsuranceBase = Math.min(base, REGULATIONS.MAX_UNEMPLOYMENT_INSURANCE_BASE);
    
    const socialInsurance = socialInsuranceBase * REGULATIONS.SOCIAL_INSURANCE_RATE;
    const healthInsurance = socialInsuranceBase * REGULATIONS.HEALTH_INSURANCE_RATE;
    const unemploymentInsurance = unemploymentInsuranceBase * REGULATIONS.UNEMPLOYMENT_INSURANCE_RATE;
    
    return {
      socialInsurance,
      healthInsurance,
      unemploymentInsurance,
      total: socialInsurance + healthInsurance + unemploymentInsurance,
      base: socialInsuranceBase
    };
  };

  // Tính thuế TNCN
  const calculateTax = (taxableIncome) => {
    if (taxableIncome <= 0) return 0;
    
    let tax = 0;
    let remainingIncome = taxableIncome;
    
    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }
    
    return tax;
  };

  // Tính từ Gross sang Net
  const calculateGrossToNet = (grossSalary) => {
    const insurance = calculateInsurance(grossSalary);
    const incomeAfterInsurance = grossSalary - insurance.total;
    
    const personalDeduction = REGULATIONS.PERSONAL_DEDUCTION;
    const dependentDeduction = dependents * REGULATIONS.DEPENDENT_DEDUCTION;
    const totalDeduction = personalDeduction + dependentDeduction;
    
    const taxableIncome = Math.max(0, incomeAfterInsurance - totalDeduction);
    const tax = calculateTax(taxableIncome);
    
    const netSalary = grossSalary - insurance.total - tax;
    
    return {
      grossSalary,
      insurance,
      personalDeduction,
      dependentDeduction,
      totalDeduction,
      taxableIncome,
      tax,
      netSalary
    };
  };


  // Tính từ Net sang Gross (sử dụng phương pháp lặp)
  const calculateNetToGross = (targetNet) => {
    let grossEstimate = targetNet * 1.3; // Ước lượng ban đầu
    let iterations = 0;
    const maxIterations = 100;
    const tolerance = 1000; // Sai số cho phép 1000đ
    
    while (iterations < maxIterations) {
      const result = calculateGrossToNet(grossEstimate);
      const diff = result.netSalary - targetNet;
      
      if (Math.abs(diff) < tolerance) {
        return result;
      }
      
      // Điều chỉnh gross estimate
      grossEstimate = grossEstimate - diff * 0.8;
      iterations++;
    }
    
    return calculateGrossToNet(grossEstimate);
  };

  // Kết quả tính toán
  const result = useMemo(() => {
    // Xóa tất cả dấu chấm và dấu phẩy để parse số
    const salaryValue = parseFloat(salary.replace(/[.,]/g, ''));
    if (!salaryValue || salaryValue <= 0) return null;
    
    if (calculationType === 'gross-to-net') {
      return calculateGrossToNet(salaryValue);
    } else {
      return calculateNetToGross(salaryValue);
    }
  }, [salary, dependents, region, insuranceBase, customInsuranceBase, calculationType]);

  // Format số tiền
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
  };

  // Xử lý input số tiền - lưu giá trị raw, hiển thị có format
  const handleSalaryChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue === '') {
      setSalary('');
    } else {
      // Format với dấu chấm phân cách hàng nghìn
      setSalary(formatCurrency(parseInt(rawValue, 10)));
    }
  };

  const handleCustomInsuranceChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue === '') {
      setCustomInsuranceBase('');
    } else {
      setCustomInsuranceBase(formatCurrency(parseInt(rawValue, 10)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Calculator className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Công cụ tính lương Gross - Net
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Chuẩn quy định 2025 - Cập nhật mới nhất
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Nghị định 73/2024/NĐ-CP
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Nghị định 128/2025/NĐ-CP
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Nghị quyết 954/2020/UBTVQH14
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Loại tính toán */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Loại tính toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={calculationType} onValueChange={setCalculationType}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="gross-to-net" className="text-xs">
                        Gross → Net
                      </TabsTrigger>
                      <TabsTrigger value="net-to-gross" className="text-xs">
                        Net → Gross
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Nhập lương */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    {calculationType === 'gross-to-net' ? 'Lương Gross' : 'Lương Net mong muốn'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="relative">
                      <Input
                        type="text"
                        value={salary}
                        onChange={handleSalaryChange}
                        placeholder="Nhập số tiền..."
                        className="pr-12 text-lg font-semibold h-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        VNĐ
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculationType === 'gross-to-net' 
                        ? 'Nhập lương Gross (trước thuế và bảo hiểm)'
                        : 'Nhập lương Net bạn muốn nhận được'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Người phụ thuộc */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Người phụ thuộc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số người phụ thuộc</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDependents(Math.max(0, dependents - 1))}
                        disabled={dependents === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-lg">{dependents}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDependents(dependents + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Giảm trừ: {formatCurrency(REGULATIONS.DEPENDENT_DEDUCTION)}/người/tháng
                  </p>
                </CardContent>
              </Card>

              {/* Vùng lương tối thiểu */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    Vùng lương tối thiểu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(REGULATIONS.MIN_WAGE).map(([key, value]) => (
                      <Button
                        key={key}
                        variant={region === key ? "default" : "outline"}
                        className={cn(
                          "h-auto py-2 px-3 flex flex-col items-start",
                          region === key && "bg-emerald-600 hover:bg-emerald-700"
                        )}
                        onClick={() => setRegion(key)}
                      >
                        <span className="text-xs font-normal opacity-80">
                          {key.replace('REGION_', 'Vùng ')}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(value)}đ
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Result Section */}
            <div className="lg:col-span-2 space-y-6">
              {result ? (
                <>
                  {/* Kết quả chính */}
                  <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center md:text-left">
                          <p className="text-emerald-100 text-sm mb-1">Lương Gross</p>
                          <p className="text-3xl font-bold">
                            {formatCurrency(result.grossSalary)} <span className="text-lg">VNĐ</span>
                          </p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-emerald-100 text-sm mb-1">Lương Net (Thực nhận)</p>
                          <p className="text-3xl font-bold">
                            {formatCurrency(result.netSalary)} <span className="text-lg">VNĐ</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        <span className="text-sm">
                          Tỷ lệ thực nhận: <strong>{((result.netSalary / result.grossSalary) * 100).toFixed(1)}%</strong>
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chi tiết các khoản */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bảo hiểm */}
                    <Card className="shadow-lg border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                          <FileText className="h-5 w-5" />
                          Các khoản bảo hiểm
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">BHXH (8%)</span>
                          <span className="font-semibold text-red-600">
                            -{formatCurrency(result.insurance.socialInsurance)}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">BHYT (1.5%)</span>
                          <span className="font-semibold text-red-600">
                            -{formatCurrency(result.insurance.healthInsurance)}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">BHTN (1%)</span>
                          <span className="font-semibold text-red-600">
                            -{formatCurrency(result.insurance.unemploymentInsurance)}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 bg-red-50 px-3 rounded-lg">
                          <span className="font-semibold text-gray-800">Tổng bảo hiểm (10.5%)</span>
                          <span className="font-bold text-red-600">
                            -{formatCurrency(result.insurance.total)}đ
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Giảm trừ */}
                    <Card className="shadow-lg border-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                          <Users className="h-5 w-5" />
                          Giảm trừ gia cảnh
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">Bản thân</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.personalDeduction)}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-gray-600">
                            Người phụ thuộc ({dependents} người)
                          </span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(result.dependentDeduction)}đ
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 bg-green-50 px-3 rounded-lg">
                          <span className="font-semibold text-gray-800">Tổng giảm trừ</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(result.totalDeduction)}đ
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Thuế TNCN */}
                  <Card className="shadow-lg border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                        <Calculator className="h-5 w-5" />
                        Thuế thu nhập cá nhân
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Thu nhập sau BH</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(result.grossSalary - result.insurance.total)}đ
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Thu nhập chịu thuế</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(result.taxableIncome)}đ
                          </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-orange-600 mb-1">Thuế TNCN phải nộp</p>
                          <p className="text-xl font-bold text-orange-600">
                            -{formatCurrency(result.tax)}đ
                          </p>
                        </div>
                      </div>

                      {/* Biểu thuế lũy tiến */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-3">Biểu thuế lũy tiến từng phần:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          {TAX_BRACKETS.map((bracket, index) => (
                            <div 
                              key={index}
                              className={cn(
                                "text-center p-2 rounded-lg text-xs",
                                result.taxableIncome > bracket.min 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              <p className="font-semibold">{bracket.rate * 100}%</p>
                              <p className="text-[10px]">
                                {bracket.max === Infinity 
                                  ? `>${formatCurrency(bracket.min / 1000000)}tr`
                                  : `${formatCurrency(bracket.min / 1000000)}-${formatCurrency(bracket.max / 1000000)}tr`
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tổng kết */}
                  <Card className="shadow-lg border-0 bg-gray-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Tổng kết các khoản khấu trừ</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Lương Gross</span>
                          <span className="font-semibold">{formatCurrency(result.grossSalary)}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600">
                          <span>(-) Bảo hiểm bắt buộc</span>
                          <span className="font-semibold">-{formatCurrency(result.insurance.total)}đ</span>
                        </div>
                        <div className="flex justify-between items-center text-red-600">
                          <span>(-) Thuế TNCN</span>
                          <span className="font-semibold">-{formatCurrency(result.tax)}đ</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-500">
                          <span className="font-bold text-lg text-gray-800">(=) Lương Net thực nhận</span>
                          <span className="font-bold text-xl text-emerald-600">
                            {formatCurrency(result.netSalary)}đ
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-lg border-0 h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nhập số tiền để tính toán
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Nhập lương {calculationType === 'gross-to-net' ? 'Gross' : 'Net'} để xem chi tiết 
                      các khoản bảo hiểm, thuế và lương thực nhận
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>


          {/* Thông tin quy định */}
          <Card className="mt-8 shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Thông tin quy định áp dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">Lương cơ sở</Badge>
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>{formatCurrency(REGULATIONS.BASE_SALARY)}đ/tháng</strong>
                    <br />
                    <span className="text-xs">Theo Nghị định 73/2024/NĐ-CP, có hiệu lực từ 01/07/2024</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">Giảm trừ gia cảnh</Badge>
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>Bản thân: {formatCurrency(REGULATIONS.PERSONAL_DEDUCTION)}đ/tháng</strong>
                    <br />
                    <strong>Người phụ thuộc: {formatCurrency(REGULATIONS.DEPENDENT_DEDUCTION)}đ/người/tháng</strong>
                    <br />
                    <span className="text-xs">Theo Nghị quyết 954/2020/UBTVQH14</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Badge className="bg-purple-100 text-purple-700">Mức trần đóng BH</Badge>
                  </h4>
                  <p className="text-sm text-gray-600">
                    <strong>BHXH: {formatCurrency(REGULATIONS.MAX_SOCIAL_INSURANCE_BASE)}đ</strong> (20 lần lương cơ sở)
                    <br />
                    <strong>BHTN: {formatCurrency(REGULATIONS.MAX_UNEMPLOYMENT_INSURANCE_BASE)}đ</strong> (20 lần lương tối thiểu vùng 1)
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Kết quả chỉ mang tính chất tham khảo, có thể khác với thực tế tùy theo chính sách công ty</li>
                      <li>Một số khoản phụ cấp, trợ cấp có thể không tính vào thu nhập chịu thuế</li>
                      <li>Mức đóng BHXH có thể khác nếu công ty áp dụng mức lương đóng BH riêng</li>
                      <li>Lương tối thiểu vùng mới nhất áp dụng từ 01/07/2025 theo Nghị định 128/2025/NĐ-CP</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;
