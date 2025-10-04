
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCvById, createCvFromTemplate, updateCv, exportPdf as exportPdfApi } from '../../services/api';
import { mapToFrontend, mapToBackend } from '../../utils/dataMapper';
import { sampleCVData } from '../../data/sampleData';
import CVPreview from '../CVPreview/CVPreview';
import TemplateSelector from './TemplateSelector_new';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import WorkExperienceForm from '../forms/WorkExperienceForm';
import SkillsForm from '../forms/SkillsForm';
import EducationForm from '../forms/EducationForm';
import ProjectsForm from '../forms/ProjectsForm';
import CertificatesForm from '../forms/CertificatesForm';
import { 
  User, 
  Briefcase, 
  Award, 
  FileText, 
  Eye, 
  Save, 
  Download, 
  Menu,
  X,
  Palette,
  GraduationCap,
  FolderOpen,
  AlignCenterVertical as Certificate
} from 'lucide-react';

const CVBuilder = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-blue');
  const [showPreview, setShowPreview] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.65); // A4 thu nhỏ cho preview
  const cvContentRef = useRef(null);
  const [cvData, setCVData] = useState(null);
  const [error, setError] = useState(null);

  // Load or create CV
  useEffect(() => {
    const fetchOrCreateCv = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated && cvId && cvId !== 'new') {
          // Load existing CV
          const dataFromApi = await getCvById(cvId);
          if (dataFromApi && dataFromApi.data) {
            const mappedData = mapToFrontend(dataFromApi.data);
            // Ensure personalInfo exists
            if (!mappedData.personalInfo) {
              mappedData.personalInfo = {};
            }
            setCVData(mappedData);
            setSelectedTemplate(mappedData.template || 'modern-blue');
          } else {
            navigate('/editor/new', { replace: true });
          }
        } else {
          // Create new CV with sample data - Works for both authenticated and non-authenticated users
          const basicCV = {
            ...sampleCVData,
            id: 'temp-' + Date.now(),
            template: 'modern-blue',
            personalInfo: {
              ...sampleCVData.personalInfo,
              fullName: isAuthenticated 
                ? 'CV Mới ' + new Date().toLocaleDateString('vi-VN')
                : 'CV Demo ' + new Date().toLocaleDateString('vi-VN')
            }
          };
          setCVData(basicCV);
          setSelectedTemplate(basicCV.template || 'modern-blue');
          console.log('✅ CV created with sample data - PDF export available');
        }
      } catch (error) {
        console.error("Error loading CV:", error);
        setError(error);
        
        // Always fallback to sample data - Works for all users
        const basicCV = {
          ...sampleCVData,
          id: 'temp-' + Date.now(),
          template: 'modern-blue',
          personalInfo: {
            ...sampleCVData.personalInfo,
            fullName: isAuthenticated 
              ? 'CV Mới ' + new Date().toLocaleDateString('vi-VN')
              : 'CV Demo ' + new Date().toLocaleDateString('vi-VN')
          }
        };
        setCVData(basicCV);
        setSelectedTemplate(basicCV.template || 'modern-blue');
        console.log('✅ Fallback to sample data - PDF export available');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateCv();
  }, [cvId, navigate]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    if (cvData) {
      setCVData({
        ...cvData,
        template: templateId
      });
    }
  };

  // Export PDF function - Clone exact preview content
  const exportPDF = async () => {
    if (!cvData) {
      alert('Không có dữ liệu CV để export.');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Get the preview content from the ref
      const previewElement = cvContentRef.current;
      
      if (!previewElement) {
        alert('Không tìm thấy preview content.');
        setIsExporting(false);
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        alert('Vui lòng cho phép popup để export PDF.');
        setIsExporting(false);
        return;
      }

      // Get the exact HTML content from preview (without copying computed styles to avoid conflicts)
      const clonedElement = previewElement.cloneNode(true);

      // Collect stylesheets and style tags
      let styles = '';
      let styleLinks = '';
      
      // Get all style tags
      document.querySelectorAll('style').forEach(styleTag => {
        styles += styleTag.innerHTML + '\n';
      });
      
      // Get all stylesheet links
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        styleLinks += `<link rel="stylesheet" href="${link.href}">\n`;
      });
      
      // Get CSS rules from stylesheets (for inline styles)
      Array.from(document.styleSheets).forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            Array.from(styleSheet.cssRules).forEach(rule => {
              styles += rule.cssText + '\n';
            });
          }
        } catch (e) {
          // CORS - already handled by styleLinks above
          console.log('Skipping stylesheet due to CORS:', styleSheet.href);
        }
      });

      // Build complete HTML document with A4 full size
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${cvData.personalInfo?.fullName || 'CV'}</title>
  
  <!-- Include stylesheet links -->
  ${styleLinks}
  
  <style>
    /* Include all existing styles */
    ${styles}
    
    /* Reset problematic properties and force full A4 size */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }
    
    /* CV container at full A4 size */
    #cv-preview,
    .cv-preview {
      width: 210mm !important;
      min-height: 297mm !important;
      box-sizing: border-box !important;
    }
    
    /* Ensure text doesn't overflow or overlap */
    #cv-preview *,
    .cv-preview * {
      box-sizing: border-box !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    @media print {
      html, body {
        margin: 0;
        padding: 0;
        width: 210mm;
        height: 297mm;
      }
      
      /* Prevent page breaks inside important elements */
      .cv-preview, .cv-section {
        page-break-inside: avoid;
      }
    }
    
    @media screen {
      body {
        background: #525659;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
    }
  </style>
  
  <script>
    // Fix any potential layout issues after page load
    window.addEventListener('load', function() {
      // Force reflow to fix potential rendering issues
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
      
      console.log('PDF preview loaded successfully');
    });
  </script>
</head>
<body>
  ${clonedElement.outerHTML}
</body>
</html>`;
      
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for all resources (including fonts and styles) to load
      const waitForLoad = async () => {
        try {
          // Wait for document to be ready
          await printWindow.document.fonts.ready;
          
          // Additional wait to ensure all styles are applied
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          printWindow.focus();
          printWindow.print();
          setIsExporting(false);
        } catch (e) {
          // Fallback if fonts.ready is not supported
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            setIsExporting(false);
          }, 1500);
        }
      };
      
      // Start the loading process
      if (printWindow.document.readyState === 'complete') {
        waitForLoad();
      } else {
        printWindow.onload = waitForLoad;
        // Fallback timeout
        setTimeout(() => {
          if (isExporting) {
            waitForLoad();
          }
        }, 3000);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi khi export PDF: ' + error.message);
      setIsExporting(false);
    }
  };

  // Save CV function
  const saveCv = async () => {
    setIsSaving(true);
    try {
      if (cvData.id?.startsWith('temp-')) {
        // Save to localStorage for temp CV
        const offlineCVs = JSON.parse(localStorage.getItem('offline-cvs') || '[]');
        const updatedCVs = offlineCVs.filter(cv => cv.id !== cvData.id);
        updatedCVs.push(cvData);
        localStorage.setItem('offline-cvs', JSON.stringify(updatedCVs));
        alert('CV đã được lưu!');
      } else {
        // Try to save to backend
        const backendData = mapToBackend(cvData);
        await updateCv(cvData.id, backendData);
        alert('CV đã được lưu!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('CV đã được lưu local.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <h2 className="text-lg font-semibold text-gray-800">CV Builder</h2>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 space-y-2">
            <button
              onClick={saveCv}
              disabled={isSaving}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSidebarOpen && <span>{isSaving ? 'Đang lưu...' : 'Lưu CV'}</span>}
            </button>

            <button
              onClick={exportPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isSidebarOpen && <span>{isExporting ? 'Đang export...' : '📄 Export PDF'}</span>}
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              <Eye className="w-4 h-4" />
              {isSidebarOpen && <span>{showPreview ? 'Ẩn Preview' : 'Xem Preview'}</span>}
            </button>
          </div>

          {/* Navigation Tabs */}
          {isSidebarOpen && (
            <div className="p-4">
              <div className="space-y-1">
                {[
                  { id: 'template', label: 'Mẫu CV', icon: Palette },
                  { id: 'personal', label: 'Thông tin cá nhân', icon: User },
                  { id: 'summary', label: 'Tóm tắt', icon: FileText },
                  { id: 'work', label: 'Kinh nghiệm', icon: Briefcase },
                  { id: 'education', label: 'Học vấn', icon: GraduationCap },
                  { id: 'skills', label: 'Kỹ năng', icon: Award },
                  { id: 'projects', label: 'Dự án', icon: FolderOpen },
                  { id: 'certificates', label: 'Chứng chỉ', icon: Certificate },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
            <div className="p-6">
              {cvData && (
                <div>
                  {activeTab === 'template' && (
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onSelectTemplate={handleTemplateSelect}
                    />
                  )}
                  {activeTab === 'personal' && (
                    <PersonalInfoForm
                      personalInfo={cvData.personalInfo || {
                        fullName: '',
                        email: '',
                        phone: '',
                        address: '',
                        website: '',
                        linkedin: '',
                        github: '',
                        profileImage: ''
                      }}
                      onChange={(data) => setCVData({...cvData, personalInfo: data})}
                    />
                  )}
                  {activeTab === 'summary' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tóm tắt nghề nghiệp</h3>
                      <textarea
                        value={cvData.professionalSummary || ''}
                        onChange={(e) => setCVData({...cvData, professionalSummary: e.target.value})}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Viết tóm tắt về bản thân và mục tiêu nghề nghiệp..."
                      />
                    </div>
                  )}
                  {activeTab === 'work' && (
                    <WorkExperienceForm
                      workExperience={cvData.workExperience || []}
                      onChange={(data) => setCVData({...cvData, workExperience: data})}
                    />
                  )}
                  {activeTab === 'education' && (
                    <EducationForm
                      education={cvData.education || []}
                      onChange={(data) => setCVData({...cvData, education: data})}
                    />
                  )}
                  {activeTab === 'skills' && (
                    <SkillsForm
                      skills={cvData.skills || []}
                      onChange={(data) => setCVData({...cvData, skills: data})}
                    />
                  )}
                  {activeTab === 'projects' && (
                    <ProjectsForm
                      projects={cvData.projects || []}
                      onChange={(data) => setCVData({...cvData, projects: data})}
                    />
                  )}
                  {activeTab === 'certificates' && (
                    <CertificatesForm
                      certificates={cvData.certificates || []}
                      onChange={(data) => setCVData({...cvData, certificates: data})}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 bg-gray-100 border-l border-gray-200 overflow-y-auto">
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
              <div className="p-6 flex justify-center items-start min-h-screen">
                <div 
                  style={{
                    zoom: scale,
                    transformOrigin: 'top center',
                    transition: 'zoom 0.1s ease-out',
                  }}
                  className="shadow-2xl"
                >
                  <CVPreview
                    ref={cvContentRef}
                    cvData={cvData}
                    template={selectedTemplate}
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
  