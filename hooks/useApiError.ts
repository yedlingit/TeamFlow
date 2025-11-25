import { useCallback } from 'react';
import { ApiException } from '../api/client';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook for handling API errors with toast notifications
 * 
 * @example
 * const handleApiError = useApiError();
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleApiError(error);
 * }
 */
export function useApiError() {
  const { error: showError } = useToast();

  return useCallback(
    (error: unknown, customMessage?: string) => {
      if (error instanceof ApiException) {
        // Handle API errors
        const message = customMessage || error.data.error || error.data.message || error.message;
        showError(message);
        
        // Log detailed error in development
        if (import.meta.env.DEV) {
          console.error('API Error:', {
            status: error.status,
            data: error.data,
            message: error.message,
          });
        }
      } else if (error instanceof Error) {
        // Handle generic errors
        showError(customMessage || error.message || 'An unexpected error occurred');
      } else {
        // Handle unknown errors
        showError(customMessage || 'An unexpected error occurred');
      }
    },
    [showError]
  );
}

