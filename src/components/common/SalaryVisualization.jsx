import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SalaryVisualization component
 * Visualizes salary range with comparison to market average
 */
const SalaryVisualization = ({
  minSalary,
  maxSalary,
  averageSalary,
  marketMin,
  marketMax,
  className
}) => {
  // Format salary for display (in millions VND)
  const formatSalary = (value) => {
    if (!value) return 'Thỏa thuận';
    const millions = value / 1000000;
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`;
    }
    return `${millions}M`;
  };

  // Calculate salary statistics
  const jobAverage = minSalary && maxSalary ? (minSalary + maxSalary) / 2 : null;
  const marketAverage = averageSalary || (marketMin && marketMax ? (marketMin + marketMax) / 2 : null);
  
  // Competitive level
  const getCompetitiveLevel = () => {
    if (!jobAverage || !marketAverage) return null;
    const ratio = (jobAverage / marketAverage) * 100;
    
    if (ratio >= 120) return { label: 'Rất cao', color: 'from-emerald-600 to-green-600', icon: Award };
    if (ratio >= 105) return { label: 'Cao hơn thị trường', color: 'from-blue-600 to-cyan-600', icon: TrendingUp };
    if (ratio >= 95) return { label: 'Tương đương thị trường', color: 'from-amber-600 to-orange-600', icon: DollarSign };
    return { label: 'Dưới thị trường', color: 'from-gray-600 to-gray-500', icon: DollarSign };
  };

  const competitive = getCompetitiveLevel();

  // Prepare chart data
  const chartData = [
    {
      name: 'Mức lương',
      min: minSalary ? minSalary / 1000000 : 0,
      max: maxSalary ? maxSalary / 1000000 : 0,
      avg: jobAverage ? jobAverage / 1000000 : 0,
      isJob: true
    }
  ];

  if (marketMin && marketMax) {
    chartData.push({
      name: 'Thị trường',
      min: marketMin / 1000000,
      max: marketMax / 1000000,
      avg: marketAverage ? marketAverage / 1000000 : 0,
      isJob: false
    });
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-foreground mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Tối thiểu: <span className="font-bold text-foreground">{data.min}M</span>
            </p>
            <p className="text-muted-foreground">
              Trung bình: <span className="font-bold text-primary">{data.avg}M</span>
            </p>
            <p className="text-muted-foreground">
              Tối đa: <span className="font-bold text-foreground">{data.max}M</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn(
      "border-2 border-border/50 shadow-lg shadow-primary/5",
      "bg-card/95 backdrop-blur-sm overflow-hidden relative",
      className
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-2 border-emerald-500/30">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Phân tích mức lương
            </CardTitle>
          </div>
          {competitive && (
            <Badge className={cn(
              "px-4 py-2 rounded-lg font-semibold text-white border-0",
              `bg-gradient-to-r ${competitive.color}`
            )}>
              <competitive.icon className="h-4 w-4 mr-1" />
              {competitive.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* Salary Range Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">Tối thiểu</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {formatSalary(minSalary)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-2 border-emerald-500/30">
            <p className="text-xs text-muted-foreground mb-1">Trung bình</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {formatSalary(jobAverage)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20">
            <p className="text-xs text-muted-foreground mb-1">Tối đa</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {formatSalary(maxSalary)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  label={{ value: 'Triệu VND', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="min" fill="hsl(var(--primary) / 0.3)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="max" fill="hsl(var(--primary) / 0.5)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Salary Range Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0M</span>
            <span>50M</span>
            <span>100M+</span>
          </div>
          <div className="relative h-8 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 rounded-full overflow-hidden border-2 border-primary/30">
            {minSalary && maxSalary && (
              <div
                className="absolute h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full transition-all duration-500"
                style={{
                  left: `${Math.min((minSalary / 1000000 / 100) * 100, 95)}%`,
                  width: `${Math.min(((maxSalary - minSalary) / 1000000 / 100) * 100, 95 - ((minSalary / 1000000 / 100) * 100))}%`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Market Comparison */}
        {marketAverage && jobAverage && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">So với thị trường</p>
                <p className="text-xs text-muted-foreground">Mức lương trung bình ngành</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {((jobAverage / marketAverage - 1) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {jobAverage > marketAverage ? 'Cao hơn' : 'Thấp hơn'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalaryVisualization;
