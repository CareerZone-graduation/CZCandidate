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
import { formatSalary, formatTimeAgo, formatDistance, calculateDistance } from '@/utils/formatters';

/**
 * JobResultCard component for displaying individual job search results
 * Includes job details, company info, and action buttons
 */
const JobResultCard = ({
  job,
  onClick,
  className,
  showSaveButton = true,
  compact = false,
  userLocation
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const distance = React.useMemo(() => {
    if (!userLocation || !job.location?.coordinates?.coordinates) {
      return null;
    }
    try {
      const userCoords = JSON.parse(userLocation);
      const jobCoords = job.location.coordinates.coordinates;
      const distanceInMeters = calculateDistance(userCoords, jobCoords);
      if (distanceInMeters === null) {
        return null;
      }
      return formatDistance(distanceInMeters);
    } catch (error) {
      console.error("Failed to calculate distance:", error);
      return null;
    }
  }, [userLocation, job.location?.coordinates]);

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

  // Function to get color classes based on job type (FULL_TIME, PART_TIME, etc.)
 const getTypeColorClasses = (type) => {
    const colorMap = {
      'FULL_TIME': {
        bg: 'from-blue-500/10 to-cyan-500/10',
        text: 'text-blue-600',
        border: 'border-blue-500/20',
        hover: 'hover:from-blue-500/20 hover:to-cyan-500/20'
      },
      'PART_TIME': {
        bg: 'from-amber-500/10 to-orange-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/20',
        hover: 'hover:from-amber-500/20 hover:to-orange-500/20'
      },
      'CONTRACT': {
        bg: 'from-purple-500/10 to-violet-500/10',
        text: 'text-purple-600',
        border: 'border-purple-500/20',
        hover: 'hover:from-purple-50/20 hover:to-violet-500/20'
      },
      'INTERNSHIP': {
        bg: 'from-green-500/10 to-emerald-500/10',
        text: 'text-green-600',
        border: 'border-green-500/20',
        hover: 'hover:from-green-50/20 hover:to-emerald-500/20'
      },
      'FREELANCE': {
        bg: 'from-pink-500/10 to-rose-500/10',
        text: 'text-pink-60',
        border: 'border-pink-500/20',
        hover: 'hover:from-pink-500/20 hover:to-rose-500/20'
      }
    };
    return colorMap[type] || {
      bg: 'from-primary/10 to-info/10',
      text: 'text-primary',
      border: 'border-primary/20',
      hover: 'hover:from-primary/20 hover:to-info/20'
    };
  };

  // Function to get color classes based on work type (ON_SITE, REMOTE, HYBRID)
  const getWorkTypeColorClasses = (workType) => {
    const colorMap = {
      'ON_SITE': {
        bg: 'from-red-500/10 to-rose-500/10',
        text: 'text-red-600',
        border: 'border-red-500/20',
        hover: 'hover:from-red-500/20 hover:to-rose-500/20'
      },
      'REMOTE': {
        bg: 'from-indigo-500/10 to-blue-500/10',
        text: 'text-indigo-600',
        border: 'border-indigo-500/20',
        hover: 'hover:from-indigo-500/20 hover:to-blue-500/20'
      },
      'HYBRID': {
        bg: 'from-orange-500/10 to-amber-500/10',
        text: 'text-orange-600',
        border: 'border-orange-500/20',
        hover: 'hover:from-orange-500/20 hover:to-amber-500/20'
      }
    };
    return colorMap[workType] || {
      bg: 'from-primary/10 to-info/10',
      text: 'text-primary',
      border: 'border-primary/20',
      hover: 'hover:from-primary/20 hover:to-info/20'
    };
  };

  const typeColorClasses = getTypeColorClasses(job.type);
  const workTypeColorClasses = getWorkTypeColorClasses(job.workType);

  // Generate random color classes for other badges to ensure variety
  const getRandomColorClasses = () => {
    const colors = [
      { bg: 'from-blue-500/10 to-cyan-500/10', text: 'text-blue-600', border: 'border-blue-500/20', hover: 'hover:from-blue-500/20 hover:to-cyan-500/20' },
      { bg: 'from-emerald-500/10 to-green-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', hover: 'hover:from-emerald-500/20 hover:to-green-500/20' },
      { bg: 'from-purple-500/10 to-violet-50/10', text: 'text-purple-600', border: 'border-purple-500/20', hover: 'hover:from-purple-500/20 hover:to-violet-500/20' },
      { bg: 'from-amber-500/10 to-orange-500/10', text: 'text-amber-60', border: 'border-amber-500/20', hover: 'hover:from-amber-500/20 hover:to-orange-500/20' },
      { bg: 'from-pink-500/10 to-rose-500/10', text: 'text-pink-600', border: 'border-pink-50/20', hover: 'hover:from-pink-500/20 hover:to-rose-500/20' },
      { bg: 'from-indigo-500/10 to-blue-500/10', text: 'text-indigo-600', border: 'border-indigo-500/20', hover: 'hover:from-indigo-500/20 hover:to-blue-500/20' },
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const salaryColorClasses = getRandomColorClasses();
  const locationColorClasses = getRandomColorClasses();

  return (
    <Card
      className={cn(
        "group border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1",
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Avatar className={cn("rounded-lg border-2 border-primary/20 bg-white shadow-sm group-hover:shadow-md transition-all duration-300", compact ? "h-28 w-28" : "h-28 w-28")}>
              <AvatarImage
                src={job.company?.logo}
                alt={job.company?.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-info/10 text-primary font-semibold rounded-lg text-lg group-hover:from-primary/20 group-hover:to-info/20 transition-all duration-300 hover:from-primary/20 hover:to-info/20">
                {job.company?.name?.charAt(0) || job.title?.charAt(0) || 'J'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-1",
                  compact ? "text-lg" : "text-xl"
                )}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  <Building className="h-4 w-4 flex-shrink-0 text-primary/70" />
                  <span className="font-medium truncate">{job.recruiterProfileId?.company?.name}</span>
                </div>
              </div>
              
              {/* Save Button */}
              {showSaveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveJob}
                  className="flex-shrink-0 text-muted-foreground hover:text-red-50 transition-colors duration-300 group-hover:bg-red-50/50"
                >
                  <Heart className={cn("h-5 w-5 transition-all duration-30", job.isSaved && "fill-red-500 text-red-500 scale-110")} />
                </Button>
              )}
            </div>

            {/* Job Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.type && (
                <Badge variant="secondary" className={cn("text-xs", typeColorClasses.bg.replace('from-', 'bg-').replace(' to-', '/10 to-').replace('/10', '/10'), typeColorClasses.text, typeColorClasses.hover.replace('hover:from-', 'hover:bg-').replace(' hover:to-', '/20 hover:to-').replace('/20', '/20'), "transition-colors duration-300")}>
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
              )}
              
              {job.workType && (
                <Badge variant="outline" className={cn("text-xs", workTypeColorClasses.border, workTypeColorClasses.text, "hover:bg-primary/10 transition-colors duration-300")}>
                  {job.workType}
                </Badge>
              )}
              
              <Badge variant="outline" className={cn("text-xs", salaryColorClasses.border, salaryColorClasses.text, "hover:bg-primary/10 transition-colors duration-300")}>
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
              </Badge>
              
              {job.location && job.location.province && (
                <Badge variant="outline" className={cn("text-xs", locationColorClasses.border, locationColorClasses.text, "hover:bg-primary/10 transition-colors duration-300")}>
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location.province}
               </Badge>
             )}

             
             {job.deadline && (
               <Badge variant="outline" className="text-xs border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors duration-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                </Badge>
              )}
            </div>

            {/* Job Description */}
            {!compact && job.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 group-hover:text-foreground transition-colors duration-300">
                {job.description}
              </p>
            )}

            {/* Job Skills/Requirements */}
            {!compact && job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-info/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-info/20 transition-all duration-300 transform hover:scale-105">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/10 to-info/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-info/20 transition-all duration-300 transform hover:scale-105">
                    +{job.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                <div className="flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(job.createdAt)}
                </div>
                
                {distance && (
                  <div className="flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
                    <MapPin className="h-3 w-3" />
                    {distance}
                  </div>
                )}
                {job.applicantCount && (
                  <div className="flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
                    <Users className="h-3 w-3" />
                    {job.applicantCount} ứng viên
                  </div>
                )}
                
                {job.views && (
                  <div className="flex items-center gap-1 group-hover:text-primary transition-colors duration-300">
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
                  className="text-xs hover:border-primary hover:text-primary transition-colors duration-300 border-primary/30"
                >
                  Xem chi tiết
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleApplyJob}
                  className="btn-gradient hover:bg-primary/90 text-primary-foreground text-xs transition-all duration-300 hover:scale-105 hover:shadow-md"
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
