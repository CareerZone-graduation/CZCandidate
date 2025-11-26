import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, FolderGit2, ExternalLink, X, Save, Calendar } from 'lucide-react';
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
    <div className="space-y-4 p-6 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div>
        <Label htmlFor="name">Tên dự án <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormChange('name', e.target.value)}
          placeholder="VD: E-commerce Platform"
          className="bg-background"
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
          className="bg-background resize-none"
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
          className="bg-background"
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
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="endDate">Ngày kết thúc</Label>
          <Input
            id="endDate"
            type="month"
            value={formData.endDate}
            onChange={(e) => onFormChange('endDate', e.target.value)}
            className="bg-background"
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
            className="bg-background"
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
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleRemoveTechnology(tech)}
                />
              </Badge>
            ))}
          </div>
        )}
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
      startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 7) : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 7) : ''
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
    <Card className="card-hover border-none shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderGit2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Dự án</h3>
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
          <ProjectForm
            formData={currentProjectFormData}
            onFormChange={handleFormChange}
            onCancel={handleCancel}
            onSave={handleSave}
            isUpdating={isUpdating}
          />
        )}

        {projects.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
              <FolderGit2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Chưa có dự án nào</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Thêm dự án để thể hiện kinh nghiệm thực tế</p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Thêm dự án
            </Button>
          </div>
        ) : (
          <div className="relative pl-2">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border/60"></div>

            <div className="space-y-8">
              {projects.map((project) => (
                <div key={project._id} className="relative pl-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-background bg-primary shadow-sm z-10 group-hover:scale-110 transition-transform"></div>

                  {editingId === project._id ? (
                    <ProjectForm
                      formData={currentProjectFormData}
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
                              {project.name}
                            </h4>
                            {(project.startDate || project.endDate) && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Hiện tại'}
                              </div>
                            )}
                          </div>

                          {project.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {project.description}
                            </p>
                          )}

                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {project.technologies.map((tech, i) => (
                                <Badge key={i} variant="secondary" className="text-xs font-normal">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {project.url && (
                            <div className="pt-1">
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                              >
                                Xem dự án <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(project)}
                            disabled={isUpdating}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};
