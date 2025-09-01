import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Separator } from '../../../components/ui/separator';
import { 
  X, 
  Edit3, 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock,
  Building,
  Monitor,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getJobAlertOptions } from '../../../services/jobNotificationService';
import { cn } from '../../../lib/utils';

/**
 * Dialog để chỉnh sửa job alert
 */
export const EditNotificationDialog = ({ notification, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: '',
    category: '',
    salaryRange: '',
    type: '',
    workType: '',
    experience: '',
    frequency: 'weekly',
    isActive: true
  });
  
  const [errors, setErrors] = useState({});
  const options = getJobAlertOptions();

  // Load notification data khi component mount
  useEffect(() => {
    if (notification) {
      setFormData({
        name: notification.name || notification.keyword || '',
        keywords: notification.keywords || notification.keyword || '',
        location: notification.location?.province || notification.location || '',
        category: notification.category || '',
        salaryRange: notification.salaryRange || '',
        type: notification.type || '',
        workType: notification.workType || '',
        experience: notification.experience || '',
        frequency: notification.frequency || 'weekly',
        isActive: notification.isActive !== undefined ? notification.isActive : (notification.active !== undefined ? notification.active : true)
      });
    }
  }, [notification]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên thông báo không được để trống';
    }
    
    if (!formData.keywords.trim()) {
      newErrors.keywords = 'Từ khóa không được để trống';
    }
    
    if (!formData.frequency) {
      newErrors.frequency = 'Vui lòng chọn tần suất thông báo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Transform data to match API format
    const submitData = {
      keyword: formData.keywords, // API expects 'keyword', not 'keywords'
      location: formData.location ? { province: formData.location } : undefined,
      frequency: formData.frequency,
      salaryRange: formData.salaryRange || undefined,
      type: formData.type || undefined,
      workType: formData.workType || undefined,
      experience: formData.experience || undefined,
      category: formData.category || undefined,
      active: formData.isActive,
      notificationMethod: 'APPLICATION'
    };

    // Remove undefined fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined || submitData[key] === '') {
        delete submitData[key];
      }
    });
    
    await onSubmit(submitData);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Chỉnh sửa thông báo việc làm
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cập nhật tiêu chí thông báo việc làm của bạn
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tên thông báo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-semibold">
                    Tên thông báo <span className="text-red-500">*</span>
                  </label>
                </div>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="VD: Thông báo React Developer tại Hà Nội"
                  className={cn(
                    "h-11",
                    errors.name && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Từ khóa */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-semibold">
                    Từ khóa công việc <span className="text-red-500">*</span>
                  </label>
                </div>
                <Input
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="VD: React Developer, Frontend, JavaScript..."
                  className={cn(
                    "h-11",
                    errors.keywords && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.keywords && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.keywords}
                  </p>
                )}
              </div>

              {/* Tần suất */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-semibold">
                    Tần suất thông báo <span className="text-red-500">*</span>
                  </label>
                </div>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => handleInputChange('frequency', value)}
                >
                  <SelectTrigger className={cn(
                    "h-11",
                    errors.frequency && "border-red-500"
                  )}>
                    <SelectValue placeholder="Chọn tần suất thông báo" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.frequency}
                  </p>
                )}
              </div>

              <Separator />

              {/* Bộ lọc nâng cao */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  Tiêu chí lọc (tùy chọn)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Địa điểm */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Địa điểm</label>
                    </div>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleInputChange('location', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả địa điểm" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.provinces.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mức lương */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Mức lương</label>
                    </div>
                    <Select
                      value={formData.salaryRange}
                      onValueChange={(value) => handleInputChange('salaryRange', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả mức lương" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.salaryRanges.map((salary) => (
                          <SelectItem key={salary.value} value={salary.value}>
                            {salary.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Kinh nghiệm */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Kinh nghiệm</label>
                    </div>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange('experience', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.experiences.map((exp) => (
                          <SelectItem key={exp.value} value={exp.value}>
                            {exp.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ngành nghề */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Ngành nghề</label>
                    </div>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả ngành nghề" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loại công việc */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Loại công việc</label>
                    </div>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả loại" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hình thức làm việc */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <label className="text-sm font-medium">Hình thức</label>
                    </div>
                    <Select
                      value={formData.workType}
                      onValueChange={(value) => handleInputChange('workType', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Tất cả hình thức" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.workTypes.map((work) => (
                          <SelectItem key={work.value} value={work.value}>
                            {work.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Trạng thái */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Trạng thái thông báo</h3>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={formData.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('isActive', true)}
                    className={cn(
                      "flex items-center gap-2",
                      formData.isActive && "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Bật thông báo
                  </Button>
                  <Button
                    type="button"
                    variant={!formData.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('isActive', false)}
                    className={cn(
                      "flex items-center gap-2",
                      !formData.isActive && "bg-gray-600 hover:bg-gray-700"
                    )}
                  >
                    <X className="h-4 w-4" />
                    Tạm dừng
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang cập nhật...
                    </div>
                  ) : (
                    'Cập nhật thông báo'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditNotificationDialog;