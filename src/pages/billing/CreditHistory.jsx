import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import CreditHistoryList from '@/components/billing/CreditHistoryList';
import CreditHistoryFilters from '@/components/billing/CreditHistoryFilters';
import CreditSummary from '@/components/billing/CreditSummary';
import { getCreditHistory, getCreditSummary } from '@/services/creditHistoryService';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const CreditHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20,
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  // Store accumulated transactions for "Load More" functionality
  const [accumulatedTransactions, setAccumulatedTransactions] = useState([]);

  // Fetch credit history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
    isFetching,
  } = useQuery({
    queryKey: ['creditHistory', filters],
    queryFn: () => getCreditHistory(filters),
    keepPreviousData: true,
  });

  // Accumulate transactions when new data arrives
  useEffect(() => {
    if (historyData?.data?.transactions) {
      if (filters.page === 1) {
        // Reset accumulated data when filters change or going back to page 1
        setAccumulatedTransactions(historyData.data.transactions);
      } else {
        // Append new transactions for subsequent pages
        setAccumulatedTransactions(prev => {
          const existingIds = new Set(prev.map(t => t._id));
          const newTransactions = historyData.data.transactions.filter(
            t => !existingIds.has(t._id)
          );
          return [...prev, ...newTransactions];
        });
      }
    }
  }, [historyData, filters.page]);

  // Fetch summary
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
  } = useQuery({
    queryKey: ['creditSummary', { startDate: filters.startDate, endDate: filters.endDate }],
    queryFn: () => getCreditSummary({
      startDate: filters.startDate,
      endDate: filters.endDate
    }),
  });

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params[key] = value.toString();
      }
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Show error toast
  useEffect(() => {
    if (historyError) {
      toast.error('Không thể tải lịch sử giao dịch', {
        description: historyError.response?.data?.message || 'Vui lòng thử lại sau',
      });
    }
  }, [historyError]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
    // Reset accumulated transactions when filters change
    setAccumulatedTransactions([]);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    });
    // Reset accumulated transactions
    setAccumulatedTransactions([]);
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Lịch sử giao dịch xu</h1>
          <p className="text-muted-foreground">
            Theo dõi tất cả các giao dịch nạp xu và sử dụng xu của bạn
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary Statistics */}
        <CreditSummary
          summary={summaryData?.data}
          isLoading={isLoadingSummary}
        />

        {/* Filters */}
        <CreditHistoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Transaction List */}
        <CreditHistoryList
          transactions={accumulatedTransactions}
          pagination={historyData?.data?.pagination}
          isLoading={isLoadingHistory && filters.page === 1}
          isLoadingMore={isFetching && filters.page > 1}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
};

export default CreditHistoryPage;
