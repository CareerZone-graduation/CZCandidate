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
 * Custom hook để quản lý job notifications
 * Tương thích với JobNotificationManager component
 */
export const useJobNotifications = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // State quản lý
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(new Set()); // Set of IDs being deleted
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * Fetch danh sách notifications
   */
  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getJobAlerts({
        page: currentPage,
        limit: 10,
        ...params
      });
      
      console.log('📡 Job alerts response:', response);
      
      if (response.data.success) {
        const jobAlerts = response.data.data || [];
        
        // Transform API data to match component expectations
        const transformedNotifications = jobAlerts.map(alert => ({
          _id: alert._id,
          name: alert.keyword, // Dùng keyword làm name
          keywords: alert.keyword,
          location: alert.location?.province || '',
          category: formatCategory(alert.category),
          salaryRange: formatSalaryRange(alert.salaryRange),
          frequency: alert.frequency,
          isActive: alert.active,
          createdAt: alert.createdAt,
          updatedAt: alert.updatedAt,
          lastSent: null, // API không có field này
          // Lưu raw data để dễ edit
          rawData: alert
        }));
        
        setNotifications(transformedNotifications);
        
        // Cập nhật pagination nếu có
        if (response.data.meta) {
          setTotalItems(response.data.meta.totalItems || transformedNotifications.length);
          setTotalPages(response.data.meta.totalPages || 1);
          setCurrentPage(response.data.meta.currentPage || 1);
        } else {
          setTotalItems(transformedNotifications.length);
          setTotalPages(1);
        }
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách thông báo');
      }
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentPage]);

  /**
   * Tạo notification mới
   */
  const createNotification = useCallback(async (notificationData) => {
    try {
      setIsSaving(true);
      
      console.log('🆕 Creating notification with data:', notificationData);
      
      const response = await createJobAlert(notificationData);
      
      if (response.data.success) {
        toast.success('Đăng ký thông báo thành công!');
        await fetchNotifications(); // Refresh danh sách
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể tạo thông báo');
      }
    } catch (err) {
      console.error('❌ Error creating notification:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchNotifications]);

  /**
   * Cập nhật notification
   */
  const updateNotification = useCallback(async (id, notificationData) => {
    try {
      setIsSaving(true);
      
      console.log('📝 Updating notification:', id, notificationData);
      
      const response = await updateJobAlert(id, notificationData);
      
      if (response.data.success) {
        toast.success('Cập nhật thông báo thành công!');
        await fetchNotifications(); // Refresh danh sách
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể cập nhật thông báo');
      }
    } catch (err) {
      console.error('❌ Error updating notification:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchNotifications]);

  /**
   * Xóa notification
   */
  const deleteNotification = useCallback(async (id) => {
    try {
      // Add to deleting set
      setIsDeleting(prev => new Set([...prev, id]));
      
      const response = await deleteJobAlert(id);
      
      if (response.data.success) {
        toast.success('Xóa thông báo thành công!');
        await fetchNotifications(); // Refresh danh sách
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể xóa thông báo');
      }
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(errorMessage);
      return false;
    } finally {
      // Remove from deleting set
      setIsDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [fetchNotifications]);

  /**
   * Bật/tắt trạng thái notification
   */
  const toggleNotification = useCallback(async (id, isActive) => {
    try {
      const response = await toggleJobAlertStatus(id, !isActive);
      
      if (response.data.success) {
        toast.success(!isActive ? 'Đã bật thông báo' : 'Đã tắt thông báo');
        
        // Cập nhật local state để UI responsive
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === id 
              ? { ...notification, isActive: !isActive } 
              : notification
          )
        );
        return true;
      } else {
        throw new Error(response.data.message || 'Không thể thay đổi trạng thái');
      }
    } catch (err) {
      console.error('❌ Error toggling notification status:', err);
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
  const activeNotifications = notifications.filter(n => n.isActive);
  const hasNotifications = notifications.length > 0;
  const canCreateMore = true; // Có thể giới hạn số lượng tối đa nếu cần

  // Auto fetch khi component mount hoặc user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Reset state khi user logout
      setNotifications([]);
      setError(null);
      setCurrentPage(1);
      setTotalItems(0);
      setTotalPages(1);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Format functions
  const formatCategory = (category) => {
    const categoryMap = {
      'SOFTWARE_DEVELOPMENT': 'Phát triển phần mềm',
      'WEB_DEVELOPMENT': 'Phát triển web',
      'MOBILE_DEVELOPMENT': 'Phát triển mobile',
      'DATA_SCIENCE': 'Khoa học dữ liệu',
      'DEVOPS': 'DevOps',
      'UI_UX_DESIGN': 'Thiết kế UI/UX',
      'PRODUCT_MANAGEMENT': 'Quản lý sản phẩm',
      'MARKETING': 'Marketing',
      'SALES': 'Kinh doanh',
      'HR': 'Nhân sự'
    };
    return categoryMap[category] || category || '';
  };

  const formatSalaryRange = (salaryRange) => {
    const salaryMap = {
      'UNDER_10M': 'Dưới 10 triệu',
      '10M_15M': '10-15 triệu',
      '15M_20M': '15-20 triệu',
      '20M_30M': '20-30 triệu',
      '30M_50M': '30-50 triệu',
      'ABOVE_50M': 'Trên 50 triệu',
      'NEGOTIABLE': 'Thỏa thuận'
    };
    return salaryMap[salaryRange] || salaryRange || '';
  };

  return {
    // Data
    notifications,
    activeNotifications,
    hasNotifications,
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
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    handlePageChange
  };
};

export default useJobNotifications;