# 🎯 Section Order Manager - Complete Guide

## 📦 Tổng quan hệ thống

Hệ thống quản lý thứ tự và hiển thị sections trong CV Builder với các tính năng:

✅ **Drag & Drop** - Kéo thả để sắp xếp lại sections  
✅ **Hide/Show** - Ẩn/hiện sections không cần thiết  
✅ **Two-Column Support** - Hỗ trợ đặc biệt cho templates 2 cột  
✅ **Validation** - Đảm bảo section order hợp lệ  
✅ **Responsive** - Hoạt động tốt trên mọi thiết bị  

---

## 🚀 Quick Start

### Bước 1: Import component

```jsx
import ImprovedSectionOrderManager from '@/components/buildCV/ImprovedSectionOrderManager';
```

### Bước 2: Sử dụng trong component

```jsx
function CVBuilder() {
  const [cvData, setCVData] = useState({
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
    hiddenSections: [],
    template: 'modern-blue'
  });

  return (
    <ImprovedSectionOrderManager
      sectionOrder={cvData.sectionOrder}
      hiddenSections={cvData.hiddenSections}
      currentTemplate={cvData.template}
      onChange={(newOrder) => setCVData({ ...cvData, sectionOrder: newOrder })}
      onHiddenChange={(newHidden) => setCVData({ ...cvData, hiddenSections: newHidden })}
    />
  );
}
```

### Bước 3: Test với Demo component

```jsx
import SectionManagerDemo from '@/components/buildCV/SectionManagerDemo';

// Trong route hoặc page
<Route path="/demo/section-manager" element={<SectionManagerDemo />} />
```

---

## 📁 Cấu trúc Files

```
CareerZone-Candidate-FE/src/
├── utils/
│   └── templateHelpers.js                    # ⭐ Helper functions
├── hooks/
│   └── useSectionManager.js                  # ⭐ Custom hook
└── components/
    └── buildCV/
        ├── ImprovedSectionOrderManager.jsx   # ⭐ Main component (NEW)
        ├── SectionManagerDemo.jsx            # 🧪 Demo/Test component
        ├── README_SECTION_MANAGER.md         # 📚 Chi tiết documentation
        └── SectionOrderManager.jsx           # 🔄 Old component (keep for compatibility)
```

---

## 🎨 Templates được hỗ trợ

### Single Column Templates
- `modern-blue`
- `classic-white`
- `creative-gradient`
- `minimal-gray`
- `elegant-serif`
- `modern-sans`
- `compact-dense`
- `executive-formal`

### Two Column Templates
- `two-column-sidebar` - Sidebar: skills, education | Main: summary, experience, projects, certificates
- `creative-split` - Sidebar: skills, education, certificates | Main: summary, experience, projects

---

## 🔧 API & Functions

### Component Props

```typescript
interface ImprovedSectionOrderManagerProps {
  sectionOrder: string[];              // Thứ tự sections hiện tại
  hiddenSections: string[];            // Danh sách sections bị ẩn
  currentTemplate: string;             // ID của template
  onChange: (newOrder: string[]) => void;        // Callback khi order thay đổi
  onHiddenChange: (newHidden: string[]) => void; // Callback khi hidden thay đổi
}
```

### Hook API

```typescript
const {
  // State
  sectionOrder,
  hiddenSections,
  
  // Actions
  moveSection,              // Di chuyển section lên/xuống
  reorderSections,          // Set order mới (drag & drop)
  toggleSectionVisibility,  // Toggle hide/show
  resetToDefault,           // Reset về default
  
  // Getters
  getVisibleSections,       // Lấy danh sách sections visible
  canMoveUp,                // Check có thể move up không
  canMoveDown,              // Check có thể move down không
  
  // Setters
  setSectionOrder,
  setHiddenSections
} = useSectionManager(initialOrder, initialHidden, templateId);
```

### Helper Functions

```javascript
// Check template có phải 2 cột không
isTwoColumnTemplate(templateId: string): boolean

// Lấy cấu hình layout
getTwoColumnLayout(templateId: string): { sidebar: string[], main: string[] } | null

// Phân chia sections theo column
splitSectionsByColumn(sectionOrder: string[], templateId: string): { sidebar: string[], main: string[] }

// Validate section order
validateSectionOrder(sectionOrder: string[], templateId: string): boolean

// Lấy default order
getDefaultSectionOrder(templateId: string): string[]

// Di chuyển section trong column
moveSectionInColumn(sectionOrder: string[], templateId: string, sectionId: string, direction: 'up' | 'down'): string[]
```

