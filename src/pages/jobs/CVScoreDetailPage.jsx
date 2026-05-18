import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import CVPreview from '../../components/CVPreview/CVPreview';
import { mapToFrontend } from '../../utils/dataMapper';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  Tag,
  Edit3,
  FileText,
  Briefcase,
  TrendingUp,
  Download,
} from 'lucide-react';
import { getApplicationDetail } from '../../services/jobService';
import { cn } from '../../lib/utils';

export default function CVScoreDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['applicationDetail', applicationId],
    queryFn: () => getApplicationDetail(applicationId),
  });

  const application = applicationData?.data;
  const cvScore = application?.cvScore;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả chấm điểm...</p>
        </div>
      </div>
    );
  }

  if (!cvScore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chưa có kết quả chấm điểm</h2>
          <p className="text-gray-600 mb-4">CV này chưa được chấm điểm</p>
          <Button onClick={() => navigate('/dashboard/applications')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/applications')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kết quả chấm điểm CV</h1>
                <p className="text-sm text-gray-600">{application.jobSnapshot?.title}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r", getScoreGradient(cvScore.overall_score))}>
              <Award className="h-6 w-6 text-white" />
              <div className="text-white">
                <p className="text-xs opacity-90">Điểm tổng</p>
                <p className="text-2xl font-bold">{cvScore.overall_score}/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Suggestions & Score Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Improvements - Moved to top */}
            {cvScore.improvements && (
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-700">
                    <Lightbulb className="h-5 w-5" />
                    Gợi ý cải thiện
                  </h3>
                  
                  {cvScore.improvements.content && cvScore.improvements.content.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Nội dung:</h4>
                      <ul className="space-y-2">
                        {cvScore.improvements.content.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-600 mt-1">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cvScore.improvements.formatting && cvScore.improvements.formatting.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Trình bày:</h4>
                      <ul className="space-y-2">
                        {cvScore.improvements.formatting.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-600 mt-1">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Weaknesses */}
            {cvScore.weaknesses && cvScore.weaknesses.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    Phần cần cải thiện
                  </h3>
                  <ul className="space-y-2">
                    {cvScore.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Critical Gaps */}
            {cvScore.critical_gaps && cvScore.critical_gaps.length > 0 && (
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    Thiếu sót nghiêm trọng
                  </h3>
                  <ul className="space-y-2">
                    {cvScore.critical_gaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Rewrite Examples */}
            {cvScore.rewrite_examples && cvScore.rewrite_examples.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-indigo-600" />
                    Gợi ý viết lại
                  </h3>
                  <div className="space-y-3">
                    {cvScore.rewrite_examples.map((example, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-red-50 p-3 border-b">
                          <p className="text-sm text-red-800">
                            <span className="font-semibold">❌ Trước:</span> {example.original}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3">
                          <p className="text-sm text-green-800">
                            <span className="font-semibold">✅ Sau:</span> {example.improved}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breakdown */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Chi tiết điểm số
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Kỹ năng', value: cvScore.breakdown.skills, max: 20 },
                    { label: 'Kinh nghiệm', value: cvScore.breakdown.experience, max: 20 },
                    { label: 'Học vấn', value: cvScore.breakdown.education, max: 10 },
                    { label: 'Từ khóa/ATS', value: cvScore.breakdown.keywords_ats, max: 15 },
                    { label: 'Thành tích', value: cvScore.breakdown.achievements, max: 15 },
                    { label: 'Trình bày', value: cvScore.breakdown.presentation, max: 20 },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-gray-600">{item.value}/{item.max}</span>
                      </div>
                      <Progress value={(item.value / item.max) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Keywords */}
            {cvScore.suggested_keywords && cvScore.suggested_keywords.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Từ khóa nên thêm
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cvScore.suggested_keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - CV Preview with Annotations */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    CV của bạn với gợi ý cải thiện
                  </h2>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tải CV
                  </Button>
                </div>

                {/* CV Content with Annotations */}
                <div className="bg-white border rounded-lg overflow-hidden">
                  {/* Render CV Template */}
                  {application.submittedCV?.source === 'TEMPLATE' && application.submittedCV?.templateSnapshot ? (
                    <div className="relative">
                      {/* CV Preview */}
                      <div className="transform scale-75 origin-top">
                        <CVPreview
                          cvData={mapToFrontend({
                            cvData: application.submittedCV.templateSnapshot,
                            templateId: application.submittedCV.templateId,
                            title: application.submittedCV.name
                          })}
                        />
                      </div>
                      
                      {/* Overlay Annotations */}
                      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-white/95 to-transparent pointer-events-none">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                          <FileText className="h-4 w-4" />
                          CV Template - {application.submittedCV.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>CV uploaded (PDF) - Không thể hiển thị preview</p>
                    </div>
                  )}
                </div>

                {/* Annotations Below CV */}
                <div className="space-y-4 mt-6">
                  {/* Annotations moved to left column */}
                  <div className="text-center text-gray-500 text-sm py-4">
                    <p>Xem gợi ý cải thiện ở cột bên trái</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
