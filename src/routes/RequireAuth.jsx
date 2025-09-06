import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const location = useLocation();
  const authed = !!localStorage.getItem("auth");

  return authed ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}