---

## 💡 Use Cases & Examples

### Use Case 1: Tích hợp vào CV Builder

```jsx
import { useState } from 'react';
import ImprovedSectionOrderManager from '@/components/buildCV/ImprovedSectionOrderManager';

const CVBuilder = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [cvData, setCVData] = useState({
    personalInfo: {},
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
    hiddenSections: [],
    template: 'modern-blue'
  });

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'layout', label: 'Layout' },  // ⭐ Tab cho Section Manager
    { id: 'template', label: 'Template' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <ImprovedSectionOrderManager
            sectionOrder={cvData.sectionOrder}
            hiddenSections={cvData.hiddenSections}
            currentTemplate={cvData.template}
            onChange={(newOrder) => setCVData({ ...cvData, sectionOrder: newOrder })}
            onHiddenChange={(newHidden) => setCVData({ ...cvData, hiddenSections: newHidden })}
          />
        );
      // ... other cases
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="content">
        {renderTabContent()}
      </div>
    </div>
  );
};
```

### Use Case 2: Custom hook với additional logic

```jsx
import { useSectionManager } from '@/hooks/useSectionManager';
import { getSectionMetadata } from '@/utils/templateHelpers';

const useAdvancedSectionManager = (initialOrder, initialHidden, templateId) => {
  const manager = useSectionManager(initialOrder, initialHidden, templateId);

  // Custom: Hide all optional sections
  const hideOptionalSections = () => {
    const optionalSections = manager.sectionOrder.filter(id => {
      const metadata = getSectionMetadata(id);
      return metadata && !metadata.required;
    });
    manager.hideSections(optionalSections);
  };

  // Custom: Show only essential sections
  const showEssentialOnly = () => {
    const essentialSections = ['summary', 'experience', 'education'];
    const toHide = manager.sectionOrder.filter(id => !essentialSections.includes(id));
    manager.hideSections(toHide);
  };

  // Custom: Optimize for ATS (Applicant Tracking System)
  const optimizeForATS = () => {
    // ATS-friendly order
    const atsOrder = ['summary', 'experience', 'education', 'skills', 'certificates', 'projects'];
    manager.reorderSections(atsOrder);
    manager.showSections(atsOrder); // Show all
  };

  return {
    ...manager,
    hideOptionalSections,
    showEssentialOnly,
    optimizeForATS
  };
};

// Usage
const MyComponent = () => {
  const {
    sectionOrder,
    hiddenSections,
    hideOptionalSections,
    optimizeForATS
  } = useAdvancedSectionManager(initialOrder, initialHidden, templateId);

  return (
    <div>
      <button onClick={hideOptionalSections}>Hide Optional</button>
      <button onClick={optimizeForATS}>Optimize for ATS</button>
    </div>
  );
};
```

### Use Case 3: Sync với Backend

```jsx
import { useEffect, useCallback } from 'react';
import { useSectionManager } from '@/hooks/useSectionManager';
import { updateCv } from '@/services/api';
import { debounce } from 'lodash';

const CVBuilderWithAutoSave = ({ cvId, initialData }) => {
  const {
    sectionOrder,
    hiddenSections,
    // ... other methods
  } = useSectionManager(
    initialData.sectionOrder,
    initialData.hiddenSections,
    initialData.template
  );

  // Auto-save với debounce
  const saveToBackend = useCallback(
    debounce(async (data) => {
      try {
        await updateCv(cvId, data);
        console.log('✅ Auto-saved');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, 1000),
    [cvId]
  );

  // Sync khi có thay đổi
  useEffect(() => {
    saveToBackend({ sectionOrder, hiddenSections });
  }, [sectionOrder, hiddenSections, saveToBackend]);

  return (
    <ImprovedSectionOrderManager
      sectionOrder={sectionOrder}
      hiddenSections={hiddenSections}
      currentTemplate={initialData.template}
      onChange={(newOrder) => {/* handled by hook */}}
      onHiddenChange={(newHidden) => {/* handled by hook */}}
    />
  );
};
```

