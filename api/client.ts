/**
 * API Client - Centralized HTTP client for TeamFlow API
 * 
 * Features:
 * - Base URL configuration
 * - Cookie authentication (credentials: 'include')
 * - Error handling with retry logic
 * - Request/Response interceptors
 * - TypeScript types
 */

// Get API base URL from environment variable (Vite)
const API_BASE_URL = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'http://localhost:5112';

export interface ApiError {
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

/**
 * Custom error class for API errors
 */
export class ApiException extends Error {
  constructor(
    public status: number,
    public data: ApiError,
    message?: string
  ) {
    super(message || data.error || data.message || 'An error occurred');
    this.name = 'ApiException';
  }
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatuses: number[];
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryable = (status: number, retryableStatuses: number[]): boolean => {
  return retryableStatuses.includes(status);
};

/**
 * Main API client function
 */
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<ApiResponse<T>> {
  const config: RetryConfig = { ...defaultRetryConfig, ...retryConfig };
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Merge options
  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important: Include cookies for authentication
  };

  let lastError: ApiException | null = null;
  let lastResponse: Response | null = null;

  // Retry logic
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Add delay before retry (except first attempt)
      if (attempt > 0) {
        const delay = config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await sleep(delay);
      }

      const response = await fetch(url, requestOptions);
      lastResponse = response;

      // Parse response body
      let data: T | ApiError;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (response.status === 204) {
        // No content
        return {
          data: undefined as T,
          status: response.status,
          ok: response.ok,
        };
      } else {
        // Plain text or other
        const text = await response.text();
        data = { error: text || 'An error occurred' };
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = data as ApiError;
        const error = new ApiException(response.status, errorData);

        // Handle 401/403 - redirect to login (but don't retry)
        if (response.status === 401 || response.status === 403) {
          // Only redirect if not already on login/register/onboarding page
          if (typeof window !== 'undefined' && 
              !window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register') &&
              !window.location.pathname.includes('/onboarding')) {
            // Store the current path for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            window.location.href = '/login';
          }
          throw error;
        }

        // Check if retryable
        if (
          attempt < config.maxRetries &&
          isRetryable(response.status, config.retryableStatuses)
        ) {
          lastError = error;
          continue; // Retry
        }

        // Not retryable or max retries reached
        throw error;
      }

      // Success
      return {
        data: data as T,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      // Network errors or other fetch errors
      if (error instanceof ApiException) {
        throw error; // Re-throw API errors
      }

      // Network error - retry if attempts left
      if (attempt < config.maxRetries) {
        lastError = new ApiException(
          0,
          { error: 'Network error' },
          error instanceof Error ? error.message : 'Network request failed'
        );
        continue; // Retry
      }

      // Max retries reached or non-retryable error
      throw new ApiException(
        0,
        { error: 'Network error' },
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new ApiException(500, { error: 'Unknown error' });
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, retryConfig?: Partial<RetryConfig>): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: 'GET' }, retryConfig);
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  data?: unknown,
  retryConfig?: Partial<RetryConfig>
): Promise<ApiResponse<T>> {
  return apiClient<T>(
    endpoint,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    retryConfig
  );
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: unknown,
  retryConfig?: Partial<RetryConfig>
): Promise<ApiResponse<T>> {
  return apiClient<T>(
    endpoint,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    retryConfig
  );
}

/**
 * PATCH request
 */
export async function patch<T>(
  endpoint: string,
  data?: unknown,
  retryConfig?: Partial<RetryConfig>
): Promise<ApiResponse<T>> {
  return apiClient<T>(
    endpoint,
    {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    },
    retryConfig
  );
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, retryConfig?: Partial<RetryConfig>): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, { method: 'DELETE' }, retryConfig);
}

// Export default for convenience
export default {
  get,
  post,
  put,
  patch,
  delete: del,
};

