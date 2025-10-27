import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Award, ExternalLink, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const CertificateForm = ({ formData, onFormChange, onCancel, onSave, isUpdating }) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <Label htmlFor="name">Tên chứng chỉ <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="VD: AWS Certified Solutions Architect"
        />
      </div>

      <div>
        <Label htmlFor="issuer">Đơn vị cấp <span className="text-destructive">*</span></Label>
        <Input
          id="issuer"
          value={formData.issuer}
          onChange={(e) => onFormChange('issuer', e.target.value)}
          placeholder="VD: Amazon Web Services"
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
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Ngày hết hạn</Label>
          <Input
            id="expiryDate"
            type="month"
            value={formData.expiryDate}
            onChange={(e) => onFormChange('expiryDate', e.target.value)}
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
        />
      </div>

      <div className="flex gap-2 justify-end">
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Chứng chỉ
        </CardTitle>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm chứng chỉ
          </Button>
        )}
      </CardHeader>
      <CardContent>
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
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có chứng chỉ nào</p>
            <p className="text-sm mt-1">Thêm chứng chỉ để tăng uy tín với nhà tuyển dụng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert._id} className="space-y-2">
                {editingId === cert._id ? (
                  <CertificateForm
                    formData={currentCertificateFormData}
                    onFormChange={handleFormChange}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    isUpdating={isUpdating}
                  />
                ) : (
                  <div className="border-l-2 border-primary/20 pl-4 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Cấp: {formatDate(cert.issueDate)}</span>
                          {cert.expiryDate && (
                            <span>Hết hạn: {formatDate(cert.expiryDate)}</span>
                          )}
                        </div>
                        {cert.credentialId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Mã: {cert.credentialId}
                          </p>
                        )}
                        {cert.url && (
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            Xem chứng chỉ <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(cert)}
                          disabled={isUpdating}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cert._id)}
                          disabled={isUpdating}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
