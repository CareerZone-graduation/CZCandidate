import React from 'react';
import ExternalJobCard from './ExternalJobCard';
import { Ghost, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ExternalJobResultsList = ({ jobs = [], isLoading, isError, onJobClick, onLoadMore, hasNextPage, isFetchingNextPage }) => {
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">Đang thu thập kết quả trên internet...</h3>
                    <p className="text-sm text-blue-600 text-center max-w-md">
                        Hệ thống đang quét qua các trang tuyển dụng lớn trên toàn cầu để mang về cho bạn những công việc phù hợp nhất. Quá trình này có thể mất vài giây.
                    </p>
                </div>

                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white p-6 rounded-xl border border-gray-100 flex gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Đã có lỗi xảy ra</h3>
                <p className="text-gray-500">
                    Không thể lấy danh sách việc làm bên ngoài lúc này. Vui lòng thử lại sau.
                </p>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Ghost className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy việc làm phù hợp</h3>
                <p className="text-gray-500">
                    Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để có thêm kết quả từ interent.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {jobs.map((job) => (
                    <ExternalJobCard
                        key={job.id}
                        job={job}
                        onClick={onJobClick}
                    />
                ))}
            </div>

            {/* Load More Button or Infinite Scroll Trigger (simplified for now with a button) */}
            {hasNextPage && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isFetchingNextPage}
                        className="w-full sm:w-auto min-w-[200px]"
                    >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tải thêm...
                            </>
                        ) : (
                            'Xem thêm kết quả'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ExternalJobResultsList;
