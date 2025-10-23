import React from 'react';
import { X, Sparkles, Zap, Coffee, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SampleDataSuggestion = ({ onSelectSample, onDismiss }) => {
  const samples = [
    {
      id: 'default',
      title: 'Kỹ sư phần mềm',
      description: 'Phù hợp cho vị trí lập trình viên, developer',
      icon: Zap,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'creative',
      title: 'Nhà thiết kế',
      description: 'Dành cho designer, UX/UI, creative',
      icon: Sparkles,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'minimal',
      title: 'Marketing',
      description: 'Cho vị trí marketing, sales, business',
      icon: Coffee,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-3xl w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Chào mừng đến với CV Builder!
              </h2>
              <p className="text-gray-600">
                Bắt đầu nhanh với dữ liệu mẫu hoặc tự tạo từ đầu
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sample Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {samples.map((sample) => {
              const Icon = sample.icon;
              return (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 p-6 text-left bg-white hover:scale-105"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${sample.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${sample.color}-100 text-${sample.color}-600 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-900">
                      {sample.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {sample.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Sử dụng mẫu này
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Skip Button */}
          <div className="flex items-center justify-center pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onDismiss}
              className="text-gray-600 hover:text-gray-900"
            >
              Bỏ qua, tôi sẽ tự điền thông tin
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Mẹo:</strong> Bạn có thể chỉnh sửa mọi thông tin sau khi chọn mẫu. 
              Dữ liệu mẫu giúp bạn hình dung cách CV sẽ trông như thế nào!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleDataSuggestion;
