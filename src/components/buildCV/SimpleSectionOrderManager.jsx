import React, { useState } from 'react';
import { 
  Settings, GripVertical, ChevronUp, ChevronDown, 
  FileText, Briefcase, GraduationCap, Award, FolderOpen, 
  AlignCenterVertical as Certificate, Eye, EyeOff, 
  Columns2, LayoutList, RotateCcw, Info, AlertCircle 
} from 'lucide-react';
import { 
  isTwoColumnTemplate, 
  splitSectionsByColumn, 
  moveSectionInColumn,
  getDefaultSectionOrder 
} from '@/utils/templateHelpers';

/**
 * Simplified Section Order Manager - Không dùng internal state
 * Tất cả state được quản lý bởi parent component
 */
const SimpleSectionOrderManager = ({ 
  sectionOrder, 
  onChange, 
  hiddenSections, 
  onHiddenChange, 
  currentTemplate 
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const sectionConfig = {
    summary: {
      id: 'summary',
      name: 'Professional Summary',
      icon: FileText,
      description: 'Brief overview of your professional background',
      color: 'blue'
    },
    experience: {
      id: 'experience',
      name: 'Work Experience',
      icon: Briefcase,
      description: 'Your work history and achievements',
      color: 'purple'
    },
    education: {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      description: 'Your educational background',
      color: 'green'
    },
    skills: {
      id: 'skills',
      name: 'Skills',
      icon: Award,
      description: 'Technical and soft skills',
      color: 'orange'
    },
    projects: {
      id: 'projects',
      name: 'Projects',
      icon: FolderOpen,
      description: 'Personal and professional projects',
      color: 'indigo'
    },
    certificates: {
      id: 'certificates',
      name: 'Certificates',
      icon: Certificate,
      description: 'Professional certifications and achievements',
      color: 'pink'
    }
  };

  const isTwoColumn = isTwoColumnTemplate(currentTemplate);
  const { sidebar: sidebarSections, main: mainSections } = isTwoColumn 
    ? splitSectionsByColumn(sectionOrder, currentTemplate)
    : { sidebar: [], main: sectionOrder };

  // Move section up/down
  const handleMoveSection = (sectionId, direction) => {
    const newOrder = moveSectionInColumn(sectionOrder, currentTemplate, sectionId, direction);
    onChange(newOrder);
  };

  // Check if can move
  const canMoveUp = (sectionId) => {
    if (isTwoColumn) {
      const { sidebar, main } = splitSectionsByColumn(sectionOrder, currentTemplate);
      const columnSections = sidebar.includes(sectionId) ? sidebar : main;
      const index = columnSections.indexOf(sectionId);
      return index > 0;
    }
    return sectionOrder.indexOf(sectionId) > 0;
  };

  const canMoveDown = (sectionId) => {
    if (isTwoColumn) {
      const { sidebar, main } = splitSectionsByColumn(sectionOrder, currentTemplate);
      const columnSections = sidebar.includes(sectionId) ? sidebar : main;
      const index = columnSections.indexOf(sectionId);
      return index < columnSections.length - 1;
    }
    return sectionOrder.indexOf(sectionId) < sectionOrder.length - 1;
  };

  // Toggle visibility
  const handleToggleVisibility = (sectionId) => {
    if (hiddenSections.includes(sectionId)) {
      onHiddenChange(hiddenSections.filter(id => id !== sectionId));
    } else {
      onHiddenChange([...hiddenSections, sectionId]);
    }
  };

  // Reset to default
  const handleReset = () => {
    const defaultOrder = getDefaultSectionOrder(currentTemplate);
    onChange(defaultOrder);
    onHiddenChange([]);
  };

  // Drag & Drop handlers
  const handleDragStart = (e, index, column = null) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, column }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex, dropColumn = null) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const dragIndex = data.index;
    const dragColumn = data.column;

    if (dragIndex === dropIndex && dragColumn === dropColumn) {
      setDragOverIndex(null);
      setDragOverColumn(null);
      return;
    }

    let newFullOrder;

    if (dropColumn) {
      const columnSections = dropColumn === 'sidebar' ? sidebarSections : mainSections;
      const newColumnOrder = [...columnSections];
      const [draggedItem] = newColumnOrder.splice(dragIndex, 1);
      const newDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newColumnOrder.splice(newDropIndex, 0, draggedItem);

      const otherColumn = dropColumn === 'sidebar' ? mainSections : sidebarSections;
      newFullOrder = dropColumn === 'sidebar' 
        ? [...newColumnOrder, ...otherColumn]
        : [...otherColumn, ...newColumnOrder];
    } else {
      newFullOrder = [...sectionOrder];
      const [draggedItem] = newFullOrder.splice(dragIndex, 1);
      const newDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
      newFullOrder.splice(newDropIndex, 0, draggedItem);
    }

    onChange(newFullOrder);
    setDragOverIndex(null);
    setDragOverColumn(null);
  };

  const renderSectionItem = (sectionId, index, columnSections = null, columnName = null) => {
    const section = sectionConfig[sectionId];
    const Icon = section.icon;
    const isHidden = hiddenSections.includes(sectionId);
    const isDraggingOver = dragOverIndex === index && dragOverColumn === columnName;

    const colorClasses = {
      blue: 'border-blue-500 bg-blue-50',
      purple: 'border-purple-500 bg-purple-50',
      green: 'border-green-500 bg-green-50',
      orange: 'border-orange-500 bg-orange-50',
      indigo: 'border-indigo-500 bg-indigo-50',
      pink: 'border-pink-500 bg-pink-50'
    };

    return (
      <div
        key={sectionId}
        className={`p-4 border-l-4 rounded-lg transition-all relative ${
          isHidden 
            ? 'bg-gray-50 border-gray-200 opacity-60' 
            : `${colorClasses[section.color]} hover:shadow-md`
        }`}
        draggable={!isHidden}
        onDragStart={(e) => handleDragStart(e, index, columnName)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index, columnName)}
        onDragEnter={() => {
          setDragOverIndex(index);
          setDragOverColumn(columnName);
        }}
        onDragEnd={() => {
          setDragOverIndex(null);
          setDragOverColumn(null);
        }}
      >
        {isDraggingOver && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500" />}
        
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-center space-y-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" title="Drag to reorder" />
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => handleMoveSection(sectionId, 'up')}
                disabled={!canMoveUp(sectionId)}
                className={`p-1 rounded ${
                  !canMoveUp(sectionId)
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                }`}
                title="Move up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleMoveSection(sectionId, 'down')}
                disabled={!canMoveDown(sectionId)}
                className={`p-1 rounded ${
                  !canMoveDown(sectionId)
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                }`}
                title="Move down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className={`flex items-center space-x-3 flex-1 p-2 rounded ${isHidden ? '' : 'bg-white'}`}>
            <Icon className={`w-5 h-5 ${isHidden ? 'text-gray-400' : `text-${section.color}-600`}`} />
            <div className="flex-1">
              <div className={`font-medium ${isHidden ? 'text-gray-500' : 'text-gray-800'}`}>
                {section.name}
              </div>
              <div className="text-sm text-gray-500">{section.description}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              isHidden 
                ? 'bg-gray-200 text-gray-500' 
                : `bg-${section.color}-100 text-${section.color}-700`
            }`}>
              #{index + 1}
            </span>
            <button
              onClick={() => handleToggleVisibility(sectionId)}
              className={`p-2 rounded-full transition-colors ${
                isHidden 
                  ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                  : `text-${section.color}-600 hover:text-${section.color}-700 hover:bg-${section.color}-100`
              }`}
              title={isHidden ? 'Show section' : 'Hide section'}
            >
              {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Bố cục & Thứ tự Sections</h3>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset mặc định</span>
        </button>
      </div>

      {/* Template Layout Info */}
      {isTwoColumn && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Columns2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Template 2 cột đang được sử dụng</h4>
              <p className="text-sm text-blue-700">
                Template này sử dụng bố cục 2 cột. Sections được chia thành{' '}
                <strong>Sidebar</strong> (cột trái) và <strong>Nội dung chính</strong> (cột phải).
                Bạn có thể sắp xếp lại sections trong mỗi cột độc lập.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Mẹo:</strong> Kéo thả sections để sắp xếp lại, hoặc dùng nút mũi tên.{' '}
            {isTwoColumn && 'Mỗi cột có thể sắp xếp độc lập. '}
            Click icon mắt để ẩn/hiện sections trong CV của bạn.
          </div>
        </div>
      </div>

      {/* Section Reordering */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">
          {isTwoColumn ? 'Tùy chỉnh Sections theo cột' : 'Tùy chỉnh thứ tự Sections'}
        </h4>

        {isTwoColumn ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sidebar Column */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-2 p-2 bg-purple-50 rounded-lg">
                <LayoutList className="w-4 h-4 text-purple-600" />
                <h5 className="font-semibold text-gray-700">Sidebar (Cột trái)</h5>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {sidebarSections.length} sections
                </span>
              </div>
              {sidebarSections.map((sectionId, index) => 
                renderSectionItem(sectionId, index, sidebarSections, 'sidebar')
              )}
            </div>

            {/* Main Content Column */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-2 p-2 bg-green-50 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <h5 className="font-semibold text-gray-700">Nội dung chính (Cột phải)</h5>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {mainSections.length} sections
                </span>
              </div>
              {mainSections.map((sectionId, index) => 
                renderSectionItem(sectionId, index, mainSections, 'main')
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sectionOrder.map((sectionId, index) => renderSectionItem(sectionId, index))}
          </div>
        )}
      </div>

      {/* Layout Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Xem trước bố cục
        </h4>
        
        {isTwoColumn ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">Sidebar</h5>
              <div className="space-y-2">
                {sidebarSections.map((sectionId, index) => {
                  const section = sectionConfig[sectionId];
                  const isHidden = hiddenSections.includes(sectionId);
                  if (isHidden) return null;
                  return (
                    <div key={sectionId} className="flex items-center space-x-2 text-sm bg-white p-2 rounded">
                      <span className="text-purple-600 font-medium">{index + 1}.</span>
                      <span className="text-gray-700">{section.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">Nội dung chính</h5>
              <div className="space-y-2">
                {mainSections.map((sectionId, index) => {
                  const section = sectionConfig[sectionId];
                  const isHidden = hiddenSections.includes(sectionId);
                  if (isHidden) return null;
                  return (
                    <div key={sectionId} className="flex items-center space-x-2 text-sm bg-white p-2 rounded">
                      <span className="text-green-600 font-medium">{index + 1}.</span>
                      <span className="text-gray-700">{section.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sectionOrder.map((sectionId, index) => {
              const section = sectionConfig[sectionId];
              const isHidden = hiddenSections.includes(sectionId);
              if (isHidden) return null;
              return (
                <div key={sectionId} className="flex items-center space-x-2 text-sm bg-white p-2 rounded">
                  <span className="text-blue-600 font-medium">{index + 1}.</span>
                  <span className="text-gray-700">{section.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden Sections Alert */}
      {hiddenSections.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-orange-900 mb-1">Sections đang ẩn</h5>
              <p className="text-sm text-orange-700 mb-2">
                Các sections sau đang bị ẩn và sẽ không xuất hiện trong CV:
              </p>
              <div className="flex flex-wrap gap-2">
                {hiddenSections.map(sectionId => {
                  const section = sectionConfig[sectionId];
                  return (
                    <span key={sectionId} className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                      {section.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSectionOrderManager;
