import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCvs, deleteCv, createCvFromTemplate, duplicateCv as duplicateCvApi } from '../../services/api';
import { cvTemplates } from '@/data/templates';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { PlusCircle, Edit, Trash2, Copy } from 'lucide-react';
import TemplateGallery from '@/components/buildCV/TemplateGallery';

const CVListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cvToDuplicate, setCvToDuplicate] = useState(null);
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
      navigate(`/editor/${data.data._id}`);
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

  const handleOpenCreateDialog = (template) => {
    setSelectedTemplate(template);
    setNewCvName(`CV mới dựa trên ${template.name}`);
    setIsCreateDialogOpen(true);
  };
  
  const handleOpenDuplicateDialog = (cv) => {
    setCvToDuplicate(cv);
    setNewCvName(`Bản sao của ${cv.name}`);
    setIsDuplicateDialogOpen(true);
  };

  const handleCreateCv = () => {
    if (!newCvName.trim()) {
      toast.error('Vui lòng nhập tên cho CV.');
      return;
    }
    createMutation.mutate({ templateId: selectedTemplate.id, name: newCvName });
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cvsData.data.map((cv) => (
                  <Card key={cv._id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="truncate">{cv.name || 'CV chưa có tên'}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">
                        Cập nhật lần cuối: {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/editor/${cv._id}`}><Edit className="h-4 w-4 mr-2" />Sửa</Link>
                      </Button>
                       <Button variant="outline" size="sm" onClick={() => handleOpenDuplicateDialog(cv)}>
                        <Copy className="h-4 w-4 mr-2" />Nhân bản
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(cv._id)}>
                        <Trash2 className="h-4 w-4 mr-2" />Xóa
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
        ) : (
             <EmptyState message="Bạn chưa có CV nào. Hãy chọn một mẫu bên dưới để bắt đầu!" />
        )}
      </section>

      <section id="templates" className="mt-12 pt-4">
         <TemplateGallery selectedTemplate={null} onSelectTemplate={(id) => {
             const template = cvTemplates.find(t => t.id === id);
             if(template) handleOpenCreateDialog(template);
         }} />
      </section>

      {/* Create CV Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo CV mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cv-name" className="text-right">Tên CV</Label>
              <Input
                id="cv-name"
                value={newCvName}
                onChange={(e) => setNewCvName(e.target.value)}
                className="col-span-3"
                placeholder="Ví dụ: CV ứng tuyển Fresher"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
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
    </div>
  );
};

export default CVListPage;