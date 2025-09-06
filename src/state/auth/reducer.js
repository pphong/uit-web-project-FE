export const initialState = {
  user: null,
  accessToken: null,
  error: null,
  loading: false,
  hydrated: false,
};

export const AUTH = {
  HYDRATE: "AUTH/HYDRATE",
  LOGIN_START: "AUTH/LOGIN_START",
  LOGIN_SUCCESS: "AUTH/LOGIN_SUCCESS",
  LOGIN_ERROR: "AUTH/LOGIN_ERROR",
  LOGOUT: "AUTH/LOGOUT",
  SET_USER: "AUTH/SET_USER",
};

const reducer = (state, action) => {
  switch (action.type) {
    case AUTH.HYDRATE:
      return { ...state, ...action.payload, hydrated: true };
    case AUTH.LOGIN_START:
      return { ...state, loading: true, error: null };
    case AUTH.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        accessToken: action.payload.accessToken,
        user: action.payload.user,
        error: null,
      };
    case AUTH.LOGIN_ERROR:
      return { ...state, loading: false, error: action.error };
    case AUTH.SET_USER:
      return { ...state, user: action.payload };
    case AUTH.LOGOUT:
      return { ...initialState };
    default:
      return state;
  }
};

export default reducer;
