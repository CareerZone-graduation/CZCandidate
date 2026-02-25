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
  Bookmark,
  RefreshCw,
  Zap,
  TrendingUp
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

  const { mutate: toggleSaveJob, isPending: isSaving } = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
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

  // Job type config — color accent + label
  const JOB_TYPE_CONFIG = {
    FULL_TIME:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   accent: '#3b82f6', label: 'Toàn thời gian' },
    PART_TIME:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  accent: '#f59e0b', label: 'Bán thời gian' },
    CONTRACT:    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', accent: '#8b5cf6', label: 'Hợp đồng' },
    INTERNSHIP:  { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',accent: '#10b981', label: 'Thực tập' },
    FREELANCE:   { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   accent: '#ec4899', label: 'Freelance' },
    TEMPORARY:   { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: '#f97316', label: 'Tạm thời' },
  };

  const WORK_TYPE_CONFIG = {
    ON_SITE: { bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Tại văn phòng' },
    REMOTE:  { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Làm từ xa' },
    HYBRID:  { bg: 'bg-teal-50',   text: 'text-teal-700',   label: 'Linh hoạt' },
  };

  const typeConfig    = JOB_TYPE_CONFIG[job.type]    || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: '#64748b', label: job.type };
  const workTypeCfg   = WORK_TYPE_CONFIG[job.workType] || { bg: 'bg-slate-50', text: 'text-slate-700', label: job.workType };

  // "New" badge — posted within last 48 hours
  const isNew = job.createdAt && (Date.now() - new Date(job.createdAt).getTime()) < 48 * 60 * 60 * 1000;

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden relative",
        "border border-border/60 hover:border-primary/40",
        "bg-card hover:bg-card/95",
        "shadow-sm hover:shadow-xl hover:shadow-primary/8",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Left accent bar — colored by job type */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300 group-hover:w-1.5"
        style={{ backgroundColor: typeConfig.accent }}
      />

      <div className={cn("pl-5 pr-5 pt-5 pb-4", compact && "pl-4 pr-4 pt-4 pb-3")}>
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className={cn(
              "relative rounded-xl overflow-hidden",
              "ring-2 ring-border/50 group-hover:ring-primary/20",
              "transition-all duration-300",
              compact ? "h-14 w-14" : "h-16 w-16"
            )}>
              <Avatar className="w-full h-full rounded-xl">
                <AvatarImage
                  src={job.company?.logo}
                  alt={job.company?.name}
                  className="object-cover"
                />
                <AvatarFallback
                  className="rounded-xl font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${typeConfig.accent}20, ${typeConfig.accent}08)`,
                    color: typeConfig.accent
                  }}
                >
                  {job.company?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h3 className={cn(
                  "font-semibold text-foreground line-clamp-2",
                  "group-hover:text-primary transition-colors duration-200",
                  compact ? "text-sm" : "text-base leading-snug"
                )}>
                  {job.title}
                </h3>
                {isNew && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500 text-white shrink-0 uppercase">
                    <Zap className="h-2.5 w-2.5" />
                    Mới
                  </span>
                )}
                {job.isHot && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-orange-500 text-white shrink-0 uppercase">
                    <TrendingUp className="h-2.5 w-2.5" />
                    Hot
                  </span>
                )}
              </div>

              {showSaveButton && (
                <button
                  onClick={handleSaveJob}
                  disabled={isSaving}
                  className={cn(
                    "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                    job.isSaved
                      ? "text-red-500 bg-red-50 hover:bg-red-100"
                      : "text-muted-foreground/40 hover:text-red-500 hover:bg-red-50/80",
                    isSaving && "opacity-70 cursor-wait"
                  )}
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Heart className={cn("h-4 w-4", job.isSaved && "fill-current")} />
                  )}
                </button>
              )}
            </div>

            {/* Company Name */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (job.company?._id) navigate(`/company/${job.company._id}`);
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 mb-3"
            >
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{job.company?.name}</span>
            </button>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {/* Salary — most prominent */}
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
                "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
              )}>
                <DollarSign className="h-3 w-3" />
                {formatSalary(job.salaryMin || job.minSalary, job.salaryMax || job.maxSalary)}
              </span>

              {job.type && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border",
                  typeConfig.bg, typeConfig.text, typeConfig.border
                )}>
                  <Briefcase className="h-2.5 w-2.5" />
                  {typeConfig.label}
                </span>
              )}

              {job.workType && (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium",
                  workTypeCfg.bg, workTypeCfg.text
                )}>
                  {workTypeCfg.label}
                </span>
              )}
            </div>

            {/* Location & Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {job.location?.province && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location.district ? `${job.location.district}, ` : ''}{job.location.province}
                </span>
              )}
              {distance && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <MapPin className="h-3 w-3" />
                  {distance}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(job.createdAt)}
              </span>
              {job.applicantCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {job.applicantCount} ứng viên
                </span>
              )}
            </div>

            {/* Skills */}
            {!compact && job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-muted/60 text-muted-foreground rounded-md border border-border/40 hover:bg-primary/8 hover:text-primary hover:border-primary/20 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="px-2 py-0.5 text-xs bg-muted/40 text-muted-foreground/70 rounded-md">
                    +{job.skills.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Deadline Warning */}
            {job.deadline && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-200/70">
                <Clock className="h-3 w-3" />
                Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3.5 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {job.experience && (
              <span className="px-2 py-0.5 bg-muted/50 rounded-md">{job.experience?.replace('_', ' ')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCardClick}
              className="h-8 rounded-lg px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/8 transition-all duration-200"
            >
              Xem chi tiết
            </Button>
            <Button
              size="sm"
              onClick={handleApplyJob}
              className={cn(
                "h-8 rounded-lg px-4 text-xs font-semibold shadow-sm transition-all duration-200",
                "hover:scale-[1.03] active:scale-[0.98]",
                job.isApplied
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
              )}
            >
              {job.isApplied ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5 mr-1.5" />
              )}
              {job.isApplied ? "Ứng tuyển lại" : "Ứng tuyển ngay"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobResultCard;
