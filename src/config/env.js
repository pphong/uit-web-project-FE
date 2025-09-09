/**
 * Quản lý biến môi trường cho ứng dụng
 * Tất cả biến môi trường phải bắt đầu bằng VITE_ để Vite có thể truy cập
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Export individual API variables for backward compatibility
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'UIT Web Project',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Quản lý tài chính cá nhân',
  AUTHOR: 'UIT Students',
};

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_SECRET: import.meta.env.VITE_JWT_SECRET || 'default-secret-key',
  TOKEN_EXPIRY: import.meta.env.VITE_TOKEN_EXPIRY || '24h',
  STORAGE_KEY: 'uit_web_auth_token',
  REFRESH_TOKEN_KEY: 'uit_web_refresh_token',
};

// Database Configuration (for frontend)
export const DB_CONFIG = {
  NAME: import.meta.env.VITE_DB_NAME || 'uit_web_project',
  VERSION: 1,
};

// External Services
export const EXTERNAL_SERVICES = {
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || '',
};

// Development Configuration
export const DEV_CONFIG = {
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || false,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  ENABLE_DEVTOOLS: import.meta.env.DEV || false,
};

// Production Configuration
export const PROD_CONFIG = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || false,
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true' || false,
};

// Environment Detection
export const ENV = {
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
};

// Utility function để kiểm tra biến môi trường
export const getEnvVar = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Utility function để kiểm tra xem có phải development mode không
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// Utility function để kiểm tra xem có phải production mode không
export const isProduction = () => {
  return import.meta.env.PROD;
};

// Default export chứa tất cả cấu hình
export default {
  API_CONFIG,
  APP_CONFIG,
  AUTH_CONFIG,
  DB_CONFIG,
  EXTERNAL_SERVICES,
  DEV_CONFIG,
  PROD_CONFIG,
  ENV,
  getEnvVar,
  isDevelopment,
  isProduction,
};
