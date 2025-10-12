import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSectionManager } from '../../../hooks/useSectionManager';
import { 
  isTwoColumnTemplate, 
  splitSectionsByColumn,
  validateSectionOrder,
  getDefaultSectionOrder,
  moveSectionInColumn
} from '../../../utils/templateHelpers';

describe('Template Helpers', () => {
  describe('isTwoColumnTemplate', () => {
    it('should return true for two-column templates', () => {
      expect(isTwoColumnTemplate('two-column-sidebar')).toBe(true);
      expect(isTwoColumnTemplate('creative-split')).toBe(true);
    });

    it('should return false for single-column templates', () => {
      expect(isTwoColumnTemplate('modern-blue')).toBe(false);
      expect(isTwoColumnTemplate('classic-white')).toBe(false);
    });
  });

  describe('splitSectionsByColumn', () => {
    it('should split sections correctly for two-column-sidebar', () => {
      const sections = ['summary', 'experience', 'skills', 'education'];
      const result = splitSectionsByColumn(sections, 'two-column-sidebar');
      
      expect(result.sidebar).toContain('skills');
      expect(result.sidebar).toContain('education');
      expect(result.main).toContain('summary');
      expect(result.main).toContain('experience');
    });

    it('should return all sections in main for single-column template', () => {
      const sections = ['summary', 'experience', 'skills'];
      const result = splitSectionsByColumn(sections, 'modern-blue');
      
      expect(result.sidebar).toEqual([]);
      expect(result.main).toEqual(sections);
    });
  });

  describe('validateSectionOrder', () => {
    it('should validate correct section order', () => {
      const order = ['summary', 'experience', 'education', 'skills'];
      expect(validateSectionOrder(order, 'modern-blue')).toBe(true);
    });

    it('should reject invalid section names', () => {
      const order = ['summary', 'invalid-section', 'experience'];
      expect(validateSectionOrder(order, 'modern-blue')).toBe(false);
    });
  });

  describe('getDefaultSectionOrder', () => {
    it('should return default order for single-column template', () => {
      const order = getDefaultSectionOrder('modern-blue');
      expect(order).toContain('summary');
      expect(order).toContain('experience');
      expect(order).toContain('education');
    });

    it('should return correct order for two-column template', () => {
      const order = getDefaultSectionOrder('two-column-sidebar');
      expect(order.length).toBeGreaterThan(0);
    });
  });

  describe('moveSectionInColumn', () => {
    it('should move section up in single-column template', () => {
      const order = ['summary', 'experience', 'education'];
      const result = moveSectionInColumn(order, 'modern-blue', 'education', 'up');
      
      expect(result.indexOf('education')).toBe(1);
      expect(result.indexOf('experience')).toBe(2);
    });

    it('should move section down in single-column template', () => {
      const order = ['summary', 'experience', 'education'];
      const result = moveSectionInColumn(order, 'modern-blue', 'summary', 'down');
      
      expect(result.indexOf('summary')).toBe(1);
      expect(result.indexOf('experience')).toBe(0);
    });
  });
});

describe('useSectionManager Hook', () => {
  const initialOrder = ['summary', 'experience', 'education', 'skills'];
  const initialHidden = [];
  const templateId = 'modern-blue';

  it('should initialize with correct values', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    expect(result.current.sectionOrder).toEqual(initialOrder);
    expect(result.current.hiddenSections).toEqual(initialHidden);
  });

  it('should move section up', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    act(() => {
      result.current.moveSection('education', 'up');
    });

    const educationIndex = result.current.sectionOrder.indexOf('education');
    const experienceIndex = result.current.sectionOrder.indexOf('experience');
    expect(educationIndex).toBeLessThan(experienceIndex);
  });

  it('should move section down', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    act(() => {
      result.current.moveSection('summary', 'down');
    });

    const summaryIndex = result.current.sectionOrder.indexOf('summary');
    expect(summaryIndex).toBe(1);
  });

  it('should toggle section visibility', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    act(() => {
      result.current.toggleSectionVisibility('skills');
    });

    expect(result.current.hiddenSections).toContain('skills');

    act(() => {
      result.current.toggleSectionVisibility('skills');
    });

    expect(result.current.hiddenSections).not.toContain('skills');
  });

  it('should hide section', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    act(() => {
      result.current.hideSection('experience');
    });

    expect(result.current.hiddenSections).toContain('experience');
  });

  it('should show section', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, ['experience'], templateId)
    );

    act(() => {
      result.current.showSection('experience');
    });

    expect(result.current.hiddenSections).not.toContain('experience');
  });

  it('should reset to default', () => {
    const { result } = renderHook(() =>
      useSectionManager(['skills', 'summary'], ['experience'], templateId)
    );

    act(() => {
      result.current.resetToDefault();
    });

    expect(result.current.sectionOrder.length).toBeGreaterThan(0);
    expect(result.current.hiddenSections).toEqual([]);
  });

  it('should get visible sections', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, ['skills'], templateId)
    );

    const visible = result.current.getVisibleSections();
    expect(visible).not.toContain('skills');
    expect(visible).toContain('summary');
    expect(visible).toContain('experience');
  });

  it('should check if section is hidden', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, ['skills'], templateId)
    );

    expect(result.current.isSectionHidden('skills')).toBe(true);
    expect(result.current.isSectionHidden('summary')).toBe(false);
  });

  it('should check if can move up', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    expect(result.current.canMoveUp('summary')).toBe(false); // First item
    expect(result.current.canMoveUp('experience')).toBe(true);
  });

  it('should check if can move down', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    expect(result.current.canMoveDown('skills')).toBe(false); // Last item
    expect(result.current.canMoveDown('summary')).toBe(true);
  });

  it('should reorder sections', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    const newOrder = ['skills', 'summary', 'experience', 'education'];

    act(() => {
      result.current.reorderSections(newOrder);
    });

    expect(result.current.sectionOrder).toEqual(newOrder);
  });

  it('should hide multiple sections', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, initialHidden, templateId)
    );

    act(() => {
      result.current.hideSections(['skills', 'education']);
    });

    expect(result.current.hiddenSections).toContain('skills');
    expect(result.current.hiddenSections).toContain('education');
  });

  it('should show multiple sections', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, ['skills', 'education'], templateId)
    );

    act(() => {
      result.current.showSections(['skills', 'education']);
    });

    expect(result.current.hiddenSections).not.toContain('skills');
    expect(result.current.hiddenSections).not.toContain('education');
  });
});

describe('Two-Column Template Behavior', () => {
  const initialOrder = ['summary', 'experience', 'skills', 'education'];
  const templateId = 'two-column-sidebar';

  it('should move section within sidebar column only', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, [], templateId)
    );

    // Skills and Education are in sidebar
    act(() => {
      result.current.moveSection('education', 'up');
    });

    const { sidebar } = splitSectionsByColumn(result.current.sectionOrder, templateId);
    const educationIndex = sidebar.indexOf('education');
    const skillsIndex = sidebar.indexOf('skills');
    
    expect(educationIndex).toBeLessThan(skillsIndex);
  });

  it('should not allow moving section to different column', () => {
    const { result } = renderHook(() =>
      useSectionManager(initialOrder, [], templateId)
    );

    const initialSidebar = splitSectionsByColumn(result.current.sectionOrder, templateId).sidebar;

    act(() => {
      result.current.moveSection('skills', 'up');
    });

    const finalSidebar = splitSectionsByColumn(result.current.sectionOrder, templateId).sidebar;
    
    // Skills should still be in sidebar
    expect(finalSidebar).toContain('skills');
  });
});
