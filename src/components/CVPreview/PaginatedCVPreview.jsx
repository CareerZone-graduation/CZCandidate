import React, { useEffect, useState, useRef } from 'react';
import ModernBlueTemplate from './templates/ModernBlueTemplate';
import ClassicWhiteTemplate from './templates/ClassicWhiteTemplate';
import CreativeGradientTemplate from './templates/CreativeGradientTemplate';
import MinimalGrayTemplate from './templates/MinimalGrayTemplate';
import TwoColumnSidebarTemplate from './templates/TwoColumnSidebarTemplate';
import ElegantSerifTemplate from './templates/ElegantSerifTemplate';
import ModernSansTemplate from './templates/ModernSansTemplate';
import CompactDenseTemplate from './templates/CompactDenseTemplate';
import CreativeSplitTemplate from './templates/CreativeSplitTemplate';

import CreativeGreenTemplate from './templates/CreativeGreenTemplate';
import ProfessionalHexTemplate from './templates/ProfessionalHexTemplate';

// A4 page constants
const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const MM_TO_PX = 3.7795275591; // 1mm = 3.7795275591px at 96 DPI
const A4_HEIGHT_PX = A4_HEIGHT_MM * MM_TO_PX;

// Layout constants (adjust these based on your template design)
const HEADER_HEIGHT_PX = 160; // Header height for first page
const CONTENT_PADDING = 64; // Padding for content area (top + bottom)
const PAGE_MARGIN = 20; // Safety margin
const SECTION_SPACING = 32; // Space between sections

/**
 * PaginatedCVPreview Component
 * Automatically splits CV content across multiple A4 pages
 * Prevents section content from being cut across pages
 */
const PaginatedCVPreview = React.forwardRef(({ cvData, className = '' }, ref) => {
  const [pages, setPages] = useState([]);
  const measureRef = useRef(null);

  // Ensure sectionOrder exists
  const sectionOrder = cvData.sectionOrder || [
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certificates'
  ];

  // Use the template from cvData
  const selectedTemplate = cvData.template || 'modern-blue';

  /**
   * Measure section heights and paginate content
   */
  useEffect(() => {
    const measureAndPaginate = async () => {
      if (!measureRef.current) return;
      // Xóa tín hiệu cũ đi trước khi bắt đầu tính toán lại
      document.body.removeAttribute('data-cv-ready');
      const tempContainer = measureRef.current;
      const sectionsData = [];

      // Measure each section
      for (const sectionId of sectionOrder) {
        const sectionElement = tempContainer.querySelector(`[data-section="${sectionId}"]`);
        if (sectionElement) {
          const height = sectionElement.offsetHeight;
          sectionsData.push({
            id: sectionId,
            height: height,
            element: sectionElement.cloneNode(true)
          });
        }
      }

      // Paginate sections
      const paginatedPages = [];
      let currentPage = [];
      let currentPageHeight = HEADER_HEIGHT_PX + CONTENT_PADDING;
      const availableHeight = A4_HEIGHT_PX - CONTENT_PADDING - PAGE_MARGIN;

      sectionsData.forEach((section, index) => {
        const sectionWithMargin = section.height + SECTION_SPACING;

        if (index === 0) {
          // First section always goes on first page
          if (currentPageHeight + sectionWithMargin <= availableHeight) {
            currentPage.push(section);
            currentPageHeight += sectionWithMargin;
          } else {
            // Section too large for first page with header
            currentPage.push(section);
            paginatedPages.push({ sections: [...currentPage], isFirstPage: true });
            currentPage = [];
            currentPageHeight = CONTENT_PADDING;
          }
        } else {
          // Try to fit section on current page
          if (currentPageHeight + sectionWithMargin <= availableHeight) {
            currentPage.push(section);
            currentPageHeight += sectionWithMargin;
          } else {
            // Start new page
            paginatedPages.push({
              sections: [...currentPage],
              isFirstPage: paginatedPages.length === 0
            });
            currentPage = [section];
            currentPageHeight = CONTENT_PADDING + sectionWithMargin;
          }
        }
      });

      // Add remaining sections
      if (currentPage.length > 0) {
        paginatedPages.push({
          sections: currentPage,
          isFirstPage: paginatedPages.length === 0
        });
      }

      setPages(paginatedPages);
      // ✅ BƯỚC QUAN TRỌNG: BÁO HIỆU CHO PUPPETEER RẰNG ĐÃ XONG!
      // Dùng setTimeout nhỏ để đảm bảo React đã render xong sau khi setPages
      setTimeout(() => {
        document.body.setAttribute('data-cv-ready', 'true');
        console.log('✅ CV is ready for PDF export!');
      }, 0);
    };

    // Delay measurement to ensure DOM is ready
    const timeoutId = setTimeout(measureAndPaginate, 100);
    return () => clearTimeout(timeoutId);
  }, [cvData, sectionOrder, selectedTemplate]);

  /**
   * Get template component based on selection
   */
  const getTemplateComponent = () => {
    switch (selectedTemplate) {
      case 'modern-blue':
        return ModernBlueTemplate;
      case 'classic-white':
        return ClassicWhiteTemplate;
      case 'creative-gradient':
        return CreativeGradientTemplate;
      case 'minimal-gray':
        return MinimalGrayTemplate;
      case 'two-column-sidebar':
        return TwoColumnSidebarTemplate;
      case 'elegant-serif':
        return ElegantSerifTemplate;
      case 'modern-sans':
        return ModernSansTemplate;
      case 'compact-dense':
        return CompactDenseTemplate;
      case 'creative-split':
        return CreativeSplitTemplate;

      case 'creative-green':
        return CreativeGreenTemplate;
      case 'professional-hex':
        return ProfessionalHexTemplate;
      default:
        return ModernBlueTemplate;
    }
  };

  /**
   * Render a single page with selected template
   */
  const renderTemplate = (pageData, pageIndex) => {
    const isFirstPage = pageData.isFirstPage;
    const sectionsToShow = pageData.sections.map(s => s.id);

    const TemplateComponent = getTemplateComponent();

    return (
      <TemplateComponent
        cvData={{
          ...cvData,
          sectionOrder: sectionsToShow
        }}
        showHeader={isFirstPage}
        pageNumber={pageIndex + 1}
      />
    );
  };

  const TemplateComponent = getTemplateComponent();

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="fixed opacity-0 pointer-events-none"
        style={{ left: '-9999px', top: 0 }}
        aria-hidden="true"
      >
        <TemplateComponent cvData={cvData} showHeader={true} measureMode={true} />
      </div>

      {/* PaginatedCVPreview output */}
      <div ref={ref} className={`cv-preview ${className}`} id="cv-preview">
        {pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-page bg-white shadow-lg mb-6 flex flex-col"
            style={{
              width: `${A4_WIDTH_MM}mm`,
              minHeight: `${A4_HEIGHT_MM}mm`,
              pageBreakAfter: 'always',
              breakAfter: 'page'
            }}
          >
            {renderTemplate(pageData, pageIndex)}
          </div>
        ))}
      </div>
    </>
  );
});

PaginatedCVPreview.displayName = 'PaginatedCVPreview';

export default PaginatedCVPreview;
