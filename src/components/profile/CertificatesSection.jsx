import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Award, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const CertificatesSection = ({ certificates = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    url: ''
  });

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(certificates[index]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (index) => {
    const updatedCertificates = certificates.filter((_, i) => i !== index);
    try {
      await onUpdate({ certificates: updatedCertificates });
      toast.success('Đã xóa chứng chỉ');
    } catch (error) {
      toast.error('Không thể xóa chứng chỉ');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.issuer || !formData.issueDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const updatedCertificates = [...certificates];
    if (editingIndex !== null) {
      updatedCertificates[editingIndex] = formData;
    } else {
      updatedCertificates.push(formData);
    }

    try {
      await onUpdate({ certificates: updatedCertificates });
      toast.success(editingIndex !== null ? 'Đã cập nhật chứng chỉ' : 'Đã thêm chứng chỉ');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Không thể lưu chứng chỉ');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Chứng chỉ
        </CardTitle>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm chứng chỉ
        </Button>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có chứng chỉ nào</p>
            <p className="text-sm mt-1">Thêm chứng chỉ để tăng uy tín với nhà tuyển dụng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{cert.name}</h4>
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
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên chứng chỉ *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: AWS Certified Solutions Architect"
                  required
                />
              </div>

              <div>
                <Label htmlFor="issuer">Đơn vị cấp *</Label>
                <Input
                  id="issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="VD: Amazon Web Services"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Ngày cấp *</Label>
                  <Input
                    id="issueDate"
                    type="month"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                  <Input
                    id="expiryDate"
                    type="month"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="credentialId">Mã chứng chỉ</Label>
                <Input
                  id="credentialId"
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  placeholder="VD: ABC123XYZ"
                />
              </div>

              <div>
                <Label htmlFor="url">Link xác thực</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingIndex !== null ? 'Cập nhật' : 'Thêm'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
