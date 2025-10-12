import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CVPreview from '../../components/CVPreview/CVPreview';
// Đảm bảo bạn import hàm lấy CV từ API
import { getCvById } from '../../services/api'; 
import { mapToFrontend } from '../../utils/dataMapper'; // Import hàm map dữ liệu

const CVRenderOnlyPage = () => {
  const [searchParams] = useSearchParams();
  const cvId = searchParams.get('cvId');
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCvData = async () => {
      if (!cvId) {
        setError("CV ID is missing. Please ensure you are accessing this page with a 'cvId' query parameter, e.g., /render.html?cvId=your_cv_id_here");
        setLoading(false);
        return;
      }
      try {
        // Gọi API để lấy dữ liệu CV từ backend
        const dataFromApi = await getCvById(cvId);
        if (dataFromApi) {
          // Sử dụng dataMapper để chuyển đổi dữ liệu cho phù hợp với component Preview
          setCvData(mapToFrontend(dataFromApi.data));
          // setCvData(mapToFrontend(dataFromApi));
        } else {
          throw new Error(`CV with ID "${cvId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching CV data:", err);
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, [cvId]);

  if (loading) {
    return <div>Loading Document...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '2rem' }}>Error: {error}</div>;
  }

  // Component CVPreview sẽ nhận dữ liệu đã được map
  return (
    <div id="cv-preview" style={{
      margin: 0,
      padding: 0,
      backgroundColor: 'white',
      width: '100%',
      minHeight: '100vh'
    }}>
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

export default CVRenderOnlyPage;