import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Reusable FilterGroup component for radio button filters
 * Used for category, job type, work type, and experience filters
 */
const FilterGroup = ({
  title,
  value,
  options = [],
  onChange,
  className,
  showClearButton = true,
  layout = 'vertical', // 'vertical' or 'horizontal'
  collapsible = true, // Enable collapsible functionality
  defaultExpanded = false, // Default expansion state
  maxVisibleItems = 5, // Maximum items to show when collapsed
  allowFullCollapse = true // Allow collapsing to just title
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);
  /**
   * Handle value change
   * @param {string} newValue - New selected value
   */
  const handleValueChange = (newValue) => {
    // If the same value is selected, clear it (toggle behavior)
    const valueToSet = newValue === value ? '' : newValue;
    onChange(valueToSet);
  };

  /**
   * Clear the selected value
   */
  const handleClear = () => {
    onChange('');
  };

  /**
   * Toggle full collapse state
   */
  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  /**
   * Toggle expanded state
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine which options to show
  const shouldCollapse = collapsible && options.length > maxVisibleItems;
  const visibleOptions = shouldCollapse && !isExpanded 
    ? options.slice(0, maxVisibleItems)
    : options;
  const hiddenCount = options.length - maxVisibleItems;

  return (
    <Card className={cn("border-none shadow-none", className)}>
      <CardHeader className={cn("pb-3", isFullyCollapsed && "pb-0")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              {title}
            </CardTitle>
            {/* Show selected value when collapsed */}
            {isFullyCollapsed && value && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                {options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value)?.label || 
                 options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value) || 
                 value}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showClearButton && value && !isFullyCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {allowFullCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullCollapse}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                {isFullyCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      {!isFullyCollapsed && (
        <CardContent className="pt-0">
          <RadioGroup
            value={value || ''}
            onValueChange={handleValueChange}
            className={cn(
              layout === 'horizontal' 
                ? "flex flex-wrap gap-4" 
                : "space-y-3"
            )}
          >
            {visibleOptions.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              
              return (
                <div 
                  key={optionValue} 
                  className={cn(
                    "flex items-center space-x-2",
                    layout === 'horizontal' && "flex-none"
                  )}
                >
                  <RadioGroupItem 
                    value={optionValue} 
                    id={`${title}-${optionValue}`}
                    className="text-primary"
                  />
                  <Label 
                    htmlFor={`${title}-${optionValue}`}
                    className={cn(
                      "text-sm font-medium cursor-pointer",
                      "text-muted-foreground hover:text-foreground",
                      "transition-colors duration-200",
                      value === optionValue && "text-primary font-semibold"
                    )}
                  >
                    <span>{optionLabel}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {/* Expand/Collapse Button */}
          {shouldCollapse && (
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Xem thêm {hiddenCount} mục
                  </>
                )}
              </Button>
            </div>
          )}
          
          {options.length === 0 && (
            <div className="text-sm text-muted-foreground py-2">
              Không có tùy chọn nào
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default FilterGroup;