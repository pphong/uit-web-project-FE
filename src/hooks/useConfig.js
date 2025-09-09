import { useState, useEffect } from 'react';
import config from '../config/index.js';

/**
 * Hook để sử dụng cấu hình ứng dụng trong React components
 * @returns {Object} Object chứa tất cả cấu hình và utility functions
 */
export const useConfig = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading configuration
    setIsLoaded(true);
  }, []);

  return {
    ...config,
    isLoaded,
  };
};

/**
 * Hook để lấy cấu hình API
 * @returns {Object} Cấu hình API
 */
export const useApiConfig = () => {
  return config.API_CONFIG;
};

/**
 * Hook để lấy cấu hình ứng dụng
 * @returns {Object} Cấu hình ứng dụng
 */
export const useAppConfig = () => {
  return config.APP_CONFIG;
};

/**
 * Hook để lấy cấu hình xác thực
 * @returns {Object} Cấu hình xác thực
 */
export const useAuthConfig = () => {
  return config.AUTH_CONFIG;
};

/**
 * Hook để kiểm tra môi trường
 * @returns {Object} Thông tin môi trường
 */
export const useEnvironment = () => {
  return {
    isDevelopment: config.isDevelopment(),
    isProduction: config.isProduction(),
    mode: config.ENV.MODE,
  };
};

/**
 * Hook để lấy biến môi trường với giá trị mặc định
 * @param {string} key - Tên biến môi trường
 * @param {any} defaultValue - Giá trị mặc định
 * @returns {any} Giá trị biến môi trường
 */
export const useEnvVar = (key, defaultValue = '') => {
  return config.getEnvVar(key, defaultValue);
};

export default useConfig;