### Use Case 4: Xử lý khi đổi template

```jsx
import { getDefaultSectionOrder } from '@/utils/templateHelpers';

const TemplateSelector = ({ currentTemplate, onTemplateChange, cvData, setCVData }) => {
  const handleTemplateChange = (newTemplateId) => {
    // Confirm nếu có thay đổi chưa lưu
    const confirmed = window.confirm(
      'Changing template will reset section order. Continue?'
    );

    if (confirmed) {
      // Reset section order về default của template mới
      const newOrder = getDefaultSectionOrder(newTemplateId);
      
      setCVData({
        ...cvData,
        template: newTemplateId,
        sectionOrder: newOrder,
        // Có thể giữ hiddenSections hoặc reset
        hiddenSections: []
      });

      onTemplateChange(newTemplateId);
    }
  };

  return (
    <div>
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => handleTemplateChange(template.id)}
          className={currentTemplate === template.id ? 'active' : ''}
        >
          {template.name}
        </button>
      ))}
    </div>
  );
};
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Sections không di chuyển được

**Triệu chứng**: Click nút up/down nhưng section không di chuyển

**Nguyên nhân**: 
- Template 2 cột: Đang cố di chuyển section ra khỏi column của nó
- Đã ở vị trí đầu/cuối

**Giải pháp**:
```jsx
// Check trước khi di chuyển
const handleMove = (sectionId, direction) => {
  if (direction === 'up' && !canMoveUp(sectionId)) {
    alert('Cannot move up - already at top of column');
    return;
  }
  if (direction === 'down' && !canMoveDown(sectionId)) {
    alert('Cannot move down - already at bottom of column');
    return;
  }
  moveSection(sectionId, direction);
};
```

### Issue 2: State không sync với parent

**Triệu chứng**: Thay đổi trong Section Manager không phản ánh ở component cha

**Nguyên nhân**: Không gọi onChange/onHiddenChange callbacks

**Giải pháp**:
```jsx
// Trong ImprovedSectionOrderManager, đảm bảo có:
React.useEffect(() => {
  onChange(sectionOrder);
}, [sectionOrder, onChange]);

React.useEffect(() => {
  onHiddenChange(hiddenSections);
}, [hiddenSections, onHiddenChange]);
```

### Issue 3: Validation failed

**Triệu chứng**: Console error "Invalid section order"

**Nguyên nhân**: Section order không hợp lệ cho template hiện tại

**Giải pháp**:
```jsx
import { validateSectionOrder, getDefaultSectionOrder } from '@/utils/templateHelpers';

const handleReorder = (newOrder) => {
  if (!validateSectionOrder(newOrder, templateId)) {
    console.warn('Invalid order, resetting to default');
    const defaultOrder = getDefaultSectionOrder(templateId);
    setSectionOrder(defaultOrder);
    return;
  }
  setSectionOrder(newOrder);
};
```

### Issue 4: Drag & Drop không hoạt động

**Triệu chứng**: Không thể kéo thả sections

**Nguyên nhân**: 
- Section bị hidden (hidden sections không draggable)
- Browser không hỗ trợ HTML5 drag & drop

**Giải pháp**:
```jsx
// Đảm bảo draggable chỉ khi không hidden
<div
  draggable={!isHidden}
  onDragStart={!isHidden ? handleDragStart : undefined}
>
  {/* content */}
</div>

// Fallback: Sử dụng nút up/down thay vì drag & drop
```

---

## 🎓 Best Practices

### 1. Luôn validate trước khi update

```javascript
const updateSectionOrder = (newOrder) => {
  if (validateSectionOrder(newOrder, templateId)) {
    setSectionOrder(newOrder);
  } else {
    // Handle invalid order
    console.error('Invalid section order');
  }
};
```

### 2. Debounce auto-save

```javascript
import { debounce } from 'lodash';

const debouncedSave = useCallback(
  debounce((data) => updateCv(cvId, data), 1000),
  [cvId]
);

useEffect(() => {
  debouncedSave({ sectionOrder, hiddenSections });
}, [sectionOrder, hiddenSections]);
```

### 3. Provide user feedback

```jsx
const [isSaving, setIsSaving] = useState(false);

