import { useState, useCallback } from 'react';
import { 
  isTwoColumnTemplate, 
  moveSectionInColumn, 
  getDefaultSectionOrder,
  validateSectionOrder,
  splitSectionsByColumn
} from '@/utils/templateHelpers';

/**
 * Custom hook để quản lý sections (order, visibility)
 */
export const useSectionManager = (initialSectionOrder, initialHiddenSections, templateId) => {
  const [sectionOrder, setSectionOrder] = useState(initialSectionOrder || getDefaultSectionOrder(templateId));
  const [hiddenSections, setHiddenSections] = useState(initialHiddenSections || []);

  /**
   * Di chuyển section lên/xuống
   */
  const moveSection = useCallback((sectionId, direction) => {
    setSectionOrder(prevOrder => {
      const newOrder = moveSectionInColumn(prevOrder, templateId, sectionId, direction);
      return validateSectionOrder(newOrder, templateId) ? newOrder : prevOrder;
    });
  }, [templateId]);

  /**
   * Reorder sections bằng drag & drop
   */
  const reorderSections = useCallback((newOrder) => {
    if (validateSectionOrder(newOrder, templateId)) {
      setSectionOrder(newOrder);
    }
  }, [templateId]);

  /**
   * Toggle visibility của section
   */
  const toggleSectionVisibility = useCallback((sectionId) => {
    setHiddenSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  }, []);

  /**
   * Ẩn section
   */
  const hideSection = useCallback((sectionId) => {
    setHiddenSections(prev => {
      if (!prev.includes(sectionId)) {
        return [...prev, sectionId];
      }
      return prev;
    });
  }, []);

  /**
   * Hiện section
   */
  const showSection = useCallback((sectionId) => {
    setHiddenSections(prev => prev.filter(id => id !== sectionId));
  }, []);

  /**
   * Ẩn nhiều sections
   */
  const hideSections = useCallback((sectionIds) => {
    setHiddenSections(prev => {
      const newHidden = [...prev];
      sectionIds.forEach(id => {
        if (!newHidden.includes(id)) {
          newHidden.push(id);
        }
      });
      return newHidden;
    });
  }, []);

  /**
   * Hiện nhiều sections
   */
  const showSections = useCallback((sectionIds) => {
    setHiddenSections(prev => prev.filter(id => !sectionIds.includes(id)));
  }, []);

  /**
   * Reset về default
   */
  const resetToDefault = useCallback(() => {
    setSectionOrder(getDefaultSectionOrder(templateId));
    setHiddenSections([]);
  }, [templateId]);

  /**
   * Lấy visible sections (không bị ẩn)
   */
  const getVisibleSections = useCallback(() => {
    return sectionOrder.filter(id => !hiddenSections.includes(id));
  }, [sectionOrder, hiddenSections]);

  /**
   * Kiểm tra section có bị ẩn không
   */
  const isSectionHidden = useCallback((sectionId) => {
    return hiddenSections.includes(sectionId);
  }, [hiddenSections]);

  /**
   * Lấy index của section trong order
   */
  const getSectionIndex = useCallback((sectionId) => {
    return sectionOrder.indexOf(sectionId);
  }, [sectionOrder]);

  /**
   * Kiểm tra có thể di chuyển section lên không
   */
  const canMoveUp = useCallback((sectionId) => {
    const index = getSectionIndex(sectionId);
    if (index <= 0) return false;

    // Nếu là template 2 cột, chỉ check trong column của nó
    if (isTwoColumnTemplate(templateId)) {
      const { sidebar, main } = splitSectionsByColumn(sectionOrder, templateId);
      const columnSections = sidebar.includes(sectionId) ? sidebar : main;
      const columnIndex = columnSections.indexOf(sectionId);
      return columnIndex > 0;
    }

    return true;
  }, [sectionOrder, templateId, getSectionIndex]);

  /**
   * Kiểm tra có thể di chuyển section xuống không
   */
  const canMoveDown = useCallback((sectionId) => {
    const index = getSectionIndex(sectionId);
    if (index === -1 || index >= sectionOrder.length - 1) return false;

    // Nếu là template 2 cột, chỉ check trong column của nó
    if (isTwoColumnTemplate(templateId)) {
      const { sidebar, main } = splitSectionsByColumn(sectionOrder, templateId);
      const columnSections = sidebar.includes(sectionId) ? sidebar : main;
      const columnIndex = columnSections.indexOf(sectionId);
      return columnIndex < columnSections.length - 1;
    }

    return true;
  }, [sectionOrder, templateId, getSectionIndex]);

  return {
    sectionOrder,
    hiddenSections,
    moveSection,
    reorderSections,
    toggleSectionVisibility,
    hideSection,
    showSection,
    hideSections,
    showSections,
    resetToDefault,
    getVisibleSections,
    isSectionHidden,
    getSectionIndex,
    canMoveUp,
    canMoveDown,
    setSectionOrder,
    setHiddenSections
  };
};
