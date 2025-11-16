import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestForToken, setupOnMessageListener } from '@/services/firebase';
import { fetchRecentNotifications, fetchUnreadCount, fetchNotifications } from '@/redux/notificationSlice';
import { toast } from 'sonner';

/**
 * A hook to manage Firebase Cloud Messaging.
 * It requests permission, gets the token, and listens for foreground messages.
 */
const useFirebaseMessaging = (options = {}) => {
  const { onPermissionDenied } = options;
  const [notification, setNotification] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const dispatch = useDispatch();
  const { pagination, initialized } = useSelector((state) => state.notifications);

  /**
   * Manually requests notification permission and retrieves the FCM token.
   */
  const requestPermission = async () => {
    try {
      // Reset permission denied state
      setPermissionDenied(false);
      
      const token = await requestForToken();
      if (token) {
        toast.success('Thông báo đã được bật.');
        console.log('FCM token obtained:', token);
      } else {
        // Permission was denied
        const errorMessage = 'Quyền thông báo bị từ chối. Nhấn "Xem hướng dẫn" để biết cách bật.';
        setPermissionDenied(true);
        
        toast.error(errorMessage, {
          duration: 5000,
          action: {
            label: 'Xem hướng dẫn',
            onClick: () => {
              if (onPermissionDenied) {
                onPermissionDenied();
              }
            }
          }
        });
        
        // Auto trigger permission guide callback after delay
        if (onPermissionDenied) {
          setTimeout(() => onPermissionDenied(), 1500);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      
      // Check if it's a permission error
      const isPermissionError = error.message?.toLowerCase().includes('permission') || 
                                error.message?.toLowerCase().includes('denied');
      
      if (isPermissionError) {
        setPermissionDenied(true);
        const errorMessage = 'Quyền thông báo bị từ chối. Nhấn "Xem hướng dẫn" để biết cách bật.';
        
        toast.error(errorMessage, {
          duration: 5000,
          action: {
            label: 'Xem hướng dẫn',
            onClick: () => {
              if (onPermissionDenied) {
                onPermissionDenied();
              }
            }
          }
        });
        
        if (onPermissionDenied) {
          setTimeout(() => onPermissionDenied(), 1500);
        }
      } else {
        toast.error('Đã xảy ra lỗi khi bật thông báo.');
      }
    }
  };
useEffect(() => {
    // Chỉ thiết lập listener nếu người dùng đã cho phép thông báo
    if (Notification.permission === 'granted') {
      console.log('Setting up Firebase messaging listener...');

      // onMessage trả về một hàm "unsubscribe"
      // Chúng ta sẽ lưu nó lại để gọi khi component unmount
      const unsubscribe = setupOnMessageListener((payload) => {
        setNotification(payload);

        if (payload.notification) {
          toast.info(payload.notification.title, {
            description: payload.notification.body,
            duration: 5000,
            // Thêm action để người dùng có thể click vào
            action: {
              label: 'Xem',
              onClick: () => {
                if (payload.data && payload.data.url) {
                   window.location.href = payload.data.url;
                }
              },
            },
          });

          // Gọi API để cập nhật lại notifications trong Redux
          console.log('Fetching updated notifications after push notification...');
          
          // Cập nhật recent notifications và unread count
          dispatch(fetchRecentNotifications());
          dispatch(fetchUnreadCount());
          
          // Nếu user đã load notifications (đang ở NotificationsPage), refetch lại
          if (initialized) {
            dispatch(fetchNotifications({ 
              page: pagination.page, 
              limit: pagination.limit 
            }));
          }
        }
      });

      // Đây là hàm cleanup của useEffect
      // Nó sẽ được gọi khi component bị unmount (ví dụ: chuyển trang)
      return () => {
        console.log('Unsubscribing from Firebase messaging listener...');
        unsubscribe();
      };
    }
  }, [dispatch, pagination.page, pagination.limit, initialized]);

  // === VISIBILITY CHANGE HANDLER ===
  // Khi user quay lại tab sau khi ở background, refetch notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Notification.permission === 'granted') {
        console.log('Tab became visible, refreshing notifications...');
        
        // Refetch tất cả để đảm bảo sync
        dispatch(fetchRecentNotifications());
        dispatch(fetchUnreadCount());
        
        // Nếu đang ở NotificationsPage, cũng refetch
        if (initialized) {
          dispatch(fetchNotifications({ 
            page: pagination.page, 
            limit: pagination.limit 
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, pagination.page, pagination.limit, initialized]);

  return { 
    notification, 
    requestPermission,
    permissionDenied 
  };
};

export default useFirebaseMessaging;