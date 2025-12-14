import { useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';

/**
 * A hook to manage Firebase Cloud Messaging.
 * It now uses FirebaseContext to avoid duplicate listeners.
 */
const useFirebaseMessaging = (options = {}) => {
  const { onPermissionDenied } = options;
  const context = useFirebase();

  const { requestPermission: contextRequestPermission, ...rest } = context;

  // Wrap requestPermission to pass the local callback
  const requestPermission = useCallback(async () => {
    return contextRequestPermission({ onPermissionDenied });
  }, [contextRequestPermission, onPermissionDenied]);

  return {
    ...rest,
    requestPermission
  };
};

export default useFirebaseMessaging;
