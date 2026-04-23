import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Sparkles, 
  MessageSquare, 
  Copy, 
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  TrendingUp,
  FileEdit
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const AIImprovementPanel = ({ cvScore, onApplyImprovement }) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    experience: false,
    skills: false,
    keywords: false
  });
  const [copiedIndex, setCopiedIndex] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Đã copy vào clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const improvementSections = [
    {
      id: 'summary',
      title: 'Tóm tắt & Mục tiêu',
      icon: Target,
      color: 'blue',
      suggestions: cvScore?.improvements?.content?.filter(s => 
        s.toLowerCase().includes('tóm tắt') || 
        s.toLowerCase().includes('mục tiêu') ||
        s.toLowerCase().includes('summary')
      ) || []
    },
    {
      id: 'experience',
      title: 'Kinh nghiệm làm việc',
      icon: TrendingUp,
      color: 'green',
      suggestions: cvScore?.rewrite_examples || [],
      isRewrite: true
    },
    {
      id: 'skills',
      title: 'Kỹ năng cần bổ sung',
      icon: Lightbulb,
      color: 'purple',
      suggestions: cvScore?.skill_gaps?.map(gap => ({
        skill: gap.skill,
        current: gap.current_level,
        required: gap.required_level,
        resources: gap.learning_resources,
        time: gap.time_to_proficiency
      })) || []
    },
    {
      id: 'keywords',
      title: 'Từ khóa ATS',
      icon: FileEdit,
      color: 'orange',
      keywords: cvScore?.suggested_keywords || []
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Gợi ý cải thiện CV</h3>
            <p className="text-sm text-gray-600">
              Áp dụng các gợi ý này để tăng điểm CV của bạn
            </p>
          </div>
        </div>

        {/* Overall Summary */}
        {cvScore?.summary && (
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tổng quan</h4>
                <p className="text-gray-700 leading-relaxed">{cvScore.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Sections */}
        <div className="space-y-4">
          {improvementSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];
            const hasContent = section.isRewrite 
              ? section.suggestions.length > 0
              : section.keywords 
                ? section.keywords.length > 0
                : section.suggestions.length > 0;

            if (!hasContent) return null;

            return (
              <div key={section.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', getColorClasses(section.color))}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{section.title}</h4>
                      <p className="text-sm text-gray-600">
                        {section.isRewrite 
                          ? `${section.suggestions.length} ví dụ cải thiện`
                          : section.keywords
                            ? `${section.keywords.length} từ khóa`
                            : `${section.suggestions.length} gợi ý`}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3">
                    {/* Rewrite Examples */}
                    {section.isRewrite && section.suggestions.map((example, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="mb-3">
                          <Badge className="bg-red-100 text-red-700 mb-2">Trước</Badge>
                          <p className="text-sm text-gray-700">{example.original}</p>
                        </div>
                        <div className="mb-3">
                          <Badge className="bg-green-100 text-green-700 mb-2">Sau</Badge>
                          <p className="text-sm text-gray-900 font-medium">{example.improved}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(example.improved, `rewrite-${idx}`)}
                          className="w-full"
                        >
                          {copiedIndex === `rewrite-${idx}` ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Đã copy
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy câu cải thiện
                            </>
                          )}
                        </Button>
                      </div>
                    ))}

                    {/* Skill Gaps */}
                    {section.id === 'skills' && section.suggestions.map((gap, idx) => (
                      <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{gap.skill}</h5>
                          <Badge className="bg-purple-100 text-purple-700">
                            {gap.time}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <span className="text-gray-600">Hiện tại:</span>
                          <Badge variant="outline">{gap.current}</Badge>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-600">Cần:</span>
                          <Badge className="bg-green-100 text-green-700">{gap.required}</Badge>
                        </div>
                        {gap.resources && gap.resources.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Tài nguyên học:</p>
                            <ul className="space-y-1">
                              {gap.resources.map((resource, rIdx) => (
                                <li key={rIdx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span>{resource}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Keywords */}
                    {section.keywords && (
                      <div className="flex flex-wrap gap-2">
                        {section.keywords.map((keyword, idx) => (
                          <Badge
                            key={idx}
                            className="bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200 transition-colors"
                            onClick={() => handleCopy(keyword, `keyword-${idx}`)}
                          >
                            {keyword}
                            {copiedIndex === `keyword-${idx}` ? (
                              <Check className="h-3 w-3 ml-1" />
                            ) : (
                              <Copy className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* General Suggestions */}
                    {!section.isRewrite && !section.keywords && section.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              toast.success('Đang chuyển đến trang chỉnh sửa CV...');
              if (onApplyImprovement) {
                onApplyImprovement(cvScore);
              }
            }}
          >
            <FileEdit className="h-4 w-4 mr-2" />
            Áp dụng vào CV
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const allText = JSON.stringify(cvScore, null, 2);
              handleCopy(allText, 'all');
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy tất cả
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIImprovementPanel;
