import React from 'react';
import { cvTemplates } from '@/data/templates';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TemplatePreview = ({ template, isSelected, onSelect }) => {
  const baseClasses = "w-full h-full rounded-lg border-2 transition-all duration-200 cursor-pointer relative overflow-hidden bg-white";
  const selectedClasses = isSelected ? "border-primary ring-2 ring-primary/30" : "border-gray-200 hover:border-primary/50";

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
    'executive-formal': (
       <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}>
        <div className="p-3 border-b-4 border-gray-800 text-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <div className="h-2.5 bg-gray-800 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
  };

  return (
    <div className="relative">
      <div className="aspect-[1/1.414]">
        {previews[template.id] || <div className={cn(baseClasses, selectedClasses)} onClick={onSelect}><p>Preview</p></div>}
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white ring-2 ring-white">
          <Check className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

const TemplateGallery = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Choose Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cvTemplates.map((template) => (
          <div key={template.id}>
            <TemplatePreview
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={() => onSelectTemplate(template.id)}
            />
            <div className="text-center mt-3">
              <h3 className="font-semibold text-gray-800">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <Badge variant="secondary" className="mt-2">{template.category}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;