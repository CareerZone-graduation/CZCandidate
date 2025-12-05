import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveJob, unsaveJob } from '@/services/savedJobService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Building2,
  Heart,
  Users,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatSalary, formatTimeAgo, formatDistance, calculateDistance } from '@/utils/formatters';

/**
 * JobResultCard - Professional job card design
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
    if (!userLocation || !job.location?.coordinates?.coordinates) return null;
    try {
      const userCoords = JSON.parse(userLocation);
      const jobCoords = job.location.coordinates.coordinates;
      const distanceInMeters = calculateDistance(userCoords, jobCoords);
      if (distanceInMeters === null) return null;
      return formatDistance(distanceInMeters);
    } catch (error) {
      return null;
    }
  }, [userLocation, job.location?.coordinates]);

  const handleCardClick = () => {
    if (onClick) {
      onClick(job);
    } else {
      navigate(`/jobs/${job._id}`);
    }
  };

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
        return {
          ...oldData,
          data: oldData.data.map(j =>
            j._id === job._id ? { ...j, isSaved: !j.isSaved } : j
          ),
        };
      });
      return { previousData };
    },
    onSuccess: () => {
      if (onSaveToggle) return;
      toast.success(job.isSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm');
      queryClient.invalidateQueries({queryKey: ['savedJobs']});
    },
    onError: (err, _vars, context) => {
      if (onSaveToggle) return;
      if (context?.previousData) {
        queryClient.setQueryData(['jobs', 'search', searchParameters], context.previousData);
      }
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra');
    },
  });

  const handleSaveJob = (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu việc làm');
      return;
    }
    toggleSaveJob();
  };

  const handleApplyJob = (event) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      navigate('/login');
      return;
    }
    navigate(`/jobs/${job.id || job._id}`);
  };

  // Job type styling
  const getJobTypeStyle = (type) => {
    const styles = {
      'FULL_TIME': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'PART_TIME': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'CONTRACT': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'INTERNSHIP': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      'FREELANCE': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      'TEMPORARY': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
    };
    return styles[type] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  };

  // Work type styling
  const getWorkTypeStyle = (workType) => {
    const styles = {
      'ON_SITE': { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Tại văn phòng' },
      'REMOTE': { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Làm từ xa' },
      'HYBRID': { bg: 'bg-teal-50', text: 'text-teal-700', label: 'Linh hoạt' }
    };
    return styles[workType] || { bg: 'bg-slate-50', text: 'text-slate-700', label: workType };
  };

  // Job type labels
  const getJobTypeLabel = (type) => {
    const labels = {
      'FULL_TIME': 'Toàn thời gian',
      'PART_TIME': 'Bán thời gian',
      'CONTRACT': 'Hợp đồng',
      'INTERNSHIP': 'Thực tập',
      'FREELANCE': 'Freelance',
      'TEMPORARY': 'Tạm thời'
    };
    return labels[type] || type;
  };

  const typeStyle = getJobTypeStyle(job.type);
  const workTypeStyle = getWorkTypeStyle(job.workType);

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden",
        "border border-slate-200 hover:border-primary/30",
        "bg-white hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300",
        className
      )}
      onClick={handleCardClick}
    >
      <div className={cn("p-5", compact && "p-4")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <Avatar className={cn(
              "rounded-xl border-2 border-slate-100 bg-white",
              "group-hover:border-primary/20 transition-colors",
              compact ? "h-14 w-14" : "h-16 w-16"
            )}>
              <AvatarImage
                src={job.company?.logo}
                alt={job.company?.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-semibold text-lg rounded-xl">
                {job.company?.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            {/* Title & Save Button */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className={cn(
                "font-semibold text-slate-800 line-clamp-2",
                "group-hover:text-primary transition-colors",
                compact ? "text-base" : "text-lg"
              )}>
                {job.title}
              </h3>
              
              {showSaveButton && (
                <button
                  onClick={handleSaveJob}
                  className={cn(
                    "flex-shrink-0 p-2 rounded-full transition-all",
                    job.isSaved 
                      ? "text-red-500 bg-red-50 hover:bg-red-100" 
                      : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <Heart className={cn(
                    "h-5 w-5",
                    job.isSaved && "fill-current"
                  )} />
                </button>
              )}
            </div>

            {/* Company Name */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (job.company?._id) navigate(`/company/${job.company._id}`);
              }}
              className="flex items-center gap-1.5 text-slate-600 hover:text-primary transition-colors mb-3"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">{job.company?.name}</span>
            </button>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {job.type && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded-full border",
                    typeStyle.bg, typeStyle.text, typeStyle.border
                  )}
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  {getJobTypeLabel(job.type)}
                </Badge>
              )}
              
              {job.workType && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium px-2.5 py-0.5 rounded-full border-0",
                    workTypeStyle.bg, workTypeStyle.text
                  )}
                >
                  {workTypeStyle.label}
                </Badge>
              )}
              
              <Badge 
                variant="outline" 
                className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-0"
              >
                <DollarSign className="h-3 w-3 mr-0.5" />
                {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
              </Badge>
            </div>

            {/* Location & Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {job.location?.province && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location.district ? `${job.location.district}, ` : ''}{job.location.province}
                </span>
              )}
              
              {distance && (
                <span className="flex items-center gap-1 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  {distance}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatTimeAgo(job.createdAt)}
              </span>
              
              {job.applicantCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {job.applicantCount} ứng viên
                </span>
              )}
            </div>

            {/* Skills */}
            {!compact && job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-md">
                    +{job.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Deadline Warning */}
            {job.deadline && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-600">
                <Clock className="h-3.5 w-3.5" />
                Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCardClick}
            className="rounded-full px-4 text-slate-600 hover:text-primary hover:border-primary"
          >
            Xem chi tiết
          </Button>
          <Button
            size="sm"
            onClick={handleApplyJob}
            className="rounded-full px-5 bg-primary hover:bg-primary/90"
          >
            <Bookmark className="h-4 w-4 mr-1.5" />
            Ứng tuyển
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobResultCard;
