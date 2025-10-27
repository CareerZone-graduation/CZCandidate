import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, FolderGit2, ExternalLink, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCallback } from 'react';

const ProjectForm = ({ formData, onFormChange, onCancel, onSave, isUpdating }) => {
  const [techInput, setTechInput] = useState('');

  const handleAddTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      onFormChange('technologies', [...formData.technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (tech) => {
    onFormChange('technologies', formData.technologies.filter(t => t !== tech));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div>
        <Label htmlFor="name">Tên dự án <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="VD: E-commerce Platform"
        />
      </div>

      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormChange('description', e.target.value)}
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
          onChange={(e) => onFormChange('url', e.target.value)}
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
            onChange={(e) => onFormChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="month"
            value={formData.endDate}
            onChange={(e) => onFormChange('endDate', e.target.value)}
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

export const ProjectsSection = ({ projects = [], onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentProjectFormData, setCurrentProjectFormData] = useState({
    name: '',
    description: '',
    url: '',
    startDate: '',
    endDate: '',
    technologies: []
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFormChange = useCallback((field, value) => {
    setCurrentProjectFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
  };

  const handleAdd = () => {
    setCurrentProjectFormData({
      name: '',
      description: '',
      url: '',
      startDate: '',
      endDate: '',
      technologies: []
    });
    setIsAdding(true);
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setCurrentProjectFormData({
      ...project,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setCurrentProjectFormData({
      name: '',
      description: '',
      url: '',
      startDate: '',
      endDate: '',
      technologies: []
    });
  };

  const handleSave = async () => {
    if (!currentProjectFormData.name) {
      toast.error('Vui lòng nhập tên dự án');
      return;
    }

    try {
      setIsUpdating(true);
      let updatedProjects;

      if (isAdding) {
        updatedProjects = [...projects, currentProjectFormData];
      } else {
        updatedProjects = projects.map(proj =>
          proj._id === editingId ? { ...proj, ...currentProjectFormData } : proj
        );
      }

      await onUpdate({ projects: updatedProjects });
      toast.success(isAdding ? 'Thêm dự án thành công' : 'Cập nhật dự án thành công');
      handleCancel(); // Reset form and editing state
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (projId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;

    try {
      setIsUpdating(true);
      const updatedProjects = projects.filter(proj => proj._id !== projId);
      await onUpdate({ projects: updatedProjects });
      toast.success('Xóa dự án thành công');
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
          <FolderGit2 className="w-5 h-5" />
          Dự án
        </CardTitle>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm dự án
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding && (
          <ProjectForm
            formData={currentProjectFormData}
            onFormChange={handleFormChange}
            onCancel={handleCancel}
            onSave={handleSave}
            isUpdating={isUpdating}
          />
        )}

        {projects.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có dự án nào</p>
            <p className="text-sm mt-1">Thêm dự án để thể hiện kinh nghiệm thực tế</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="space-y-2">
                {editingId === project._id ? (
                  <ProjectForm
                    formData={currentProjectFormData}
                    onFormChange={handleFormChange}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    isUpdating={isUpdating}
                  />
                ) : (
                  <div className="border-l-2 border-primary/20 pl-4 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-foreground">{project.name}</h4>
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
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(project)}
                          disabled={isUpdating}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(project._id)}
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
        )}
      </CardContent>
    </Card>
  );
};