const saveChanges = async () => {
  setIsSaving(true);
  try {
    await updateCv(cvId, { sectionOrder, hiddenSections });
    toast.success('Changes saved!');
  } catch (error) {
    toast.error('Failed to save changes');
  } finally {
    setIsSaving(false);
  }
};

return (
  <div>
    <ImprovedSectionOrderManager {...props} />
    {isSaving && <div>Saving...</div>}
  </div>
);
```

### 4. Handle template changes gracefully

```jsx
const handleTemplateChange = (newTemplate) => {
  // Warn user if there are unsaved changes
  if (hasUnsavedChanges) {
    const confirmed = confirm('You have unsaved changes. Continue?');
    if (!confirmed) return;
  }

  // Reset to default order for new template
  const newOrder = getDefaultSectionOrder(newTemplate);
  setCVData({
    ...cvData,
    template: newTemplate,
    sectionOrder: newOrder
  });
};
```

### 5. Accessibility

```jsx
// Thêm ARIA labels và keyboard support
<button
  onClick={() => moveSection(sectionId, 'up')}
  aria-label={`Move ${sectionName} up`}
  disabled={!canMoveUp(sectionId)}
>
  <ChevronUp />
</button>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'ArrowUp') {
      moveSection(selectedSection, 'up');
    }
    if (e.ctrlKey && e.key === 'ArrowDown') {
      moveSection(selectedSection, 'down');
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [selectedSection]);
```

---

## 📊 Performance Tips

### 1. Memoize callbacks

```jsx
const handleSectionOrderChange = useCallback((newOrder) => {
  setCVData(prev => ({ ...prev, sectionOrder: newOrder }));
}, []);

const handleHiddenSectionsChange = useCallback((newHidden) => {
  setCVData(prev => ({ ...prev, hiddenSections: newHidden }));
}, []);
```

### 2. Lazy load component

```jsx
import { lazy, Suspense } from 'react';

const ImprovedSectionOrderManager = lazy(() => 
  import('@/components/buildCV/ImprovedSectionOrderManager')
);

function CVBuilder() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ImprovedSectionOrderManager {...props} />
    </Suspense>
  );
}
```

### 3. Optimize re-renders

```jsx
import { memo } from 'react';

const SectionItem = memo(({ section, onMove, onToggle }) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.section.id === nextProps.section.id &&
         prevProps.section.isHidden === nextProps.section.isHidden;
});
```

---

## 🧪 Testing

### Unit Test Example

```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSectionManager } from '@/hooks/useSectionManager';

describe('useSectionManager', () => {
  it('should move section up', () => {
    const { result } = renderHook(() =>
      useSectionManager(
        ['summary', 'experience', 'education'],
        [],
        'modern-blue'
      )
    );

    act(() => {
      result.current.moveSection('education', 'up');
    });

    expect(result.current.sectionOrder).toEqual([
      'summary',
      'education',
      'experience'
    ]);
  });

  it('should toggle section visibility', () => {
    const { result } = renderHook(() =>
      useSectionManager(
        ['summary', 'experience'],
        [],
        'modern-blue'
      )
    );

    act(() => {
      result.current.toggleSectionVisibility('experience');
    });

    expect(result.current.hiddenSections).toContain('experience');
  });
});
```

---

## 📚 Additional Resources

- [Component Demo](/demo/section-manager) - Live demo
- [README_SECTION_MANAGER.md](./src/components/buildCV/README_SECTION_MANAGER.md) - Detailed API docs
- [React DnD](https://react-dnd.github.io/react-dnd/) - Drag & Drop library
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 🤝 Contributing

Nếu muốn cải thiện Section Manager:

1. Test với Demo component trước
2. Đảm bảo backward compatibility
3. Update documentation
4. Add unit tests

---

## 📝 Changelog

### v2.0.0 (Current)
- ✨ New ImprovedSectionOrderManager component
- ✨ useSectionManager custom hook
- ✨ Template helpers utilities
- ✨ Better two-column support
- ✨ Enhanced UI/UX
- ✨ Demo component for testing

### v1.0.0
- ✅ Basic SectionOrderManager
- ✅ Drag & drop support
- ✅ Hide/show sections

---

**Made with ❤️ for CareerZone**
