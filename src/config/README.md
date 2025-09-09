# Quản lý Biến Môi Trường

## Tổng quan

Dự án này sử dụng hệ thống quản lý biến môi trường được tổ chức trong thư mục `src/config/`. Tất cả các biến môi trường phải bắt đầu bằng `VITE_` để Vite có thể truy cập chúng.

## Cấu trúc File

```
src/config/
├── env.js          # Định nghĩa tất cả biến môi trường
├── index.js        # File cấu hình chính và export
└── README.md       # Hướng dẫn này
```

## Cách sử dụng

### 1. Tạo file .env

Copy file `env.example` thành `.env` và cập nhật các giá trị:

```bash
cp env.example .env
```

### 2. Các cách sử dụng biến môi trường

#### Cách 1: Sử dụng trực tiếp (như bạn muốn)
```javascript
// Sử dụng trực tiếp import.meta.env
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Sử dụng trong function
const fetchData = async () => {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
};
```

#### Cách 2: Import từ file cấu hình đơn giản
```javascript
// Import từ file cấu hình đơn giản
import { API_URL, API_BASE_URL, API_TIMEOUT } from '../config/api.js';

// Sử dụng
const fetchData = async () => {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
};
```

#### Cách 3: Import cấu hình đầy đủ
```javascript
// Import cấu hình cụ thể
import { API_CONFIG, APP_CONFIG } from '../config/env.js';

// Hoặc import tất cả
import config from '../config/index.js';

// Sử dụng
const apiUrl = API_CONFIG.BASE_URL;
const appName = APP_CONFIG.NAME;
```

#### Cách 4: Sử dụng hooks (trong React component)
```javascript
import { useApiConfig, useConfig } from '../hooks/useConfig.js';

function MyComponent() {
  const apiConfig = useApiConfig();
  const { APP_CONFIG } = useConfig();
  
  return (
    <div>
      <h1>{APP_CONFIG.NAME}</h1>
      <p>API: {apiConfig.BASE_URL}</p>
    </div>
  );
}
```

### 3. Sử dụng utility functions

```javascript
import { getEnvVar, isDevelopment, isProduction } from '../config/env.js';

// Lấy biến môi trường với giá trị mặc định
const apiUrl = getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000');

// Kiểm tra môi trường
if (isDevelopment()) {
  console.log('Đang chạy ở chế độ development');
}
```

## Các biến môi trường có sẵn

### API Configuration
- `VITE_API_BASE_URL`: URL gốc của API
- `VITE_API_TIMEOUT`: Timeout cho API requests (ms)

### App Configuration
- `VITE_APP_NAME`: Tên ứng dụng
- `VITE_APP_VERSION`: Phiên bản ứng dụng
- `VITE_APP_DESCRIPTION`: Mô tả ứng dụng

### Authentication
- `VITE_JWT_SECRET`: Secret key cho JWT
- `VITE_TOKEN_EXPIRY`: Thời gian hết hạn token

### External Services
- `VITE_GOOGLE_ANALYTICS_ID`: ID Google Analytics
- `VITE_SENTRY_DSN`: DSN cho Sentry error tracking

### Development
- `VITE_DEBUG_MODE`: Bật/tắt chế độ debug
- `VITE_LOG_LEVEL`: Mức độ log (debug, info, warn, error)

## Lưu ý quan trọng

1. **Tất cả biến môi trường phải bắt đầu bằng `VITE_`**
2. **File `.env` không được commit vào Git**
3. **Sử dụng `env.example` làm template**
4. **Restart dev server sau khi thay đổi biến môi trường**

## Ví dụ sử dụng trong component

```javascript
import React from 'react';
import { API_CONFIG, APP_CONFIG, isDevelopment } from '../config/env.js';

const MyComponent = () => {
  const handleApiCall = async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
    // ...
  };

  return (
    <div>
      <h1>{APP_CONFIG.NAME}</h1>
      {isDevelopment() && <div>Debug mode enabled</div>}
    </div>
  );
};

export default MyComponent;
```

## Troubleshooting

### Biến môi trường không được load
- Kiểm tra tên biến có bắt đầu bằng `VITE_`
- Restart dev server
- Kiểm tra file `.env` có tồn tại không

### Lỗi import
- Kiểm tra đường dẫn import
- Đảm bảo file `env.js` đã được tạo đúng
