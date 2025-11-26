import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import SupportRequestList from '../../components/support/SupportRequestList';
import { getUserSupportRequests } from '../../services/supportRequestService';

const SupportRequestsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1,
    limit: 10
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['supportRequests', filters],
    queryFn: () => getUserSupportRequests(filters)
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectRequest = (id) => {
    navigate(`/support/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yêu cầu Hỗ trợ</h1>
            <p className="mt-2 text-gray-600">Quản lý các yêu cầu hỗ trợ của bạn</p>
          </div>
          <button
            onClick={() => navigate('/support/new')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo yêu cầu mới</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Đang chờ</option>
              <option value="in-progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              <option value="technical-issue">Vấn đề kỹ thuật</option>
              <option value="account-issue">Vấn đề tài khoản</option>
              <option value="payment-issue">Vấn đề thanh toán</option>
              <option value="job-posting-issue">Vấn đề đăng tin</option>
              <option value="application-issue">Vấn đề ứng tuyển</option>
              <option value="general-inquiry">Thắc mắc chung</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</p>
          </div>
        )}

        {/* Request List */}
        <SupportRequestList
          requests={data?.data || []}
          onSelect={handleSelectRequest}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-gray-700">
              Trang {filters.page} / {data.meta.totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === data.meta.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportRequestsPage;
