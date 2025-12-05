import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SalaryRangeSlider - Professional salary filter component
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

  const MIN_SALARY = 0;
  const MAX_SALARY = 100;
  const STEP = 1;

  const formatSalary = (value) => {
    if (value === 0) return 'Không giới hạn';
    if (value >= MAX_SALARY) return `${MAX_SALARY}+ triệu`;
    return `${value} triệu`;
  };

  const formatShortSalary = (value) => {
    if (value === 0) return '0';
    if (value >= MAX_SALARY) return `${MAX_SALARY}+`;
    return `${value}tr`;
  };

  useEffect(() => {
    const min = minSalary ? parseInt(minSalary, 10) / 1000000 : MIN_SALARY;
    const max = maxSalary ? parseInt(maxSalary, 10) / 1000000 : MAX_SALARY;
    
    setLocalRange([
      Math.max(MIN_SALARY, Math.min(min, MAX_SALARY)), 
      Math.max(MIN_SALARY, Math.min(max, MAX_SALARY))
    ]);
    setManualMin(min > 0 ? min.toString() : '');
    setManualMax(max < MAX_SALARY ? max.toString() : '');
  }, [minSalary, maxSalary]);

  const handleSliderChange = (newRange) => {
    setLocalRange(newRange);
    setManualMin(newRange[0] > 0 ? newRange[0].toString() : '');
    setManualMax(newRange[1] < MAX_SALARY ? newRange[1].toString() : '');
  };

  const handleManualMinChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setManualMin(numValue);
  };

  const handleManualMaxChange = (value) => {
    const numValue = value.replace(/[^0-9]/g, '');
    setManualMax(numValue);
  };

  const handleApply = () => {
    const min = manualMin ? Math.max(MIN_SALARY, Math.min(parseInt(manualMin, 10), MAX_SALARY)) : localRange[0];
    const max = manualMax ? Math.max(min, Math.min(parseInt(manualMax, 10), MAX_SALARY)) : localRange[1];
    
    setLocalRange([min, max]);
    
    onChange({
      minSalary: min > 0 ? (min * 1000000).toString() : '',
      maxSalary: max < MAX_SALARY ? (max * 1000000).toString() : ''
    });
  };

  const handleClear = (e) => {
    e?.stopPropagation();
    setLocalRange([MIN_SALARY, MAX_SALARY]);
    setManualMin('');
    setManualMax('');
    onChange({ minSalary: '', maxSalary: '' });
  };

  const hasActiveFilter = localRange[0] > MIN_SALARY || localRange[1] < MAX_SALARY;

  const presets = [
    { label: 'Dưới 10tr', min: 0, max: 10 },
    { label: '10-20tr', min: 10, max: 20 },
    { label: '20-30tr', min: 20, max: 30 },
    { label: '30-50tr', min: 30, max: 50 },
    { label: 'Trên 50tr', min: 50, max: 100 }
  ];

  return (
    <div className={cn("border-b border-slate-100 last:border-0", className)}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between py-3 px-1",
          "text-left transition-colors hover:bg-slate-50 rounded-lg -mx-1"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <span className="font-medium text-slate-800 text-sm">Mức lương</span>
            {!isExpanded && hasActiveFilter && (
              <p className="text-xs text-emerald-600 font-medium mt-0.5">
                {formatShortSalary(localRange[0])} - {formatShortSalary(localRange[1])}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Range Display */}
          <div className="flex items-center justify-between px-1">
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-0.5">Từ</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatSalary(localRange[0])}
              </p>
            </div>
            <div className="flex-1 mx-4 h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-0.5">Đến</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatSalary(localRange[1])}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="px-2 py-2">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 px-1">
                Tối thiểu (triệu)
              </label>
              <Input
                type="text"
                placeholder="0"
                value={manualMin}
                onChange={(e) => handleManualMinChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 px-1">
                Tối đa (triệu)
              </label>
              <Input
                type="text"
                placeholder="100+"
                value={manualMax}
                onChange={(e) => handleManualMaxChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setLocalRange([preset.min, preset.max]);
                  setManualMin(preset.min > 0 ? preset.min.toString() : '');
                  setManualMax(preset.max < MAX_SALARY ? preset.max.toString() : '');
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border",
                  "transition-all duration-150",
                  localRange[0] === preset.min && localRange[1] === preset.max
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleApply}
            size="sm"
            className={cn(
              "w-full h-9 rounded-lg font-medium",
              "bg-emerald-600 hover:bg-emerald-700 text-white",
              "transition-all duration-150"
            )}
          >
            Áp dụng mức lương
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalaryRangeSlider;
