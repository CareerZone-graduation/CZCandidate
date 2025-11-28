import React, { useState, useEffect } from 'react';
import { ChevronRight, X, DollarSign } from 'lucide-react';

const SalaryRangeFilter = ({
  minSalary = '',
  maxSalary = '',
  onChange,
  className = '',
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

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedRange('');
    setCustomMin('');
    setCustomMax('');
    setIsCustomMode(false);
    onChange({ minSalary: '', maxSalary: '' });
  };

  const toggleFullCollapse = () => {
    setIsFullyCollapsed(!isFullyCollapsed);
  };

  const hasActiveFilter = selectedRange !== '' && selectedRange !== 'all';

  const getSelectedRangeLabel = () => {
    if (selectedRange === 'custom') {
      return `${customMin || '0'} - ${customMax || '∞'} triệu`;
    }
    const range = salaryRanges.find(r => r.value === selectedRange);
    return range ? range.label : '';
  };

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
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Mức lương
          </h3>
          {isFullyCollapsed && hasActiveFilter && (
            <span className="text-sm text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full font-medium">
              {getSelectedRangeLabel()}
            </span>
          )}
        </div>
        {hasActiveFilter && !isFullyCollapsed && (
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
        <div className="p-4 animate-slide-down space-y-4">
          <div className="space-y-2" role="radiogroup" aria-label="Mức lương">
            {salaryRanges.map((range) => (
              <label
                key={range.value}
                className={`
                  flex items-center gap-2 p-2 rounded-md cursor-pointer
                  transition-all duration-200
                  hover:bg-gray-100
                  ${selectedRange === range.value ? 'bg-blue-50 border border-blue-200' : ''}
                `}
              >
                <input
                  type="radio"
                  value={range.value}
                  checked={selectedRange === range.value}
                  onChange={() => handleRangeChange(range.value)}
                  className="
                    h-4 w-4 text-blue-600 border-gray-300 
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  "
                  id={`salary-${range.value}`}
                />
                <span className="text-sm text-gray-700 font-medium">
                  {range.label}
                </span>
              </label>
            ))}
            <label
              className={`
                flex items-center gap-2 p-2 rounded-md cursor-pointer
                transition-all duration-200
                hover:bg-gray-100
                ${selectedRange === 'custom' ? 'bg-blue-50 border border-blue-200' : ''}
              `}
            >
              <input
                type="radio"
                value="custom"
                checked={selectedRange === 'custom'}
                onChange={() => handleRangeChange('custom')}
                className="
                  h-4 w-4 text-blue-600 border-gray-300 
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                "
                id="salary-custom"
              />
              <span className="text-sm text-gray-700 font-medium">
                Tùy chỉnh
              </span>
            </label>
          </div>

          {isCustomMode && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div className="space-y-1">
                <label htmlFor="min-salary" className="text-sm font-medium text-gray-700">
                  Lương tối thiểu (triệu VNĐ)
                </label>
                <input
                  id="min-salary"
                  type="text"
                  placeholder="VD: 10"
                  value={customMin}
                  onChange={(e) => handleCustomMinChange(e.target.value)}
                  onBlur={handleCustomSalaryChange}
                  className="
                    w-full h-10 px-3 rounded-md border border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    text-sm text-gray-700
                  "
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="max-salary" className="text-sm font-medium text-gray-700">
                  Lương tối đa (triệu VNĐ)
                </label>
                <input
                  id="max-salary"
                  type="text"
                  placeholder="VD: 20"
                  value={customMax}
                  onChange={(e) => handleCustomMaxChange(e.target.value)}
                  onBlur={handleCustomSalaryChange}
                  className="
                    w-full h-10 px-3 rounded-md border border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    text-sm text-gray-700
                  "
                />
              </div>
              <button
                onClick={handleCustomSalaryChange}
                className="
                  w-full h-10 rounded-md bg-blue-600 text-white
                  hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
                  transition-colors duration-200
                "
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalaryRangeFilter;