import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMPLETENESS_ITEMS = [
  {
    key: 'hasBasicInfo',
    label: 'Thông tin cơ bản',
    description: 'Số điện thoại, giới thiệu, ảnh đại diện',
    weight: 40
  },
  {
    key: 'hasSkills',
    label: 'Kỹ năng',
    description: 'Ít nhất 3 kỹ năng',
    weight: 15
  },
  {
    key: 'hasCV',
    label: 'CV',
    description: 'Upload CV của bạn',
    weight: 15
  },
  {
    key: 'hasExperience',
    label: 'Kinh nghiệm làm việc',
    description: 'Tùy chọn - phù hợp cho người có kinh nghiệm',
    weight: 15,
    optional: true
  },
  {
    key: 'hasEducation',
    label: 'Học vấn',
    description: 'Tùy chọn - thêm thông tin học vấn',
    weight: 15,
    optional: true
  }
];

export const ProfileCompletenessCard = ({ profileCompleteness, profile }) => {
  // Debug log
  console.log('ProfileCompletenessCard received:', profileCompleteness);
  
  // If backend doesn't return profileCompleteness, calculate it on frontend
  let data = profileCompleteness;
  
  if (!data && profile) {
    console.log('Calculating profileCompleteness on frontend (backend not ready)');
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
  
  // Determine color based on percentage
  const getPercentageColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600';
    if (pct >= 60) return 'text-blue-600';
    if (pct >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getProgressColor = (pct) => {
    if (pct >= 85) return 'bg-emerald-600';
    if (pct >= 60) return 'bg-blue-600';
    if (pct >= 40) return 'bg-amber-600';
    return 'bg-rose-600';
  };

  const getStatusBadge = (pct) => {
    if (pct === 100) return { label: 'Hoàn hảo', variant: 'default', className: 'bg-emerald-600' };
    if (pct >= 85) return { label: 'Tốt', variant: 'default', className: 'bg-blue-600' };
    if (pct >= 60) return { label: 'Khá', variant: 'default', className: 'bg-amber-600' };
    if (pct >= 40) return { label: 'Trung bình', variant: 'secondary' };
    return { label: 'Cần hoàn thiện', variant: 'destructive' };
  };

  const statusBadge = getStatusBadge(percentage);
  const completedCount = COMPLETENESS_ITEMS.filter(item => data[item.key]).length;
  const totalCount = COMPLETENESS_ITEMS.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Độ hoàn thiện hồ sơ</CardTitle>
          <Badge variant={statusBadge.variant} className={statusBadge.className}>
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Percentage Circle */}
        <div className="text-center py-4">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
                className={cn(getProgressColor(percentage), "transition-all duration-1000 ease-out")}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", getPercentageColor(percentage))}>
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {completedCount}/{totalCount} mục
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar (alternative view) */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {percentage === 100 ? (
              '🎉 Hồ sơ của bạn đã hoàn chỉnh!'
            ) : (
              `Còn ${100 - percentage}% để hoàn thiện`
            )}
          </p>
        </div>

        {/* Completeness Items */}
        <div className="space-y-3 pt-2">
          <p className="text-sm font-semibold text-foreground">Chi tiết:</p>
          {COMPLETENESS_ITEMS.map((item) => {
            const isCompleted = data[item.key];
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors",
                  isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-muted/50"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-medium",
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </p>
                    {item.optional && (
                      <Badge variant="outline" className="text-xs">
                        Tùy chọn
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  {item.weight}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips Section */}
        {percentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 Mẹo tăng % hoàn thiện
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  {!data.hasBasicInfo && (
                    <li>• Cập nhật số điện thoại và giới thiệu bản thân</li>
                  )}
                  {!data.hasSkills && (
                    <li>• Thêm ít nhất 3 kỹ năng của bạn</li>
                  )}
                  {!data.hasCV && (
                    <li>• Upload CV để tăng cơ hội được tuyển dụng</li>
                  )}
                  {percentage >= 40 && percentage < 100 && (
                    <li>• Thêm kinh nghiệm & học vấn để nổi bật hơn</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {percentage === 100 && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              🎉 Tuyệt vời! Hồ sơ của bạn đã hoàn chỉnh
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Bạn đã sẵn sàng để ứng tuyển!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
