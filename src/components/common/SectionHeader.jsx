import { Badge } from '@/components/ui/badge';

/**
 * Reusable section header component for consistent styling across sections
 * @param {{
 *   badgeText?: string;
 *   title: string | React.ReactNode;
 *   description?: string;
 *   badgeVariant?: "default" | "secondary" | "destructive" | "outline";
 *   className?: string;
 * }} props
 */
export const SectionHeader = ({ 
  badgeText, 
  title, 
  description, 
  badgeVariant = "outline",
  className = "" 
}) => (
  <div className={`text-center mb-16 ${className}`}>
    {badgeText && (
      <Badge 
        variant={badgeVariant} 
        className="px-4 py-2 text-sm font-medium text-primary border-primary/30 bg-background mb-4"
      >
        {badgeText}
      </Badge>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
      {title}
    </h2>
    {description && (
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    )}
  </div>
);