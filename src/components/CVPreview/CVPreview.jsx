import React from 'react';
import PaginatedCVPreview from './PaginatedCVPreview';

/**
 * CVPreview Component
 * Main entry point for CV preview with automatic pagination
 */
const CVPreview = React.forwardRef(({ cvData, template, className = '' }, ref) => {
  // Ensure sectionOrder exists for backward compatibility
  const sectionOrder = cvData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'];
  const hiddenSections = cvData.hiddenSections || [];
  
  // Filter out hidden sections from sectionOrder
  const visibleSectionOrder = sectionOrder.filter(section => !hiddenSections.includes(section));
  
  // Create ordered CV data based on sectionOrder and hiddenSections
  const orderedCVData = {
    ...cvData,
    sectionOrder: visibleSectionOrder,
    hiddenSections,
    // Use the template prop if provided, otherwise fall back to cvData.template
    template: template || cvData.template || 'modern-blue'
  };

  return (
    <PaginatedCVPreview
      ref={ref}
      cvData={orderedCVData}
      className={className}
    />
  );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;