import { toast } from 'sonner';
import type { ExternalToast } from 'sonner';

interface UseToastReturn {
  success: (message: string, options?: ExternalToast) => void;
  error: (message: string, options?: ExternalToast) => void;
  warning: (message: string, options?: ExternalToast) => void;
  info: (message: string, options?: ExternalToast) => void;
  toast: (message: string, options?: ExternalToast) => void;
}

/**
 * useToast Hook
 * Consistent toast notifications as per Project Architecture Rules.
 *
 * Usage:
 * const { success, error, warning, info } = useToast();
 * success('Operation successful');
 */
export const useToast = (): UseToastReturn => {
  return {
    success: (message: string, options?: ExternalToast) => toast.success(message, options),
    error: (message: string, options?: ExternalToast) => toast.error(message, options),
    warning: (message: string, options?: ExternalToast) => toast.warning(message, options),
    info: (message: string, options?: ExternalToast) => toast.info(message, options),
    toast: (message: string, options?: ExternalToast) => toast(message, options),
  };
};
