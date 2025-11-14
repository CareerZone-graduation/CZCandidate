import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestForToken, setupOnMessageListener } from '@/services/firebase';
import { fetchRecentNotifications, fetchUnreadCount } from '@/redux/notificationSlice';
import { toast } from 'sonner';

/**
 * A hook to manage Firebase Cloud Messaging.
 * It requests permission, gets the token, and listens for foreground messages.
 */
const useFirebaseMessaging = () => {
  const [notification, setNotification] = useState(null);
  const dispatch = useDispatch();

  /**
   * Manually requests notification permission and retrieves the FCM token.
   */
  const requestPermission = async () => {
    try {
      const token = await requestForToken();
      if (token) {
        toast.success('Thông báo đã được bật.');
        console.log('FCM token obtained:', token);
        // TODO: Send the token to your server here
      } else {
        toast.warning('Yêu cầu quyền thông báo đã bị từ chối.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Đã xảy ra lỗi khi bật thông báo.');
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
          dispatch(fetchRecentNotifications());
          dispatch(fetchUnreadCount());
        }
      });

      // Đây là hàm cleanup của useEffect
      // Nó sẽ được gọi khi component bị unmount (ví dụ: chuyển trang)
      return () => {
        console.log('Unsubscribing from Firebase messaging listener...');
        unsubscribe();
      };
    }
  }, [dispatch]); // Thêm dispatch vào dependency array



  return { notification, requestPermission };
};

export default useFirebaseMessaging;