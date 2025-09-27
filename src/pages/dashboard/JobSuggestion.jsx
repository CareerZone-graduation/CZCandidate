import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import apiClient from "@/services/apiClient";

const JobSuggestion = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/jobs");
      setJobs(response.data.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải gợi ý việc làm.");
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-2 items-end flex flex-col">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24" />
                  <div className="space-x-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return <ErrorState message={error} onRetry={fetchJobs} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gợi ý việc làm dành cho bạn</h2>
        <div className="text-sm text-muted-foreground">
          Tìm thấy {jobs.length} công việc
        </div>
      </div>
      
      {jobs.length === 0 ? (
        <EmptyState message="Hiện tại không có gợi ý việc làm nào phù hợp với bạn." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-foreground mb-2">{job.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <span className="font-medium">{job.company.name}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm space-x-4">
                      <span>📍 {job.location.province} - {job.location.ward}</span>
                      <span>💼 {job.type === 'FULL_TIME' ? 'Toàn thời gian' : 'Bán thời gian'}</span>
                      <span>🏢 {job.workType === 'ON_SITE' ? 'Tại văn phòng' : job.workType === 'REMOTE' ? 'Từ xa' : 'Hybrid'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-success font-bold text-lg">
                      {job.minSalary} - {job.maxSalary} Triệu
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{job.category}</Badge>
                    <Badge variant="secondary">{job.experience}</Badge>
                    {job.approved && (
                      <Badge variant="outline" className="text-success border-success">
                        ✓ Đã xác thực
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Đăng {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" className="border-gray-300 hover:bg-gray-50">Lưu việc làm</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Ứng tuyển ngay</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSuggestion;