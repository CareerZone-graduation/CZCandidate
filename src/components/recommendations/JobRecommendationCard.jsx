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
        "group cursor-pointer border-2 border-primary/30",
        "hover:border-primary hover:shadow-2xl hover:shadow-primary/20",
        "transition-all duration-500",
        "bg-gradient-to-br from-primary/5 via-card to-card",
        "overflow-hidden relative"
      )}
      onClick={handleCardClick}
    >
      {/* Recommendation Badge */}
      <div className="absolute top-4 right-4 z-20">
        <Badge 
          className={cn(
            "px-3 py-1.5 rounded-full font-bold text-sm border-2",
            getScoreColor(job.recommendationScore || 0),
            "shadow-lg animate-pulse"
          )}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {job.recommendationScore || 0}% phù hợp
        </Badge>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className={cn(
              "rounded-2xl border-2 border-primary/40 bg-white shadow-lg",
              "group-hover:shadow-2xl group-hover:border-primary group-hover:scale-105",
              "transition-all duration-500 overflow-hidden",
              "h-32 w-32"
            )}>
              <Avatar className="h-full w-full rounded-2xl">
                <AvatarImage
                  src={job.recruiterProfileId?.company?.logo}
                  alt={job.recruiterProfileId?.company}
                  className="object-cover"
                />
                <AvatarFallback className={cn(
                  "bg-gradient-to-br from-primary/30 via-primary/20 to-transparent",
                  "text-primary font-bold rounded-2xl text-3xl"
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
                  "font-bold text-foreground line-clamp-2 mb-2 text-2xl",
                  "group-hover:text-primary transition-all duration-300"
                )}>
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary/80 transition-all duration-300">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold truncate">{job.recruiterProfileId?.company || 'Công ty'}</span>
                </div>
              </div>
              
              {/* Save Button */}
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
            </div>

            {/* Recommendation Reasons */}
            {job.recommendationReasons && job.recommendationReasons.length > 0 && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Lý do gợi ý:</span>
                </div>
                <div className="space-y-1">
                  {job.recommendationReasons.slice(0, 3).map((reason, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{reason.value}</span>
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
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 border border-blue-500/20"
                >
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
              )}
              
              {job.workType && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500/10 to-blue-500/10 text-indigo-600 border-2 border-indigo-500/30"
                >
                  {job.workType}
                </Badge>
              )}
              
              <Badge 
                variant="outline" 
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 border-2 border-emerald-500/30"
              >
                <DollarSign className="h-3 w-3 mr-1" />
                {formatSalary(job.minSalary, job.maxSalary)}
              </Badge>
              
              {job.location?.province && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 border-2 border-blue-500/30"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location.province}
                </Badge>
              )}
            </div>

            {/* Job Description */}
            {job.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4 group-hover:text-foreground transition-colors duration-300">
                {job.description}
              </p>
            )}

            {/* Job Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.slice(0, 4).map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs font-medium px-3 py-1 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/30"
                  >
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 4 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-2 border-primary/40"
                  >
                    +{job.skills.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(job.createdAt)}
                </div>
                {job.recommendedAt && (
                  <div className="flex items-center gap-1 text-primary">
                    <Sparkles className="h-3 w-3" />
                    Gợi ý {formatTimeAgo(job.recommendedAt)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCardClick}
                  className="text-xs font-semibold px-4 py-2 rounded-lg border-2 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300"
                >
                  Xem chi tiết
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleApplyJob}
                  className="btn-gradient text-primary-foreground text-xs font-bold px-5 py-2 rounded-lg hover:scale-110 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
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
