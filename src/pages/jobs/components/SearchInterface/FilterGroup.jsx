import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';

const FilterGroup = ({
  title,
  value,
  options = [],
  onChange,
  className = '',
  showClearButton = true,
  layout = 'vertical', // 'vertical' or 'horizontal'
  collapsible = true,
  defaultExpanded = false,
  maxVisibleItems = 5,
  allowFullCollapse = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);

  const handleValueChange = (newValue) => {
    const valueToSet = newValue === value ? '' : newValue;
    onChange(valueToSet);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldCollapse = collapsible && options.length > maxVisibleItems;
  const visibleOptions = shouldCollapse && !isExpanded 
    ? options.slice(0, maxVisibleItems)
    : options;
  const hiddenCount = options.length - maxVisibleItems;

  return (
    <div className={`border rounded-lg bg-white shadow-sm transition-all duration-300 ${className}`}>
      <div 
        className={`
          flex items-center justify-between p-4 cursor-pointer
          bg-gray-50 hover:bg-gray-100 transition-colors duration-200
          rounded-t-lg
          ${isFullyCollapsed ? 'rounded-b-lg' : ''}
        `}
        onClick={allowFullCollapse ? toggleFullCollapse : undefined}
        role={allowFullCollapse ? 'button' : undefined}
        aria-expanded={!isFullyCollapsed}
      >
        <div className="flex items-center gap-3">
          <ChevronRight 
            className={`
              h-5 w-5 text-gray-500 transition-transform duration-300
              ${isFullyCollapsed ? 'rotate-0' : 'rotate-90'}
            `}
          />
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
          {isFullyCollapsed && value && (
            <span className="text-sm text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full font-medium">
              {options.find(opt => (typeof opt === 'string' ? opt : opt.value) === value)?.label || value}
            </span>
          )}
        </div>
        {showClearButton && value && !isFullyCollapsed && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Xóa bộ lọc"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!isFullyCollapsed && (
        <div className="p-4 animate-slide-down">
          <div 
            className={`
              ${layout === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}
            `}
            role="radiogroup"
            aria-label={title}
          >
            {visibleOptions.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;

              return (
                <label
                  key={optionValue}
                  className={`
                    flex items-center gap-2 p-2 rounded-md cursor-pointer
                    transition-all duration-200
                    hover:bg-gray-100
                    ${value === optionValue ? 'bg-blue-50 border border-blue-200' : ''}
                    ${layout === 'horizontal' ? 'flex-none' : ''}
                  `}
                >
                  <input
                    type="radio"
                    value={optionValue}
                    checked={value === optionValue}
                    onChange={() => handleValueChange(optionValue)}
                    className="
                      h-4 w-4 text-blue-600 border-gray-300 
                      focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    "
                    id={`${title}-${optionValue}`}
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {optionLabel}
                  </span>
                </label>
              );
            })}
          </div>

          {shouldCollapse && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={toggleExpanded}
                className="
                  w-full flex items-center justify-center gap-1
                  text-sm text-gray-500 hover:text-gray-700
                  py-2 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Xem thêm {hiddenCount} mục
                  </>
                )}
              </button>
            </div>
          )}

          {options.length === 0 && (
            <p className="text-sm text-gray-500 py-2">
              Không có tùy chọn nào
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterGroup;