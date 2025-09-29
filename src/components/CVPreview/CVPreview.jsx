import React from 'react';
import ModernBlueTemplate from './templates/ModernBlueTemplate';
import ClassicWhiteTemplate from './templates/ClassicWhiteTemplate';
import CreativeGradientTemplate from './templates/CreativeGradientTemplate';
import MinimalGrayTemplate from './templates/MinimalGrayTemplate';
import TwoColumnSidebarTemplate from './templates/TwoColumnSidebarTemplate';
import ElegantSerifTemplate from './templates/ElegantSerifTemplate';
import ModernSansTemplate from './templates/ModernSansTemplate';
import CompactDenseTemplate from './templates/CompactDenseTemplate';
import CreativeSplitTemplate from './templates/CreativeSplitTemplate';
import ExecutiveFormalTemplate from './templates/ExecutiveFormalTemplate';

const CVPreview = React.forwardRef(({ cvData, className = '' }, ref) => {
  // Ensure sectionOrder exists for backward compatibility
  const sectionOrder = cvData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'];
  
  // Create ordered CV data based on sectionOrder
  const orderedCVData = {
    ...cvData,
    sectionOrder
  };

  const renderTemplate = () => {
    switch (cvData.template) {
      case 'modern-blue':
        return <ModernBlueTemplate cvData={orderedCVData} />;
      case 'classic-white':
        return <ClassicWhiteTemplate cvData={orderedCVData} />;
      case 'creative-gradient':
        return <CreativeGradientTemplate cvData={orderedCVData} />;
      case 'minimal-gray':
        return <MinimalGrayTemplate cvData={orderedCVData} />;
      case 'two-column-sidebar':
        return <TwoColumnSidebarTemplate cvData={orderedCVData} />;
      case 'elegant-serif':
        return <ElegantSerifTemplate cvData={orderedCVData} />;
      case 'modern-sans':
        return <ModernSansTemplate cvData={orderedCVData} />;
      case 'compact-dense':
        return <CompactDenseTemplate cvData={orderedCVData} />;
      case 'creative-split':
        return <CreativeSplitTemplate cvData={orderedCVData} />;
      case 'executive-formal':
        return <ExecutiveFormalTemplate cvData={orderedCVData} />;
      default:
        return <ModernBlueTemplate cvData={orderedCVData} />;
    }
  };

  return (
    <div ref={ref} className={`cv-preview ${className}`} id="cv-preview">
      {renderTemplate()}
    </div>
  );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;