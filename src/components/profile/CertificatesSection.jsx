import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Award, ExternalLink, Save, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const CertificateForm = ({ formData, onFormChange, onCancel, onSave, isUpdating }) => {
  return (
    <div className="space-y-4 p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div>
        <Label htmlFor="name">Tên chứng chỉ <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="VD: AWS Certified Solutions Architect"
          className="bg-background"
        />
      </div>

      <div>
        <Label htmlFor="issuer">Đơn vị cấp <span className="text-destructive">*</span></Label>
        <Input
          id="issuer"
          value={formData.issuer}
          onChange={(e) => onFormChange('issuer', e.target.value)}
          placeholder="VD: Amazon Web Services"
          className="bg-background"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issueDate">Ngày cấp <span className="text-destructive">*</span></Label>
          <Input
            id="issueDate"
            type="month"
            value={formData.issueDate}
            onChange={(e) => onFormChange('issueDate', e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Ngày hết hạn</Label>
          <Input
            id="expiryDate"
            type="month"
            value={formData.expiryDate}
            onChange={(e) => onFormChange('expiryDate', e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="credentialId">Mã chứng chỉ</Label>
        <Input
          id="credentialId"
          value={formData.credentialId}
          onChange={(e) => onFormChange('credentialId', e.target.value)}
          placeholder="VD: ABC123XYZ"
          className="bg-background"
        />
      </div>

      <div>
        <Label htmlFor="url">Link xác thực</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => onFormChange('url', e.target.value)}
          placeholder="https://..."
          className="bg-background"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isUpdating}>
          <X className="w-4 h-4 mr-2" />
          Hủy
        </Button>
        <Button onClick={onSave} disabled={isUpdating}>
          <Save className="w-4 h-4 mr-2" />
          {isUpdating ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  );
};

export const CertificatesSection = ({ certificates = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentCertificateFormData, setCurrentCertificateFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    url: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFormChange = useCallback((field, value) => {
    setCurrentCertificateFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  const handleAdd = () => {
    setCurrentCertificateFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (cert) => {
    setEditingId(cert._id);
    setCurrentCertificateFormData({
      ...cert,
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentCertificateFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    });
  };

  const handleSave = async () => {
    if (!currentCertificateFormData.name || !currentCertificateFormData.issuer || !currentCertificateFormData.issueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setIsUpdating(true);
      let updatedCertificates;

      if (isAdding) {
        updatedCertificates = [...certificates, currentCertificateFormData];
      } else {
        updatedCertificates = certificates.map(cert =>
          cert._id === editingId ? { ...cert, ...currentCertificateFormData } : cert
        );
      }

      await onUpdate({ certificates: updatedCertificates });
      toast.success(isAdding ? 'Thêm chứng chỉ thành công' : 'Cập nhật chứng chỉ thành công');
      handleCancel(); // Reset form and editing state
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (certId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) return;

    try {
      setIsUpdating(true);
      const updatedCertificates = certificates.filter(cert => cert._id !== certId);
      await onUpdate({ certificates: updatedCertificates });
      toast.success('Xóa chứng chỉ thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="card-hover border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Chứng chỉ</h3>
          </div>
          {!isAdding && !editingId && (
            <Button onClick={handleAdd} size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAdding && (
          <CertificateForm
            formData={currentCertificateFormData}
            onFormChange={handleFormChange}
            onCancel={handleCancel}
            onSave={handleSave}
            isUpdating={isUpdating}
          />
        )}

        {certificates.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <Award className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Chưa có chứng chỉ nào</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Thêm chứng chỉ để tăng uy tín với nhà tuyển dụng</p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chứng chỉ
            </Button>
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border/60"></div>

            <div className="space-y-8">
              {certificates.map((cert) => (
                <div key={cert._id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 group-hover:scale-110 transition-transform"></div>

                  {editingId === cert._id ? (
                    <CertificateForm
                      formData={currentCertificateFormData}
                      onFormChange={handleFormChange}
                      onCancel={handleCancel}
                      onSave={handleSave}
                      isUpdating={isUpdating}
                    />
                  ) : (
                    <div className="group/item relative rounded-xl p-4 hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-bold text-lg text-foreground group-hover/item:text-primary transition-colors">
                              {cert.name}
                            </h4>
                            <p className="text-base font-medium text-muted-foreground mt-1">
                              {cert.issuer}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center bg-muted px-2 py-1 rounded">
                              <Calendar className="w-3.5 h-3.5 mr-1.5" />
                              {formatDate(cert.issueDate)}
                              {cert.expiryDate && ` - ${formatDate(cert.expiryDate)}`}
                            </div>
                            {cert.credentialId && (
                              <div className="flex items-center bg-muted px-2 py-1 rounded">
                                <span className="font-medium mr-1.5">ID:</span>
                                {cert.credentialId}
                              </div>
                            )}
                          </div>

                          {cert.url && (
                            <div className="pt-1">
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                              >
                                Xem chứng chỉ <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(cert)}
                            disabled={isUpdating}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(cert._id)}
                            disabled={isUpdating}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
