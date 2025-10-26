import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/apiClient';

const getProfileCompleteness = async () => {
  const response = await apiClient.get('/candidate/profile/completeness');
  return response.data;
};

export const ProfileCompletenessBar = ({ className, showDetails = true }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['profileCompleteness'],
    queryFn: getProfileCompleteness,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
          <div className="h-2 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const completeness = data?.completeness || 0;
  const missingFields = data?.missingFields || [];
  const recommendations = data?.recommendations || [];

  const getCompletenessColor = (percentage) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-600';
    if (percentage >= 60) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">
            Độ hoàn thiện hồ sơ
          </h3>
          <span className={cn('text-lg font-bold', getCompletenessColor(completeness))}>
            {completeness}%
          </span>
        </div>

        <div className="relative">
          <Progress value={completeness} className="h-2" />
          <div
            className={cn(
              'absolute top-0 left-0 h-2 rounded-full transition-all',
              getProgressColor(completeness)
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>

        {showDetails && (
          <div className="mt-4 space-y-3">
            {completeness >= 60 ? (
              <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Hồ sơ của bạn đã đủ để nhận gợi ý việc làm!
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Hoàn thiện thêm {60 - completeness}% để nhận gợi ý việc làm phù hợp
                </p>
              </div>
            )}

            {missingFields.length > 0 && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Thông tin còn thiếu:
                </p>
                <ul className="space-y-1">
                  {missingFields.slice(0, 3).map((field, index) => (
                    <li key={index} className="text-xs text-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {field}
                    </li>
                  ))}
                  {missingFields.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      và {missingFields.length - 3} thông tin khác...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Gợi ý:</p>
                <p>{recommendations[0]}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
