import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Building,
  ArrowRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatSalary, formatTimeAgo } from '@/utils/formatters';

/**
 * JobMarkerPopup - Compact job information popup for map markers
 * Displays essential job details when clicking on a marker
 */
const JobMarkerPopup = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/jobs/${job._id}`);
  };

  // Format location string
  const locationString = [
    job.location?.district,
    job.location?.province
  ].filter(Boolean).join(', ');

  // Get salary range
  const salaryRange = formatSalary(job.minSalary, job.maxSalary);

  return (
    <div className="w-[320px] bg-card rounded-lg shadow-lg overflow-hidden">
      {/* Header with company info */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
            <AvatarImage
              src={job.company?.logo}
              alt={job.company?.name}
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {job.company?.name?.charAt(0) || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job.company?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job details */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-clamp-1">
            {locationString || 'Chưa cập nhật'}
          </span>
        </div>

        {/* Salary */}
        {salaryRange && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-green-600">
              {salaryRange}
            </span>
          </div>
        )}

        {/* Experience & Type */}
        <div className="flex flex-wrap gap-2">
          {job.experience && (
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.experience.replace(/_/g, ' ')}
            </Badge>
          )}
          {job.type && (
            <Badge variant="outline" className="text-xs">
              {job.type.replace(/_/g, ' ')}
            </Badge>
          )}
          {job.workType && (
            <Badge variant="secondary" className="text-xs">
              {job.workType.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>

        {/* Deadline */}
        {job.deadline && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Hạn nộp: {formatTimeAgo(job.deadline)}
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleViewDetails}
          className={cn(
            "w-full btn-gradient text-white font-semibold",
            "hover:scale-[1.02] transition-all duration-300",
            "shadow-lg shadow-primary/20"
          )}
          size="sm"
        >
          Xem chi tiết
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default JobMarkerPopup;
