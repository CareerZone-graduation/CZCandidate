import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SearchEmpty component
 * Displays empty state when no search results are found
 */
const SearchEmpty = ({
  query = '',
  hasFilters = false,
  onClearFilters,
  onNewSearch,
  className
}) => {
  /**
   * Get appropriate empty state content based on context
   */
  const getEmptyContent = () => {
    if (query && hasFilters) {
      return {
        icon: <Filter className="h-16 w-16 text-muted-foreground" />,
        title: "Không tìm thấy việc làm phù hợp",
        message: `Không có kết quả nào phù hợp với "${query}" và các bộ lọc đã chọn. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.`,
        actions: [
          {
            label: "Xóa bộ lọc",
            variant: "outline",
            onClick: onClearFilters
          },
          {
            label: "Tìm kiếm mới",
            variant: "default",
            onClick: onNewSearch
          }
        ]
      };
    }

    if (query) {
      return {
        icon: <Search className="h-16 w-16 text-muted-foreground" />,
        title: "Không tìm thấy việc làm nào",
        message: `Không có kết quả nào phù hợp với từ khóa "${query}". Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lỗi chính tả.`,
        actions: [
          {
            label: "Tìm kiếm mới",
            variant: "default",
            onClick: onNewSearch
          }
        ]
      };
    }

    if (hasFilters) {
      return {
        icon: <Filter className="h-16 w-16 text-muted-foreground" />,
        title: "Không có việc làm phù hợp với bộ lọc",
        message: "Các bộ lọc bạn đã chọn không có kết quả nào. Hãy thử điều chỉnh bộ lọc để tìm thêm cơ hội việc làm.",
        actions: [
          {
            label: "Xóa bộ lọc",
            variant: "outline",
            onClick: onClearFilters
          }
        ]
      };
    }

    return {
      icon: <Search className="h-16 w-16 text-muted-foreground" />,
      title: "Bắt đầu tìm kiếm việc làm",
      message: "Nhập từ khóa vào ô tìm kiếm để khám phá các cơ hội nghề nghiệp phù hợp với bạn.",
      actions: []
    };
  };

  const content = getEmptyContent();

  return (
    <Card className={cn("border-none shadow-none bg-transparent", className)}>
      <CardContent className="py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {content.icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground">
            {content.title}
          </h3>

          {/* Message */}
          <p className="text-muted-foreground leading-relaxed">
            {content.message}
          </p>

          {/* Action Buttons */}
          {content.actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {content.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  onClick={action.onClick}
                  className="min-w-[120px]"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Search Tips */}
          <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t border-border">
            <p className="font-medium">Gợi ý tìm kiếm:</p>
            <ul className="space-y-1 text-left max-w-sm mx-auto">
              <li>• Thử các từ khóa khác nhau</li>
              <li>• Kiểm tra lỗi chính tả</li>
              <li>• Sử dụng từ khóa tổng quát hơn</li>
              <li>• Điều chỉnh hoặc xóa bộ lọc</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchEmpty;