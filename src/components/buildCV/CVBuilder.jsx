
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCvById, createCvFromTemplate, updateCv, exportPdf as exportPdfApi } from '../../services/api';
import { mapToFrontend, mapToBackend } from '../../utils/dataMapper';
import { sampleCVData, creativeSampleData, minimalSampleData } from '../../data/sampleData';
import CVPreview from '../CVPreview/CVPreview';
import CVPaginatedPreview from '../CVPreview/CVPaginatedPreview';
import TemplateGallery from './TemplateGallery';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import WorkExperienceForm from '../forms/WorkExperienceForm';
import SkillsForm from '../forms/SkillsForm';
import EducationForm from '../forms/EducationForm';
import ProjectsForm from '../forms/ProjectsForm';
import CertificatesForm from '../forms/CertificatesForm';
import SimpleSectionOrderManager from './SimpleSectionOrderManager';
import SampleDataSpotlight from './SampleDataSpotlight';
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
  AlignCenterVertical as Certificate,
  Sparkles,
  Zap,
  Coffee,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const CVBuilder = () => {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('template');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-blue');
  const [showPreview, setShowPreview] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState(0.65); // A4 thu nhỏ cho preview
  const cvContentRef = useRef(null); // For paginated preview
  const cvExportRef = useRef(null); // For export (no pagination)
  const [cvData, setCVData] = useState(null);
  const [error, setError] = useState(null);
  const [showSampleSuggestion, setShowSampleSuggestion] = useState(false);

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

            // Check if we should show suggestion for newly created CV
            if (searchParams.get('showSuggestion') === 'true') {
              setShowSampleSuggestion(true);
            }
          } else {
            navigate('/editor/new', { replace: true });
          }
        } else {
          // Create new CV - Show suggestion dialog first
          const basicCV = {
            id: 'temp-' + Date.now(),
            template: 'modern-blue',
            personalInfo: {
              fullName: isAuthenticated
                ? 'CV Mới ' + new Date().toLocaleDateString('vi-VN')
                : 'CV Demo ' + new Date().toLocaleDateString('vi-VN')
            },
            professionalSummary: '',
            workExperience: [],
            education: [],
            skills: [],
            projects: [],
            certificates: [],
            sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'certificates'],
            hiddenSections: []
          };
          setCVData(basicCV);
          setSelectedTemplate(basicCV.template || 'modern-blue');
          // Show sample data suggestion for new CVs
          setShowSampleSuggestion(true);
          console.log('✅ New CV created - showing sample data suggestion');
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

  const loadSampleData = (sampleType = 'default') => {
    let sample;
    switch (sampleType) {
      case 'creative':
        sample = creativeSampleData;
        break;
      case 'minimal':
        sample = minimalSampleData;
        break;
      default:
        sample = sampleCVData;
    }

    // Keep the core identifiers and structure, but overwrite content
    setCVData(prevData => ({
      ...prevData,
      ...sample,
      id: prevData.id, // Retain original ID
      name: `CV mẫu - ${sample.personalInfo.fullName}`,
      template: sample.template || prevData.template,
    }));

    // Close suggestion dialog and switch to personal info tab
    setShowSampleSuggestion(false);
    setActiveTab('personal');
  };

  const handleDismissSuggestion = () => {
    setShowSampleSuggestion(false);
    setActiveTab('personal');
    toast.info('Bạn có thể tải dữ liệu mẫu bất cứ lúc nào từ sidebar!');
  };

  const exportPDF = async () => {
    if (!cvData || !cvData.id || cvData.id.startsWith('temp-')) {
      toast.error('Vui lòng lưu CV trước khi xuất PDF.');
      return;
    }

    setIsExporting(true);
    try {
      // Gọi API từ backend để tạo PDF
      const pdfBlob = await exportPdfApi(cvData.id);

      // Tạo URL tạm thời cho file Blob và kích hoạt tải về
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cvData.personalInfo.fullName || 'CV'}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Dọn dẹp
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Save CV function
  const saveCv = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu CV của bạn.');
      return;
    }

    setIsSaving(true);
    try {
      const backendData = mapToBackend(cvData);

      if (cvId === 'new' || cvData.id.startsWith('temp-')) {
        // This is a new CV, create it
        const payload = {
          title: backendData.cvData.personalInfo.fullName || 'CV mới',
          templateId: selectedTemplate,
          cvData: backendData.cvData,
        };
        const newCv = await createCvFromTemplate(payload);
        toast.success('CV của bạn đã được tạo thành công!');
        // Navigate to the new CV's edit page
        navigate(`/editor/${newCv.data._id}`, { replace: true });
      } else {
        // This is an existing CV, update it
        await updateCv(cvData.id, backendData);
        toast.success('CV của bạn đã được cập nhật!');
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.message || 'Không thể lưu CV. Vui lòng thử lại.';
      toast.error(errorMessage);
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
    <>
      {/* Sample Data Spotlight - Highlights the sample data section */}
      {showSampleSuggestion && (
        <SampleDataSpotlight
          onSelectSample={loadSampleData}
          onDismiss={handleDismissSuggestion}
        />
      )}

      <div className="h-full bg-gray-50">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`${isSidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
            <div className="p-4 border-b border-gray-200 shrink-0">
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

            {/* Scrollable Sidebar Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-4">

                {/* Sample Data Buttons */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
                    Dùng dữ liệu mẫu
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => loadSampleData('default')}
                      className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Kỹ sư phần mềm
                    </button>
                    <button
                      onClick={() => loadSampleData('creative')}
                      className="flex items-center justify-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Nhà thiết kế
                    </button>
                    <button
                      onClick={() => loadSampleData('minimal')}
                      className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Coffee className="w-3 h-3 mr-1" />
                      Marketing
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
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
                  <div className="">
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
                        { id: 'layout', label: 'Bố cục & Thứ tự', icon: Settings },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
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
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex ${showPreview ? 'w-1/2' : 'w-full'}`}>
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
              <div className="p-6">
                {cvData && (
                  <div>
                    {activeTab === 'template' && (
                      <TemplateGallery
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
                        onChange={(data) => setCVData({ ...cvData, personalInfo: data })}
                      />
                    )}
                    {activeTab === 'summary' && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Tóm tắt nghề nghiệp</h3>
                        <textarea
                          value={cvData.professionalSummary || ''}
                          onChange={(e) => setCVData({ ...cvData, professionalSummary: e.target.value })}
                          rows={6}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                          placeholder="Viết tóm tắt về bản thân và mục tiêu nghề nghiệp..."
                        />
                      </div>
                    )}
                    {activeTab === 'work' && (
                      <WorkExperienceForm
                        workExperience={cvData.workExperience || []}
                        onChange={(data) => setCVData({ ...cvData, workExperience: data })}
                      />
                    )}
                    {activeTab === 'education' && (
                      <EducationForm
                        education={cvData.education || []}
                        onChange={(data) => setCVData({ ...cvData, education: data })}
                      />
                    )}
                    {activeTab === 'skills' && (
                      <SkillsForm
                        skills={cvData.skills || []}
                        onChange={(data) => setCVData({ ...cvData, skills: data })}
                      />
                    )}
                    {activeTab === 'projects' && (
                      <ProjectsForm
                        projects={cvData.projects || []}
                        onChange={(data) => setCVData({ ...cvData, projects: data })}
                      />
                    )}
                    {activeTab === 'certificates' && (
                      <CertificatesForm
                        certificates={cvData.certificates || []}
                        onChange={(data) => setCVData({ ...cvData, certificates: data })}
                      />
                    )}
                    {activeTab === 'layout' && (
                      <SimpleSectionOrderManager
                        sectionOrder={cvData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certificates']}
                        hiddenSections={cvData.hiddenSections || []}
                        currentTemplate={cvData.template || selectedTemplate}
                        onChange={(newOrder) => {
                          console.log('Section order changed:', newOrder);
                          setCVData({ ...cvData, sectionOrder: newOrder });
                        }}
                        onHiddenChange={(newHidden) => {
                          console.log('Hidden sections changed:', newHidden);
                          setCVData({ ...cvData, hiddenSections: newHidden });
                        }}
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
                <div className="p-6 flex justify-center items-start min-h-full">
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.1s ease-out',
                    }}
                    className=""
                  >
                    {/* <CVPaginatedPreview ref={cvContentRef}> */}
                    <CVPreview
                      ref={cvContentRef}
                      cvData={cvData}
                      template={selectedTemplate}
                    />
                    {/* </CVPaginatedPreview> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden CV for export (no pagination) */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
          <CVPreview
            ref={cvExportRef}
            cvData={cvData}
            template={selectedTemplate}
          />
        </div>
      </div>
    </>
  );
};

export default CVBuilder;
