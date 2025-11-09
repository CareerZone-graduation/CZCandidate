import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Info, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { getMe } from '@/services/profileService';
import { updatePrivacySettings, getAllowSearchSettings, toggleAllowSearch } from '@/services/profileService';
import { getCVs } from '@/services/cvService';
import { cn } from '@/lib/utils';

const PrivacySettings = () => {
  const queryClient = useQueryClient();
  const [allowSearch, setAllowSearch] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [showCvSelector, setShowCvSelector] = useState(false);

  // Fetch current allow search settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['allowSearchSettings'],
    queryFn: getAllowSearchSettings,
  });

  // Fetch user CVs
  const { data: cvsData, isLoading: cvsLoading } = useQuery({
    queryKey: ['userCVs'],
    queryFn: getCVs,
  });

  // Fetch user data
  const { data: userData, isLoading, isError, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getMe,
  });

  // Set initial state when data loads
  useEffect(() => {
    if (settingsData?.data) {
      setAllowSearch(settingsData.data.allowSearch);
      setSelectedCvId(settingsData.data.selectedCvId);
    }
  }, [settingsData]);

  // Toggle allow search mutation
  const toggleMutation = useMutation({
    mutationFn: (data) => toggleAllowSearch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowSearchSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Đã cập nhật cài đặt tìm kiếm thành công');
      setShowCvSelector(false);
    },
    onError: (error) => {
      setAllowSearch(!allowSearch);
      toast.error(error.response?.data?.message || 'Không thể cập nhật cài đặt');
    },
  });

  const handleToggleAllowSearch = (checked) => {
    if (checked) {
      // Nếu bật, kiểm tra xem đã có CV chưa
      const cvs = cvsData?.data || [];
      if (cvs.length === 0) {
        toast.error('Bạn cần upload ít nhất 1 CV trước khi bật tìm việc');
        return;
      }
      
      // Nếu đã có CV được chọn trước đó, dùng luôn
      if (selectedCvId) {
        setAllowSearch(true);
        toggleMutation.mutate({ allowSearch: true, selectedCvId });
      } else {
        // Hiển thị CV selector
        setShowCvSelector(true);
      }
    } else {
      // Nếu tắt, không cần chọn CV
      setAllowSearch(false);
      toggleMutation.mutate({ allowSearch: false });
    }
  };

  const handleSelectCv = (cvId) => {
    setSelectedCvId(cvId);
    setAllowSearch(true);
    toggleMutation.mutate({ allowSearch: true, selectedCvId: cvId });
  };

  const handleChangeCv = () => {
    setShowCvSelector(true);
  };

  const cvs = cvsData?.data || [];
  const selectedCv = cvs.find(cv => cv._id === selectedCvId);

  if (isLoading || settingsLoading) {
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
                phù hợp cho các nhà tuyển dụng dựa trên AI. Bạn cần chọn 1 CV để hiển thị.
                Thông tin liên hệ trong CV sẽ được che cho đến khi nhà tuyển dụng mua quyền xem.
              </p>
            </div>
            <Switch
              id="allow-search"
              checked={allowSearch}
              onCheckedChange={handleToggleAllowSearch}
              disabled={toggleMutation.isPending}
              className={cn(
                toggleMutation.isPending && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Selected CV Display */}
          {allowSearch && selectedCv && !showCvSelector && (
            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-900">
                      CV đang sử dụng để tìm việc:
                    </p>
                    <p className="text-sm text-green-700 font-semibold">
                      {selectedCv.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Tải lên: {new Date(selectedCv.uploadedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleChangeCv}
                  disabled={toggleMutation.isPending}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Đổi CV
                </Button>
              </div>
            </div>
          )}

          {/* CV Selector */}
          {showCvSelector && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Chọn CV để hiển thị cho nhà tuyển dụng:
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCvSelector(false)}
                  disabled={toggleMutation.isPending}
                >
                  Hủy
                </Button>
              </div>
              
              {cvsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : cvs.length === 0 ? (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-center">
                  <p className="text-sm text-gray-600">
                    Bạn chưa có CV nào. Vui lòng upload CV trước.
                  </p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => window.location.href = '/cv'}
                  >
                    Đi đến trang quản lý CV
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cvs.map((cv) => (
                    <button
                      key={cv._id}
                      onClick={() => handleSelectCv(cv._id)}
                      disabled={toggleMutation.isPending}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        'hover:border-primary hover:bg-primary/5',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        selectedCvId === cv._id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className={cn(
                          'h-5 w-5 flex-shrink-0 mt-0.5',
                          selectedCvId === cv._id ? 'text-primary' : 'text-gray-400'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 truncate">
                              {cv.name}
                            </p>
                            {selectedCvId === cv._id && (
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Tải lên: {new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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
                  <strong>Chỉ CV bạn chọn</strong> sẽ hiển thị cho nhà tuyển dụng chưa mở khóa.
                  Các CV khác sẽ bị ẩn hoàn toàn
                </li>
                <li>
                  Email và số điện thoại trong CV sẽ được <strong>che bằng hình chữ nhật xám</strong> cho
                  đến khi nhà tuyển dụng mua quyền xem hồ sơ đầy đủ
                </li>
                <li>
                  Sau khi nhà tuyển dụng mở khóa, họ sẽ xem được tất cả CV và thông tin đầy đủ của bạn
                </li>
                <li>
                  Bạn có thể đổi CV hoặc tắt tính năng này bất cứ lúc nào
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
