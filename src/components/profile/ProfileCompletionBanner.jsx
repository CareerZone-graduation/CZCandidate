import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProfileCompletionBanner = ({ profileCompleteness, profile }) => {
  // Debug log
  console.log('ProfileCompletionBanner received:', profileCompleteness);
  
  // If backend doesn't return profileCompleteness, calculate it on frontend
  let data = profileCompleteness;
  
  if (!data && profile) {
    console.log('Calculating profileCompleteness on frontend for banner');
    data = {
      hasBasicInfo: !!(profile.phone && profile.bio && profile.avatar),
      hasExperience: (profile.experiences || []).length > 0,
      hasEducation: (profile.educations || []).length > 0,
      hasSkills: (profile.skills || []).length >= 3,
      hasCV: (profile.cvs || []).length > 0,
      percentage: 0
    };
    
    // Calculate percentage
    const weights = {
      hasBasicInfo: 40,
      hasSkills: 15,
      hasCV: 15,
      hasExperience: 15,
      hasEducation: 15
    };
    
    data.percentage = Math.round(
      (data.hasBasicInfo ? weights.hasBasicInfo : 0) +
      (data.hasSkills ? weights.hasSkills : 0) +
      (data.hasCV ? weights.hasCV : 0) +
      (data.hasExperience ? weights.hasExperience : 0) +
      (data.hasEducation ? weights.hasEducation : 0)
    );
  }
  
  if (!data) {
    console.log('No profileCompleteness data - returning null');
    return null;
  }

  const { percentage = 0 } = data;

  // Don't show if 100% complete
  if (percentage === 100) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              🎉 Hồ sơ hoàn chỉnh!
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
              Hồ sơ của bạn đã được hoàn thiện 100%. Bạn có thể bắt đầu ứng tuyển ngay!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getColorClass = (pct) => {
    if (pct >= 70) return 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800';
    if (pct >= 40) return 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800';
    return 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800';
  };

  const getTextColor = (pct) => {
    if (pct >= 70) return 'text-blue-900 dark:text-blue-100';
    if (pct >= 40) return 'text-amber-900 dark:text-amber-100';
    return 'text-rose-900 dark:text-rose-100';
  };

  const getMutedTextColor = (pct) => {
    if (pct >= 70) return 'text-blue-700 dark:text-blue-300';
    if (pct >= 40) return 'text-amber-700 dark:text-amber-300';
    return 'text-rose-700 dark:text-rose-300';
  };

  const getIconColor = (pct) => {
    if (pct >= 70) return 'text-blue-600';
    if (pct >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const missingItems = [];
  if (!data.hasBasicInfo) missingItems.push('thông tin cơ bản');
  if (!data.hasSkills) missingItems.push('kỹ năng');
  if (!data.hasCV) missingItems.push('CV');

  return (
    <div className={cn(
      "bg-gradient-to-r rounded-lg p-4 border",
      getColorClass(percentage)
    )}>
      <div className="flex items-start gap-3">
        <TrendingUp className={cn("w-6 h-6 flex-shrink-0 mt-0.5", getIconColor(percentage))} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className={cn("text-base font-semibold", getTextColor(percentage))}>
              Hồ sơ chưa hoàn chỉnh
            </h3>
            <Badge 
              variant="secondary" 
              className={cn("font-bold text-sm", getTextColor(percentage))}
            >
              {percentage}%
            </Badge>
          </div>
          
          <Progress value={percentage} className="h-2 mb-2" />
          
          <p className={cn("text-sm", getMutedTextColor(percentage))}>
            {missingItems.length > 0 ? (
              <>
                Còn thiếu: <strong>{missingItems.join(', ')}</strong>. 
                Hoàn thiện hồ sơ để tăng cơ hội được tuyển dụng lên đến 70%!
              </>
            ) : (
              <>
                Thêm kinh nghiệm và học vấn để hồ sơ của bạn nổi bật hơn!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
