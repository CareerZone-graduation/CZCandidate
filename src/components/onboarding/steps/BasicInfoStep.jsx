import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Phone, MapPin, Upload, X, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { basicInfoSchema } from '@/schemas/onboardingSchemas';
import { InlineError } from '../ErrorState';
import locationData from '@/data/oldtree.json';
import { isOnline } from '@/utils/errorHandling';

// Process location data từ oldtree.json - CHỈ 1 LẦN khi module load
const processLocationData = () => {
  const provinceNames = [];
  const districtMap = new Map();

  locationData.forEach(province => {
    if (!province?.name) return;
    provinceNames.push(province.name);
    const districts = (province.districts || []).map(d => ({ name: d.name }));
    districtMap.set(province.name, { districts });
  });

  return { provinceNames, districtMap };
};

const { provinceNames, districtMap: locationMap } = processLocationData();

// Memoize component để tránh re-render không cần thiết
export const BasicInfoStep = memo(({ initialData = {}, onNext, isLoading, error: externalError, onLoadingChange }) => {
  const [avatarPreview, setAvatarPreview] = useState(initialData.avatar || null);
  const [selectedLocations, setSelectedLocations] = useState(initialData.preferredLocations || []);
  const [online, setOnline] = useState(isOnline());
  const [avatarError, setAvatarError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValidating, touchedFields },
    setValue,
    watch,
    trigger
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      fullName: initialData.fullName || '',
      phone: initialData.phone || '',
      avatar: initialData.avatar || null,
      preferredLocations: initialData.preferredLocations || []
    }
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarError(null);

    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setAvatarError('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setAvatarError('Chỉ chấp nhận file ảnh JPG, PNG hoặc GIF');
        return;
      }

      // Lưu file để upload sau
      setAvatarFile(file);
      
      // Preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.onerror = () => {
        setAvatarError('Không thể đọc file ảnh');
      };
      reader.readAsDataURL(file);
    }
  };

  // Memoize handlers để tránh tái tạo
  const addLocation = useCallback((province) => {
    if (selectedLocations.length >= 5) return;
    
    // Chỉ lưu province và district (null = tất cả quận/huyện)
    const newLocation = { province, district: null };
    const updated = [...selectedLocations, newLocation];
    setSelectedLocations(updated);
    setValue('preferredLocations', updated, { shouldValidate: true });
    // Trigger validation after adding location
    trigger('preferredLocations');
  }, [selectedLocations, setValue, trigger]);

  const removeLocation = useCallback((index) => {
    const updated = selectedLocations.filter((_, i) => i !== index);
    setSelectedLocations(updated);
    setValue('preferredLocations', updated, { shouldValidate: true });
    // Trigger validation after removing location
    trigger('preferredLocations');
  }, [selectedLocations, setValue, trigger]);

  const updateLocationDistrict = useCallback((index, district) => {
    const updated = [...selectedLocations];
    updated[index].district = district;
    setSelectedLocations(updated);
    setValue('preferredLocations', updated);
  }, [selectedLocations, setValue]);

  const onSubmit = useCallback(async (data) => {
    // Final validation before submit
    if (!online) {
      return;
    }

    // Prevent double submission
    if (uploadingAvatar || isLoading) {
      return;
    }

    try {
      // Normalize phone number to match backend format (remove spaces, keep only digits and optional +)
      if (data.phone) {
        // Remove all spaces, dashes, parentheses
        let normalizedPhone = data.phone.replace(/[\s\-\(\)]/g, '');
        // If starts with +84, keep it; if starts with 0, keep it as is
        data.phone = normalizedPhone;
      }

      // Upload avatar nếu có
      if (avatarFile) {
        console.log('🔄 Starting avatar upload...');
        setUploadingAvatar(true);
        onLoadingChange?.(true); // Notify parent about loading state
        try {
          const { uploadAvatar } = await import('@/services/onboardingService');
          console.log('📤 Uploading avatar to server...');
          const uploadResult = await uploadAvatar(avatarFile);
          console.log('✅ Avatar uploaded successfully:', uploadResult.data.avatarUrl);
          // Avatar URL đã được lưu vào backend, không cần gửi trong data
          data.avatar = uploadResult.data.avatarUrl;
        } catch (uploadError) {
          console.error('❌ Avatar upload error:', uploadError);
          setAvatarError('Không thể tải ảnh lên. Vui lòng thử lại.');
          setUploadingAvatar(false);
          onLoadingChange?.(false);
          return; // Stop submission if avatar upload fails
        } finally {
          console.log('🏁 Avatar upload finished');
          setUploadingAvatar(false);
          onLoadingChange?.(false);
        }
      }

      // Xóa avatar khỏi data nếu không có file mới
      if (!avatarFile && !data.avatar) {
        delete data.avatar;
      }

      // Call onNext which will trigger the parent's loading state
      await onNext(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [online, uploadingAvatar, isLoading, avatarFile, onLoadingChange, onNext]);

  // Memoize filtered provinces để tránh filter mỗi lần render
  const availableProvinces = useMemo(() => {
    return provinceNames.filter(p => !selectedLocations.some(loc => loc.province === p));
  }, [selectedLocations]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Offline Warning */}
      {!online && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.
          </AlertDescription>
        </Alert>
      )}

      {/* External Error Display */}
      {externalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{externalError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cơ bản</CardTitle>
          <CardDescription>
            Cung cấp thông tin cơ bản để nhà tuyển dụng có thể liên hệ với bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback>
                  <User className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Upload className="w-4 h-4" />
                  {uploadingAvatar ? 'Đang tải ảnh lên...' : 'Tải ảnh đại diện (không bắt buộc)'}
                </div>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar || isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG hoặc GIF. Tối đa 5MB
              </p>
              {avatarError && <InlineError message={avatarError} />}
              {uploadingAvatar && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Đang tải ảnh lên...
                </p>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                {...register('fullName')}
                placeholder="Nguyễn Văn A"
                className="pl-10"
              />
            </div>
            <InlineError message={errors.fullName?.message} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0912345678"
                className="pl-10"
              />
            </div>
            <InlineError message={errors.phone?.message} />
          </div>

          {/* Preferred Locations */}
          <div className="space-y-2">
            <Label>
              Địa điểm làm việc mong muốn <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Chọn tối đa 5 địa điểm
            </p>

            {/* Selected Locations */}
            <div className="space-y-2">
              {selectedLocations.map((location, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">{location.province}</p>
                    </div>
                    <div>
                      <Select
                        value={location.district || 'all'}
                        onValueChange={(value) => updateLocationDistrict(index, value === 'all' ? null : value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <span className="font-medium">Tất cả quận/huyện</span>
                          </SelectItem>
                          {locationMap.get(location.province)?.districts.map((district) => (
                            <SelectItem key={district.name} value={district.name}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!location.district && (
                        <p className="text-xs text-muted-foreground mt-1">Tất cả quận/huyện</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Location */}
            {selectedLocations.length < 5 && (
              <Select onValueChange={addLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Thêm địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  {availableProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <InlineError message={errors.preferredLocations?.message} />
          </div>
        </CardContent>
      </Card>

      {/* Status messages */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {!online && (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Không có kết nối mạng</span>
          </>
        )}
        {online && isValidating && (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Đang kiểm tra...</span>
          </>
        )}
      </div>

      {/* Hidden submit button - Form sẽ được submit từ footer của OnboardingWrapper */}
      <button type="submit" className="hidden" />
    </form>
  );
});
