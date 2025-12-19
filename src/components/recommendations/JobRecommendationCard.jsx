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
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatSalary, formatTimeAgo } from '@/utils/formatters';

/**
 * JobRecommendationCard component for displaying recommended jobs
 * Includes recommendation score, reasons, and action buttons
 */
const JobRecommendationCard = ({ job, onSaveToggle }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const handleCardClick = () => {
    navigate(`/jobs/${job._id}`);
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

      await queryClient.cancelQueries({ queryKey: ['recommendations'] });
      const previousData = queryClient.getQueryData(['recommendations']);

      queryClient.setQueryData(['recommendations'], (oldData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map(j =>
              j._id === job._id ? { ...j, isSaved: !j.isSaved } : j
            )
          }))
        };
      });

      return { previousData };
    },
    onSuccess: () => {
      if (onSaveToggle) return;
      toast.success(job.isSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm thành công');
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
    },
    onError: (err, _vars, context) => {
      if (onSaveToggle) return;
      if (context?.previousData) {
        queryClient.setQueryData(['recommendations'], context.previousData);
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

  const handleApplyJob = (event) => {
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      navigate('/login');
      return;
    }

    navigate(`/jobs/${job._id}`);
  };

  // Get score color based on recommendation score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer border border-primary/20",
        "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        "transition-all duration-300",
        "bg-gradient-to-br from-card via-card to-primary/5",
        "overflow-hidden relative"
      )}
      onClick={handleCardClick}
    >
      {/* Recommendation Badge */}
      <div className="absolute top-4 right-4 z-20">
        <Badge
          className={cn(
            "px-3 py-1.5 rounded-full font-bold text-sm border shadow-sm",
            getScoreColor(job.recommendationScore || 0),
            "backdrop-blur-md bg-opacity-90"
          )}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {job.recommendationScore || 0}% phù hợp
        </Badge>
      </div>

      {/* Gradient overlay - simplified and faster */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className={cn(
              "rounded-xl border border-border bg-white shadow-sm",
              "group-hover:shadow-md group-hover:border-primary/30",
              "transition-all duration-300 overflow-hidden",
              "h-24 w-24 flex items-center justify-center p-2"
            )}>
              <Avatar className="h-full w-full rounded-lg">
                <AvatarImage
                  src={job.recruiterProfileId?.company?.logo}
                  alt={job.recruiterProfileId?.company}
                  className="object-contain"
                />
                <AvatarFallback className={cn(
                  "bg-primary/5 text-primary/80 font-bold rounded-lg text-2xl"
                )}>
                  {job.recruiterProfileId?.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-bold text-foreground line-clamp-2 mb-1 text-xl",
                  "group-hover:text-primary transition-colors duration-300"
                )}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium truncate text-sm">{job.recruiterProfileId?.company || 'Công ty'}</span>
                </div>
              </div>

              {/* Save Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveJob}
                className={cn(
                  "flex-shrink-0 rounded-full h-10 w-10 transition-all duration-300",
                  "hover:bg-red-50 hover:scale-110",
                  job.isSaved
                    ? "text-red-500 hover:text-red-600 bg-red-50"
                    : "text-muted-foreground hover:text-red-500"
                )}
              >
                <Heart className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  job.isSaved && "fill-red-500 scale-110"
                )} />
              </Button>
            </div>

            {/* Recommendation Reasons */}
            {job.recommendationReasons && job.recommendationReasons.length > 0 && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10 group-hover:border-primary/20 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">Điểm nổi bật</span>
                </div>
                <div className="space-y-1">
                  {job.recommendationReasons.slice(0, 3).map((reason, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{reason.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Info Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.type && (
                <Badge
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
              )}

              {job.workType && (
                <Badge
                  variant="outline"
                  className="px-2.5 py-0.5 text-xs font-medium border-indigo-200 text-indigo-700 bg-indigo-50/50"
                >
                  {job.workType}
                </Badge>
              )}

              <Badge
                variant="outline"
                className="px-2.5 py-0.5 text-xs font-medium border-emerald-200 text-emerald-700 bg-emerald-50/50"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.minSalary, job.maxSalary)}
              </Badge>

              {job.location?.province && (
                <Badge
                  variant="outline"
                  className="px-2.5 py-0.5 text-xs font-medium border-slate-200 text-slate-700 bg-slate-50/50"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location.province}
                </Badge>
              )}
            </div>

            {/* Job Description - Optional */}

            {/* Job Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    +{job.skills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-border/60">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1" title={`Đăng ${formatTimeAgo(job.createdAt)}`}>
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(job.createdAt)}
                </div>
                {job.recommendedAt && (
                  <div className="flex items-center gap-1 text-primary/80 font-medium">
                    <Sparkles className="h-3 w-3" />
                    Gợi ý mới
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCardClick}
                  className="text-xs h-8 px-3 font-medium text-foreground hover:text-primary hover:bg-primary/5"
                >
                  Chi tiết
                </Button>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleApplyJob}
                  className="text-xs h-8 px-4 font-bold shadow-none hover:shadow-lg"
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

export default JobRecommendationCard;
