import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCvById, createCv, updateCv, exportPdf as exportPdfApi } from '../../services/api';
import { mapToFrontend, mapToBackend } from '../../utils/dataMapper';
import { sampleCVData, creativeSampleData, minimalSampleData } from '../../data/sampleData';
import CVPreview from '../CVPreview/CVPreview';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import WorkExperienceForm from '../forms/WorkExperienceForm';
import SkillsForm from '../forms/SkillsForm';
import EducationForm from '../forms/EducationForm';
import ProjectsForm from '../forms/ProjectsForm';
import CertificatesForm from '../forms/CertificatesForm';
import TemplateSelector from './TemplateSelector';
import SectionOrderManager from './SectionOrderManager';
import { 
  User, 
  Briefcase, 
  Award, 
  FileText, 
  Eye, 
  Save, 
  Download, 
  Palette,
  Menu,
  X,
  Plus,
  GraduationCap,
  FolderOpen,
  AlignCenterVertical as Certificate,
  Settings,
  Sparkles,
  Zap,
  Coffee,
  Home
} from 'lucide-react';

const CVBuilder = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef(null);
  const cvContentRef = useRef(null);
  const [cvData, setCVData] = useState(null);

  useEffect(() => {
    const fetchOrCreateCv = async () => {
      setIsLoading(true);
      try {
        if (cvId && cvId !== 'new') {
          const dataFromApi = await getCvById(cvId);
          if (dataFromApi) {
            setCVData(mapToFrontend(dataFromApi));
          } else {
            // If not found, create a new one
            navigate('/editor/new', { replace: true });
          }
        } else {
          // Create a new CV
          const newCv = await createCv({ name: 'New CV', templateId: 'modern-blue' }); // Default template
          setCVData(mapToFrontend(newCv));
          navigate(`/editor/${newCv._id}`, { replace: true });
        }
      } catch (error) {
        console.error("Error fetching or creating CV:", error);
        // Handle error (e.g., show a notification, redirect to an error page)
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateCv();
  }, [cvId, navigate]);

  useLayoutEffect(() => {
    const container = previewContainerRef.current;
    // Đảm bảo container và content đã được render
    if (!container || !cvContentRef.current) {
      return;
    }

    const updateScale = () => {
      // Kiểm tra lại trong trường hợp re-render
      if (!container || !cvContentRef.current) return;

      const containerWidth = container.offsetWidth;
      // Chiều rộng của CV theo khổ A4 (210mm) quy đổi ra pixel.
      // Giả sử 1 inch = 96px và 1 inch = 25.4mm
      const cvContentWidth = 210 * (96 / 25.4);

      if (containerWidth < cvContentWidth) {
        // Nếu container hẹp hơn, tính tỷ lệ để thu nhỏ CV vừa vặn
        // Trừ một ít padding để không bị dính sát
        setScale((containerWidth - 32) / cvContentWidth);
      } else {
        // Nếu container đủ rộng, giữ nguyên kích thước gốc
        setScale(1);
      }
    };

    updateScale(); // Chạy lần đầu

    // Tự động cập nhật khi kích thước container thay đổi
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    // Dọn dẹp
    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [isLoading, showPreview]); // Chạy lại khi tải xong hoặc khi bật/tắt preview


  // Load sample data functions
  const loadSampleData = (sampleType = 'default') => {
    if (!cvData) {
      console.warn('CV data is not loaded yet. Cannot load sample data.');
      return;
    }
    let sampleData;
    switch (sampleType) {
      case 'creative':
        sampleData = creativeSampleData;
        break;
      case 'minimal':
        sampleData = minimalSampleData;
        break;
      default:
        sampleData = sampleCVData;
    }
    
    const newSampleCV = {
      ...sampleData,
      id: cvData.id || '', // Keep existing ID if available
      createdAt: cvData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCVData(newSampleCV);
    
    // Show preview to see the result
    setShowPreview(true);
  };

  const saveCurrentCV = async () => {
    if (!cvData) return;
    setIsSaving(true);
    try {
      const backendData = mapToBackend(cvData);
      await updateCv(cvData.id, backendData);
      alert('CV saved successfully!');
    } catch (error) {
      console.error("Failed to save CV", error);
      alert('Error saving CV. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const exportPDF = async () => {
    if (!cvData || !cvData.id) {
        alert('Please save the CV before exporting.');
        return;
    }
    
    // Bắt đầu quá trình export
    setIsExporting(true);
    
    try {
        // BƯỚC 1: Lưu lại CV hiện tại và đợi cho đến khi lưu xong
        console.log("Saving CV before exporting...");
        const backendData = mapToBackend(cvData);
        await updateCv(cvData.id, backendData);
        console.log("CV saved successfully. Starting PDF export...");

        // BƯỚC 2: Tiến hành export sau khi đã lưu
        const pdfBlob = await exportPdfApi(cvData.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cv-${cvData.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Failed to export PDF. Please try again.');
    } finally {
        // Kết thúc quá trình export, reset lại state
        setIsExporting(false);
    }
};

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'certificates', label: 'Certificates', icon: Certificate },
    { id: 'layout', label: 'Layout', icon: Settings },
    { id: 'template', label: 'Template', icon: Palette }
  ];

  const renderTabContent = () => {
    if (!cvData) return null;
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoForm
            personalInfo={cvData.personalInfo}
            onChange={(personalInfo) =>
              setCVData({ ...cvData, personalInfo })
            }
          />
        );
      case 'summary':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Professional Summary
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a brief summary of your professional background and career objectives
              </label>
              <textarea
                value={cvData.professionalSummary}
                onChange={(e) => setCVData({ ...cvData, professionalSummary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Experienced software engineer with 5+ years of experience in developing web applications using React, Node.js, and cloud technologies. Passionate about creating scalable solutions and leading development teams..."
              />
            </div>
          </div>
        );
      case 'experience':
        return (
          <WorkExperienceForm
            workExperience={cvData.workExperience}
            onChange={(workExperience) =>
              setCVData({ ...cvData, workExperience })
            }
          />
        );
      case 'education':
        return (
          <EducationForm
            education={cvData.education}
            onChange={(education) =>
              setCVData({ ...cvData, education })
            }
          />
        );
      case 'skills':
        return (
          <SkillsForm
            skills={cvData.skills}
            onChange={(skills) =>
              setCVData({ ...cvData, skills })
            }
          />
        );
      case 'projects':
        return (
          <ProjectsForm
            projects={cvData.projects}
            onChange={(projects) =>
              setCVData({ ...cvData, projects })
            }
          />
        );
      case 'certificates':
        return (
          <CertificatesForm
            certificates={cvData.certificates}
            onChange={(certificates) =>
              setCVData({ ...cvData, certificates })
            }
          />
        );
      case 'layout':
        return (
          <SectionOrderManager
            sectionOrder={cvData.sectionOrder}
            hiddenSections={cvData.hiddenSections || []}
            onChange={(sectionOrder) =>
              setCVData({ ...cvData, sectionOrder })
            }
            onHiddenChange={(hiddenSections) =>
              setCVData({ ...cvData, hiddenSections })
            }
          />
        );
      case 'template':
        return (
          <TemplateSelector
            selectedTemplate={cvData.template}
            onSelectTemplate={(template) => {
              setCVData({ ...cvData, template });
              setShowPreview(true); // Show preview when template is selected
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white shadow-lg z-10`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-between">
               <h1 className="text-xl font-bold text-gray-800">CV Builder</h1>
               <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700">
                   <Home className="w-5 h-5" />
               </button>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Sample Data Buttons */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
              Quick Start with Sample Data
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => loadSampleData('default')}
                className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <Zap className="w-3 h-3 mr-1" />
                Tech Professional
              </button>
              <button
                onClick={() => loadSampleData('creative')}
                className="flex items-center justify-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Creative Designer
              </button>
              <button
                onClick={() => loadSampleData('minimal')}
                className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Coffee className="w-3 h-3 mr-1" />
                Minimal Style
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Load sample data to test features quickly!
            </p>
          </div>
          

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={saveCurrentCV}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </button>
            <button
                onClick={exportPDF}
                disabled={isExporting} // Vô hiệu hóa nút khi đang export
                className="flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:bg-gray-300"
            >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : ''}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center text-gray-600"
          >
            <Menu className="w-5 h-5 mr-2" />
            CV Builder
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Form Content */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto transition-all duration-300`}>
            <div className="max-w-2xl mx-auto">
              {isLoading ? <p className="text-center text-gray-500">Loading CV...</p> : renderTabContent()}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div ref={previewContainerRef} className="w-1/2 bg-gray-100 border-l border-gray-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex justify-center">
                <div style={{
                    zoom: scale,
                    transformOrigin: 'top center',
                    transition: 'zoom 0.1s ease-out'
                  }}>
                  <CVPreview
                    ref={cvContentRef}
                    cvData={{
                      ...cvData,
                      sectionOrder: cvData.sectionOrder.filter(s => !(cvData.hiddenSections || []).includes(s))
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;