import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
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
import { getMyProfile } from '../../services/profileService';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10">
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
      <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10">
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
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
                      <div className="flex items-center text-primary-foreground/80 mb-2">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{profile.email}</span>
                      </div>
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
                
                <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
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
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      Giới thiệu
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
                      <Badge variant="outline">{calculateExperience(profile.experiences)}</Badge>
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
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                      Học vấn
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
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-primary" />
                      Kỹ năng
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
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Tải lên
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
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
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
                  <Button className="w-full justify-start" variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Tải lên CV mới
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm kinh nghiệm
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;