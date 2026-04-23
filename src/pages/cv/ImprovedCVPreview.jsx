import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Download, ArrowLeft, Loader2, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Lazy load html2pdf to avoid build errors if not installed
let html2pdf = null;
try {
  html2pdf = require('html2pdf.js');
} catch (e) {
  console.warn('html2pdf.js not installed. PDF export will be disabled.');
}

// Import CV templates
import ModernBlueTemplate from '../../components/CVPreview/templates/ModernBlueTemplate';
import ClassicWhiteTemplate from '../../components/CVPreview/templates/ClassicWhiteTemplate';
import MinimalGrayTemplate from '../../components/CVPreview/templates/MinimalGrayTemplate';

const ImprovedCVPreview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cvRef = useRef(null);
  
  const [cvData, setCvData] = useState(null);
  const [templateId, setTemplateId] = useState('modern-blue');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get key from URL params
      const cvKey = searchParams.get('key');
      
      if (!cvKey) {
        toast.error('Không có dữ liệu CV');
        navigate(-1);
        return;
      }

      // Get data from sessionStorage
      const storedData = sessionStorage.getItem(cvKey);
      
      if (!storedData) {
        toast.error('Dữ liệu CV đã hết hạn hoặc không tồn tại');
        navigate(-1);
        return;
      }

      const parsedData = JSON.parse(storedData);
      setCvData(parsedData.cvData);
      setTemplateId(parsedData.templateId || 'modern-blue');
      setIsLoading(false);
      
      // Clean up sessionStorage after loading (optional)
      // sessionStorage.removeItem(cvKey);
    } catch (error) {
      console.error('Error loading CV data:', error);
      toast.error('Không thể tải dữ liệu CV');
      navigate(-1);
    }
  }, [searchParams, navigate]);

  const handleExportPDF = async () => {
    if (!cvRef.current || !cvData) {
      toast.error('Không có CV để xuất');
      return;
    }

    setIsExporting(true);
    try {
      if (html2pdf) {
        // Use html2pdf.js if available
        const element = cvRef.current;
        
        const opt = {
          margin: 0,
          filename: `CV_Improved_${cvData.personalInfo?.fullName || 'CV'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          }
        };

        await html2pdf().set(opt).from(element).save();
        toast.success('Đã tải xuống CV thành công!');
      } else {
        // Fallback to browser print
  
        window.print();
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Không thể xuất PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTemplate = () => {
    if (!cvData) return null;

    const templateProps = {
      cvData,
      isPreview: true
    };

    switch (templateId) {
      case 'modern-blue':
        return <ModernBlueTemplate {...templateProps} />;
      case 'classic-white':
        return <ClassicWhiteTemplate {...templateProps} />;
      case 'minimal-gray':
      case 'minimalist':
        return <MinimalGrayTemplate {...templateProps} />;
      default:
        return <ModernBlueTemplate {...templateProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4 max-w-5xl print:px-0 print:max-w-none">
        {/* Header - Hidden when printing */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
            
            </Button>
            <div className="border-l pl-4">
              <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                CV Đã Cải Thiện
              </h1>
              <p className="text-sm text-gray-600">
                Template: <span className="font-medium">{templateId}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xuất PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {html2pdf ? 'Tải xuống PDF' : 'In / Lưu PDF'}
              </>
            )}
          </Button>
        </div>

        {/* CV Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0 print:rounded-none">
          <div 
            ref={cvRef}
            className="cv-preview-container"
            style={{
              width: '210mm', // A4 width
              minHeight: '297mm', // A4 height
              margin: '0 auto',
              backgroundColor: 'white'
            }}
          >
            {renderTemplate()}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 space-y-4 print:hidden">
          {/* Main instruction */}
          <div className="text-center text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-2">CV này đã được tối ưu hóa bởi AI để phù hợp với yêu cầu công việc</p>
          </div>

          {/* Detailed instruction for print */}
          {!html2pdf && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                  !
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-900 mb-3 text-lg">
                    🎨 QUAN TRỌNG: Cách giữ màu sắc khi lưu PDF
                  </h3>
                  <ol className="text-left text-sm space-y-2 text-gray-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600 flex-shrink-0">1.</span>
                      <span>Nhấn nút <span className="font-semibold bg-yellow-200 px-1 rounded">"In / Lưu PDF"</span> bên trên</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600 flex-shrink-0">2.</span>
                      <span>Trong hộp thoại in, tìm và click <span className="font-semibold bg-yellow-200 px-1 rounded">"More settings"</span> (Cài đặt khác)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600 flex-shrink-0">3.</span>
                      <div>
                        <span className="font-bold text-red-600">✅ BẬT checkbox:</span>
                        <div className="mt-1 bg-white border-2 border-red-400 rounded px-3 py-2 inline-block">
                          <span className="font-bold">"Background graphics"</span> hoặc <span className="font-bold">"Đồ họa nền"</span>
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-yellow-600 flex-shrink-0">4.</span>
                      <span>Chọn <span className="font-semibold bg-yellow-200 px-1 rounded">"Save as PDF"</span> và click Save</span>
                    </li>
                  </ol>
                  <div className="mt-4 p-3 bg-white rounded border border-yellow-300">
                    <p className="text-xs text-gray-600">
                      💡 <span className="font-semibold">Mẹo:</span> Nếu không tìm thấy "Background graphics", 
                      scroll xuống trong phần "More settings" hoặc tìm "Print backgrounds"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple instruction for html2pdf */}
          {html2pdf && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="font-medium text-blue-900 text-center">
                📥 Nhấn nút "Tải xuống PDF" bên trên để lưu file với đầy đủ màu sắc
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          /* Hide everything except CV */
          .print\\:hidden {
            display: none !important;
          }
          
          /* CV container full width */
          .cv-preview-container {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Remove page margins */
          @page {
            margin: 0;
            size: A4;
          }
          
          /* FORCE colors to print - CRITICAL for keeping colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Force background colors */
          *[class*="bg-"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Force text colors */
          *[class*="text-"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Force border colors */
          *[class*="border-"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ImprovedCVPreview;
