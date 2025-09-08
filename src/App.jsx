import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

import RequireAuth from "./routes/RequireAuth";

function App() {
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
