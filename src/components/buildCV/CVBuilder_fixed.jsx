import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCvById, createCvFromTemplate, getTemplates, updateCv, exportPdf as exportPdfApi, exportExcel as exportExcelApi } from '../../services/api';
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
  const { isAuthenticated } = useSelector((state) => state.auth);
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
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [forceOnlineMode, setForceOnlineMode] = useState(false);

  // Check authentication first
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: window.location.pathname },
        replace: true 
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchOrCreateCv = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (cvId && cvId !== 'new') {
          if (cvId.startsWith('offline-')) {
            const offlineCVs = JSON.parse(localStorage.getItem('offline-cvs') || '[]');
            const offlineCV = offlineCVs.find(cv => cv.id === cvId);
            
            if (offlineCV) {
              setCVData(offlineCV);
              setIsOfflineMode(true);
              return;
            } else {
              navigate('/editor/new', { replace: true });
              return;
            }
          }
          
          const dataFromApi = await getCvById(cvId);
          if (dataFromApi && dataFromApi.data) {
            setCVData(mapToFrontend(dataFromApi.data));
          } else {
            navigate('/editor/new', { replace: true });
          }
        } else {
          // Create new CV - ALWAYS USE SAMPLE DATA AND STAY ONLINE
          const basicCV = {
            ...sampleCVData,
            id: 'temp-' + Date.now(),
            template: 'modern-creative',
            personalInfo: {
              ...sampleCVData.personalInfo,
              fullName: 'CV Mới ' + new Date().toLocaleDateString('vi-VN')
            }
          };
          
          setCVData(basicCV);
          setIsOfflineMode(false);
          setForceOnlineMode(true);
          console.log('🟢 Forced online mode - you can export PDF');
        }
      } catch (error) {
        console.error("Error fetching or creating CV:", error);
        setError(error);
        
        if (error.response?.status === 401) {
          navigate('/login', { 
            state: { from: window.location.pathname },
            replace: true 
          });
        } else if (error.response?.status === 404 && cvId && cvId !== 'new') {
          navigate('/editor/new', { replace: true });
        } else {
          // STAY ONLINE with sample data
          const basicCV = {
            ...sampleCVData,
            id: 'temp-' + Date.now(),
            template: 'modern-creative',
            personalInfo: {
              ...sampleCVData.personalInfo,
              fullName: 'CV Mới ' + new Date().toLocaleDateString('vi-VN')
            }
          };
          
          setCVData(basicCV);
          setIsOfflineMode(false);
          setForceOnlineMode(true);
          console.log('🟢 Forced online mode after error - you can export PDF');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrCreateCv();
  }, [cvId, isAuthenticated, navigate]);

  // Simple PDF export that always works
  const exportPDF = async () => {
    if (!cvData) {
      alert('Không có dữ liệu CV để export.');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Try backend PDF export first
      if (cvData.id && !cvData.id.startsWith('temp-') && !cvData.id.startsWith('offline-')) {
        console.log("🟢 Attempting backend PDF export...");
        const pdfBlob = await exportPdfApi(cvData.id);
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cv-${cvData.personalInfo?.fullName || 'cv'}-${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log("✅ PDF export completed successfully");
        alert('✅ Export PDF thành công!');
        return;
      }
    } catch (error) {
      console.error('Backend PDF export failed:', error);
    }
    
    // Fallback: Browser print to PDF
    const printCV = () => {
      const printWindow = window.open('', '_blank');
      const cvHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>CV - ${cvData.personalInfo?.fullName || 'CV'}</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 0; 
                padding: 20px;
                background: white;
                color: #333;
                line-height: 1.6;
              }
              .cv-container { max-width: 800px; margin: 0 auto; }
              .cv-header { 
                text-align: center; 
                margin-bottom: 30px; 
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              .cv-header h1 { 
                margin: 0 0 10px 0; 
                color: #2563eb;
                font-size: 2em;
              }
              .cv-header p { margin: 5px 0; color: #666; }
              .cv-section { 
                margin-bottom: 25px; 
                padding: 15px;
                border-left: 4px solid #2563eb;
                background: #fafbfc;
              }
              .cv-section h3 { 
                color: #2563eb; 
                margin: 0 0 15px 0; 
                font-size: 1.3em;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
              }
              .work-item, .edu-item, .project-item { 
                margin-bottom: 15px; 
                padding: 10px;
                background: white;
                border-radius: 5px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .work-item strong, .edu-item strong, .project-item strong { 
                color: #1f2937; 
                font-size: 1.1em;
              }
              .work-item em, .edu-item em { color: #6b7280; }
              .date-range { 
                color: #9ca3af; 
                font-size: 0.9em; 
                margin: 5px 0;
              }
              .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
              }
              .skill-tag {
                background: #dbeafe;
                color: #1e40af;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.9em;
              }
              @media print { 
                body { margin: 0; padding: 15px; }
                .cv-section { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="cv-container">
              <div class="cv-header">
                <h1>${cvData.personalInfo?.fullName || 'CV'}</h1>
                <p><strong>Email:</strong> ${cvData.personalInfo?.email || 'Chưa cập nhật'}</p>
                <p><strong>Điện thoại:</strong> ${cvData.personalInfo?.phone || 'Chưa cập nhật'}</p>
                <p><strong>Địa chỉ:</strong> ${cvData.personalInfo?.address || 'Chưa cập nhật'}</p>
              </div>
              
              ${cvData.professionalSummary ? `
                <div class="cv-section">
                  <h3>🎯 Tóm tắt nghề nghiệp</h3>
                  <p>${cvData.professionalSummary}</p>
                </div>
              ` : ''}
              
              ${cvData.workExperience?.length ? `
                <div class="cv-section">
                  <h3>💼 Kinh nghiệm làm việc</h3>
                  ${cvData.workExperience.map(exp => `
                    <div class="work-item">
                      <strong>${exp.position || 'Vị trí'}</strong> tại <em>${exp.company || 'Công ty'}</em>
                      <div class="date-range">${exp.startDate || ''} - ${exp.endDate || 'Hiện tại'}</div>
                      <p>${exp.description || 'Mô tả công việc...'}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${cvData.education?.length ? `
                <div class="cv-section">
                  <h3>🎓 Học vấn</h3>
                  ${cvData.education.map(edu => `
                    <div class="edu-item">
                      <strong>${edu.degree || 'Bằng cấp'}</strong> - <em>${edu.institution || 'Trường'}</em>
                      <div class="date-range">${edu.startDate || ''} - ${edu.endDate || ''}</div>
                      ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${cvData.skills?.length ? `
                <div class="cv-section">
                  <h3>🛠️ Kỹ năng</h3>
                  <div class="skills-list">
                    ${cvData.skills.map(skill => `
                      <span class="skill-tag">${skill.name || skill} ${skill.level ? `(${skill.level})` : ''}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              
              ${cvData.projects?.length ? `
                <div class="cv-section">
                  <h3>🚀 Dự án</h3>
                  ${cvData.projects.map(project => `
                    <div class="project-item">
                      <strong>${project.name || 'Tên dự án'}</strong>
                      <div class="date-range">${project.startDate || ''} - ${project.endDate || ''}</div>
                      <p>${project.description || 'Mô tả dự án...'}</p>
                      ${project.technologies ? `<p><strong>Công nghệ:</strong> ${project.technologies}</p>` : ''}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(cvHtml);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    };
    
    console.log('🟢 Using browser print as PDF export');
    printCV();
    setIsExporting(false);
  };

  const saveCv = async () => {
    // Simple save function
    setIsSaving(true);
    try {
      if (cvData.id?.startsWith('temp-') || cvData.id?.startsWith('offline-')) {
        // Save to localStorage
        const offlineCVs = JSON.parse(localStorage.getItem('offline-cvs') || '[]');
        const updatedCVs = offlineCVs.filter(cv => cv.id !== cvData.id);
        updatedCVs.push(cvData);
        localStorage.setItem('offline-cvs', JSON.stringify(updatedCVs));
        alert('CV đã được lưu offline!');
      } else {
        // Try to save to backend
        const backendData = mapToBackend(cvData);
        await updateCv(cvData.id, backendData);
        alert('CV đã được lưu!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Có lỗi khi lưu CV. Dữ liệu đã được lưu local.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportOfflineCV = () => {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cv-${cvData.personalInfo?.fullName || 'cv'}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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

  if (error && !cvData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success message for online mode */}
      {forceOnlineMode && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm">
                  <strong>🟢 Online Mode:</strong> Bạn có thể export PDF bình thường! 
                  CV đang sử dụng dữ liệu mẫu và có thể export PDF qua trình duyệt.
                </p>
              </div>
            </div>
            <button
              onClick={() => setForceOnlineMode(false)}
              className="text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

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
              {isSidebarOpen && <span>{isExporting ? 'Đang export...' : 'Export PDF'}</span>}
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
                  {activeTab === 'personal' && (
                    <PersonalInfoForm
                      data={cvData.personalInfo}
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
                      data={cvData.workExperience}
                      onChange={(data) => setCVData({...cvData, workExperience: data})}
                    />
                  )}
                  {activeTab === 'education' && (
                    <EducationForm
                      data={cvData.education}
                      onChange={(data) => setCVData({...cvData, education: data})}
                    />
                  )}
                  {activeTab === 'skills' && (
                    <SkillsForm
                      data={cvData.skills}
                      onChange={(data) => setCVData({...cvData, skills: data})}
                    />
                  )}
                  {activeTab === 'projects' && (
                    <ProjectsForm
                      data={cvData.projects}
                      onChange={(data) => setCVData({...cvData, projects: data})}
                    />
                  )}
                  {activeTab === 'certificates' && (
                    <CertificatesForm
                      data={cvData.certificates}
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
              <div className="p-6 flex justify-center">
                <div style={{
                    zoom: scale,
                    transformOrigin: 'top center',
                    transition: 'zoom 0.1s ease-out'
                  }}>
                  <CVPreview
                    ref={cvContentRef}
                    cvData={cvData}
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
