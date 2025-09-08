import { createContext, useReducer, useContext, useEffect } from "react";
import reducer, { initialState, AUTH } from "../state/auth/reducer";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (accessToken || user)
      dispatch({ type: AUTH.HYDRATE, payload: { accessToken, user } });
  }, []);

  useEffect(() => {
    state.accessToken
      ? localStorage.setItem("accessToken", state.accessToken)
      : localStorage.removeItem("accessToken");
    state.user
      ? localStorage.setItem("user", JSON.stringify(state.user))
      : localStorage.removeItem("user");
  }, [state.user, state.accessToken]);

  const login = async (payload) => {
    dispatch({ type: AUTH.LOGIN_START });
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.success === false)
        throw new Error(json?.message || `HTTP ${res.status}`);

      const accessToken = json?.data.accessToken || json.accessToken;

      dispatch({
        type: AUTH.LOGIN_SUCCESS,
        payload: { accessToken, user: json?.data?.user },
      });
    } catch (error) {
      dispatch({
        type: AUTH.LOGIN_ERROR,
        error: error.message || "Đăng nhập không thành công",
      });
      throw error;
    }
  };

  const logout = () => dispatch({ type: AUTH.LOGOUT });

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong <AuthProvider>");
  }
  return context;
}
