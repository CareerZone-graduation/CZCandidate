import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getSavedJobs, unsaveJob } from '@/services/savedJobService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bookmark, Search, ArrowUpDown } from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import JobResultCard from './components/SearchResults/JobResultCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import ResultsPagination from './components/SearchResults/ResultsPagination';

const SavedJobs = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [query, setQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['savedJobs', page, limit, sortBy, query],
    queryFn: () => getSavedJobs({ page, limit, sortBy, search: query }),
    keepPreviousData: true,
  });

  const savedJobs = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const { mutate: removeJob } = useMutation({
    mutationFn: ({ jobId }) => unsaveJob(jobId),
    onSuccess: (data, { jobId }) => {
      toast.success('Đã bỏ lưu công việc thành công');
      queryClient.invalidateQueries({queryKey: ['savedJobs']});
      queryClient.invalidateQueries({queryKey: ['jobDetail', jobId]});
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi bỏ lưu công việc';
      toast.error(errorMessage);
    },
  });

  const handleUnsave = (job) => {
    removeJob({ jobId: job.jobId || job.id });
  };

  const jobResultCards = useMemo(() => {
    return savedJobs.map(job => (
      <JobResultCard
        key={job.jobId}
        job={{ ...job, isSaved: true }}
        showSaveButton={true}
        onSaveToggle={() => handleUnsave(job)}
        onCardClick={() => navigate(`/jobs/${job.jobId}`)}
      />
    ));
  }, [savedJobs]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <ErrorState onRetry={refetch} message={error.response?.data?.message || error.message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/80 backdrop-blur-sm relative z-10">
      <div className="container py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Việc làm đã lưu</h1>
          <Badge variant="secondary" className="ml-4 text-lg">
            <Bookmark className="h-5 w-5 mr-2" />
            {meta.totalItems || 0}
          </Badge>
        </div>

        <EnhancedCard className="mb-8 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuery(searchTerm);
                  setPage(1);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm trong các việc làm đã lưu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button type="submit" className="h-12">
                  Tìm kiếm
                </Button>
              </form>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Mới nhất</SelectItem>
                  <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
                  <SelectItem value="deadline:asc">Hạn nộp gần nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </EnhancedCard>

        {savedJobs.length > 0 ? (
          <>
            <div className="space-y-4">
              {jobResultCards}
            </div>
            <div className="mt-8">
              <ResultsPagination
                currentPage={page}
                totalPages={meta.totalPages || 1}
                onPageChange={setPage}
                totalResults={meta.totalItems || 0}
                pageSize={limit}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="Không tìm thấy việc làm đã lưu"
            message={
              query
                ? `Không có kết quả nào phù hợp với từ khóa "${query}".`
                : "Bạn chưa lưu công việc nào. Hãy bắt đầu tìm kiếm và lưu lại những cơ hội tốt nhất!"
            }
            actionLabel="Khám phá việc làm"
            onAction={() => navigate('/jobs/search')}
          />
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
