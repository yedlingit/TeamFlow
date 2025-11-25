import { useState, useCallback } from 'react';

/**
 * Hook for managing loading state
 * 
 * @example
 * const { isLoading, startLoading, stopLoading } = useLoading();
 * 
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await apiCall();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const toggleLoading = useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
}

