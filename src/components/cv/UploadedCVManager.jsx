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
import { cn } from '@/lib/utils';

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
      const responseData = data?.data;
      let uploadedCv = null;

      if (Array.isArray(responseData) && responseData.length > 0) {
        // Find the CV with the latest uploadedAt timestamp
        uploadedCv = responseData.reduce((latest, current) => {
          return new Date(current.uploadedAt) > new Date(latest.uploadedAt) ? current : latest;
        }, responseData[0]);
      } else if (responseData?._id) {
        uploadedCv = responseData;
      }

      if (uploadedCv?._id) {
        setNewlyUploadedCvId(uploadedCv._id);
        // Auto view the newly uploaded CV
        setViewingCv(uploadedCv);
        // Remove highlight after 5 seconds
        setTimeout(() => {
          setNewlyUploadedCvId(null);
        }, 5000);
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

  // Auto-select first CV if none selected and data loaded
  React.useEffect(() => {
    if (cvsData?.data?.length > 0 && !viewingCv && !isLoading) {
      setViewingCv(cvsData.data[0]);
    }
  }, [cvsData, viewingCv, isLoading]);

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
    <div className="flex h-full bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Left Panel - CV List */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r bg-card">
        <div className="p-4 border-b flex items-center justify-between bg-card sticky top-0 z-10">
          <div>
            <h2 className="font-semibold text-lg tracking-tight">CV đã tải lên</h2>
            <p className="text-xs text-muted-foreground">{cvs.length} tài liệu</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            title="Tải lên CV mới"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cvs.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Chưa có CV nào</p>
              <p className="text-xs text-muted-foreground mb-3">Tải lên CV để bắt đầu</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Tải lên ngay
              </Button>
            </div>
          ) : (
            cvs.map((cv) => (
              <div
                key={cv._id}
                onClick={() => handleViewInPanel(cv)}
                className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border relative overflow-hidden ${newlyUploadedCvId === cv._id
                  ? 'bg-green-50 border-green-500 ring-2 ring-green-400 ring-offset-1 shadow-[0_0_15px_rgba(74,222,128,0.3)] z-10'
                  : viewingCv?._id === cv._id
                    ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/10'
                    : 'hover:bg-accent/50 border-transparent hover:border-border'
                  }`}
              >
                <div className="mt-0.5 relative">
                  <div className={`h-10 w-10 rounded flex items-center justify-center ${viewingCv?._id === cv._id ? 'bg-white text-primary shadow-sm' : 'bg-muted/50 text-muted-foreground'
                    }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  {cv.isDefault && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-medium text-sm truncate pr-2 ${viewingCv?._id === cv._id ? 'text-primary' : 'text-foreground'
                      }`} title={cv.name}>
                      {cv.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(cv.uploadedAt).toLocaleDateString('vi-VN')}
                    </p>
                    {newlyUploadedCvId === cv._id && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                        MỚI
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/30">
        {viewingCv ? (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-lg truncate text-gray-900">{viewingCv.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Đã tải lên {new Date(viewingCv.uploadedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}</span>
                    {viewingCv.isDefault && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-yellow-600 font-medium bg-yellow-50 px-1.5 py-0.5 rounded">
                          <Star className="h-3 w-3 fill-current" /> CV Mặc định
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenRenameDialog(viewingCv)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  title="Đổi tên"
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Đổi tên</span>
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(viewingCv)}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  title="Tải xuống"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Tải về</span>
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                {!viewingCv.isDefault && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(viewingCv)}
                      className="h-8 px-2 text-muted-foreground hover:text-yellow-600"
                      title="Đặt làm mặc định"
                    >
                      <Star className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">Mặc định</span>
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDeleteDialog(viewingCv)}
                  className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Xóa</span>
                </Button>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div className="flex-1 overflow-hidden relative bg-gray-100/50">
              <PDFViewer
                pdfUrl={viewingCv.path}
                fileName={viewingCv.name}
                onDownload={() => handleDownload(viewingCv)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <div className="max-w-md text-center">
              <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 opacity-20" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chọn CV để xem trước</h3>
              <p className="text-gray-500 mb-8">
                Chọn một CV từ danh sách bên trái để xem nội dung chi tiết, hoặc tải lên CV mới của bạn.
              </p>
              <Button onClick={() => fileInputRef.current?.click()} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                <Upload className="h-5 w-5" /> Tải lên CV mới
              </Button>
            </div>
          </div>
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
