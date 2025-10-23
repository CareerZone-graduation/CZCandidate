import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCvs, deleteCv, createCvFromTemplate, duplicateCv as duplicateCvApi, renameCv } from '../../services/api';
import { cvTemplates } from '@/data/templates';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/common/ErrorState';
import { PlusCircle, Edit, Trash2, Copy, AlertTriangle, ExternalLink, Pencil } from 'lucide-react';
import TemplateGallery from '@/components/buildCV/TemplateGallery';
import CVPreview from '@/components/cv/CVPreview';

/**
 * CV List Page - Manages user's CV collection
 * 
 * NAMING CONVENTION:
 * - Display: cv.name (virtual field from backend)
 * - API requests: send 'title' for create, 'name' for rename/duplicate
 * - Backend automatically maps between 'name' and 'title'
 */
const CVListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvToDuplicate, setCvToDuplicate] = useState(null);
  const [cvToDelete, setCvToDelete] = useState(null);
  const [cvToRename, setCvToRename] = useState(null);
  const [newCvName, setNewCvName] = useState('');

  const { data: cvsData, isLoading: isLoadingCvs, isError: isCvsError, refetch: refetchCvs } = useQuery({
    queryKey: ['my-cvs'],
    queryFn: getCvs,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCv,
    onSuccess: () => {
      toast.success('CV đã được xóa thành công!');
      queryClient.invalidateQueries({ queryKey: ['my-cvs'] });
      setIsDeleteDialogOpen(false);
      setCvToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa CV.');
    },
  });

  const createMutation = useMutation({
    mutationFn: createCvFromTemplate,
    onSuccess: (data) => {
      toast.success('CV đã được tạo thành công!');
      queryClient.invalidateQueries({ queryKey: ['my-cvs'] });
      setIsCreateDialogOpen(false);
      setNewCvName('');
      // Navigate to editor with showSuggestion flag
      navigate(`/editor/${data.data._id}?showSuggestion=true`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể tạo CV.');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: ({ cvId, name }) => duplicateCvApi(cvId, name),
    onSuccess: (data) => {
      toast.success('CV đã được nhân bản thành công!');
      queryClient.invalidateQueries({ queryKey: ['my-cvs'] });
      setIsDuplicateDialogOpen(false);
      setNewCvName('');
      navigate(`/editor/${data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể nhân bản CV.');
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ cvId, name }) => renameCv(cvId, name),
    onSuccess: () => {
      toast.success('Đổi tên CV thành công!');
      queryClient.invalidateQueries({ queryKey: ['my-cvs'] });
      setIsRenameDialogOpen(false);
      setCvToRename(null);
      setNewCvName('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể đổi tên CV.');
    },
  });

  const handleOpenCreateDialog = (template) => {
    setSelectedTemplate(template);
    setNewCvName(`CV ${template.name}`);
    setIsCreateDialogOpen(true);
  };

  const handleOpenDuplicateDialog = (cv) => {
    setCvToDuplicate(cv);
    setNewCvName(`Bản sao của ${cv.title}`);
    setIsDuplicateDialogOpen(true);
  };

  const handleOpenDeleteDialog = (cv) => {
    setCvToDelete(cv);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCv = () => {
    if (cvToDelete) {
      deleteMutation.mutate(cvToDelete._id);
    }
  };

  const handleOpenRenameDialog = (cv) => {
    setCvToRename(cv);
    setNewCvName(cv.name || '');
    setIsRenameDialogOpen(true);
  };

  const handleRenameCv = () => {
    if (!newCvName.trim()) {
      toast.error('Vui lòng nhập tên cho CV.');
      return;
    }
    if (cvToRename) {
      renameMutation.mutate({ cvId: cvToRename._id, name: newCvName });
    }
  };

  const handleViewCV = (cvId) => {
    // Mở trang render.html trong tab mới
    window.open(`/render.html?cvId=${cvId}`, '_blank');
  };

  const handleCreateCv = () => {
    if (!newCvName.trim()) {
      toast.error('Vui lòng nhập tên cho CV.');
      return;
    }
    // Send 'title' to backend (backend uses 'title' field)
    createMutation.mutate({ templateId: selectedTemplate.id, title: newCvName });
  };

  const handleDuplicateCv = () => {
    if (!newCvName.trim()) {
      toast.error('Vui lòng nhập tên cho bản sao CV.');
      return;
    }
    duplicateMutation.mutate({ cvId: cvToDuplicate._id, name: newCvName });
  };

  if (isLoadingCvs) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
        <Skeleton className="h-8 w-1/3 mt-12 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      </div>
    );
  }

  if (isCvsError) {
    return <ErrorState onRetry={refetchCvs} message="Không thể tải dữ liệu." />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <section id="my-cvs">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý CV</h1>
          <Button onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tạo CV mới
          </Button>
        </div>

        {cvsData?.data?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cvsData.data.map((cv) => (
              <Card key={cv._id} className="flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="truncate text-lg flex-1">{cv.title || 'CV chưa có tên'}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRenameDialog(cv);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow space-y-4">
                  {/* CV Preview */}
                  <div className="w-full">
                    <CVPreview
                      cv={cv}
                      className="w-full"
                      onClick={() => handleViewCV(cv._id)}
                    />
                  </div>

                  {/* CV Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Cập nhật: {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}</span>
                      {cv.cvData?.personalInfo?.completionPercentage && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {cv.cvData.personalInfo.completionPercentage}% hoàn thành
                        </span>
                      )}
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {cv.cvData?.experiences?.length > 0 && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded">
                          {cv.cvData.experiences.length} kinh nghiệm
                        </span>
                      )}
                      {cv.cvData?.skills?.length > 0 && (
                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded">
                          {cv.cvData.skills.length} kỹ năng
                        </span>
                      )}
                    </div>

                    {cv.templateId && (
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                        Template: {cv.templateId}
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4">
                  {/* Primary Actions */}
                  <div className="flex w-full gap-2">
                    <Button variant="default" size="sm" className="flex-1" asChild>
                      <Link to={`/editor/${cv._id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewCV(cv._id)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Xem
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex w-full gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDuplicateDialog(cv)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Nhân bản
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(cv)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có CV nào</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Bạn chưa tạo CV nào. Hãy chọn một mẫu CV phù hợp bên dưới để bắt đầu tạo CV chuyên nghiệp của bạn!
            </p>
            <Button onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Tạo CV đầu tiên
            </Button>
          </div>
        )}
      </section>

      <section id="templates" className="mt-12 pt-4">
        <TemplateGallery selectedTemplate={null} onSelectTemplate={(id) => {
          const template = cvTemplates.find(t => t.id === id);
          if (template) handleOpenCreateDialog(template);
        }} />
      </section>

      {/* Create CV Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Tạo CV mới</DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4 py-2">
              {/* Template Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                {selectedTemplate.bestFor && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-xs text-gray-500">Phù hợp:</span>
                    {selectedTemplate.bestFor.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-blue-700 px-2 py-1 rounded shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* CV Name Input */}
              <div className="space-y-2">
                <Label htmlFor="cv-name">Tên CV của bạn</Label>
                <Input
                  id="cv-name"
                  value={newCvName}
                  onChange={(e) => setNewCvName(e.target.value)}
                  placeholder="Ví dụ: CV ứng tuyển Frontend Developer"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Đặt tên giúp bạn dễ dàng quản lý khi có nhiều CV
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateCv} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo và Chỉnh sửa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate CV Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhân bản CV</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duplicate-cv-name" className="text-right">Tên CV mới</Label>
              <Input
                id="duplicate-cv-name"
                value={newCvName}
                onChange={(e) => setNewCvName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleDuplicateCv} disabled={duplicateMutation.isPending}>
              {duplicateMutation.isPending ? 'Đang nhân bản...' : 'Nhân bản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename CV Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Đổi tên CV</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-cv-name">Tên CV mới</Label>
              <Input
                id="rename-cv-name"
                value={newCvName}
                onChange={(e) => setNewCvName(e.target.value)}
                placeholder="Nhập tên mới cho CV"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Đặt tên rõ ràng giúp bạn dễ dàng tìm kiếm và quản lý CV
              </p>
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
            <Button
              onClick={handleRenameCv}
              disabled={renameMutation.isPending}
            >
              {renameMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete CV Confirmation Dialog */}
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
              Bạn có chắc chắn muốn xóa CV <span className="font-semibold text-gray-900">"{cvToDelete?.name}"</span> không?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. CV sẽ bị xóa vĩnh viễn khỏi hệ thống.
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
              onClick={handleDeleteCv}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa CV
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CVListPage;