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
import { formatSalary, formatLocation, formatTimeAgo } from '@/utils/formatters';

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

  // Removed local format functions - now using utils/formatters.js

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
        "group card-yellow-hover",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Avatar className={cn("rounded-lg border-2 border-muted", compact ? "h-16 w-16" : "h-24 w-24")}>
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
                {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
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