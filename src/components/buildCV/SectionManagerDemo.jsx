import React, { useState } from 'react';
import ImprovedSectionOrderManager from './ImprovedSectionOrderManager';
import { Play, Code, Eye } from 'lucide-react';

/**
 * Demo component để test Section Order Manager
 * Có thể dùng để development và testing
 */
const SectionManagerDemo = () => {
  const [cvData, setCVData] = useState({
    sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
    hiddenSections: [],
    template: 'modern-blue'
  });

  const [showCode, setShowCode] = useState(false);

  const templates = [
    { id: 'modern-blue', name: 'Modern Blue', type: 'Single Column' },
    { id: 'classic-white', name: 'Classic White', type: 'Single Column' },
    { id: 'two-column-sidebar', name: 'Two Column Sidebar', type: 'Two Column' },
    { id: 'creative-split', name: 'Creative Split', type: 'Two Column' },
    { id: 'minimal-gray', name: 'Minimal Gray', type: 'Single Column' }
  ];

  const handleTemplateChange = (newTemplate) => {
    setCVData(prev => ({ ...prev, template: newTemplate }));
  };

  const handleSectionOrderChange = (newOrder) => {
    setCVData(prev => ({ ...prev, sectionOrder: newOrder }));
  };

  const handleHiddenSectionsChange = (newHidden) => {
    setCVData(prev => ({ ...prev, hiddenSections: newHidden }));
  };

  const codeExample = `import ImprovedSectionOrderManager from '@/components/buildCV/ImprovedSectionOrderManager';

function CVBuilder() {
  const [cvData, setCVData] = useState({
    sectionOrder: ${JSON.stringify(cvData.sectionOrder, null, 2)},
    hiddenSections: ${JSON.stringify(cvData.hiddenSections, null, 2)},
    template: '${cvData.template}'
  });

  return (
    <ImprovedSectionOrderManager
      sectionOrder={cvData.sectionOrder}
      hiddenSections={cvData.hiddenSections}
      currentTemplate={cvData.template}
      onChange={(newOrder) => 
        setCVData(prev => ({ ...prev, sectionOrder: newOrder }))
      }
      onHiddenChange={(newHidden) => 
        setCVData(prev => ({ ...prev, hiddenSections: newHidden }))
      }
    />
  );
}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Play className="w-8 h-8 mr-3 text-blue-600" />
                Section Order Manager Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Test and preview the section order manager with different templates
              </p>
            </div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>{showCode ? 'Hide' : 'Show'} Code</span>
            </button>
          </div>

          {/* Template Selector */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template to Test:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    cvData.template === template.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{template.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code Example */}
        {showCode && (
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Usage Example
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(codeExample);
                  alert('Code copied to clipboard!');
                }}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Copy Code
              </button>
            </div>
            <pre className="text-green-400 text-sm font-mono">
              <code>{codeExample}</code>
            </pre>
          </div>
        )}

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Manager */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ImprovedSectionOrderManager
                sectionOrder={cvData.sectionOrder}
                hiddenSections={cvData.hiddenSections}
                currentTemplate={cvData.template}
                onChange={handleSectionOrderChange}
                onHiddenChange={handleHiddenSectionsChange}
              />
            </div>
          </div>

          {/* State Preview */}
          <div className="space-y-6">
            {/* Current State */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Current State
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Template:</label>
                  <div className="mt-1 p-2 bg-blue-50 rounded text-blue-700 font-mono text-sm">
                    {cvData.template}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Section Order ({cvData.sectionOrder.length}):
                  </label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    <ol className="text-sm space-y-1">
                      {cvData.sectionOrder.map((section, index) => (
                        <li key={section} className="flex items-center">
                          <span className="text-gray-500 mr-2">{index + 1}.</span>
                          <span className={`font-mono ${
                            cvData.hiddenSections.includes(section) 
                              ? 'text-gray-400 line-through' 
                              : 'text-gray-700'
                          }`}>
                            {section}
                          </span>
                          {cvData.hiddenSections.includes(section) && (
                            <span className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                              hidden
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Hidden Sections ({cvData.hiddenSections.length}):
                  </label>
                  <div className="mt-1 p-2 bg-orange-50 rounded">
                    {cvData.hiddenSections.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hidden sections</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cvData.hiddenSections.map(section => (
                          <span key={section} className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded font-mono">
                            {section}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Output */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">JSON Output</h3>
              <div className="bg-gray-900 rounded p-4 overflow-x-auto">
                <pre className="text-green-400 text-xs font-mono">
                  {JSON.stringify(cvData, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(cvData, null, 2));
                  alert('JSON copied to clipboard!');
                }}
                className="mt-3 w-full text-sm px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Copy JSON
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleHiddenSectionsChange([])}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Show All Sections
                </button>
                <button
                  onClick={() => handleHiddenSectionsChange(['projects', 'certificates'])}
                  className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
                >
                  Hide Optional Sections
                </button>
                <button
                  onClick={() => {
                    const reversed = [...cvData.sectionOrder].reverse();
                    handleSectionOrderChange(reversed);
                  }}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Reverse Order
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Try switching between different templates to see how the section manager 
            adapts to single-column and two-column layouts. Drag sections, hide/show them, and observe 
            the state changes in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionManagerDemo;
