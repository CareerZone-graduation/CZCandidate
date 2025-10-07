import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Circle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ProfileCompletion component
 * Gamified profile completion tracker to encourage users to complete their profile
 */
const ProfileCompletion = ({
  profile = {},
  onActionClick,
  className
}) => {
  // Calculate completion percentage and items
  const completionData = useMemo(() => {
    const items = [
      {
        id: 'basic',
        label: 'Thông tin cơ bản',
        description: 'Họ tên, email, số điện thoại',
        completed: !!(profile.fullName && profile.email && profile.phone),
        weight: 15,
        icon: User,
        action: 'editBasicInfo'
      },
      {
        id: 'bio',
        label: 'Giới thiệu bản thân',
        description: 'Viết vài dòng về bạn',
        completed: !!(profile.bio && profile.bio.length >= 50),
        weight: 10,
        icon: FileText,
        action: 'editBio'
      },
      {
        id: 'experience',
        label: 'Kinh nghiệm làm việc',
        description: 'Thêm ít nhất 1 kinh nghiệm',
        completed: !!(profile.experiences && profile.experiences.length > 0),
        weight: 25,
        icon: Briefcase,
        action: 'addExperience'
      },
      {
        id: 'education',
        label: 'Học vấn',
        description: 'Thêm thông tin học vấn',
        completed: !!(profile.educations && profile.educations.length > 0),
        weight: 15,
        icon: GraduationCap,
        action: 'addEducation'
      },
      {
        id: 'skills',
        label: 'Kỹ năng',
        description: 'Thêm ít nhất 3 kỹ năng',
        completed: !!(profile.skills && profile.skills.length >= 3),
        weight: 20,
        icon: Code,
        action: 'addSkills'
      },
      {
        id: 'cv',
        label: 'CV/Resume',
        description: 'Tải lên hoặc tạo CV',
        completed: !!(profile.cvs && profile.cvs.length > 0),
        weight: 15,
        icon: FileText,
        action: 'uploadCV'
      }
    ];

    const completedWeight = items.reduce((sum, item) => 
      sum + (item.completed ? item.weight : 0), 0
    );
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const completedCount = items.filter(item => item.completed).length;

    return {
      items,
      percentage,
      completedCount,
      totalCount: items.length
    };
  }, [profile]);

  // Get completion level
  const getCompletionLevel = (percentage) => {
    if (percentage === 100) return {
      label: 'Hoàn hảo',
      color: 'from-emerald-600 to-green-600',
      bgColor: 'from-emerald-500/20 to-green-500/10',
      borderColor: 'border-emerald-500/30',
      icon: Award
    };
    if (percentage >= 75) return {
      label: 'Tốt',
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-500/20 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      icon: TrendingUp
    };
    if (percentage >= 50) return {
      label: 'Trung bình',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'from-amber-500/20 to-orange-500/10',
      borderColor: 'border-amber-500/30',
      icon: Sparkles
    };
    return {
      label: 'Cơ bản',
      color: 'from-gray-600 to-gray-500',
      bgColor: 'from-gray-500/20 to-gray-500/10',
      borderColor: 'border-gray-500/30',
      icon: Circle
    };
  };

  const level = getCompletionLevel(completionData.percentage);

  // Get motivational message
  const getMotivationalMessage = (percentage) => {
    if (percentage === 100) return '🎉 Hồ sơ của bạn đã hoàn thiện! Các nhà tuyển dụng sẽ dễ dàng tìm thấy bạn.';
    if (percentage >= 75) return '👏 Hồ sơ của bạn khá tốt! Hoàn thiện thêm để tăng cơ hội được nhận.';
    if (percentage >= 50) return '📈 Hồ sơ đang được hoàn thiện. Hãy tiếp tục để nổi bật hơn!';
    return '🚀 Bắt đầu hoàn thiện hồ sơ để tăng 300% cơ hội được chú ý!';
  };

  return (
    <Card className={cn(
      "border-2 border-border/50 shadow-xl shadow-primary/10",
      "bg-card/95 backdrop-blur-sm overflow-hidden relative",
      className
    )}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent opacity-30 animate-pulse" />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl",
                `bg-gradient-to-br ${level.bgColor}`,
                `border-2 ${level.borderColor}`
              )}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <level.icon className={cn(
                "h-6 w-6",
                `bg-gradient-to-r ${level.color} bg-clip-text text-transparent`
              )} />
            </motion.div>
            <div>
              <CardTitle className="text-xl font-bold">Hoàn thiện hồ sơ</CardTitle>
              <p className="text-sm text-muted-foreground">
                {completionData.completedCount}/{completionData.totalCount} mục đã hoàn thành
              </p>
            </div>
          </div>
          <Badge className={cn(
            "px-4 py-2 rounded-lg font-bold text-white border-0",
            `bg-gradient-to-r ${level.color}`
          )}>
            {completionData.percentage}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative">
            <Progress 
              value={completionData.percentage} 
              className="h-4 bg-gradient-to-r from-gray-200 to-gray-100"
            />
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${completionData.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {getMotivationalMessage(completionData.percentage)}
          </p>
        </div>

        {/* Completion Items */}
        <div className="space-y-3">
          {completionData.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg transition-all duration-300",
                item.completed 
                  ? "bg-emerald-50/50 border border-emerald-500/20" 
                  : "bg-gray-50/50 border border-border/30 hover:border-primary/30 hover:bg-primary/5"
              )}
            >
              <div className="flex-shrink-0 pt-0.5">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="h-4 w-4 text-primary" />
                  <h4 className={cn(
                    "text-sm font-semibold",
                    item.completed ? "text-foreground" : "text-foreground/80"
                  )}>
                    {item.label}
                  </h4>
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    +{item.weight}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {item.description}
                </p>
                {!item.completed && onActionClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onActionClick(item.action, item)}
                    className={cn(
                      "h-7 px-3 text-xs rounded-lg",
                      "text-primary hover:text-primary-foreground",
                      "hover:bg-primary group"
                    )}
                  >
                    Hoàn thành ngay
                    <ArrowRight className="h-3 w-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        {completionData.percentage < 100 && (
          <div className={cn(
            "p-4 rounded-xl",
            `bg-gradient-to-r ${level.bgColor}`,
            `border-2 ${level.borderColor}`
          )}>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  Lợi ích khi hoàn thiện hồ sơ
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Tăng 300% cơ hội được nhà tuyển dụng chú ý</li>
                  <li>✓ Xuất hiện cao hơn trong kết quả tìm kiếm</li>
                  <li>✓ Nhận gợi ý việc làm phù hợp hơn</li>
                  <li>✓ Được ưu tiên trong các chiến dịch tuyển dụng</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;
