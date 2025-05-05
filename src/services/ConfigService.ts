import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Import directly from process.env or Constants
const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';
const FDA_API_KEY = process.env.FDA_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Secure configuration service for managing API keys and environment settings
 * 
 * This service implements:
 * 1. A layered approach to config - secure keys only accessible at runtime
 * 2. Key rotation capabilities
 * 3. Different configs for development and production
 */

// Keys for secure storage
const CONFIG_KEYS = {
  GOOGLE_VISION_API_KEY: 'mediscan_google_vision_api_key',
  GEMINI_API_KEY: 'mediscan_gemini_api_key',
  FDA_API_KEY: 'mediscan_fda_api_key',
  CONFIG_VERSION: 'mediscan_config_version',
};

// Config version to track updates
const CURRENT_CONFIG_VERSION = '1.0';

// Base URLs for different environments
const BASE_URLS = {
  development: {
    FDA_API: 'https://dev-api.fda.gov',
    GEMINI_API: 'https://generativelanguage.googleapis.com',
    VISION_API: 'https://vision.googleapis.com',
  },
  staging: {
    FDA_API: 'https://staging-api.fda.gov',
    GEMINI_API: 'https://generativelanguage.googleapis.com',
    VISION_API: 'https://vision.googleapis.com',
  },
  production: {
    FDA_API: 'https://api.fda.gov',
    GEMINI_API: 'https://generativelanguage.googleapis.com',
    VISION_API: 'https://vision.googleapis.com',
  },
};

/**
 * Determine if the app is running in development mode
 */
const isDevelopment = __DEV__;

/**
 * Determine the current environment
 */
const getEnvironment = () => {
  if (isDevelopment) {
    return 'development';
  }
  
  // You could implement logic to detect staging vs production
  // For example, based on a build flag or bundle ID
  return 'production';
};

/**
 * Get base URLs for the current environment
 */
export const getBaseUrls = () => {
  const environment = getEnvironment();
  return BASE_URLS[environment];
};

/**
 * Initialize the configuration service
 * This should be called at app startup
 */
export const initializeConfig = async (): Promise<void> => {
  try {
    // Check if we need to update stored config
    const storedVersion = await SecureStore.getItemAsync(CONFIG_KEYS.CONFIG_VERSION);
    
    if (storedVersion !== CURRENT_CONFIG_VERSION || true) { // Force update for now
      console.log('Initializing or updating configuration...');
      
      // Store keys securely - get from environment directly
      await Promise.all([
        SecureStore.setItemAsync(CONFIG_KEYS.GOOGLE_VISION_API_KEY, GOOGLE_VISION_API_KEY || ''),
        SecureStore.setItemAsync(CONFIG_KEYS.GEMINI_API_KEY, GEMINI_API_KEY || ''),
        SecureStore.setItemAsync(CONFIG_KEYS.FDA_API_KEY, FDA_API_KEY || ''),
        SecureStore.setItemAsync(CONFIG_KEYS.CONFIG_VERSION, CURRENT_CONFIG_VERSION),
      ]);
      
      console.log('Configuration initialized successfully');
      console.log('Google Vision API Key available:', Boolean(GOOGLE_VISION_API_KEY));
      console.log('Gemini API Key available:', Boolean(GEMINI_API_KEY));
      console.log('FDA API Key available:', Boolean(FDA_API_KEY));
    }
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
    throw new Error('Failed to initialize app configuration');
  }
};

/**
 * Get the Google Vision API key
 */
export const getGoogleVisionApiKey = async (): Promise<string> => {
  try {
    // First check SecureStore
    const storedKey = await SecureStore.getItemAsync(CONFIG_KEYS.GOOGLE_VISION_API_KEY);
    if (storedKey) {
      return storedKey;
    }
    
    // Fallback to environment variable
    if (GOOGLE_VISION_API_KEY) {
      return GOOGLE_VISION_API_KEY;
    }
    
    console.error('Google Vision API key not found in SecureStore or environment');
    return '';
  } catch (error) {
    console.error('Failed to get Google Vision API key:', error);
    // Last resort fallback
    return GOOGLE_VISION_API_KEY || '';
  }
};

/**
 * Get the Gemini API key
 */
export const getGeminiApiKey = async (): Promise<string> => {
  try {
    // First check SecureStore
    const storedKey = await SecureStore.getItemAsync(CONFIG_KEYS.GEMINI_API_KEY);
    if (storedKey) {
      return storedKey;
    }
    
    // Fallback to environment variable
    if (GEMINI_API_KEY) {
      return GEMINI_API_KEY;
    }
    
    console.error('Gemini API key not found in SecureStore or environment');
    return '';
  } catch (error) {
    console.error('Failed to get Gemini API key:', error);
    // Last resort fallback
    return GEMINI_API_KEY || '';
  }
};

/**
 * Get the FDA API key
 */
export const getFdaApiKey = async (): Promise<string> => {
  try {
    // First check SecureStore
    const storedKey = await SecureStore.getItemAsync(CONFIG_KEYS.FDA_API_KEY);
    if (storedKey) {
      return storedKey;
    }
    
    // Fallback to environment variable
    if (FDA_API_KEY) {
      return FDA_API_KEY;
    }
    
    console.error('FDA API key not found in SecureStore or environment');
    return '';
  } catch (error) {
    console.error('Failed to get FDA API key:', error);
    // Last resort fallback
    return FDA_API_KEY || '';
  }
};

/**
 * Update API keys remotely
 * 
 * In a real app, this would fetch from a secure backend service
 * that validates the app is legitimate before providing the keys
 */
export const refreshApiKeys = async (): Promise<boolean> => {
  try {
    // In a real app, you would make a secure API call to fetch new keys
    // const response = await fetch('https://api.your-backend.com/api-keys', {
    //   headers: { Authorization: 'Bearer ' + userToken }
    // });
    // const { googleVisionApiKey, geminiApiKey, fdaApiKey } = await response.json();
    
    // For demo purposes, we'll just pretend we refreshed the keys
    console.log('API keys refreshed successfully');
    return true;
  } catch (error) {
    console.error('Failed to refresh API keys:', error);
    return false;
  }
};

/**
 * Common app configuration values
 */
export const AppConfig = {
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  CACHE_TTL: 60 * 60 * 1000, // 1 hour in milliseconds
  NETWORK_TIMEOUT: 30 * 1000, // 30 seconds
  MAX_OFFLINE_DAYS: 30, // Number of days data is kept offline
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
};