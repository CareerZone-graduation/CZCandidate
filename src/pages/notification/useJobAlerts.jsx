import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  getJobAlerts,
  createJobAlert,
  updateJobAlert,
  deleteJobAlert,
  toggleJobAlertStatus
} from '../../services/jobNotificationService';

/**
 * Custom hook để quản lý đăng ký nhận job alert (job subscriptions)
 * Tương thích với JobAlertManager component
 */
export const useJobAlerts = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // State quản lý
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(new Set()); // Set of IDs being deleted
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Fetch danh sách job alerts
   */
  const fetchAlerts = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getJobAlerts({
        page: currentPage,
        limit: 10,
        ...params
      });
      
      if (response.data.success) {
        const jobAlerts = response.data.data || [];
        
        // Transform API data to match component expectations
        const transformedAlerts = jobAlerts.map(alert => ({
          _id: alert._id,
          name: alert.name || alert.keyword, // Use name if available, otherwise fallback to keyword
          keyword: alert.keyword,
          location: alert.location?.province || '',
          category: formatCategory(alert.category),
          salaryRange: formatSalaryRange(alert.salaryRange),
          frequency: alert.frequency,
          active: alert.active,
          createdAt: alert.createdAt,
          updatedAt: alert.updatedAt,
          // API không có field này, giữ lại để tương thích UI cũ nếu cần
          lastSent: null, 
          // Lưu raw data để dễ edit
          rawData: alert
        }));
        
        setAlerts(transformedAlerts);
        
        if (response.data.meta) {
          setTotalItems(response.data.meta.totalItems || transformedAlerts.length);
          setTotalPages(response.data.meta.totalPages || 1);
          setCurrentPage(response.data.meta.currentPage || 1);
        } else {
          setTotalItems(transformedAlerts.length);
          setTotalPages(1);
        }
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách đăng ký');
      }
    } catch (err) {
      console.error('❌ Error fetching job alerts:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentPage]);

  /**
   * Tạo job alert mới
   */
  const createAlert = useCallback(async (alertData) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thực hiện chức năng này.');
            return false;
        }

        try {
            setIsSaving(true);
            const response = await createJobAlert(alertData);
            
            if (response.success) {
                toast.success('Đăng ký nhận thông báo thành công!');
                await fetchAlerts(); // Tải lại danh sách
                return true;
            } else {
                throw new Error(response.message || 'Không thể tạo đăng ký');
            }
        } catch (err) {
            console.error('❌ Error creating job alert:', err);
            const errorMessage = err.response?.data?.message || err.message;
            toast.error(errorMessage);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [isAuthenticated, fetchAlerts]);

  /**
   * Cập nhật job alert
   */
  const updateAlert = useCallback(async (id, alertData) => {
    try {
      setIsSaving(true);
      
      const response = await updateJobAlert(id, alertData);
      
      if (response.data.success) {
        toast.success('Cập nhật đăng ký thành công!');
        await fetchAlerts(); // Refresh danh sách
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể cập nhật đăng ký');
      }
    } catch (err) {
      console.error('❌ Error updating job alert:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchAlerts]);

  /**
   * Xóa job alert
   */
  const deleteAlert = useCallback(async (id) => {
    try {
      setIsDeleting(prev => new Set([...prev, id]));
      
      const response = await deleteJobAlert(id);
      
      if (response.data.success) {
        toast.success('Xóa đăng ký thành công!');
        await fetchAlerts(); // Refresh danh sách
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể xóa đăng ký');
      }
    } catch (err) {
      console.error('❌ Error deleting job alert:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    } finally {
      setIsDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [fetchAlerts]);

  /**
   * Bật/tắt trạng thái job alert
   */
  const toggleAlertStatus = useCallback(async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await toggleJobAlertStatus(id, newStatus);
      
      if (response.data.success) {
        toast.success(newStatus ? 'Đã bật nhận thông báo' : 'Đã tạm dừng nhận thông báo');
        
        setAlerts(prev => 
          prev.map(alert => 
            alert._id === id 
              ? { ...alert, active: newStatus } 
              : alert
          )
        );
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể thay đổi trạng thái');
      }
    } catch (err) {
      console.error('❌ Error toggling job alert status:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    }
  }, []);

  /**
   * Thay đổi trang
   */
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  // Computed values
  const activeAlerts = alerts.filter(n => n.active);
  const hasAlerts = alerts.length > 0;
  const canCreateMore = true; // Có thể giới hạn số lượng tối đa nếu cần

  // Auto fetch khi component mount hoặc user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    } else {
      // Reset state khi user logout
      setAlerts([]);
      setError(null);
      setCurrentPage(1);
      setTotalItems(0);
      setTotalPages(1);
    }
  }, [isAuthenticated, fetchAlerts]);

  // Format functions
  const formatCategory = (category) => {
    // ... giữ nguyên
    return category || '';
  };

  const formatSalaryRange = (salaryRange) => {
    // ... giữ nguyên
    return salaryRange || '';
  };

  return {
    // Data
    alerts,
    activeAlerts,
    hasAlerts,
    canCreateMore,
    
    // Pagination
    totalItems,
    currentPage,
    totalPages,
    
    // State
    isLoading,
    isSaving,
    isDeleting,
    error,
    
    // Actions
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    toggleAlertStatus,
    handlePageChange
  };
};

export default useJobAlerts;