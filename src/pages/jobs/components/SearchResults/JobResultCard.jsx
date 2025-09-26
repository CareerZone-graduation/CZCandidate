import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Building, 
  Heart,
  ArrowRight,
  Users,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * JobResultCard component for displaying individual job search results
 * Includes job details, company info, and action buttons
 */
const JobResultCard = ({
  job,
  onClick,
  className,
  showSaveButton = true,
  compact = false
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  /**
   * Format salary range
   * @param {number} min - Minimum salary
   * @param {number} max - Maximum salary
   * @returns {string} - Formatted salary string
   */
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${min}-${max} triệu`;
    if (min) return `Từ ${min} triệu`;
    if (max) return `Lên đến ${max} triệu`;
    return 'Thỏa thuận';
  };

  /**
   * Format time ago
   * @param {string} dateString - Date string
   * @returns {string} - Time ago string
   */
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return `${Math.ceil(diffDays / 30)} tháng trước`;
  };

  const formatLocation = (location) => {
    if (!location) return 'N/A';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.district) parts.push(location.district);
      if (location.province) parts.push(location.province);
      return parts.join(', ');
    }
    return 'N/A';
  };

  /**
   * Handle job card click
   */
  const handleCardClick = () => {
    if (onClick) {
      onClick(job);
    } else {
      navigate(`/jobs/${job.id || job._id}`);
    }
  };

  /**
   * Handle save job
   * @param {Event} event - Click event
   */
  const handleSaveJob = (event) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      return;
    }

    // TODO: Implement save job functionality
    toast.success('Đã lưu việc làm');
  };

  /**
   * Handle apply job
   * @param {Event} event - Click event
   */
  const handleApplyJob = (event) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      navigate('/login');
      return;
    }

    navigate(`/jobs/${job.id || job._id}`);
  };

  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer",
        "border-border hover:border-primary/50",
        "bg-background hover:bg-muted/30",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Avatar className={cn("rounded-lg border-2 border-muted", compact ? "h-12 w-12" : "h-16 w-16")}>
              <AvatarImage 
                src={job.recruiterProfileId.company?.logo} 
                alt={job.recruiterProfileId.company?.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-lg">
                {job.recruiterProfileId.company?.name?.charAt(0) || job.title?.charAt(0) || 'J'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2",
                  compact ? "text-lg" : "text-xl"
                )}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate">{job.company?.name}</span>
                </div>
              </div>
              
              {/* Save Button */}
              {showSaveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveJob}
                  className="flex-shrink-0 text-muted-foreground hover:text-red-500"
                >
                  <Heart className={cn("h-5 w-5", job.isSaved && "fill-red-500 text-red-500")} />
                </Button>
              )}
            </div>

            {/* Job Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.type && (
                <Badge variant="secondary" className="text-xs">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
              )}
              
              {job.workType && (
                <Badge variant="outline" className="text-xs">
                  {job.workType}
                </Badge>
              )}
              
              <Badge variant="outline" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </Badge>
              
              {job.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {formatLocation(job.location)}
                </Badge>
              )}
            </div>

            {/* Job Description */}
            {!compact && job.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {job.description}
              </p>
            )}

            {/* Job Skills/Requirements */}
            {!compact && job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(job.createdAt)}
                </div>
                
                {job.applicantCount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {job.applicantCount} ứng viên
                  </div>
                )}
                
                {job.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {job.views} lượt xem
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCardClick}
                  className="text-xs"
                >
                  Xem chi tiết
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleApplyJob}
                  className="btn-gradient hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  Ứng tuyển
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobResultCard;