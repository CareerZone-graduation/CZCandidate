import React from 'react';
import { Settings, GripVertical, ChevronUp, ChevronDown, FileText, Briefcase, GraduationCap, Award, FolderOpen, AlignCenterVertical as Certificate, Eye, EyeOff } from 'lucide-react';

const SectionOrderManager = ({ sectionOrder, onChange, hiddenSections, onHiddenChange }) => {
  const sectionConfig = {
    summary: {
      id: 'summary',
      name: 'Professional Summary',
      icon: FileText,
      description: 'Brief overview of your professional background'
    },
    experience: {
      id: 'experience',
      name: 'Work Experience',
      icon: Briefcase,
      description: 'Your work history and achievements'
    },
    education: {
      id: 'education',
      name: 'Education',
      icon: GraduationCap,
      description: 'Your educational background'
    },
    skills: {
      id: 'skills',
      name: 'Skills',
      icon: Award,
      description: 'Technical and soft skills'
    },
    projects: {
      id: 'projects',
      name: 'Projects',
      icon: FolderOpen,
      description: 'Personal and professional projects'
    },
    certificates: {
      id: 'certificates',
      name: 'Certificates',
      icon: Certificate,
      description: 'Professional certifications and achievements'
    }
  };

  const [dragOverIndex, setDragOverIndex] = React.useState(null);

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      onChange(newOrder);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sectionOrder];
    const [draggedItem] = newOrder.splice(dragIndex, 1);
    
    const newDropIndex = dragIndex < dropIndex ? dropIndex - 1 : dropIndex;
    
    newOrder.splice(newDropIndex, 0, draggedItem);
    onChange(newOrder);

    setDragOverIndex(null);
  };

  const toggleSectionVisibility = (sectionId) => {
    const newHiddenSections = hiddenSections.includes(sectionId)
      ? hiddenSections.filter(id => id !== sectionId)
      : [...hiddenSections, sectionId];
    onHiddenChange(newHiddenSections);
  };

  const resetToDefault = () => {
    onChange(['summary', 'experience', 'education', 'skills', 'projects', 'certificates']);
    onHiddenChange([]);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          CV Layout & Section Order
        </h3>
        <button
          onClick={resetToDefault}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset to Default
        </button>
      </div>


      {/* Section Reordering */}
      <div>
        <h4 className="font-medium text-gray-800 mb-3">Customize Section Order</h4>
        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg mb-4">
          💡 <strong>Tip:</strong> Drag and drop sections to reorder them, or use the arrow buttons. 
          The order here will be reflected in your CV preview and PDF export.
        </div>
        
        <div className="space-y-3">
          {sectionOrder.map((sectionId, index) => {
            const section = sectionConfig[sectionId];
            const Icon = section.icon;
            const isHidden = hiddenSections.includes(sectionId);
            const isDraggingOver = dragOverIndex === index;
            
            return (
              <div
                key={sectionId}
                className={`p-4 border rounded-lg transition-all relative ${
                  isHidden ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 hover:shadow-md'
                }`}
                draggable={!isHidden}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnter={() => setDragOverIndex(index)}
                onDragEnd={() => setDragOverIndex(null)}
              >
                {isDraggingOver && <div className="absolute top-0 left-0 w-full h-0.5 bg-black" />}
                <div className="flex items-center space-x-3">
                  {/* Drag Handle */}
                  <div className="flex flex-col items-center space-y-1">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" title="Drag to reorder" />
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sectionOrder.length - 1}
                        className={`p-1 rounded ${
                          index === sectionOrder.length - 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-100'
                        }`}
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Section Info */}
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon className={`w-5 h-5 ${isHidden ? 'text-gray-400' : 'text-blue-600'}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${isHidden ? 'text-gray-500' : 'text-gray-800'}`}>
                        {section.name}
                      </div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                  </div>

                  {/* Position Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isHidden 
                        ? 'bg-gray-200 text-gray-500' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      Position {index + 1}
                    </span>
                    
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => toggleSectionVisibility(sectionId)}
                      className={`p-1 rounded ${
                        isHidden 
                          ? 'text-gray-400 hover:text-gray-600' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                      title={isHidden ? 'Show section' : 'Hide section'}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Layout Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Layout Preview</h4>
        <div className="space-y-2">
          {sectionOrder.map((sectionId, index) => {
            const section = sectionConfig[sectionId];
            const isHidden = hiddenSections.includes(sectionId);
            
            if (isHidden) return null;
            
            return (
              <div key={sectionId} className="flex items-center space-x-2 text-sm">
                <span className="text-blue-600 font-medium">{index + 1}.</span>
                <span className="text-gray-700">{section.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">💡 Layout Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Put your strongest sections first (usually Experience or Skills)</li>
          <li>• Recent graduates should consider Education before Experience</li>
          <li>• Developers and creatives often benefit from Projects section early</li>
          <li>• Keep Professional Summary at the top for best impact</li>
          <li>• Hide sections you don't need to keep your CV focused</li>
        </ul>
      </div>
    </div>
  );
};

export default SectionOrderManager;