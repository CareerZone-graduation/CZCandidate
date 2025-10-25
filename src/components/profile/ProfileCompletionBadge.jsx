import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const ProfileCompletionBadge = ({ percentage = 0, size = 'default' }) => {
  if (percentage === 100) {
    return (
      <Badge 
        variant="default" 
        className={cn(
          "bg-emerald-600 hover:bg-emerald-700",
          size === 'sm' && "text-xs px-1.5 py-0"
        )}
      >
        ✓ 100%
      </Badge>
    );
  }

  const getVariant = (pct) => {
    if (pct >= 70) return { variant: 'default', className: 'bg-blue-600 hover:bg-blue-700' };
    if (pct >= 40) return { variant: 'default', className: 'bg-amber-600 hover:bg-amber-700' };
    return { variant: 'destructive' };
  };

  const style = getVariant(percentage);

  return (
    <Badge 
      variant={style.variant}
      className={cn(
        style.className,
        size === 'sm' && "text-xs px-1.5 py-0"
      )}
    >
      {percentage}%
    </Badge>
  );
};
