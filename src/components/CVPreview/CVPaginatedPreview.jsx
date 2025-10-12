import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * CVPaginatedPreview - Smart pagination with automatic page breaks
 * Calculates element heights and splits content intelligently
 */
const CVPaginatedPreview = React.forwardRef(({ children }, ref) => {
  const measureRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  const paginateContent = useCallback(() => {
    if (!measureRef.current) return;

    // A4 at 96 DPI: 210mm × 297mm = 794px × 1123px
    // Account for padding: 32px (2rem = px-8) on left/right, 32px top/bottom
    const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI
    const PAGE_PADDING_TOP = 0; // First page has header with own padding
    const PAGE_PADDING_BOTTOM = 32; // pb-8 = 2rem = 32px
    const AVAILABLE_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_BOTTOM;
    
    const container = measureRef.current;
    
    // Get direct children of cv-preview
    const cvPreview = container.querySelector('.cv-preview');
    if (!cvPreview) {
      setIsProcessing(false);
      return;
    }

    // Collect all top-level elements, unwrapping padding containers
    const allElements = [];
    Array.from(cvPreview.children).forEach((child) => {
      // If element is a padding wrapper (px-8, py-8, p-8), extract its children
      if (child.tagName === 'DIV' && 
          (child.classList.contains('px-8') || 
           child.classList.contains('py-8') ||
           child.classList.contains('p-8'))) {
        // Add wrapper's children as top-level elements for better pagination
        allElements.push(...Array.from(child.children));
      } else {
        // Add element directly
        allElements.push(child);
      }
    });
    
    const newPages = [];
    let currentPageElements = [];
    let currentPageHeight = 0;
    
    const DEBUG = false; // Set to true to see pagination logs

    if (DEBUG) console.log('🔍 Starting pagination with', allElements.length, 'elements');

    allElements.forEach((element, index) => {
      // Measure actual height
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      const totalHeight = rect.height + marginTop + marginBottom;

      // Check if element should avoid breaking
      const isHeader = element.tagName === 'HEADER';
      const hasAvoidBreak = element.classList.contains('page-break-avoid') ||
                           element.classList.contains('cv-item') ||
                           isHeader;
      const isSectionHeader = element.classList.contains('cv-section-header') ||
                             (element.tagName === 'SECTION' && element.querySelector('h2'));

      if (DEBUG) console.log(`📏 Element ${index}: ${element.tagName}.${element.className} - Height: ${totalHeight.toFixed(0)}px, Current page: ${currentPageHeight.toFixed(0)}px`);

      // Check if adding this element would exceed page height
      if (currentPageHeight + totalHeight > AVAILABLE_HEIGHT) {
        if (DEBUG) console.log(`⚠️ Would exceed page height (${(currentPageHeight + totalHeight).toFixed(0)}px > ${AVAILABLE_HEIGHT}px)`);
        
        if (hasAvoidBreak || isHeader) {
          // Move entire element to next page
          if (currentPageElements.length > 0) {
            if (DEBUG) console.log(`📄 Creating page ${newPages.length + 1} with ${currentPageElements.length} elements`);
            newPages.push([...currentPageElements]);
          }
          currentPageElements = [element.cloneNode(true)];
          currentPageHeight = totalHeight;
          if (DEBUG) console.log(`➡️ Moved to new page, height: ${totalHeight.toFixed(0)}px`);
        } else {
          // Element can break, add to current page
          currentPageElements.push(element.cloneNode(true));
          if (DEBUG) console.log(`📄 Creating page ${newPages.length + 1} with ${currentPageElements.length} elements (overflow)`);
          newPages.push([...currentPageElements]);
          currentPageElements = [];
          currentPageHeight = 0;
        }
      } else {
        // Fits in current page
        currentPageElements.push(element.cloneNode(true));
        currentPageHeight += totalHeight;
        if (DEBUG) console.log(`✅ Added to current page, new height: ${currentPageHeight.toFixed(0)}px`);

        // Special handling for section headers - try to keep with next element
        if (isSectionHeader && index < allElements.length - 1) {
          const nextElement = allElements[index + 1];
          const nextRect = nextElement.getBoundingClientRect();
          const nextStyle = window.getComputedStyle(nextElement);
          const nextMarginTop = parseFloat(nextStyle.marginTop) || 0;
          const nextMarginBottom = parseFloat(nextStyle.marginBottom) || 0;
          const nextHeight = nextRect.height + nextMarginTop + nextMarginBottom;

          // If header + next element don't fit, move header to next page
          if (currentPageHeight + nextHeight > AVAILABLE_HEIGHT && currentPageElements.length > 1) {
            if (DEBUG) console.log(`🔄 Section header would orphan, moving to next page`);
            // Remove header from current page
            const headerElement = currentPageElements.pop();
            currentPageHeight -= totalHeight;
            
            // Save current page
            if (currentPageElements.length > 0) {
              if (DEBUG) console.log(`📄 Creating page ${newPages.length + 1} with ${currentPageElements.length} elements (before header)`);
              newPages.push([...currentPageElements]);
            }
            
            // Start new page with header
            currentPageElements = [headerElement];
            currentPageHeight = totalHeight;
            if (DEBUG) console.log(`➡️ Header moved to new page`);
          }
        }
      }
    });

    // Add remaining elements as last page
    if (currentPageElements.length > 0) {
      if (DEBUG) console.log(`📄 Creating final page ${newPages.length + 1} with ${currentPageElements.length} elements`);
      newPages.push(currentPageElements);
    }

    if (DEBUG) console.log(`✅ Pagination complete: ${newPages.length} pages`);
    setPages(newPages);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    // Wait for content to render and fonts to load
    const timer = setTimeout(() => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          // Additional delay to ensure all styles are applied
          setTimeout(paginateContent, 200);
        });
      } else {
        setTimeout(paginateContent, 300);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [children, paginateContent]);

  return (
    <>
      {/* Hidden container for measurement */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          width: '210mm',
          top: '-99999px',
          left: '-99999px',
          zIndex: -1,
        }}
      >
        {children}
      </div>

      {/* Visible paginated content */}
      <div ref={ref} className="cv-paginated-preview">
        {isProcessing ? (
          // Show loading state
          <div style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px',
              }} />
              <div>Đang xử lý phân trang...</div>
            </div>
          </div>
        ) : pages.length === 0 ? (
          // Fallback if pagination fails
          <div style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            backgroundColor: 'white',
            margin: '0 auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {children}
          </div>
        ) : (
          pages.map((pageElements, pageIndex) => (
            <div
              key={pageIndex}
              className="cv-page"
              style={{
                width: '210mm',
                height: '297mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                backgroundColor: 'white',
                marginBottom: pageIndex < pages.length - 1 ? '10mm' : '0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                position: 'relative',
                pageBreakAfter: pageIndex < pages.length - 1 ? 'always' : 'auto',
                breakAfter: pageIndex < pages.length - 1 ? 'page' : 'auto',
              }}
            >
              {/* Wrap content with padding - first page has no top padding (header handles it) */}
              <div className={pageIndex === 0 ? "px-8" : "px-8 pt-8"}>
                {pageElements.map((element, elementIndex) => {
                  const wrapper = document.createElement('div');
                  wrapper.appendChild(element);
                  return (
                    <div
                      key={elementIndex}
                      dangerouslySetInnerHTML={{ __html: wrapper.innerHTML }}
                    />
                  );
                })}
              </div>

              {/* Bottom padding for last page */}
              {pageIndex === pages.length - 1 && (
                <div className="pb-8" />
              )}

              {/* Page number */}
              <div
                className="no-print"
                style={{
                  position: 'absolute',
                  bottom: '5mm',
                  right: '10mm',
                  fontSize: '10px',
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Page {pageIndex + 1} / {pages.length}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
});

CVPaginatedPreview.displayName = 'CVPaginatedPreview';

export default CVPaginatedPreview;
