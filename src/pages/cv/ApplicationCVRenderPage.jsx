import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CVPreview from '../../components/CVPreview/CVPreview';
import { mapToFrontend } from '../../utils/dataMapper';

/**
 * ApplicationCVRenderPage - Trang render CV từ Application (dành cho cả recruiter và candidate xem qua iframe)
 * 
 * Trang này nhận applicationId từ query params và gọi API để lấy snapshot data của CV
 * URL: /render-application.html?applicationId=xxx&token=xxx&role=candidate|recruiter
 * 
 * - role=recruiter (default): Gọi /api/applications/:id/render-cv (recruiter xem CV ứng viên)
 * - role=candidate: Gọi /api/candidate/my-applications/:id/render-cv (candidate xem CV của mình)
 */
const ApplicationCVRenderPage = () => {
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get('applicationId');
  const token = searchParams.get('token'); // Token để xác thực
  const role = searchParams.get('role') || 'recruiter'; // 'recruiter' hoặc 'candidate'

  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationCVData = async () => {
      if (!applicationId) {
        setError("Application ID is missing. Please ensure you are accessing this page with an 'applicationId' query parameter.");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Authentication token is missing. Please ensure you are accessing this page with a valid 'token' parameter.");
        setLoading(false);
        return;
      }

      try {
        // Gọi API trực tiếp đến backend với token trong header
        const apiUrl = import.meta.env.VITE_API_BASE_URL 
          ? `${import.meta.env.VITE_API_BASE_URL}/api`
          : '/api';
        
        // Chọn endpoint dựa trên role
        const endpoint = role === 'candidate'
          ? `${apiUrl}/candidate/my-applications/${applicationId}/render-cv`
          : `${apiUrl}/applications/${applicationId}/render-cv?token=${token}`;
        
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = response.data?.data;
        
        if (data && data.cvData) {
          // Map dữ liệu CV snapshot để phù hợp với component CVPreview
          const mappedData = mapToFrontend({
            cvData: data.cvData,
            templateId: data.templateId,
            title: data.cvName
          });
          setCvData(mappedData);
        } else {
          throw new Error('CV data not found in application.');
        }
      } catch (err) {
        console.error("Error fetching application CV data:", err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load CV data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationCVData();
  }, [applicationId, token, role]);

  // Sau khi load xong, set data-cv-ready để puppeteer có thể capture
  useEffect(() => {
    if (!loading && cvData) {
      document.body.setAttribute('data-cv-ready', 'true');
    }
  }, [loading, cvData]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '14px',
        color: '#666'
      }}>
        Loading CV...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        color: 'red', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h3>Error Loading CV</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div style={{ 
        padding: '2rem',
        textAlign: 'center',
        color: '#666'
      }}>
        No CV data available.
      </div>
    );
  }

  return (
    <div 
      id="cv-preview" 
      data-cv-ready="true"
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: 'white',
        width: '100%',
        minHeight: '100vh'
      }}
    >
      <style>{`
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        @page {
          size: A4;
          margin: 0;
        }
      `}</style>
      <CVPreview cvData={cvData} />
    </div>
  );
};

export default ApplicationCVRenderPage;
