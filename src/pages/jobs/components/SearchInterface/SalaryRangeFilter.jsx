import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SalaryRangeFilter = ({
  minSalary = '',
  maxSalary = '',
  onChange,
  className,
  allowFullCollapse = true
}) => {
  const [selectedRange, setSelectedRange] = useState('');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);

  const salaryRanges = [
    { value: '', label: 'Tất cả mức lương', min: null, max: null },
    { value: '0-10', label: 'Dưới 10 triệu', min: 0, max: 10 },
    { value: '10-15', label: '10 - 15 triệu', min: 10, max: 15 },
    { value: '15-20', label: '15 - 20 triệu', min: 15, max: 20 },
    { value: '20-30', label: '20 - 30 triệu', min: 20, max: 30 },
    { value: '30-50', label: '30 - 50 triệu', min: 30, max: 50 },
    { value: '50+', label: 'Trên 50 triệu', min: 50, max: null }
  ];

  useEffect(() => {
    const min = minSalary ? parseInt(minSalary, 10) / 1000000 : '';
    const max = maxSalary ? parseInt(maxSalary, 10) / 1000000 : '';

    if (minSalary || maxSalary) {
      const matchingRange = salaryRanges.find(range => range.min === min && range.max === max);
      if (matchingRange) {
        setSelectedRange(matchingRange.value);
        setIsCustomMode(false);
      } else {
        setSelectedRange('custom');
        setCustomMin(min.toString());
        setCustomMax(max.toString());
        setIsCustomMode(true);
      }
    } else {
      setSelectedRange('');
      setCustomMin('');
      setCustomMax('');
      setIsCustomMode(false);
    }
  }, [minSalary, maxSalary]);

  const handleRangeChange = (rangeValue) => {
    setSelectedRange(rangeValue);
    if (rangeValue === 'custom') {
      setIsCustomMode(true);
      onChange({
        minSalary: customMin ? (parseInt(customMin, 10) * 1000000).toString() : '',
        maxSalary: customMax ? (parseInt(customMax, 10) * 1000000).toString() : ''
      });
    } else if (rangeValue === '') {
      setIsCustomMode(false);
      setCustomMin('');
      setCustomMax('');
      onChange({ minSalary: '', maxSalary: '' });
    } else {
      setIsCustomMode(false);
      const range = salaryRanges.find(r => r.value === rangeValue);
      if (range) {
        onChange({
          minSalary: range.min !== null ? (range.min * 1000000).toString() : '',
          maxSalary: range.max !== null ? (range.max * 1000000).toString() : ''
        });
      }
    }
  };

  const handleCustomSalaryChange = () => {
    onChange({
      minSalary: customMin ? (parseInt(customMin, 10) * 1000000).toString() : '',
      maxSalary: customMax ? (parseInt(customMax, 10) * 1000000).toString() : ''
    });
  };

  const formatNumberInput = (value) => value.replace(/[^0-9]/g, '');

  const handleCustomMinChange = (value) => {
    const formatted = formatNumberInput(value);
    setCustomMin(formatted);
  };

  const handleCustomMaxChange = (value) => {
    const formatted = formatNumberInput(value);
    setCustomMax(formatted);
  };

  const handleClear = () => {
    setSelectedRange('');
    setCustomMin('');
    setCustomMax('');
    setIsCustomMode(false);
    onChange({ minSalary: '', maxSalary: '' });
  };

  /**
   * Toggle full collapse state
   */
  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  const hasActiveFilter = selectedRange !== '' && selectedRange !== 'all';

  // Get selected range label for display when collapsed
  const getSelectedRangeLabel = () => {
    if (selectedRange === 'custom') {
      return `${customMin || '0'} - ${customMax || '∞'} triệu`;
    }
    const range = salaryRanges.find(r => r.value === selectedRange);
    return range ? range.label : '';
  };

  return (
    <Card className={cn("border-none shadow-none", className)}>
      <CardHeader className={cn("pb-3", isFullyCollapsed && "pb-0")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Mức lương
            </CardTitle>
            {/* Show selected salary when collapsed */}
            {isFullyCollapsed && hasActiveFilter && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                {getSelectedRangeLabel()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilter && !isFullyCollapsed && (
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
        <CardContent className="pt-0 space-y-4">
          <RadioGroup value={selectedRange} onValueChange={handleRangeChange} className="space-y-3">
            {salaryRanges.map((range) => (
              <div key={range.value} className="flex items-center space-x-2">
                <RadioGroupItem value={range.value} id={`salary-${range.value}`} className="text-primary" />
                <Label htmlFor={`salary-${range.value}`} className={cn("text-sm font-medium cursor-pointer", "text-muted-foreground hover:text-foreground", "transition-colors duration-200", selectedRange === range.value && "text-primary font-semibold")}>
                  {range.label}
                </Label>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="salary-custom" className="text-primary" />
              <Label htmlFor="salary-custom" className={cn("text-sm font-medium cursor-pointer", "text-muted-foreground hover:text-foreground", "transition-colors duration-200", selectedRange === 'custom' && "text-primary font-semibold")}>
                Tùy chỉnh
              </Label>
            </div>
          </RadioGroup>

          {isCustomMode && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="min-salary" className="text-sm font-medium">Lương tối thiểu (triệu VND)</Label>
                <Input id="min-salary" type="text" placeholder="VD: 10" value={customMin} onChange={(e) => handleCustomMinChange(e.target.value)} onBlur={handleCustomSalaryChange} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-salary" className="text-sm font-medium">Lương tối đa (triệu VND)</Label>
                <Input id="max-salary" type="text" placeholder="VD: 20" value={customMax} onChange={(e) => handleCustomMaxChange(e.target.value)} onBlur={handleCustomSalaryChange} className="h-9" />
              </div>
              <Button variant="outline" size="sm" onClick={handleCustomSalaryChange} className="w-full">Áp dụng</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SalaryRangeFilter;
