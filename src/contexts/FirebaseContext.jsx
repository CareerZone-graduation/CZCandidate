
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestForToken, setupOnMessageListener } from '@/services/firebase';
import { fetchRecentNotifications, fetchUnreadCount, fetchNotifications } from '@/redux/notificationSlice';
import { toast } from 'sonner';

export const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const dispatch = useDispatch();
    const { pagination, initialized } = useSelector((state) => state.notifications);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Refs to hold latest state values for the listener without triggering re-subscription
    const paginationRef = useRef(pagination);
    const initializedRef = useRef(initialized);
    const lastMessageIdRef = useRef(null);

    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Update refs when state changes
    useEffect(() => {
        paginationRef.current = pagination;
    }, [pagination]);

    useEffect(() => {
        initializedRef.current = initialized;
    }, [initialized]);

    // Check initial status
    useEffect(() => {
        const checkStatus = async () => {
            if ('Notification' in window && Notification.permission === 'granted') {
                if (!isAuthenticated) {
                    setIsPushEnabled(false);
                    return;
                }

                const { getFCMMessaging, checkDeviceRegistration } = await import('@/services/firebase');
                const { getToken } = await import('firebase/messaging');
                try {
                    const messaging = getFCMMessaging();
                    const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
                    if (currentToken) {
                        const isRegistered = await checkDeviceRegistration(currentToken);
                        setIsPushEnabled(isRegistered);
                    }
                } catch (e) {
                    console.error('Error checking status:', e);
                    setIsPushEnabled(false);
                }
            } else {
                setIsPushEnabled(false);
            }
        };
        checkStatus();
    }, [isAuthenticated]);

    const checkPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            setIsPushEnabled(false);
        }
    };

    /**
     * Manually requests notification permission and retrieves the FCM token.
     */
    const requestPermission = useCallback(async ({ onPermissionDenied } = {}) => {
        try {
            setIsLoading(true);
            // Reset permission denied state
            setPermissionDenied(false);

            const token = await requestForToken();
            if (token) {
                toast.success('Thông báo đã được bật.');
                console.log('FCM token obtained:', token);
                setIsPushEnabled(true);
            } else {
                // Permission was denied
                const errorMessage = 'Quyền thông báo bị từ chối. Nhấn "Xem hướng dẫn" để biết cách bật.';
                setPermissionDenied(true);
                setIsPushEnabled(false);

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
            checkPermission();

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
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Chỉ thiết lập listener nếu người dùng đã cho phép thông báo
        if ('Notification' in window && Notification.permission === 'granted') {
            console.log('Setting up Firebase messaging listener...');

            const unsubscribe = setupOnMessageListener((payload) => {
                // Deduplicate check
                if (payload.messageId && lastMessageIdRef.current === payload.messageId) {
                    console.log('Duplicate message ignored:', payload.messageId);
                    return;
                }
                if (payload.messageId) {
                    lastMessageIdRef.current = payload.messageId;
                }

                setNotification(payload);

                // Handle both Notification payload (standard) and Data payload (data-only)
                const title = payload.data?.title;
                const body = payload.data?.body;
                if (title) {
                    toast.info(title, {
                        description: body,
                        duration: 5000,
                        action: {
                            label: 'Xem ngay',
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

                    // Sử dụng refs để access latest state mà không cần re-subscribe
                    if (initializedRef.current) {
                        dispatch(fetchNotifications({
                            page: paginationRef.current.page,
                            limit: paginationRef.current.limit
                        }));
                    }
                }
            });

            return () => {
                console.log('Unsubscribing from Firebase messaging listener...');
                unsubscribe();
            };
        }
        // Listener chỉ re-run khi permission status thay đổi, không phụ thuộc vào redux state
    }, [dispatch, isPushEnabled]);

    /**
     * Manually disables push notifications for this device.
     */
    const disableNotifications = useCallback(async () => {
        try {
            setIsLoading(true);
            const { getFCMMessaging, unregisterDeviceToken } = await import('@/services/firebase');
            const { getToken, deleteToken } = await import('firebase/messaging');

            const messaging = getFCMMessaging();
            const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });

            if (currentToken) {
                // 1. Unregister from backend
                await unregisterDeviceToken(currentToken);
                // 2. Delete token from Firebase SDK
                await deleteToken(messaging);
                toast.success('Đã tắt thông báo đẩy trên thiết bị này.');
                setIsPushEnabled(false);
            } else {
                toast.info('Thiết bị chưa đăng ký thông báo.');
                setIsPushEnabled(false);
            }
        } catch (error) {
            console.error('Error disabling notifications:', error);
            toast.error('Không thể tắt thông báo.');
            checkPermission();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && 'Notification' in window && Notification.permission === 'granted') {
                console.log('Tab became visible, refreshing notifications...');

                // Only fetch if authenticated
                if (isAuthenticated) {
                    dispatch(fetchRecentNotifications());
                    dispatch(fetchUnreadCount());

                    if (initializedRef.current) {
                        dispatch(fetchNotifications({
                            page: paginationRef.current.page,
                            limit: paginationRef.current.limit
                        }));
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [dispatch]);

    const value = {
        notification,
        requestPermission,
        disableNotifications,
        isPushEnabled,
        permissionDenied,
        isLoading
    };

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};
