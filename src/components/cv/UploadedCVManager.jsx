import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Trash2, Pencil, Eye, Star, AlertTriangle } from 'lucide-react';
import apiClient from '@/services/apiClient';

/**
 * Component quản lý CV đã upload
 */
const UploadedCVManager = () => {
  const queryClient = useQueryClient();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);
  const [newName, setNewName] = useState('');

  // Fetch uploaded CVs
  const { data: cvsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['uploaded-cvs'],
    queryFn: async () => {
      const response = await apiClient.get('/candidate/cvs');
      return response.data;
    },
  });

  // Rename CV mutation
  const renameMutation = useMutation({
    mutationFn: async ({ cvId, name }) => {
      const response = await apiClient.patch(`/candidate/cvs/${cvId}`, { name });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đổi tên CV thành công!');
      queryClient.invalidateQueries({ queryKey: ['uploaded-cvs'] });
      setIsRenameDialogOpen(false);
      setSelectedCv(null);
      setNewName('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể đổi tên CV.');
    },
  });

  // Delete CV mutation
  const deleteMutation = useMutation({
    mutationFn: async (cvId) => {
      const response = await apiClient.delete(`/candidate/cvs/${cvId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa CV thành công!');
      queryClient.invalidateQueries({ queryKey: ['uploaded-cvs'] });
      setIsDeleteDialogOpen(false);
      setSelectedCv(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa CV.');
    },
  });

  // Set default CV mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (cvId) => {
      const response = await apiClient.patch(`/candidate/cvs/${cvId}/set-default`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đã đặt làm CV mặc định!');
      queryClient.invalidateQueries({ queryKey: ['uploaded-cvs'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể đặt CV mặc định.');
    },
  });

  const handleOpenRenameDialog = (cv) => {
    setSelectedCv(cv);
    setNewName(cv.name || '');
    setIsRenameDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cv) => {
    setSelectedCv(cv);
    setIsDeleteDialogOpen(true);
  };

  const handleRename = () => {
    if (!newName.trim()) {
      toast.error('Vui lòng nhập tên cho CV.');
      return;
    }
    renameMutation.mutate({ cvId: selectedCv._id, name: newName });
  };

  const handleDelete = () => {
    if (selectedCv) {
      deleteMutation.mutate(selectedCv._id);
    }
  };

  const handleSetDefault = (cv) => {
    setDefaultMutation.mutate(cv._id);
  };

  const handleView = (cv) => {
    window.open(cv.path, '_blank');
  };

  const handleDownload = (cv) => {
    const link = document.createElement('a');
    link.href = cv.path;
    link.download = cv.name || 'CV.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đang tải xuống...');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Không thể tải danh sách CV</p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const cvs = cvsData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Danh sách CV</h2>
        <span className="text-sm text-gray-500">{cvs.length} CV</span>
      </div>

      {cvs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có CV nào được tải lên
            </h3>
            <p className="text-gray-600">
              Tải lên CV của bạn để dễ dàng ứng tuyển công việc
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvs.map((cv) => (
            <Card
              key={cv._id}
              className={`hover:shadow-lg transition-all duration-200 ${
                cv.isDefault ? 'border-2 border-blue-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{cv.name}</span>
                    </CardTitle>
                    {cv.isDefault && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>CV mặc định</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                    onClick={() => handleOpenRenameDialog(cv)}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-xs text-gray-500">
                  Tải lên: {new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(cv)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(cv)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Tải
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-3">
                {!cv.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSetDefault(cv)}
                    disabled={setDefaultMutation.isPending}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenDeleteDialog(cv)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên CV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cv-name">Tên CV mới</Label>
              <Input
                id="cv-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nhập tên mới cho CV"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={renameMutation.isPending}
            >
              Hủy
            </Button>
            <Button onClick={handleRename} disabled={renameMutation.isPending}>
              {renameMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Xác nhận xóa CV</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa CV{' '}
              <span className="font-semibold text-gray-900">
                "{selectedCv?.name}"
              </span>{' '}
              không?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa CV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadedCVManager;
