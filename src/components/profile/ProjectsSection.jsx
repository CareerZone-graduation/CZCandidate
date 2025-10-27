import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, FolderGit2, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';

export const ProjectsSection = ({ projects = [], onUpdate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    startDate: '',
    endDate: '',
    technologies: []
  });
  const [techInput, setTechInput] = useState('');

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      startDate: '',
      endDate: '',
      technologies: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(projects[index]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    try {
      await onUpdate({ projects: updatedProjects });
      toast.success('Đã xóa dự án');
    } catch (error) {
      toast.error('Không thể xóa dự án');
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Vui lòng nhập tên dự án');
      return;
    }

    const updatedProjects = [...projects];
    if (editingIndex !== null) {
      updatedProjects[editingIndex] = formData;
    } else {
      updatedProjects.push(formData);
    }

    try {
      await onUpdate({ projects: updatedProjects });
      toast.success(editingIndex !== null ? 'Đã cập nhật dự án' : 'Đã thêm dự án');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Không thể lưu dự án');
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
          <FolderGit2 className="w-5 h-5" />
          Dự án
        </CardTitle>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm dự án
        </Button>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có dự án nào</p>
            <p className="text-sm mt-1">Thêm dự án để thể hiện kinh nghiệm thực tế</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    )}
                    {(project.startDate || project.endDate) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Hiện tại'}
                      </p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                      >
                        Xem dự án <ExternalLink className="w-3 h-3" />
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
                {editingIndex !== null ? 'Chỉnh sửa dự án' : 'Thêm dự án'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Tên dự án *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: E-commerce Platform"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn về dự án..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="url">Link dự án</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="technologies">Công nghệ sử dụng</Label>
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTechnology();
                      }
                    }}
                    placeholder="VD: React, Node.js..."
                  />
                  <Button type="button" onClick={handleAddTechnology}>
                    Thêm
                  </Button>
                </div>
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {tech}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveTechnology(tech)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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
