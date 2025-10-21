import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Centralised helpers for triggering toast notifications.
 * Ensures consistent styling and lets us swap the implementation later
 * without touching each call site.
 */
const useToast = () => {
  const show = useCallback((message, options) => toast(message, options), []);
  const showSuccess = useCallback((message, options) => toast.success(message, options), []);
  const showError = useCallback((message, options) => toast.error(message, options), []);
  const showLoading = useCallback((message, options) => toast.loading(message, options), []);
  const dismiss = useCallback((toastId) => toast.dismiss(toastId), []);

  return {
    show,
    showSuccess,
    showError,
    showLoading,
    dismiss,
  };
};

export default useToast;
