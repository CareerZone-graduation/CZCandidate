import { useEffect, useState } from "react";

const JobSuggestion = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs");
        if (!response.ok) throw new Error("Không lấy được danh sách việc làm");
        const result = await response.json(); // Nhận toàn bộ response
        console.log('API Response:', result); // Debug log
        
        // Lấy data từ result.data thay vì result trực tiếp
        setJobs(result.data || []); // result.data chứa array công việc
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-500 text-lg">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gợi ý việc làm dành cho bạn</h2>
        <div className="text-sm text-gray-500">
          Tìm thấy {jobs.length} công việc
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Không có công việc nào được tìm thấy.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white border rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <span className="font-medium">{job.company.name}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm space-x-4">
                    <span>📍 {job.location.province} - {job.location.ward}</span>
                    <span>💼 {job.type === 'FULL_TIME' ? 'Toàn thời gian' : 'Bán thời gian'}</span>
                    <span>🏢 {job.workType === 'ON_SITE' ? 'Tại văn phòng' : job.workType === 'REMOTE' ? 'Từ xa' : 'Hybrid'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-green-600 font-bold text-lg">
                    {job.minSalary} - {job.maxSalary} USD
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(job.deadline).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm line-clamp-3">
                  {job.description}
                </p>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {job.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {job.experience}
                  </span>
                  {job.approved && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Đăng {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="space-x-2">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Lưu việc làm
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    Ứng tuyển ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSuggestion;