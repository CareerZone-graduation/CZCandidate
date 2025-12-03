import React, { useState } from 'react';
import { cvTemplates } from '@/data/templates';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TemplatePreview = ({ template, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const baseClasses = "w-full h-full rounded-lg border-2 transition-all duration-300 cursor-pointer relative overflow-hidden bg-white shadow-sm";
  const selectedClasses = isSelected
    ? "border-primary ring-4 ring-primary/20 shadow-lg scale-[1.02]"
    : "border-gray-200 hover:border-primary/60 hover:shadow-md hover:scale-[1.02]";

  const previews = {
    'modern-blue': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="h-10 bg-blue-600"></div>
        <div className="p-3 space-y-1.5">
          <div className="h-2.5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    ),
    'classic-white': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="p-3 space-y-1.5 border-b-4 border-gray-800">
          <div className="h-2.5 bg-gray-800 rounded w-3/4 mx-auto"></div>
          <div className="h-1.5 bg-gray-400 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ),
    'creative-gradient': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"></div>
        <div className="p-3 space-y-1.5">
          <div className="h-2.5 bg-pink-200 rounded w-3/4"></div>
          <div className="h-1.5 bg-orange-100 rounded w-1/2"></div>
          <div className="h-1.5 bg-purple-100 rounded w-2/3"></div>
        </div>
      </div>
    ),
    'minimal-gray': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="p-3 space-y-2">
          <div className="h-3 bg-gray-900 rounded w-3/4"></div>
          <div className="h-1 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-1.5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ),
    'two-column-sidebar': (
      <div className={cn(baseClasses, 'flex')} onClick={onSelect}>
        <div className="w-1/3 bg-gray-800 p-2 space-y-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto"></div>
          <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="w-2/3 p-2 space-y-1.5">
          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    'elegant-serif': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="p-3 space-y-1 border-b-2 border-gray-300">
          <div className="h-3 bg-gray-800 rounded w-3/4 mx-auto"></div>
          <div className="h-1.5 bg-gray-500 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="h-1.5 bg-gray-300 rounded w-2/3"></div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ),
    'modern-sans': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="h-10 bg-gray-900"></div>
        <div className="p-3 space-y-1.5">
          <div className="h-2 bg-blue-500 rounded w-1/4"></div>
          <div className="h-2.5 bg-gray-800 rounded w-3/4"></div>
        </div>
      </div>
    ),
    'compact-dense': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="p-2 border-b-2 border-gray-800 flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div className="space-y-1 flex-1">
            <div className="h-2 bg-gray-800 rounded w-2/3"></div>
          </div>
        </div>
        <div className="p-2 space-y-1">
          <div className="h-1 bg-gray-300 rounded w-3/4"></div>
          <div className="h-1 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    'creative-split': (
      <div className={cn(baseClasses, 'flex')} onClick={onSelect}>
        <div className="w-1/3 bg-gradient-to-br from-purple-600 to-pink-500 p-2 space-y-2">
          <div className="w-8 h-8 bg-white/30 rounded-full mx-auto"></div>
          <div className="h-1.5 bg-white/60 rounded w-3/4"></div>
        </div>
        <div className="w-2/3 p-2 space-y-1.5">
          <div className="h-2 bg-pink-200 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    'creative-green': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="h-16 bg-gray-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-center mb-1">
            <div className="w-1 h-3 bg-emerald-500 mr-1.5 rounded-full"></div>
            <div className="h-1.5 bg-gray-800 rounded w-1/2"></div>
          </div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    ),
    'professional-hex': (
      <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="h-16 bg-slate-900" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)' }}></div>
        <div className="p-3 space-y-2">
          <div className="flex items-center border-b border-gray-200 pb-1">
            <div className="w-2 h-2 bg-slate-800 rotate-45 mr-1.5"></div>
            <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
          </div>
          <div className="space-y-1 pl-3 border-l border-gray-200 ml-1">
            <div className="h-1 bg-gray-300 rounded w-3/4"></div>
            <div className="h-1 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[1/1.414] relative">
        {previews[template.id] || <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}><p>Preview</p></div>}

        {/* Overlay khi hover */}
        {isHovered && !isSelected && (
          <div className="absolute inset-0 bg-black/5 rounded-lg transition-opacity duration-300 pointer-events-none" />
        )}
      </div>

      {/* Check icon khi selected */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-lg animate-in zoom-in duration-200">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Badge "Phổ biến" cho một số template */}
      {['modern-blue', 'two-column-sidebar'].includes(template.id) && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Sparkles className="w-3 h-3" />
          Phổ biến
        </div>
      )}
    </div>
  );
};

const TemplateGallery = ({ selectedTemplate, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Lấy danh sách categories duy nhất
  const categories = ['all', ...new Set(cvTemplates.map(t => t.category))];

  // Filter templates theo category
  const filteredTemplates = selectedCategory === 'all'
    ? cvTemplates
    : cvTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Chọn Mẫu CV Phù Hợp
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Khám phá bộ sưu tập mẫu CV chuyên nghiệp, được thiết kế để tạo ấn tượng với nhà tuyển dụng
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === category
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {category === 'all' ? 'Tất cả' : category}
          </button>
        ))}
      </div>

      {/* Templates Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "overflow-hidden transition-all duration-300 hover:shadow-lg",
              selectedTemplate === template.id && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-0">
              {/* Preview */}
              <div className="p-4 pb-3">
                <TemplatePreview
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => onSelectTemplate(template.id)}
                />
              </div>

              {/* Info */}
              <div className="px-4 pb-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight">
                    {template.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {template.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {template.shortDesc}
                </p>

                {/* Best For Tags */}
                {template.bestFor && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {template.bestFor.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy mẫu CV nào trong danh mục này.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;