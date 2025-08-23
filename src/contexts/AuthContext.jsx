import { createContext, useReducer, useContext } from "react";
import reducer, { initialState } from "../state/auth/reducer";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error("useAuth phải được sử dụng bên trong <AuthProvider>");
  }

  return useContext(AuthContext);
}
