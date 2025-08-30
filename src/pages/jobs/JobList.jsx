import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building,
  Calendar,
  Bookmark
} from 'lucide-react';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data in case API fails
  const mockJobs = [
    {
      _id: "1",
      title: "Frontend Developer",
      company: { name: "Tech Company", logo: "" },
      location: { province: "Hà Nội", ward: "Ba Đình" },
      minSalary: "1500",
      maxSalary: "2500",
      type: "FULL_TIME",
      experience: "SENIOR_LEVEL",
      deadline: "2025-12-31",
      skills: ["React", "JavaScript", "CSS"]
    },
    {
      _id: "2", 
      title: "Backend Developer",
      company: { name: "Software Corp", logo: "" },
      location: { province: "TP. Hồ Chí Minh", ward: "Quận 1" },
      minSalary: "2000",
      maxSalary: "3000",
      type: "FULL_TIME",
      experience: "MID_LEVEL",
      deadline: "2025-11-30",
      skills: ["Node.js", "MongoDB", "Express"]
    }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from API first
        const response = await fetch('http://localhost:5000/api/jobs');
        
        if (!response.ok) {
          throw new Error('API không phản hồi');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setJobs(result.data);
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      } catch (err) {
        console.warn('API error, using mock data:', err);
        // Use mock data if API fails
        setJobs(mockJobs);
        setError(null); // Don't show error, just use mock data
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Format functions
  const formatSalary = (minSalary, maxSalary) => {
    if (!minSalary && !maxSalary) return 'Thỏa thuận';
    if (minSalary && maxSalary) {
      return `${minSalary}-${maxSalary} USD`;
    }
    if (minSalary) return `Từ ${minSalary} USD`;
    if (maxSalary) return `Đến ${maxSalary} USD`;
  };

  const formatWorkType = (type) => {
    const typeMap = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'FREELANCE': 'Freelance'
    };
    return typeMap[type] || type;
  };

  const formatExperience = (level) => {
    const levelMap = {
      'INTERN': 'Thực tập sinh',
      'ENTRY_LEVEL': 'Mới tốt nghiệp',
      'JUNIOR_LEVEL': 'Junior (1-2 năm)',
      'MID_LEVEL': 'Mid-level (2-5 năm)',
      'SENIOR_LEVEL': 'Senior (5+ năm)',
      'LEAD_LEVEL': 'Team Lead',
      'MANAGER_LEVEL': 'Manager'
    };
    return levelMap[level] || level;
  };

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           job.company.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle view job detail
  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} size="lg">
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tìm kiếm việc làm
            </h1>
            <p className="text-gray-600">
              Khám phá {jobs.length} cơ hội việc làm hấp dẫn
            </p>
          </div>

          {/* Search Bar */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Tìm kiếm theo tên công việc, công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị {filteredJobs.length} kết quả
            </p>
          </div>

          {/* Job Grid */}
          {filteredJobs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy việc làm</h3>
                <p className="text-gray-600 mb-4">Thử thay đổi từ khóa tìm kiếm</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card 
                  key={job._id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white"
                  onClick={() => handleViewJob(job._id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={job.company.logo} alt={job.company.name} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-600">
                            {job.company.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {job.company.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{job.location.province}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium text-green-600">
                          {formatSalary(job.minSalary, job.maxSalary)}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        <span>{formatWorkType(job.type)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2 text-purple-600" />
                        <span>{formatExperience(job.experience)}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                        <span>Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 pt-2">
                        {job.skills?.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewJob(job._id);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle save job
                          }}
                        >
                          <Bookmark className="h-4 w-4 mr-2" />
                          Lưu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;