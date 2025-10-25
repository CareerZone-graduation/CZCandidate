import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Trash2, Pencil, Eye, Star, AlertTriangle, Upload, Plus } from 'lucide-react';
import apiClient from '@/services/apiClient';
import PDFViewer from './PDFViewer';

/**
 * Component quản lý CV đã upload
 */
const UploadedCVManager = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);
  const [newName, setNewName] = useState('');
  const [viewingCv, setViewingCv] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [newlyUploadedCvId, setNewlyUploadedCvId] = useState(null);

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

  // Upload CV mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cv', file);
      const response = await apiClient.post('/candidate/cvs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Tải lên CV thành công!');
      queryClient.invalidateQueries({ queryKey: ['uploaded-cvs'] });
      
      // Set newly uploaded CV ID for highlighting
      const uploadedCv = data?.data;
      if (uploadedCv?._id) {
        setNewlyUploadedCvId(uploadedCv._id);
        // Auto view the newly uploaded CV
        setViewingCv(uploadedCv);
        // Remove highlight after 3 seconds
        setTimeout(() => {
          setNewlyUploadedCvId(null);
        }, 3000);
      }
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tải lên CV.');
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

  const handleDownload = (cv) => {
    const link = document.createElement('a');
    link.href = cv.path;
    link.download = cv.name || 'CV.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Chỉ chấp nhận file PDF');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB');
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file CV');
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  const handleCancelUpload = () => {
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const handleViewInPanel = (cv) => {
    setViewingCv(cv);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Left Panel - CV List */}
      <div className="w-full lg:w-96 flex-shrink-0 space-y-4 overflow-y-auto pr-2">
        <div className="sticky top-0 bg-white pb-3 border-b z-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-900">Danh sách CV</h2>
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tải lên
            </Button>
          </div>
          <span className="text-sm text-gray-500">{cvs.length} CV</span>
        </div>

        {cvs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có CV nào được tải lên
              </h3>
              <p className="text-gray-600 mb-4">
                Tải lên CV của bạn để dễ dàng ứng tuyển công việc
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Tải lên CV đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => (
              <Card
                key={cv._id}
                className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                  cv.isDefault ? 'border-2 border-blue-500' : ''
                } ${viewingCv?._id === cv._id ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
                  newlyUploadedCvId === cv._id 
                    ? 'animate-pulse ring-4 ring-green-400 shadow-lg shadow-green-200 border-2 border-green-500' 
                    : ''
                }`}
                onClick={() => handleViewInPanel(cv)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{cv.name}</span>
                        {newlyUploadedCvId === cv._id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 animate-bounce">
                            MỚI
                          </span>
                        )}
                      </CardTitle>
                      {cv.isDefault && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <Star className="h-3 w-3 fill-current" />
                          <span>CV mặc định</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRenameDialog(cv);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(cv);
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Tải
                    </Button>
                    {!cv.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(cv);
                        }}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Mặc định
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteDialog(cv);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - PDF Viewer */}
      <div className="flex-1 hidden lg:block">
        {viewingCv ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate flex-1">
                  {viewingCv.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingCv(null)}
                  className="ml-2"
                >
                  <span className="text-xs">Đóng</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tải lên: {new Date(viewingCv.uploadedAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <PDFViewer
                pdfUrl={viewingCv.path}
                fileName={viewingCv.name}
                onDownload={() => handleDownload(viewingCv)}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center bg-gray-50">
            <CardContent className="text-center">
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chọn CV để xem
              </h3>
              <p className="text-gray-600">
                Click vào CV ở danh sách bên trái để xem nội dung
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <DialogTitle className="text-xl">Xác nhận tải lên CV</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* PDF Preview */}
            {previewUrl && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-white border-b px-4 py-2">
                  <p className="text-sm font-medium text-gray-700">Preview CV</p>
                </div>
                <div className="p-4">
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-[500px] border-0 rounded"
                    title="CV Preview"
                  />
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ nội dung CV trước khi tải lên. File phải là PDF và không quá 10MB.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={uploadMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || !selectedFile}
            >
              {uploadMutation.isPending ? 'Đang tải lên...' : 'Xác nhận tải lên'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadedCVManager;
