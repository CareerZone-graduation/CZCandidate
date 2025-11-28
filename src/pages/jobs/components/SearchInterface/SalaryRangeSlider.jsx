import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SalaryRangeSlider component with dual-handle slider
 * Professional salary range filter with visual feedback
 */
const SalaryRangeSlider = ({
  minSalary = '',
  maxSalary = '',
  onChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localRange, setLocalRange] = useState([0, 100]);
  const [manualMin, setManualMin] = useState('');
  const [manualMax, setManualMax] = useState('');

  // Salary configuration (in millions VND)
  const MIN_SALARY = 0;
  const MAX_SALARY = 100; // 100 triệu
  const STEP = 1;

  // Convert millions to display format
  const formatSalary = (value) => {
    if (value === 0) return 'Tất cả';
    if (value >= MAX_SALARY) return `${MAX_SALARY}+ triệu`;
    return `${value} triệu`;
  };

  // Initialize from props
  useEffect(() => {
    const min = minSalary ? parseInt(minSalary, 10) / 1000000 : MIN_SALARY;
    const max = maxSalary ? parseInt(maxSalary, 10) / 1000000 : MAX_SALARY;
    
    setLocalRange([Math.max(MIN_SALARY, Math.min(min, MAX_SALARY)), Math.max(MIN_SALARY, Math.min(max, MAX_SALARY))]);
    setManualMin(min > 0 ? min.toString() : '');
    setManualMax(max < MAX_SALARY ? max.toString() : '');
  }, [minSalary, maxSalary]);

  // Handle slider change (only update local state, don't trigger search)
  const handleSliderChange = (newRange) => {
    setLocalRange(newRange);
    setManualMin(newRange[0] > 0 ? newRange[0].toString() : '');
    setManualMax(newRange[1] < MAX_SALARY ? newRange[1].toString() : '');
    // Don't call onChange here - wait for Apply button
  };

  // Handle manual input
  const handleManualMinChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setManualMin(numValue);
  };

  const handleManualMaxChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setManualMax(numValue);
  };

  // Apply filter - this is the ONLY place that triggers search
  const handleApply = () => {
    const min = manualMin ? Math.max(MIN_SALARY, Math.min(parseInt(manualMin, 10), MAX_SALARY)) : localRange[0];
    const max = manualMax ? Math.max(min, Math.min(parseInt(manualMax, 10), MAX_SALARY)) : localRange[1];
    
    setLocalRange([min, max]);
    
    // Only trigger search when Apply button is clicked
    onChange({
      minSalary: min > 0 ? (min * 1000000).toString() : '',
      maxSalary: max < MAX_SALARY ? (max * 1000000).toString() : ''
    });
  };

  // Clear filter
  const handleClear = () => {
    setLocalRange([MIN_SALARY, MAX_SALARY]);
    setManualMin('');
    setManualMax('');
    onChange({ minSalary: '', maxSalary: '' });
  };

  const hasActiveFilter = localRange[0] > MIN_SALARY || localRange[1] < MAX_SALARY;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between cursor-pointer group",
          "p-3 rounded-lg hover:bg-primary/5 transition-all duration-300"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg",
            "bg-gradient-to-br from-emerald-500/20 to-green-500/10",
            "border border-emerald-500/30 transition-all duration-300",
            "group-hover:scale-110"
          )}>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Mức lương</h3>
            {hasActiveFilter && (
              <p className="text-xs text-muted-foreground">
                {formatSalary(localRange[0])} - {formatSalary(localRange[1])}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={cn(
                "h-7 px-2 text-xs rounded-lg",
                "text-red-600 hover:text-red-700 hover:bg-red-50/50"
              )}
            >
              Xóa
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Range Display */}
          <div className="flex items-center justify-between px-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Tối thiểu</p>
              <p className={cn(
                "text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600",
                "bg-clip-text text-transparent"
              )}>
                {formatSalary(localRange[0])}
              </p>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-green-500" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Tối đa</p>
              <p className={cn(
                "text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600",
                "bg-clip-text text-transparent"
              )}>
                {formatSalary(localRange[1])}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="px-3 py-4">
            <Slider
              value={localRange}
              onValueChange={handleSliderChange}
              min={MIN_SALARY}
              max={MAX_SALARY}
              step={STEP}
              className="w-full"
            />
          </div>

          {/* Manual Input */}
          <div className="grid grid-cols-2 gap-3 px-3">
            <div className="space-y-1">
              <Label htmlFor="manual-min" className="text-xs text-muted-foreground">
                Từ (triệu VNĐ)
              </Label>
              <Input
                id="manual-min"
                type="text"
                placeholder="0"
                value={manualMin}
                onChange={(e) => handleManualMinChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply();
                }}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="manual-max" className="text-xs text-muted-foreground">
                Đến (triệu VNĐ)
              </Label>
              <Input
                id="manual-max"
                type="text"
                placeholder="100+"
                value={manualMax}
                onChange={(e) => handleManualMaxChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply();
                }}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Apply Button */}
          <div className="px-3">
            <Button
              onClick={handleApply}
              size="sm"
              className={cn(
                "w-full h-10 rounded-lg font-semibold",
                "bg-gradient-to-r from-emerald-600 to-green-600",
                "hover:from-emerald-700 hover:to-green-700",
                "transition-all duration-300 hover:scale-105"
              )}
            >
              Áp dụng
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 px-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalRange([0, 10]);
                setManualMin('');
                setManualMax('10');
              }}
              className="text-xs h-7 rounded-lg hover:bg-emerald-50"
            >
              &lt; 10tr
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalRange([10, 20]);
                setManualMin('10');
                setManualMax('20');
              }}
              className="text-xs h-7 rounded-lg hover:bg-emerald-50"
            >
              10-20tr
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalRange([20, 30]);
                setManualMin('20');
                setManualMax('30');
              }}
              className="text-xs h-7 rounded-lg hover:bg-emerald-50"
            >
              20-30tr
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalRange([30, 50]);
                setManualMin('30');
                setManualMax('50');
              }}
              className="text-xs h-7 rounded-lg hover:bg-emerald-50"
            >
              30-50tr
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalRange([50, 100]);
                setManualMin('50');
                setManualMax('');
              }}
              className="text-xs h-7 rounded-lg hover:bg-emerald-50"
            >
              50tr+
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;
