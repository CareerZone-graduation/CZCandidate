import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import CVPreview from '../../components/CVPreview/CVPreview';
// Đảm bảo bạn import hàm lấy CV từ API
import { getCvById } from '../../services/api';
import { mapToFrontend } from '../../utils/dataMapper'; // Import hàm map dữ liệu

import { Skeleton } from '../../components/ui/skeleton';

const CVRenderOnlyPage = () => {
  const { cvId: paramCvId } = useParams();
  const [searchParams] = useSearchParams();
  const cvId = searchParams.get('cvId') || paramCvId;
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCvData = async () => {
      // 1. Handle Token from URL if present (Critical for Puppeteer)
      const token = searchParams.get('token');
      if (token) {
        localStorage.setItem('accessToken', token);
      }

      if (!cvId) {
        setError("CV ID is missing. Please ensure you are accessing this page with a 'cvId' query parameter.");
        setLoading(false);
        // Signal ready even on error so Puppeteer doesn't timeout
        document.body.dataset.cvReady = 'true';
        return;
      }

      try {
        // Gọi API để lấy dữ liệu CV từ backend
        const dataFromApi = await getCvById(cvId);
        if (dataFromApi) {
          // Sử dụng dataMapper để chuyển đổi dữ liệu cho phù hợp với component Preview
          setCvData(mapToFrontend(dataFromApi.data));

          // 3. Signal Puppeteer that we are ready
          // Wait a bit for images/fonts to settle
          setTimeout(() => {
            document.body.dataset.cvReady = 'true';
            console.log('CV Ready flag set!');
          }, 1000);

        } else {
          throw new Error(`CV with ID "${cvId}" not found.`);
        }
      } catch (err) {
        console.error("Error fetching CV data:", err);
        setError(err.message);
        // Signal ready even on error so Puppeteer doesn't timeout
        document.body.dataset.cvReady = 'true';
      } finally {
        setLoading(false);
      }
    };

    fetchCvData();
  }, [cvId, searchParams]);

  // Scale logic for preview in small frames
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Standard A4 width in pixels at 96 DPI
      const A4_WIDTH = 794;
      // Add some padding/margin allowance if needed, or use exact window width
      const availableWidth = window.innerWidth;

      if (availableWidth < A4_WIDTH) {
        const newScale = availableWidth / A4_WIDTH;
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    // Calculate initial scale
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
        {/* A4 Skeleton Container */}
        <div
          className="bg-white shadow-xl p-8 box-border space-y-8"
          style={{ width: '794px', minHeight: '1123px' }}
        >
          {/* Header Section */}
          <div className="flex items-center space-x-6 border-b pb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-4 flex-1">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar */}
            <div className="col-span-4 space-y-8 border-r pr-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="col-span-8 space-y-8">
              {/* Summary */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Experience */}
              <div className="space-y-6">
                <Skeleton className="h-6 w-1/3" />

                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      minHeight: '100vh',
      overflowX: 'hidden' // Prevent horizontal scroll
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
      <div style={{
        width: '794px', // Force rendering at A4 width
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        marginBottom: `${(1 - scale) * 100}%` // Compensate for vertical space if needed, though usually not critical for preview
      }}>
        <CVPreview cvData={cvData} />
      </div>
    </div>
  );
};

export default CVRenderOnlyPage;