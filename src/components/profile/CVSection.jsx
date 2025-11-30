import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';

export const CVSection = ({ cvs = [], onUpload, onDelete, onDownload }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingCvId, setDeletingCvId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      await onUpload(formData);
      e.target.value = '';
      toast.success('Tải lên CV thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải lên thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (cvId, cvName) => {
    try {
      await onDownload(cvId, cvName);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Tải xuống thất bại');
    }
  };

  const handleDelete = (cvId) => {
    setCvToDelete(cvId);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!cvToDelete) return;

    try {
      setDeletingCvId(cvToDelete);
      await onDelete(cvToDelete);
      toast.success('Xóa CV thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Xóa thất bại');
    } finally {
      setDeletingCvId(null);
      setConfirmDeleteOpen(false);
      setCvToDelete(null);
    }
  };

  return (
    <Card>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            CV của tôi
          </div>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              'Đang tải lên...'
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Tải lên
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cvs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Chưa có CV. Nhấn "Tải lên" để thêm CV của bạn.
          </p>
        ) : (
          cvs.map((cv) => (
            <div key={cv._id} className="border rounded-lg p-4 hover:bg-card transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">{cv.name}</h4>
                    {cv.isDefault && (
                      <Badge className="bg-primary text-primary-foreground">Mặc định</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tải lên: {formatDate(cv.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(cv._id, cv.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(cv._id)}
                    disabled={deletingCvId === cv._id}
                  >
                    {deletingCvId === cv._id ? (
                      <span className="text-xs">Đang xóa...</span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Xóa CV?"
        description="Bạn có chắc chắn muốn xóa CV này? Hành động này không thể hoàn tác."
        onConfirm={executeDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </Card>
  );
};
