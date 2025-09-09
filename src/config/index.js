/**
 * File cấu hình chính của ứng dụng
 * Import tất cả các cấu hình từ các module khác
 */

import {
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
} from './env.js';

// Export tất cả cấu hình
export {
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

// Cấu hình mặc định cho ứng dụng
export const DEFAULT_CONFIG = {
  // Theme configuration
  THEME: {
    PRIMARY_COLOR: '#1976d2',
    SECONDARY_COLOR: '#dc004e',
    SUCCESS_COLOR: '#2e7d32',
    WARNING_COLOR: '#ed6c02',
    ERROR_COLOR: '#d32f2f',
    INFO_COLOR: '#0288d1',
  },

  // UI Configuration
  UI: {
    SIDEBAR_WIDTH: 240,
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 60,
    BORDER_RADIUS: 8,
    SHADOW: '0 2px 8px rgba(0,0,0,0.1)',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },

  // Date format
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm:ss',

  // Currency
  CURRENCY: {
    SYMBOL: '₫',
    CODE: 'VND',
    DECIMAL_PLACES: 0,
  },

  // Validation rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[0-9]{10,11}$/,
  },

  // Storage keys
  STORAGE_KEYS: {
    USER_PREFERENCES: 'uit_web_user_preferences',
    THEME: 'uit_web_theme',
    LANGUAGE: 'uit_web_language',
    RECENT_SEARCHES: 'uit_web_recent_searches',
  },
};

// Cấu hình cho các môi trường khác nhau
export const ENVIRONMENT_CONFIG = {
  development: {
    ...DEFAULT_CONFIG,
    API_CONFIG: {
      ...API_CONFIG,
      BASE_URL: 'http://localhost:3000/api',
    },
    DEV_CONFIG: {
      ...DEV_CONFIG,
      DEBUG_MODE: true,
      LOG_LEVEL: 'debug',
    },
  },

  production: {
    ...DEFAULT_CONFIG,
    API_CONFIG: {
      ...API_CONFIG,
      BASE_URL: 'https://api.uit-web-project.com/api',
    },
    PROD_CONFIG: {
      ...PROD_CONFIG,
      ENABLE_ANALYTICS: true,
      ENABLE_ERROR_REPORTING: true,
    },
  },

  test: {
    ...DEFAULT_CONFIG,
    API_CONFIG: {
      ...API_CONFIG,
      BASE_URL: 'http://localhost:3001/api',
    },
    DEV_CONFIG: {
      ...DEV_CONFIG,
      DEBUG_MODE: false,
      LOG_LEVEL: 'error',
    },
  },
};

// Function để lấy cấu hình theo môi trường
export const getConfig = () => {
  const mode = import.meta.env.MODE || 'development';
  return ENVIRONMENT_CONFIG[mode] || ENVIRONMENT_CONFIG.development;
};

// Function để lấy cấu hình API
export const getApiConfig = () => {
  return getConfig().API_CONFIG;
};

// Function để lấy cấu hình ứng dụng
export const getAppConfig = () => {
  return getConfig().APP_CONFIG;
};

// Function để lấy cấu hình xác thực
export const getAuthConfig = () => {
  return getConfig().AUTH_CONFIG;
};

// Default export
export default {
  ...DEFAULT_CONFIG,
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
  getConfig,
  getApiConfig,
  getAppConfig,
  getAuthConfig,
};
