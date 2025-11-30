import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  FileText,
  Plus,
  Edit3,
  Trash2,
  Download,
  Star,
  Upload
} from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { getMyProfile, uploadCV, downloadCV, deleteCV, updateProfile, uploadAvatar } from '../../services/profileService';
import ExperienceFormItem from '../../components/profile/ExperienceFormItem';
import EducationFormItem from '../../components/profile/EducationFormItem';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingCvId, setDeletingCvId] = useState(null);
  const [confirmDeleteCVOpen, setConfirmDeleteCVOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phone: '',
    bio: '',
    avatarFile: null,
  });

  const [isEditBioOpen, setIsEditBioOpen] = useState(false);
  const [editBio, setEditBio] = useState('');

  const [isEditExperienceOpen, setIsEditExperienceOpen] = useState(false);
  const [editExperiences, setEditExperiences] = useState([]);

  const [isEditEducationOpen, setIsEditEducationOpen] = useState(false);
  const [editEducations, setEditEducations] = useState([]);

  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [editSkills, setEditSkills] = useState([]);

  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    responsibilities: []
  });

  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [newEducation, setNewEducation] = useState({
    school: '',
    major: '',
    degree: '',
    startDate: '',
    endDate: '',
    description: '',
    gpa: '',
    type: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getMyProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        throw new Error(response.message || 'Không thể lấy thông tin hồ sơ');
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin hồ sơ:', err);
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateExperience = (experiences) => {
    if (!experiences || experiences.length === 0) return '0 năm';

    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) return `${months} tháng`;
    if (months === 0) return `${years} năm`;
    return `${years} năm ${months} tháng`;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 bg-skeleton rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-skeleton rounded w-48"></div>
                    <div className="h-4 bg-skeleton rounded w-32"></div>
                    <div className="h-4 bg-skeleton rounded w-40"></div>
                  </div>
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-skeleton rounded w-32 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-skeleton rounded w-full"></div>
                    <div className="h-4 bg-skeleton rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8 bg-white">
              <CardContent>
                <div className="text-destructive mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Có lỗi xảy ra</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchProfile} size="lg">
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file PDF, DOC, DOCX.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', file);
      // Optionally append name if backend expects it
      // formData.append('name', file.name);

      const response = await uploadCV(formData);
      e.target.value = ''; // Reset input
      setProfile(prev => ({ ...prev, cvs: response.data }));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Tải lên thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadCV = async (cvId, cvName) => {
    try {
      const blob = await downloadCV(cvId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvName || `cv-${cvId}`; // Use cv.name, assume it has extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Tải xuống thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCV = (cvId) => {
    setCvToDelete(cvId);
    setConfirmDeleteCVOpen(true);
  };

  const executeDeleteCV = async () => {
    if (!cvToDelete) return;

    try {
      setDeletingCvId(cvToDelete);
      await deleteCV(cvToDelete);
      await fetchProfile();
      toast.success('Xóa CV thành công');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingCvId(null);
      setConfirmDeleteCVOpen(false);
      setCvToDelete(null);
    }
  };

  const handleOpenEditDialog = () => {
    setEditForm({
      fullname: profile.fullname || '',
      phone: profile.phone || '',
      bio: profile.bio || '',
      avatarFile: null,
    });
    setIsEditDialogOpen(true);
  };

  // Memoized handlers to prevent re-render
  const handleEditFormChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleExperienceChange = useCallback((index, field, value) => {
    setEditExperiences(prev => {
      const newExps = [...prev];
      newExps[index] = { ...newExps[index], [field]: value };
      return newExps;
    });
  }, []);

  const handleEducationChange = useCallback((index, field, value) => {
    setEditEducations(prev => {
      const newEdus = [...prev];
      newEdus[index] = { ...newEdus[index], [field]: value };
      return newEdus;
    });
  }, []);

  const handleNewExperienceChange = useCallback((field, value) => {
    setNewExperience(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNewEducationChange = useCallback((field, value) => {
    setNewEducation(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDeleteExperience = useCallback((index) => {
    setEditExperiences(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDeleteEducation = useCallback((index) => {
    setEditEducations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSaveProfile = async () => {
    try {
      if (editForm.avatarFile) {
        const formData = new FormData();
        formData.append('avatar', editForm.avatarFile);
        await uploadAvatar(formData);
      }
      const updateData = {
        fullname: editForm.fullname,
        phone: editForm.phone ? editForm.phone.replace(/[\s\-\(\)]/g, '') : editForm.phone,
        bio: editForm.bio,
      };
      await updateProfile(updateData);
      setIsEditDialogOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditBio = () => {
    setEditBio(profile.bio || '');
    setIsEditBioOpen(true);
  };

  const handleSaveBio = async () => {
    try {
      const updateData = {
        bio: editBio,
      };
      await updateProfile(updateData);
      setIsEditBioOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Update bio failed:', err);
      toast.error('Cập nhật giới thiệu thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditExperience = () => {
    setEditExperiences(JSON.parse(JSON.stringify(profile.experiences || [])));
    setIsEditExperienceOpen(true);
  };

  const handleSaveExperience = async () => {
    try {
      const updateData = {
        experiences: editExperiences,
      };
      await updateProfile(updateData);
      setIsEditExperienceOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Update experience failed:', err);
      toast.error('Cập nhật kinh nghiệm thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditEducation = () => {
    setEditEducations(JSON.parse(JSON.stringify(profile.educations || [])));
    setIsEditEducationOpen(true);
  };

  const handleSaveEducation = async () => {
    try {
      const updateData = {
        educations: editEducations,
      };
      await updateProfile(updateData);
      setIsEditEducationOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Update education failed:', err);
      toast.error('Cập nhật học vấn thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditSkills = () => {
    setEditSkills({
      skills: JSON.parse(JSON.stringify(profile.skills || [])),
      newSkill: ''
    });
    setIsEditSkillsOpen(true);
  };

  const handleSaveSkills = async () => {
    try {
      const updateData = {
        skills: editSkills.skills,
      };
      await updateProfile(updateData);
      setIsEditSkillsOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Update skills failed:', err);
      toast.error('Cập nhật kỹ năng thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenAddExperience = () => {
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      responsibilities: []
    });
    setIsAddExperienceOpen(true);
  };

  const handleSaveAddExperience = async () => {
    try {
      const updatedExperiences = [...(profile.experiences || []), newExperience];
      const updateData = {
        experiences: updatedExperiences,
      };
      await updateProfile(updateData);
      setIsAddExperienceOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Add experience failed:', err);
      toast.error('Thêm kinh nghiệm thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenAddEducation = () => {
    setNewEducation({
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
      gpa: '',
      type: ''
    });
    setIsAddEducationOpen(true);
  };

  const handleSaveAddEducation = async () => {
    try {
      const updatedEducations = [...(profile.educations || []), newEducation];
      const updateData = {
        educations: updatedEducations,
      };
      await updateProfile(updateData);
      setIsAddEducationOpen(false);
      await fetchProfile();
    } catch (err) {
      console.error('Add education failed:', err);
      toast.error('Thêm học vấn thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />

          {/* Profile Header */}
          <Card className="overflow-hidden bg-white">
            <div className="bg-gradient-primary p-6 text-primary-foreground">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary-foreground shadow-lg">
                  <AvatarImage src={profile.avatar} alt={profile.fullname} />
                  <AvatarFallback className="bg-primary-foreground text-primary text-2xl font-bold">
                    {profile.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.fullname}</h1>
                      <div className="flex items-center text-primary-foreground/80">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{profile.phone || 'Chưa cập nhật số điện thoại'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-primary-foreground/80 text-sm mb-1">Thành viên từ</div>
                      <div className="font-semibold">{formatDate(profile.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" onClick={handleOpenEditDialog}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* About */}
              {profile.bio && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-primary" />
                        Giới thiệu
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleOpenEditBio}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Experience */}
              {profile.experiences && profile.experiences.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-primary" />
                        Kinh nghiệm làm việc
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{calculateExperience(profile.experiences)}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleOpenEditExperience}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.experiences.map((exp, index) => (
                      <div key={exp._id || index} className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0">
                        <h3 className="font-semibold text-lg text-foreground">{exp.position}</h3>
                        <div className="flex items-center text-primary font-medium mb-2">
                          <Building className="w-4 h-4 mr-1" />
                          {exp.company}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Hiện tại'}
                        </div>
                        {exp.description && (
                          <p className="text-muted-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {profile.educations && profile.educations.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                        Học vấn
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleOpenEditEducation}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.educations.map((edu, index) => (
                      <div key={edu._id || index} className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0">
                        <h3 className="font-semibold text-lg text-foreground">{edu.school}</h3>
                        <div className="text-primary font-medium mb-1">{edu.major}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{edu.degree}</span>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </div>
                        {edu.description && (
                          <p className="text-muted-foreground mt-2">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 mr-2 text-primary" />
                        Kỹ năng
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleOpenEditSkills}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={skill._id || index} variant="secondary" className="bg-primary/10 text-primary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CVs */}
              {profile.cvs && profile.cvs.length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary" />
                        CV của tôi
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
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
                    {profile.cvs.map((cv) => (
                      <div key={cv._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 truncate">{cv.name}</h4>
                              {cv.isDefault && (
                                <Badge className="bg-primary text-primary-foreground">Mặc định</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Tải lên: {formatDate(cv.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadCV(cv._id, cv.name)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteCV(cv._id)}
                              disabled={deletingCvId === cv._id}
                            >
                              {deletingCvId === cv._id ? 'Đang xóa...' : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Hành động nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={handleOpenEditDialog}>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên CV mới
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleOpenAddExperience}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm kinh nghiệm
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleOpenAddEducation}>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Thêm học vấn
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Edit Profile Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Họ và tên</Label>
                  <Input
                    id="fullname"
                    value={editForm.fullname}
                    onChange={(e) => handleEditFormChange('fullname', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => handleEditFormChange('bio', e.target.value)}
                    placeholder="Viết về bản thân..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Ảnh đại diện</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEditFormChange('avatarFile', e.target.files?.[0] || null)}
                  />
                  {editForm.avatarFile && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Đã chọn: {editForm.avatarFile.name}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveProfile} disabled={!editForm.fullname.trim()}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Bio Dialog */}
          <Dialog open={isEditBioOpen} onOpenChange={setIsEditBioOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa giới thiệu</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editBio">Giới thiệu</Label>
                  <Textarea
                    id="editBio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Viết về bản thân..."
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditBioOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveBio}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Skills Dialog */}
          <Dialog open={isEditSkillsOpen} onOpenChange={setIsEditSkillsOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa kỹ năng</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newSkill">Thêm kỹ năng mới</Label>
                  <div className="flex gap-2">
                    <Input
                      id="newSkill"
                      placeholder="Nhập tên kỹ năng"
                      value={editSkills.newSkill || ''}
                      onChange={(e) => setEditSkills({ ...editSkills, newSkill: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editSkills.newSkill?.trim()) {
                          setEditSkills(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), { name: prev.newSkill.trim() }],
                            newSkill: ''
                          }));
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (editSkills.newSkill?.trim()) {
                          setEditSkills(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), { name: prev.newSkill.trim() }],
                            newSkill: ''
                          }));
                        }
                      }}
                      disabled={!editSkills.newSkill?.trim()}
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Kỹ năng hiện tại</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editSkills.skills?.map((skill, index) => (
                      <div key={skill._id || index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{skill.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            setEditSkills(prev => ({
                              ...prev,
                              skills: prev.skills.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">Chưa có kỹ năng nào</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditSkillsOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveSkills}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Experience Dialog */}
          <Dialog open={isEditExperienceOpen} onOpenChange={setIsEditExperienceOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa kinh nghiệm làm việc</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editExperiences.map((exp, index) => (
                    <ExperienceFormItem
                      key={`exp-${index}`}
                      exp={exp}
                      index={index}
                      onChange={handleExperienceChange}
                      onDelete={handleDeleteExperience}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditExperiences(prev => [...prev, {
                      company: '',
                      position: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      responsibilities: []
                    }]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm kinh nghiệm
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditExperienceOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveExperience}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Education Dialog */}
          <Dialog open={isEditEducationOpen} onOpenChange={setIsEditEducationOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa học vấn</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editEducations.map((edu, index) => (
                    <EducationFormItem
                      key={`edu-${index}`}
                      edu={edu}
                      index={index}
                      onChange={handleEducationChange}
                      onDelete={handleDeleteEducation}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditEducations(prev => [...prev, {
                      school: '',
                      major: '',
                      degree: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      gpa: '',
                      type: ''
                    }]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm học vấn
                </Button>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditEducationOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveEducation}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Experience Dialog */}
          <Dialog open={isAddExperienceOpen} onOpenChange={setIsAddExperienceOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm kinh nghiệm làm việc</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Công ty</Label>
                    <Input
                      value={newExperience.company}
                      onChange={(e) => handleNewExperienceChange('company', e.target.value)}
                      placeholder="Tên công ty"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vị trí</Label>
                    <Input
                      value={newExperience.position}
                      onChange={(e) => handleNewExperienceChange('position', e.target.value)}
                      placeholder="Vị trí công việc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      value={newExperience.startDate}
                      onChange={(e) => handleNewExperienceChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      value={newExperience.endDate}
                      onChange={(e) => handleNewExperienceChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả công việc</Label>
                  <Textarea
                    value={newExperience.description}
                    onChange={(e) => handleNewExperienceChange('description', e.target.value)}
                    placeholder="Mô tả về công việc..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trách nhiệm (mỗi dòng một trách nhiệm)</Label>
                  <Textarea
                    value={newExperience.responsibilities.join('\n')}
                    onChange={(e) => handleNewExperienceChange('responsibilities', e.target.value.split('\n').filter(r => r.trim()))}
                    placeholder="Liệt kê các trách nhiệm..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddExperienceOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveAddExperience} disabled={!newExperience.company.trim() || !newExperience.position.trim()}>
                  Thêm kinh nghiệm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Education Dialog */}
          <Dialog open={isAddEducationOpen} onOpenChange={setIsAddEducationOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm học vấn</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Trường học</Label>
                    <Input
                      value={newEducation.school}
                      onChange={(e) => handleNewEducationChange('school', e.target.value)}
                      placeholder="Tên trường học"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chuyên ngành</Label>
                    <Input
                      value={newEducation.major}
                      onChange={(e) => handleNewEducationChange('major', e.target.value)}
                      placeholder="Chuyên ngành học"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bằng cấp</Label>
                    <Input
                      value={newEducation.degree}
                      onChange={(e) => handleNewEducationChange('degree', e.target.value)}
                      placeholder="Ví dụ: Cử nhân, Thạc sĩ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại hình</Label>
                    <Input
                      value={newEducation.type}
                      onChange={(e) => handleNewEducationChange('type', e.target.value)}
                      placeholder="Ví dụ: Đại học, Cao đẳng"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      value={newEducation.startDate}
                      onChange={(e) => handleNewEducationChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      value={newEducation.endDate}
                      onChange={(e) => handleNewEducationChange('endDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Điểm GPA</Label>
                    <Input
                      value={newEducation.gpa}
                      onChange={(e) => handleNewEducationChange('gpa', e.target.value)}
                      placeholder="Ví dụ: 3.5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={newEducation.description}
                    onChange={(e) => handleNewEducationChange('description', e.target.value)}
                    placeholder="Mô tả về quá trình học tập..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddEducationOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleSaveAddEducation} disabled={!newEducation.school.trim() || !newEducation.major.trim()}>
                  Thêm học vấn
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmDeleteCVOpen}
        onOpenChange={setConfirmDeleteCVOpen}
        title="Xóa CV?"
        description="Bạn có chắc chắn muốn xóa CV này? Hành động này không thể hoàn tác."
        onConfirm={executeDeleteCV}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
};

export default Profile;
