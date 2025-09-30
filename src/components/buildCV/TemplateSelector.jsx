import React, { useState, useEffect } from 'react';
import { getTemplates } from '../../services/api';
import { Check } from 'lucide-react';

const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await getTemplates();
        // The API returns templates in the expected format
        setTemplates(response.data || []);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
        // Fallback to empty array
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getTemplatePreview = (template) => {
    const baseClasses = "w-full h-48 rounded-lg border-2 transition-all duration-200 cursor-pointer relative overflow-hidden";
    const selectedClasses = selectedTemplate === template.id ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300";
    
    switch (template.id) {
      case 'modern-blue':
        return (
          <div className={`${baseClasses} ${selectedClasses}`} onClick={() => onSelectTemplate(template.id)}>
            <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-700"></div>
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              <div className="h-2 bg-blue-100 rounded w-2/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'classic-white':
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-white`} onClick={() => onSelectTemplate(template.id)}>
            <div className="p-4 space-y-2 border-b-4 border-gray-800">
              <div className="h-3 bg-gray-800 rounded w-3/4 mx-auto"></div>
              <div className="h-2 bg-gray-400 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="p-4 space-y-2">
              <div className="h-2 bg-gray-300 rounded w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'creative-gradient':
        return (
          <div className={`${baseClasses} ${selectedClasses}`} onClick={() => onSelectTemplate(template.id)}>
            <div className="h-16 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-3/4"></div>
              <div className="h-2 bg-gradient-to-r from-orange-100 to-red-100 rounded w-1/2"></div>
              <div className="h-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded w-2/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'minimal-gray':
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-white`} onClick={() => onSelectTemplate(template.id)}>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-900 rounded w-3/4"></div>
              <div className="h-1 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-1">
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'two-column-sidebar':
        return (
          <div className={`${baseClasses} ${selectedClasses} flex`} onClick={() => onSelectTemplate(template.id)}>
            <div className="w-2/5 bg-gray-800 p-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-2"></div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                <div className="h-1 bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-3/5 p-2 space-y-1">
              <div className="h-2 bg-blue-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-1/2"></div>
              <div className="h-1 bg-gray-100 rounded w-2/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'elegant-serif':
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-gray-50`} onClick={() => onSelectTemplate(template.id)}>
            <div className="p-4 space-y-3 border-b-2 border-gray-300">
              <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto" style={{fontFamily: 'serif'}}></div>
              <div className="h-1 bg-gray-400 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="p-4 space-y-2">
              <div className="h-2 bg-gray-300 rounded w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'modern-sans':
        return (
          <div className={`${baseClasses} ${selectedClasses}`} onClick={() => onSelectTemplate(template.id)}>
            <div className="h-12 bg-gradient-to-r from-gray-900 to-gray-800"></div>
            <div className="p-4 space-y-2">
              <div className="h-2 bg-blue-500 rounded w-1/4"></div>
              <div className="h-3 bg-gray-800 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-2 bg-gray-100 rounded w-2/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'compact-dense':
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-white`} onClick={() => onSelectTemplate(template.id)}>
            <div className="p-2 border-b-2 border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-2 bg-gray-800 rounded w-2/3"></div>
                  <div className="h-1 bg-gray-400 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-1/2"></div>
              <div className="h-1 bg-gray-100 rounded w-2/3"></div>
              <div className="h-1 bg-gray-100 rounded w-1/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'creative-split':
        return (
          <div className={`${baseClasses} ${selectedClasses} flex`} onClick={() => onSelectTemplate(template.id)}>
            <div className="w-2/5 bg-gradient-to-br from-purple-600 to-pink-500 p-2">
              <div className="w-8 h-8 bg-white/30 rounded-full mx-auto mb-2"></div>
              <div className="space-y-1">
                <div className="h-1 bg-white/60 rounded w-3/4"></div>
                <div className="h-1 bg-white/40 rounded w-1/2"></div>
              </div>
            </div>
            <div className="w-3/5 p-2 space-y-1">
              <div className="h-2 bg-pink-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-1/2"></div>
              <div className="h-1 bg-gray-100 rounded w-2/3"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      case 'executive-formal':
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-gray-100`} onClick={() => onSelectTemplate(template.id)}>
            <div className="p-4 border-b-4 border-gray-800 text-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-2/3 mx-auto mb-1"></div>
              <div className="h-1 bg-gray-500 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="p-4 space-y-2 text-center">
              <div className="h-2 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} ${selectedClasses} bg-gray-100`} onClick={() => onSelectTemplate(template.id)}>
            <div className="flex items-center justify-center h-full text-gray-400">
              Preview
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Choose Template</h3>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Choose Template</h3>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Choose Template</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="space-y-3">
            {getTemplatePreview(template)}
            <div className="text-center">
              <h4 className="font-medium text-gray-800">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                {template.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;