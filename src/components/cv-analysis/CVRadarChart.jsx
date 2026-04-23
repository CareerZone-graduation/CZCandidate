import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const CVRadarChart = ({ data }) => {
  console.log('=== CVRadarChart received data ===', data);
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu để hiển thị
      </div>
    );
  }

  // Label mapping for Vietnamese
  const labelMapping = {
    // English to Vietnamese
    'Technical Skills': 'Kỹ năng chuyên môn',
    'Experience': 'Kinh nghiệm làm việc',
    'Education': 'Trình độ học vấn',
    'Tools & Technologies': 'Công cụ & Công nghệ',
    'Soft Skills': 'Kỹ năng mềm',
    'Projects': 'Dự án liên quan',
    'Certifications': 'Chứng chỉ',
    'Presentation': 'Trình bày CV',
    'Relevance': 'Độ phù hợp',
    'Language': 'Ngoại ngữ',
    'Extracurricular': 'Hoạt động ngoại khóa',
    // Snake case to Vietnamese
    'technical_skills': 'Kỹ năng chuyên môn',
    'experience': 'Kinh nghiệm làm việc',
    'education': 'Trình độ học vấn',
    'tools_technologies': 'Công cụ & Công nghệ',
    'soft_skills': 'Kỹ năng mềm',
    'projects': 'Dự án liên quan',
    'certifications': 'Chứng chỉ',
    'presentation': 'Trình bày CV',
    'relevance': 'Độ phù hợp',
    'language': 'Ngoại ngữ',
    'extracurricular': 'Hoạt động ngoại khóa',
    'keywords_ats': 'Từ khóa ATS',
    'achievements': 'Thành tựu',
    'skills': 'Kỹ năng',
  };

  // Transform data for Recharts
  let chartData;
  
  if (Array.isArray(data)) {
    // Data is already an array
    chartData = data.map((item) => {
      const originalMetric = item.metric || item.name || 'Unknown';
      return {
        metric: labelMapping[originalMetric] || originalMetric,
        score: item.score || 0,
        fullMark: 100,
      };
    });
  } else if (typeof data === 'object') {
    // Data is an object, convert to array
    chartData = Object.entries(data).map(([key, value]) => ({
      metric: labelMapping[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: typeof value === 'number' ? value : 0,
      fullMark: 100,
    }));
  } else {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Định dạng dữ liệu không hợp lệ
      </div>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Không có dữ liệu để hiển thị
      </div>
    );
  }
  
  console.log('CVRadarChart: chartData', chartData);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-purple-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.metric}</p>
          <p className="text-purple-600 font-bold">
            {payload[0].value}/100 điểm
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={450}>
        <RadarChart data={chartData}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <PolarGrid 
            stroke="#e5e7eb" 
            strokeWidth={1.5}
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ 
              fill: '#374151', 
              fontSize: 13,
              fontWeight: 600
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ 
              fill: '#9ca3af', 
              fontSize: 11
            }}
            tickCount={6}
            axisLine={false}
          />
          <Radar
            name="Điểm số"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            dot={{
              r: 5,
              fill: '#8b5cf6',
              strokeWidth: 2,
              stroke: '#fff'
            }}
            activeDot={{
              r: 7,
              fill: '#7c3aed',
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px'
            }}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Score Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {chartData.map((item, idx) => (
          <div 
            key={idx} 
            className="p-3 bg-white rounded-lg border-2 border-purple-100 hover:border-purple-300 transition-colors"
          >
            <div className="text-xs text-gray-600 mb-1">{item.metric}</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-purple-600">{item.score}</div>
              <div className="text-xs text-gray-400">/100</div>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-600 h-1.5 rounded-full transition-all"
                style={{ width: `${item.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CVRadarChart;
