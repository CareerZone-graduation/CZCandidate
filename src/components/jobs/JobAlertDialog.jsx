import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createJobAlert, updateJobAlert } from '@/services/jobAlertService';
import {
  FREQUENCY_OPTIONS,
  SALARY_RANGE_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_TYPE_OPTIONS,
  EXPERIENCE_OPTIONS,
  CATEGORY_OPTIONS,
  NOTIFICATION_METHOD_OPTIONS,
} from '@/constants/jobAlertEnums';
import { provinceNames, locationMap } from '@/constants/locations';

const JobAlertDialog = ({ trigger, alert, open, onOpenChange, onSuccess }) => {
  const [isOpen, setIsOpen] = useState(open || false);
  const [formData, setFormData] = useState({
    keyword: '',
    location: {
      province: 'ALL',
      district: 'ALL',
    },
    frequency: 'weekly',
    salaryRange: 'ALL',
    type: 'ALL',
    workType: 'ALL',
    experience: 'ALL',
    category: 'ALL',
    notificationMethod: 'APPLICATION',
  });

  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    if (alert) {
      setFormData({
        keyword: alert.keyword || '',
        location: alert.location || { province: 'ALL', district: 'ALL' },
        frequency: alert.frequency || 'weekly',
        salaryRange: alert.salaryRange || 'ALL',
        type: alert.type || 'ALL',
        workType: alert.workType || 'ALL',
        experience: alert.experience || 'ALL',
        category: alert.category || 'ALL',
        notificationMethod: alert.notificationMethod || 'APPLICATION',
      });
      
      // Load districts for selected province
      if (alert.location?.province && alert.location.province !== 'ALL') {
        const provinceData = locationMap.get(alert.location.province);
        if (provinceData) {
          setDistricts(provinceData.districts);
        }
      }
    }
  }, [alert]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (alert) {
        return updateJobAlert(alert._id, data);
      }
      return createJobAlert(data);
    },
    onSuccess: () => {
      toast.success(alert ? 'Cập nhật thông báo thành công' : 'Tạo thông báo thành công');
      handleClose();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
    if (!alert) {
      setFormData({
        keyword: '',
        location: { province: 'ALL', district: 'ALL' },
        frequency: 'weekly',
        salaryRange: 'ALL',
        type: 'ALL',
        workType: 'ALL',
        experience: 'ALL',
        category: 'ALL',
        notificationMethod: 'APPLICATION',
      });
    }
  };

  const handleProvinceChange = (province) => {
    setFormData(prev => ({
      ...prev,
      location: {
        province,
        district: 'ALL',
      },
    }));

    if (province === 'ALL') {
      setDistricts([]);
    } else {
      const provinceData = locationMap.get(province);
      if (provinceData) {
        setDistricts(provinceData.districts);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{alert ? 'Chỉnh sửa thông báo' : 'Tạo thông báo việc làm'}</DialogTitle>
        <DialogDescription>
          Nhập tiêu chí để nhận thông báo khi có việc làm phù hợp
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Keyword */}
          <div className="col-span-2">
            <Label htmlFor="keyword">Từ khóa (tùy chọn)</Label>
            <Input
              id="keyword"
              placeholder="VD: React Developer, Marketing Manager..."
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
            />
          </div>

          {/* Province */}
          <div>
            <Label htmlFor="province">Tỉnh/Thành phố</Label>
            <Select value={formData.location.province} onValueChange={handleProvinceChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {provinceNames.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div>
            <Label htmlFor="district">Quận/Huyện</Label>
            <Select
              value={formData.location.district}
              onValueChange={(value) =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, district: value },
                }))
              }
              disabled={formData.location.province === 'ALL'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.name} value={district.name}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Ngành nghề</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience */}
          <div>
            <Label htmlFor="experience">Kinh nghiệm</Label>
            <Select
              value={formData.experience}
              onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Salary Range */}
          <div>
            <Label htmlFor="salaryRange">Mức lương</Label>
            <Select
              value={formData.salaryRange}
              onValueChange={(value) => setFormData(prev => ({ ...prev, salaryRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SALARY_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Job Type */}
          <div>
            <Label htmlFor="type">Loại hình công việc</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Work Type */}
          <div>
            <Label htmlFor="workType">Hình thức làm việc</Label>
            <Select
              value={formData.workType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, workType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Frequency */}
          <div>
            <Label htmlFor="frequency">Tần suất nhận thông báo</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Method */}
          <div>
            <Label htmlFor="notificationMethod">Phương thức nhận</Label>
            <Select
              value={formData.notificationMethod}
              onValueChange={(value) => setFormData(prev => ({ ...prev, notificationMethod: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="btn-gradient">
            {mutation.isPending ? 'Đang xử lý...' : alert ? 'Cập nhật' : 'Tạo thông báo'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
};

export default JobAlertDialog;
