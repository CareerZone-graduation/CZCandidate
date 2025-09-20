import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { getJobAlertOptions } from '@/services/jobNotificationService';
import LocationPicker from '@/components/common/LocationPicker';

const formSchema = z.object({
  name: z.string().min(1, 'Tên đăng ký là bắt buộc').max(100),
  keyword: z.string().min(1, 'Từ khóa là bắt buộc').max(100),
  location: z.object({
    province: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
    district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  }),
  frequency: z.enum(['daily', 'weekly']),
  salaryRange: z.string().optional(),
  type: z.string().optional(),
  workType: z.string().optional(),
  experience: z.string().optional(),
  category: z.string().optional(),
});

export const CreateJobAlertDialog = ({ open, onClose, onSubmit, isLoading = false }) => {
  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      keyword: '',
      location: { province: 'Tất cả tỉnh thành', district: 'Tất cả quận/huyện' },
      frequency: 'weekly',
      salaryRange: 'ALL',
      type: 'ALL',
      workType: 'ALL',
      experience: 'ALL',
      category: 'ALL',
    },
  });
  
  const options = getJobAlertOptions();

  const handleFormSubmit = methods.handleSubmit(async (data) => {
    const apiData = { ...data };
    if (data.location.province === 'Tất cả tỉnh thành') apiData.location.province = 'ALL';
    if (data.location.district === 'Tất cả quận/huyện') apiData.location.district = 'ALL';
    
    apiData.notificationMethod = 'APPLICATION';
    apiData.active = true; // Mặc định là active khi tạo mới

    await onSubmit(apiData);
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Đăng ký nhận thông báo việc làm</DialogTitle>
          <DialogDescription>Tạo một đăng ký mới để nhận việc làm phù hợp.</DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Tên đăng ký *</Label>
              <Input id="name" {...methods.register('name')} placeholder="VD: Senior Dev (Remote)" />
              {methods.formState.errors.name && <p className="text-sm text-red-500 mt-1">{methods.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="keyword">Từ khóa tìm kiếm *</Label>
              <Input id="keyword" {...methods.register('keyword')} placeholder="VD: Backend, Java, Spring Boot" />
              {methods.formState.errors.keyword && <p className="text-sm text-red-500 mt-1">{methods.formState.errors.keyword.message}</p>}
            </div>
            
            <div>
              <Label>Địa điểm</Label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <LocationPicker control={methods.control} provinceFieldName="location.province" districtFieldName="location.district" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salaryRange">Mức lương</Label>
                <Select onValueChange={(value) => methods.setValue('salaryRange', value)} defaultValue="ALL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.salaryRanges.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Kinh nghiệm</Label>
                <Select onValueChange={(value) => methods.setValue('experience', value)} defaultValue="ALL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.experiences.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="category">Ngành nghề</Label>
                    <Select onValueChange={(value) => methods.setValue('category', value)} defaultValue="ALL">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {options.categories.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="frequency">Tần suất nhận *</Label>
                     <Select onValueChange={(value) => methods.setValue('frequency', value)} defaultValue="weekly">
                       <SelectTrigger><SelectValue /></SelectTrigger>
                       <SelectContent>
                         {options.frequencies.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                       </SelectContent>
                     </Select>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Hủy</Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-primary text-white">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Đang lưu...' : 'Tạo đăng ký'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};