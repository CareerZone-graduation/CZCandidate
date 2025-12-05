import React, { useState } from 'react';
import { ChevronDown, Check, Briefcase, Clock, Building, Award, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  briefcase: Briefcase,
  clock: Clock,
  building: Building,
  award: Award,
  tag: Tag
};

const FilterGroup = ({
  title,
  icon = 'tag',
  value,
  options = [],
  onChange,
  className = '',
  collapsible = true,
  defaultExpanded = false,
  maxVisibleItems = 5
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const IconComponent = iconMap[icon] || Tag;

  const handleValueChange = (newValue) => {
    const valueToSet = newValue === value ? '' : newValue;
    onChange(valueToSet);
  };

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const shouldShowMore = options.length > maxVisibleItems;
  const visibleOptions = showAll ? options : options.slice(0, maxVisibleItems);
  const hiddenCount = options.length - maxVisibleItems;

  const selectedLabel = options.find(opt => 
    (typeof opt === 'string' ? opt : opt.value) === value
  );

  return (
    <div className={cn("border-b border-slate-100 last:border-0", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={cn(
          "w-full flex items-center justify-between py-3 px-1",
          "text-left transition-colors hover:bg-slate-50 rounded-lg -mx-1",
          collapsible && "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium text-slate-800 text-sm">{title}</span>
            {!isExpanded && value && selectedLabel && (
              <p className="text-xs text-primary font-medium mt-0.5">
                {typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label}
              </p>
            )}
          </div>
        </div>
        
        {collapsible && (
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Options */}
      {isExpanded && (
        <div className="pb-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {visibleOptions.map((option) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            const isSelected = value === optionValue;

            return (
              <button
                key={optionValue}
                type="button"
                onClick={() => handleValueChange(optionValue)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                  "transition-all duration-150",
                  isSelected 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                  "transition-all duration-150",
                  isSelected 
                    ? "bg-primary border-primary" 
                    : "border-slate-300"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={cn(
                  "text-sm",
                  isSelected && "font-medium"
                )}>
                  {optionLabel}
                </span>
              </button>
            );
          })}

          {/* Show More/Less Button */}
          {shouldShowMore && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className={cn(
                "w-full flex items-center justify-center gap-1 py-2 mt-1",
                "text-xs font-medium text-primary hover:text-primary/80",
                "transition-colors"
              )}
            >
              {showAll ? (
                <>Thu gọn</>
              ) : (
                <>Xem thêm {hiddenCount} mục</>
              )}
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                showAll && "rotate-180"
              )} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;
