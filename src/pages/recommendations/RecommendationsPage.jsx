import React from 'react';
import { JobRecommendations } from '@/components/recommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Target } from 'lucide-react';

/**
 * RecommendationsPage - Dedicated page for job recommendations
 */
const RecommendationsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Việc làm gợi ý
            </h1>
            <p className="text-muted-foreground">
              Những công việc phù hợp nhất với hồ sơ của bạn
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Độ phù hợp cao</p>
                  <p className="text-xs text-muted-foreground">Dựa trên kỹ năng và kinh nghiệm</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cập nhật liên tục</p>
                  <p className="text-xs text-muted-foreground">Gợi ý mới mỗi ngày</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cá nhân hóa</p>
                  <p className="text-xs text-muted-foreground">Phù hợp với sở thích của bạn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations List */}
      <JobRecommendations limit={10} showHeader={false} />
    </div>
  );
};

export default RecommendationsPage;
