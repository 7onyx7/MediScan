import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import * as SecureStore from 'expo-secure-store';

// Auth token storage key
const AUTH_TOKEN_KEY = 'mediscan_auth_token';

/**
 * Certificate pinning hashes for production APIs
 * In a real app, you would have actual SHA-256 hashes of your API's certificates
 */
const CERT_PINS = {
  'api.fda.gov': [
    'sha256//example-hash-for-fda-api-1',
    'sha256//example-hash-for-fda-api-2'
  ],
  'generativelanguage.googleapis.com': [
    'sha256//example-hash-for-gemini-api-1',
    'sha256//example-hash-for-gemini-api-2'
  ]
};

/**
 * Secure API client with HTTPS enforcement and certificate pinning
 */
class ApiService {
  private axios: AxiosInstance;
  private isRefreshing = false;
  private tokenRefreshPromise: Promise<string> | null = null;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseURL: string, timeout = 30000) {
    // Enforce HTTPS
    if (!baseURL.startsWith('https://') && !__DEV__) {
      throw new Error('API URL must use HTTPS in production');
    }

    this.axios = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    // Configure request interceptors
    this.axios.interceptors.request.use(
      this.handleRequest,
      this.handleError
    );

    // Configure response interceptors
    this.axios.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError
    );
  }

  /**
   * Handle outgoing requests
   */
  private handleRequest = async (config: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
    try {
      // Check network connectivity
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        throw new Error('No internet connection');
      }

      // Add auth token if available
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }

      // In a real app, implement certificate pinning here
      // This would typically be done with a native module
      if (!__DEV__ && config.url) {
        this.validateCertificatePinning(config.url, CERT_PINS);
      }

      return config;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Validate certificate pinning (placeholder implementation)
   * In a real app, you'd use a native module like react-native-ssl-pinning
   */
  private validateCertificatePinning(url: string, pins: Record<string, string[]>): void {
    // Extract hostname from URL
    const hostname = new URL(url).hostname;
    
    // Check if we have pins for this hostname
    if (!pins[hostname]) {
      console.warn(`No certificate pins defined for ${hostname}`);
    }
    
    // In a real implementation, you would verify the server's certificate
    // against the pinned hashes here
    console.log(`Certificate pinning would be validated for ${hostname}`);
  }

  /**
   * Handle successful responses
   */
  private handleResponse = (response: AxiosResponse): AxiosResponse => {
    return response;
  };

  /**
   * Handle request errors
   */
  private handleError = (error: AxiosError): Promise<never> => {
    console.error('Request error:', error);
    return Promise.reject(error);
  };

  /**
   * Handle response errors, including token refresh
   */
  private handleResponseError = async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && originalRequest) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.tokenRefreshPromise = this.refreshAuthToken();

        try {
          const newToken = await this.tokenRefreshPromise;
          // Notify subscribers about the new token
          this.onTokenRefreshed(newToken);
          
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.axios(originalRequest);
        } catch (refreshError) {
          // Token refresh failed, logout user
          await this.logout();
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
          this.tokenRefreshPromise = null;
        }
      } else {
        // Wait for the token refresh to complete
        try {
          const newToken = await this.tokenRefreshPromise;
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return this.axios(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      // Check if it's actually a connectivity issue
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        return Promise.reject(new Error('No internet connection'));
      }
    }

    return Promise.reject(error);
  };

  /**
   * Refresh the authentication token
   */
  private async refreshAuthToken(): Promise<string> {
    try {
      // Implement your token refresh logic here
      // This might call your auth server's refresh endpoint
      
      // For demo purposes, we'll simulate a token refresh
      const newToken = `refreshed_token_${Date.now()}`;
      
      // Save the new token
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, newToken);
      
      return newToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Notify subscribers when token is refreshed
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Add a subscriber for token refresh
   */
  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Perform authenticated GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.get<T>(url, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Perform authenticated POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Perform authenticated PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Perform authenticated DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axios.delete<T>(url, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Handle API errors with consistent error format
   */
  private handleApiError(error: any): never {
    // Format error message for UI display
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with non-2xx status
      const status = error.response.status;
      const data = error.response.data;
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else {
        // Map common status codes to messages
        switch (status) {
          case 400:
            errorMessage = 'Invalid request';
            break;
          case 401:
            errorMessage = 'Authentication required';
            break;
          case 403:
            errorMessage = 'You don\'t have permission to access this resource';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          default:
            errorMessage = `Server error (${status})`;
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'No response from server. Please check your connection';
    } else if (error.message) {
      // Error setting up the request
      errorMessage = error.message;
    }
    
    // Add any monitoring or logging here
    console.error('API Error:', {
      message: errorMessage,
      originalError: error
    });
    
    throw new Error(errorMessage);
  }

  /**
   * Log out the user and clear authentication
   */
  public async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    // Additional logout logic here
  }
}

// Export singleton instances for each API service
export const fdaApiService = new ApiService('https://api.fda.gov');
export const geminiApiService = new ApiService('https://generativelanguage.googleapis.com');

// Generic API service creator for other endpoints
export const createApiService = (baseURL: string): ApiService => {
  return new ApiService(baseURL);
};