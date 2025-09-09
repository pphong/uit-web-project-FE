import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import RequireAuth from "./routes/RequireAuth";
import { useConfig } from "./hooks/useConfig";

function App() {
  const { APP_CONFIG, isDevelopment } = useConfig();

  // Log thông tin ứng dụng trong development mode
  if (isDevelopment()) {
    console.log(`🚀 ${APP_CONFIG.NAME} v${APP_CONFIG.VERSION}`);
    console.log(`📝 ${APP_CONFIG.DESCRIPTION}`);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Chỉ cho vào nếu đã đăng nhập */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<HomePage />} />
        </Route>

        {/* Lạc đường → về /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
