import React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Lightbulb, Clock, Zap, Target } from 'lucide-react';

const ProjectRecommendations = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        Không có dự án được gợi ý
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.map((project, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg p-5 border-2 border-purple-200 hover:border-purple-400 transition-colors"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              {project.title}
            </h4>
            <Badge className={cn('px-2 py-1', getDifficultyColor(project.difficulty))}>
              {project.difficulty === 'Easy' && '🟢 Dễ'}
              {project.difficulty === 'Medium' && '🟡 Trung bình'}
              {project.difficulty === 'Hard' && '🔴 Khó'}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4">{project.description}</p>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Công nghệ:</h5>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {project.key_features && project.key_features.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-700 mb-2">Tính năng chính:</h5>
              <ul className="space-y-1">
                {project.key_features.map((feature, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{project.estimated_duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600 font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>{project.impact}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectRecommendations;
