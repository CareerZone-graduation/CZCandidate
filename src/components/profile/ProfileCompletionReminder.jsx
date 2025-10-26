import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfileRecommendations } from '@/services/profileService';

export const ProfileCompletionReminder = ({ 
  profileCompleteness, 
  onDismiss,
  showDismiss = true,
  collapsible = true 
}) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await getProfileRecommendations();
        if (response.success && response.data) {
          setRecommendations(response.data);
        }
      } catch (err) {
        console.error('Lỗi khi lấy gợi ý cải thiện hồ sơ:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (profileCompleteness && profileCompleteness.percentage < 100) {
      fetchRecommendations();
    }
  }, [profileCompleteness]);

  if (!profileCompleteness || profileCompleteness.percentage === 100) {
    return null;
  }

  const { percentage = 0 } = profileCompleteness;

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

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-600 text-white';
      case 'important':
        return 'bg-amber-600 text-white';
      case 'optional':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className={cn("border-2", getColorClass(percentage))}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <TrendingUp className={cn("w-6 h-6 flex-shrink-0 mt-0.5", getIconColor(percentage))} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className={cn("text-lg", getTextColor(percentage))}>
                  Hoàn thiện hồ sơ để tăng cơ hội việc làm
                </CardTitle>
                <Badge className={cn("font-bold", getTextColor(percentage))}>
                  {percentage}%
                </Badge>
              </div>
              <Progress value={percentage} className="h-2 mb-2" />
              <p className={cn("text-sm", getMutedTextColor(percentage))}>
                {percentage < 60 ? (
                  <>⚠️ Hồ sơ chưa đủ để nhận gợi ý việc làm (cần tối thiểu 60%)</>
                ) : percentage < 80 ? (
                  <>💡 Hoàn thiện thêm để nhận gợi ý việc làm tốt hơn</>
                ) : (
                  <>🎯 Hồ sơ gần hoàn thiện! Hoàn thành các mục còn lại</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Không thể tải gợi ý. Vui lòng thử lại sau.
            </div>
          ) : recommendations ? (
            <div className="space-y-4">
              {/* Critical Items */}
              {recommendations.recommendations.critical.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                      Cần hoàn thành ngay ({recommendations.recommendations.critical.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {recommendations.recommendations.critical.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                            {item.message}
                          </p>
                          <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                            {item.impact}
                          </p>
                        </div>
                        <Link to="/dashboard/profile">
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            {item.action}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Items */}
              {recommendations.recommendations.important.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Nên hoàn thành ({recommendations.recommendations.important.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {recommendations.recommendations.important.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800"
                      >
                        <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            {item.message}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            {item.impact}
                          </p>
                        </div>
                        <Link to="/dashboard/profile">
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            {item.action}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Items */}
              {recommendations.recommendations.optional.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-600" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Tùy chọn ({recommendations.recommendations.optional.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {recommendations.recommendations.optional.slice(0, 2).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.message}
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                            {item.impact}
                          </p>
                        </div>
                        <Link to="/dashboard/profile">
                          <Button size="sm" variant="outline" className="flex-shrink-0">
                            {item.action}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Link to="/dashboard/profile">
                  <Button className="w-full" size="lg">
                    Hoàn thiện hồ sơ ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Không có gợi ý nào
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
