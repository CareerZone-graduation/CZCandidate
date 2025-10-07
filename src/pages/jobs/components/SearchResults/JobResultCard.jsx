import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveJob, unsaveJob } from '@/services/savedJobService';
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
  userLocation,
  onSaveToggle,
  searchParameters
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

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
      navigate(`/jobs/${job._id}`);
    }
  };

  /**
   * Handle save job
   * @param {Event} event - Click event
   */
  const { mutate: toggleSaveJob } = useMutation({
    mutationFn: () => {
      if (onSaveToggle) {
        onSaveToggle(job);
        return Promise.resolve();
      }
      return job.isSaved ? unsaveJob(job._id) : saveJob(job._id);
    },
    onMutate: async () => {
      if (onSaveToggle) return;

      const queryKey = ['jobs', 'search', searchParameters];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return;
        const newData = {
          ...oldData,
          data: oldData.data.map(j =>
            j._id === job._id ? { ...j, isSaved: !j.isSaved } : j
          ),
        };
        return newData;
      });

      return { previousData };
    },
    onSuccess: () => {
      if (onSaveToggle) return;
      toast.success(job.isSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm thành công');
      queryClient.invalidateQueries({queryKey: ['savedJobs']});
    },
    onError: (err, _vars, context) => {
      if (onSaveToggle) return;
      if (context?.previousData) {
        queryClient.setQueryData(['jobs', 'search', searchParameters], context.previousData);
      }
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra.');
    },
  });

  const handleSaveJob = (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu việc làm.');
      return;
    }
    toggleSaveJob();
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
        "group cursor-pointer border-2 border-border/50",
        "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20",
        "transition-all duration-500",
        "bg-card/95 backdrop-blur-sm",
        "overflow-hidden relative",
        className
      )}
      onClick={handleCardClick}
    >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className={cn("p-6 relative z-10", compact && "p-4")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className={cn(
              "rounded-2xl border-2 border-primary/30 bg-white shadow-md",
              "group-hover:shadow-xl group-hover:border-primary/60 group-hover:scale-105",
              "transition-all duration-500 overflow-hidden",
              "relative",
              compact ? "h-28 w-28" : "h-32 w-32"
            )}>
              <Avatar className="h-full w-full rounded-2xl">
                <AvatarImage
                  src={job.company?.logo}
                  alt={job.company?.name}
                  className="object-cover"
                />
                <AvatarFallback className={cn(
                  "bg-gradient-to-br from-primary/20 via-primary/10 to-transparent",
                  "text-primary font-bold rounded-2xl",
                  "group-hover:from-primary/30 group-hover:via-primary/20",
                  "transition-all duration-500",
                  compact ? "text-2xl" : "text-3xl"
                )}>
                  {job.company?.name?.charAt(0) || job.title?.charAt(0) || 'J'}
                </AvatarFallback>
              </Avatar>
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] group-hover:translate-x-[100%]" />
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold text-foreground line-clamp-2 mb-2",
                  "group-hover:text-primary transition-all duration-300",
                  "leading-tight",
                  compact ? "text-lg" : "text-2xl"
                )}>
                  {job.title}
                </h3>
                <div className={cn(
                  "flex items-center gap-2 text-muted-foreground",
                  "group-hover:text-primary/80 transition-all duration-300",
                  "group-hover:translate-x-1"
                )}>
                  <Building className="h-4 w-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold truncate">{job.company?.name}</span>
                </div>
              </div>
              
              {/* Save Button */}
              {showSaveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveJob}
                  className={cn(
                    "flex-shrink-0 rounded-xl transition-all duration-300",
                    "hover:bg-red-50/20 hover:scale-110",
                    job.isSaved 
                      ? "text-red-500 hover:text-red-600" 
                      : "text-muted-foreground hover:text-red-500"
                  )}
                >
                  <Heart className={cn(
                    "h-6 w-6 transition-all duration-300",
                    job.isSaved && "fill-red-500 animate-pulse"
                  )} />
                </Button>
              )}
            </div>

            {/* Job Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.type && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-lg",
                    "bg-gradient-to-r", typeColorClasses.bg,
                    typeColorClasses.text,
                    "border border-transparent",
                    "hover:scale-105 hover:shadow-md transition-all duration-300",
                    "group-hover:animate-pulse"
                  )}
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
              )}
              
              {job.workType && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-lg",
                    "bg-gradient-to-r", workTypeColorClasses.bg,
                    workTypeColorClasses.text,
                    "border-2", workTypeColorClasses.border,
                    "hover:scale-105 hover:shadow-md transition-all duration-300"
                  )}
                >
                  {job.workType}
                </Badge>
              )}
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-lg",
                  "bg-gradient-to-r from-emerald-500/10 to-green-500/10",
                  "text-emerald-600 border-2 border-emerald-500/30",
                  "hover:scale-105 hover:shadow-md transition-all duration-300"
                )}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
              </Badge>
              
              {job.location && job.location.province && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-lg",
                    "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
                    "text-blue-600 border-2 border-blue-500/30",
                    "hover:scale-105 hover:shadow-md transition-all duration-300"
                  )}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location.province}
               </Badge>
             )}

             
             {job.deadline && (
               <Badge 
                 variant="outline" 
                 className={cn(
                   "text-xs font-semibold px-3 py-1 rounded-lg",
                   "bg-gradient-to-r from-red-500/10 to-rose-500/10",
                   "text-red-600 border-2 border-red-500/30",
                   "hover:scale-105 hover:shadow-md transition-all duration-300",
                   "animate-pulse"
                 )}
               >
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
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium px-3 py-1 rounded-full",
                      "bg-gradient-to-r from-primary/15 to-primary/5",
                      "text-primary border border-primary/30",
                      "hover:from-primary/25 hover:to-primary/10",
                      "hover:scale-110 hover:shadow-md hover:shadow-primary/20",
                      "transition-all duration-300 cursor-default"
                    )}
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-bold px-3 py-1 rounded-full",
                      "bg-gradient-to-r from-primary/20 to-primary/10",
                      "text-primary border-2 border-primary/40",
                      "hover:from-primary/30 hover:to-primary/15",
                      "hover:scale-110 hover:shadow-md hover:shadow-primary/20",
                      "transition-all duration-300 cursor-default"
                    )}
                  >
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
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCardClick}
                  className={cn(
                    "text-xs font-semibold px-4 py-2 rounded-lg",
                    "border-2 border-primary/40 text-primary",
                    "hover:bg-primary/10 hover:border-primary",
                    "hover:scale-105 hover:shadow-md hover:shadow-primary/20",
                    "transition-all duration-300 group/btn"
                  )}
                >
                  Xem chi tiết
                  <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleApplyJob}
                  className={cn(
                    "btn-gradient text-primary-foreground",
                    "text-xs font-bold px-5 py-2 rounded-lg",
                    "hover:scale-110 hover:shadow-xl hover:shadow-primary/40",
                    "transition-all duration-300 relative overflow-hidden",
                    "group/apply"
                  )}
                >
                  <span className="relative z-10">Ứng tuyển</span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/apply:opacity-100 transition-opacity duration-300" />
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