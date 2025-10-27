import { Badge } from '@/components/ui/badge';

const LEVEL_CONFIG = {
  'Beginner': {
    label: 'Cơ bản',
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    dots: 1
  },
  'Intermediate': {
    label: 'Trung cấp',
    color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    dots: 2
  },
  'Advanced': {
    label: 'Nâng cao',
    color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    dots: 3
  },
  'Expert': {
    label: 'Chuyên gia',
    color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    dots: 4
  }
};

export const SkillLevelIndicator = ({ level, showDots = false }) => {
  const config = LEVEL_CONFIG[level];
  
  if (!config) return null;

  if (showDots) {
    return (
      <div className="flex items-center gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              i < config.dots ? 'bg-current' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.color}`}>
      {config.label}
    </Badge>
  );
};
