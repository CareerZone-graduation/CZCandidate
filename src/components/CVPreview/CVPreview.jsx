import React from 'react';
import PaginatedCVPreview from './PaginatedCVPreview';

/**
 * CVPreview Component
 * Main entry point for CV preview with automatic pagination
 */
const CVPreview = React.forwardRef(({ cvData, template, className = '' }, ref) => {
  // Ensure sectionOrder exists for backward compatibility
  const sectionOrder = cvData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'];
  
  // Create ordered CV data based on sectionOrder
  const orderedCVData = {
    ...cvData,
    sectionOrder,
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