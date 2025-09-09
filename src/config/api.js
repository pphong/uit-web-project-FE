/**
 * Cấu hình API đơn giản - tương thích với code hiện tại
 * Sử dụng: const API_URL = import.meta.env.VITE_API_URL
 */

// Export trực tiếp các biến môi trường để sử dụng như cũ
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

// Các biến môi trường khác
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'UIT Web Project';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || false;

// Utility function để lấy biến môi trường
export const getEnv = (key, defaultValue = '') => {
  return import.meta.env[key] || defaultValue;
};

// Kiểm tra môi trường
export const isDev = import.meta.env.DEV;
export const isProd = import.meta.env.PROD;

// Default export
export default {
  API_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
  DEBUG_MODE,
  getEnv,
  isDev,
  isProd,
};
