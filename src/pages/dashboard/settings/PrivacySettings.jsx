import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { getMe } from '@/services/profileService';
import { updatePrivacySettings } from '@/services/profileService';
import { cn } from '@/lib/utils';

const PrivacySettings = () => {
  const queryClient = useQueryClient();
  const [allowSearch, setAllowSearch] = useState(false);

  // Fetch user data to get current allowSearch setting
  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
  });

  // Set initial state when data loads
  useEffect(() => {
    if (userData?.data?.allowSearch !== undefined) {
      setAllowSearch(userData.data.allowSearch);
    }
  }, [userData]);

  // Update privacy settings mutation
  const updateMutation = useMutation({
    mutationFn: (settings) => updatePrivacySettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Đã cập nhật cài đặt riêng tư thành công');
    },
    onError: (error) => {
      // Revert the switch state on error
      setAllowSearch(!allowSearch);
      toast.error(error.response?.data?.message || 'Không thể cập nhật cài đặt');
    },
  });

  const handleToggleAllowSearch = (checked) => {
    setAllowSearch(checked);
    updateMutation.mutate({ allowSearch: checked });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <ErrorState
          title="Không thể tải cài đặt"
          message={error?.response?.data?.message || 'Đã xảy ra lỗi khi tải cài đặt riêng tư'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt riêng tư</h1>
        </div>
        <p className="text-gray-600">
          Quản lý quyền riêng tư và khả năng hiển thị hồ sơ của bạn
        </p>
      </div>

      {/* Privacy Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Khả năng tìm kiếm hồ sơ</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Allow Search Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="allow-search"
                  className="text-base font-medium cursor-pointer"
                >
                  Cho phép nhà tuyển dụng tìm thấy tôi
                </Label>
                {allowSearch ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                Khi bật, hồ sơ của bạn sẽ xuất hiện trong danh sách gợi ý ứng viên
                phù hợp cho các nhà tuyển dụng dựa trên AI. Thông tin liên hệ của
                bạn vẫn được bảo mật cho đến khi nhà tuyển dụng mua quyền xem hồ sơ.
              </p>
            </div>
            <Switch
              id="allow-search"
              checked={allowSearch}
              onCheckedChange={handleToggleAllowSearch}
              disabled={updateMutation.isPending}
              className={cn(
                updateMutation.isPending && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Information Box */}
          <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">Thông tin quan trọng:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Hồ sơ của bạn chỉ hiển thị cho nhà tuyển dụng khi có độ phù hợp cao
                  với công việc họ đang tuyển dụng
                </li>
                <li>
                  Email và số điện thoại của bạn sẽ được ẩn cho đến khi nhà tuyển dụng
                  mua quyền xem hồ sơ đầy đủ
                </li>
                <li>
                  Bạn có thể tắt tính năng này bất cứ lúc nào để ngừng xuất hiện trong
                  danh sách gợi ý
                </li>
                <li>
                  Việc bật tính năng này giúp tăng cơ hội được nhà tuyển dụng chủ động
                  liên hệ
                </li>
              </ul>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                allowSearch ? 'bg-green-500' : 'bg-gray-400'
              )}
            />
            <span className="text-gray-600">
              Trạng thái:{' '}
              <span className={cn('font-medium', allowSearch ? 'text-green-600' : 'text-gray-600')}>
                {allowSearch ? 'Đang bật - Hồ sơ có thể được tìm thấy' : 'Đang tắt - Hồ sơ không hiển thị'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
