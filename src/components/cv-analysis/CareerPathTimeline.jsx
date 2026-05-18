import React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Target, TrendingUp, Award } from 'lucide-react';

const CareerPathTimeline = ({ paths }) => {
  if (!paths || paths.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Không có lộ trình nghề nghiệp
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {paths.map((path, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg p-5 border-2 border-blue-200 hover:border-blue-400 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {path.role}
              </h4>
              <p className="text-sm text-gray-600">{path.description}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-300 ml-4">
              {path.timeframe}
            </Badge>
          </div>

          {/* Milestones */}
          {path.milestones && path.milestones.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Các mốc quan trọng:
              </h5>
              <div className="space-y-2">
                {path.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{milestone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {path.required_skills && path.required_skills.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Kỹ năng cần có:
              </h5>
              <div className="flex flex-wrap gap-2">
                {path.required_skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Success Rate */}
          {path.success_rate && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tỷ lệ thành công:</span>
                <span className="font-semibold text-green-600">
                  {path.success_rate}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CareerPathTimeline;
