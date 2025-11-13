// Test component để verify logo từ MongoDB
import { useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

const LogoDebugger = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.get('/jobs/search/hybrid', {
          params: {
            query: '',
            page: 1,
            size: 5
          }
        });
        
        console.log('🔍 Full API Response:', response.data);
        
        if (response.data.success && response.data.data) {
          setJobs(response.data.data);
          
          // Log chi tiết từng job
          response.data.data.forEach((job, index) => {
            console.log(`\n📋 Job ${index + 1}:`, {
              title: job.title,
              companyName: job.company?.name,
              companyLogo: job.company?.logo,
              hasLogo: !!job.company?.logo,
              isDefaultLogo: job.company?.logo === 'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg'
            });
          });
        }
      } catch (error) {
        console.error('❌ Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Logo Debugger</h1>
      
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div key={job._id} className="border p-4 rounded-lg">
            <div className="flex items-start gap-4">
              {/* Logo Display */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 border-2 rounded-lg overflow-hidden bg-gray-100">
                  {job.company?.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`❌ Failed to load logo:`, job.company.logo);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="20"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-2xl">
                      {job.company?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-2">
                  <strong>Company:</strong> {job.company?.name || 'N/A'}
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Logo URL:</strong>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                      {job.company?.logo || 'No logo'}
                    </code>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {job.company?.logo ? (
                      job.company.logo === 'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg' ? (
                        <span className="text-orange-600">⚠️ Default Logo</span>
                      ) : (
                        <span className="text-green-600">✅ Custom Logo</span>
                      )
                    ) : (
                      <span className="text-red-600">❌ No Logo</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No jobs found
        </div>
      )}
    </div>
  );
};

export default LogoDebugger;
